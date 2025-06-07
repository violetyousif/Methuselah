// src/models/index.ts

// This is not for personal User db calling! It pertains to AI-related calls only!

import { ChatRole } from '../components/ChatGPT/interface'

export interface Message {
  messageId: string
  role: ChatRole
  content: string
  timestamp: Date
}

export interface Conversation {
  conversationId: string
  title: string
  summary: string
  walletAddress: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// Updated interface to include name and email
// Updated interface to include profile pic, firstname, lastname: Viktor Gjorgjevski 6/3/2025
export interface UserData {
  //name?: string
  firstName?: string
  lastName?: string
  email?: string
  age: number
  weight: number // kg
  height: number // cm
  activityLevel: 'sedentary' | 'moderate' | 'active'
  sleepHours: number
  //profilePic?: string
}

let inMemoryConversations: Record<string, Conversation> = {}

export const getConversations = (walletAddress: string): Conversation[] => {
  return Object.values(inMemoryConversations).filter((conv) => conv.walletAddress === walletAddress)
}

export const getConversation = (conversationId: string): Conversation | undefined => {
  return inMemoryConversations[conversationId]
}

export const addConversation = (walletAddress: string, title: string): string => {
  const conversationId = Date.now().toString()
  inMemoryConversations[conversationId] = {
    conversationId,
    title,
    summary: '',
    walletAddress,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
  return conversationId
}

export const addMessage = (conversationId: string, role: ChatRole, content: string): void => {
  const conversation = inMemoryConversations[conversationId]
  if (conversation) {
    const message: Message = {
      messageId: `${conversation.messages.length + 1}`,
      role,
      content,
      timestamp: new Date()
    }
    conversation.messages.push(message)
    conversation.updatedAt = new Date()
  }
}

export const clearConversation = (conversationId: string): void => {
  const conversation = inMemoryConversations[conversationId]
  if (conversation) {
    conversation.messages = []
    conversation.summary = ''
    conversation.updatedAt = new Date()
  }
}

export const generateSummary = async (conversationId: string, fetchPath: string): Promise<void> => {
  const conversation = inMemoryConversations[conversationId]
  if (!conversation || conversation.messages.length === 0) {
    conversation.summary = ''
    return
  }

  const messagesToSummarize = conversation.messages.map((msg) => ({
    role: msg.role,
    content: msg.content
  }))

  try {
    const response = await fetch(fetchPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          ...messagesToSummarize,
          {
            role: ChatRole.System,
            content:
              'Provide a summary of the conversation in a few words, focusing on the main topic discussed, you can exclude the first greeting message by the model.'
          }
        ]
      })
    })

    if (!response.ok) throw new Error(`API error: ${response.statusText}`)

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    let fullSummary = ''
    const decoder = new TextDecoder('utf-8')
    let done = false

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      if (value) {
        fullSummary += decoder.decode(value, { stream: true })
      }
      done = readerDone
    }

    const cleanedSummary = fullSummary.trim().replace(/\n/g, ' ')
    conversation.summary = cleanedSummary || conversation.title
  } catch (error) {
    console.error('Error generating summary:', error)
    conversation.summary = conversation.title
  }
}
