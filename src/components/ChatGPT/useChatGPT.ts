// src/components/ChatGPT/useChatGPT.ts
import { useEffect, useReducer, useRef, useState } from 'react'
import ClipboardJS from 'clipboard'
import { throttle } from 'lodash-es'
import { ChatGPTProps, ChatMessage, ChatRole } from './interface'
import {
  getConversation,
  addMessage,
  clearConversation,
  generateSummary,
  Conversation,
  UserData
} from '../../models'

const scrollDown = throttle(
  () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  },
  300,
  { leading: true, trailing: false }
)

const requestMessage = async (
  url: string,
  messages: ChatMessage[],
  controller: AbortController | null
) => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ messages }),
    signal: controller?.signal
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const data = response.body

  if (!data) {
    throw new Error('No data')
  }

  return data.getReader()
}

export const useChatGPT = (
  props: ChatGPTProps & { conversationId: string; walletAddress: string }
) => {
  const { fetchPath, conversationId, walletAddress } = props
  const [, forceUpdate] = useReducer((x) => !x, false)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [healthData, setHealthData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [disabled] = useState<boolean>(false)

  const controller = useRef<AbortController | null>(null)
  const currentMessage = useRef<string>('')

  useEffect(() => {
    const fetchHealthData = async () => {
      if (walletAddress) {
        const response = await fetch(`/api/user-data?walletAddress=${walletAddress}`)
        const data = await response.json()
        setHealthData(data || null)
      }
    }
    fetchHealthData()

    const conv = getConversation(conversationId)
    setCurrentConversation(conv || null)
    if (conv && conv.messages.length === 0) {
      addMessage(
        conversationId,
        ChatRole.Assistant,
        'Greetings, traveler. I am Methuselah, a wise old man who has lived for centuries. Ask me what you seek, and I shall share my wisdom.'
      )
      setCurrentConversation(getConversation(conversationId) || null)
    }
  }, [conversationId, walletAddress])

  const archiveCurrentMessage = async () => {
    const content = currentMessage.current
    currentMessage.current = ''
    setLoading(false)
    if (content) {
      addMessage(conversationId, ChatRole.Assistant, content)
      setCurrentConversation(getConversation(conversationId) || null)
      await generateSummary(conversationId, fetchPath)
      setCurrentConversation(getConversation(conversationId) || null)
      scrollDown()
    }
  }

  const fetchMessage = async (messages: ChatMessage[]) => {
    try {
      currentMessage.current = ''
      controller.current = new AbortController()
      setLoading(true)

      const reader = await requestMessage(fetchPath, messages, controller.current)
      const decoder = new TextDecoder('utf-8')
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        if (value) {
          const char = decoder.decode(value)
          if (char === '\n' && currentMessage.current.endsWith('\n')) {
            continue
          }
          if (char) {
            currentMessage.current += char
            forceUpdate()
          }
          scrollDown()
        }
        done = readerDone
      }

      await archiveCurrentMessage()
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  const onSend = (message: ChatMessage) => {
    addMessage(conversationId, message.role, message.content)
    setCurrentConversation(getConversation(conversationId) || null)

    const healthPrompt = healthData
      ? `User: ${healthData.age} years, ${healthData.weight}kg, ${healthData.height}cm, ${healthData.activityLevel}, ${healthData.sleepHours}h sleep—`
      : ''
    const fullMessage = { ...message, content: `${healthPrompt}${message.content}` }
    fetchMessage([...(currentConversation?.messages || []), fullMessage])
  }

  const onClear = () => {
    clearConversation(conversationId)
    setCurrentConversation(getConversation(conversationId) || null)
  }

  const onStop = async () => {
    if (controller.current) {
      controller.current.abort()
      await archiveCurrentMessage()
    }
  }

  useEffect(() => {
    new ClipboardJS('.chat-wrapper .copy-btn')
  }, [])

  return {
    loading,
    disabled,
    messages: currentConversation?.messages || [],
    currentMessage,
    onSend,
    onClear,
    onStop
  }
}
