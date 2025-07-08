// src/components/ChatGPT/useChatGPT.ts
// Violet Yousif, 6/16/2025, Checks if the user is logged in before allowing chat functionality.
// Violet Yousif, 6/16/2025, Removed Web3-specific code for a more general implementation.
// Mizanur Mizan, 6/25/2025, Connected backend llm question response to chatbot frontend
// Syed Rabbey, 6/27/2025, Integrated user's first name into chat greeting and question prompts.
// Mohammad Hoque, 7/3/2025, Connected frontend conversation management to backend MongoDB storage.

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
  query: string,
  chatMode: 'direct' | 'conversational',
  // messages: ChatMessage[],
  controller: AbortController | null
) => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ query, mode: chatMode }),
    credentials: 'include',     // Include cookies for session management request
    headers: { 'Content-Type': 'application/json' },
    signal: controller?.signal
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  /* const data = response.body

  if (!data) {
    throw new Error('No data')
  }

  return data.getReader() */
  return response.json(); // ragChat returns JSON { answer, contextDocs }
};

export const useChatGPT = (
  props: ChatGPTProps & { conversationId: string; walletAddress: string; isLoggedIn?: boolean; chatMode: 'direct' | 'conversational' }
) => {
  const { conversationId, isLoggedIn = false, chatMode } = props;
  // const { fetchPath, conversationId, walletAddress } = props  // Original Web3 version
  const fetchPath = 'http://localhost:8080/api/ragChat'
  const [, forceUpdate] = useReducer((x) => !x, false)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [healthData, setHealthData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [disabled] = useState<boolean>(false)
  const [streamedMessage, setStreamedMessage] = useState<string>('');

  const greetingAttempted = useRef<Set<string>>(new Set());

  const controller = useRef<AbortController | null>(null)
  const currentMessage = useRef<string>('')

  useEffect(() => {
    const fetchHealthData = async () => {
      // Only fetch if user is logged in
      if (!isLoggedIn) return;
      
      // Session-based health data fetching (updated for non-Web3)
      try {
        const response = await fetch(`http://localhost:8080/api/user-data`, {
          credentials: 'include'
        })
        const data = await response.json()
        setHealthData(data || null)
      } catch (error) {
        console.error('Error fetching health data:', error)
      }
    }
    fetchHealthData()
  }, [isLoggedIn])

  useEffect(() => {
    const loadConversationAndInitGreeting = async () => {
      console.log('Loading conversation:', conversationId, 'healthData available:', !!healthData);
      
      const conv = await getConversation(conversationId)
      setCurrentConversation(conv || null)
      
      // Initialize greeting immediately after loading conversation if conditions are met
      if (healthData && conversationId && (!conv?.messages || conv.messages.length === 0)) {
        // Check if we've already attempted greeting for this conversation
        if (!greetingAttempted.current.has(conversationId)) {
          console.log('Sending greeting for conversation:', conversationId);
          greetingAttempted.current.add(conversationId);
          
          try {
            const userName = healthData.firstName || 'traveler';
            await addMessage(
              conversationId,
              ChatRole.Assistant,
              `Greetings, ${userName}. I am Methuselah, a wise old man who has lived for centuries. Ask me what you seek, and I shall share my wisdom.`
            );
            
            console.log('Greeting sent successfully, refreshing conversation:', conversationId);
            
            // Force a re-render and update conversation data
            const updatedConv = await getConversation(conversationId);
            setCurrentConversation(updatedConv || null);
            forceUpdate(); // Force component re-render to show the greeting
          } catch (error) {
            console.error('Error sending greeting:', error);
            greetingAttempted.current.delete(conversationId);
          }
        }
      } else if (conv && conv.messages && conv.messages.length > 0) {
        // Mark as attempted if conversation already has messages
        greetingAttempted.current.add(conversationId);
      }
    }
    
    loadConversationAndInitGreeting()
  }, [conversationId, isLoggedIn, healthData])

  //// Prev code (DON'T DELETE):
  // }, [conversationId, walletAddress])

  // Greeting initialization is now handled in the loadConversation useEffect above




  //// Prev code (DON'T DELETE):
  // Original Web3 version:
  // useEffect(() => {
  //   const fetchHealthData = async () => {
  //     if (walletAddress) {
  //       const response = await fetch(`/api/user-data?walletAddress=${walletAddress}`)
  //       const data = await response.json()
  //       setHealthData(data || null)
  //     }
  //   }
  //   fetchHealthData()
  //   
  //   const conv = getConversation(conversationId)
  //   setCurrentConversation(conv || null)
  //   if (conv && conv.messages.length === 0) {
  //     addMessage(
  //       conversationId,
  //       ChatRole.Assistant,
  //       'Greetings, traveler. I am Methuselah, a wise old man who has lived for centuries. Ask me what you seek, and I shall share my wisdom.'
  //     )
  //     setCurrentConversation(getConversation(conversationId) || null)
  //   }
  // }, [conversationId, walletAddress])

  const archiveCurrentMessage = async () => {
    const content = currentMessage.current
    currentMessage.current = ''
    setLoading(false)
    if (content) {
      await addMessage(conversationId, ChatRole.Assistant, content)
      const updatedConv = await getConversation(conversationId)
      setCurrentConversation(updatedConv || null)
      await generateSummary(conversationId, fetchPath)
      const finalConv = await getConversation(conversationId)
      setCurrentConversation(finalConv || null)
      scrollDown()
    }
  }

  const fetchMessage = async (query: string) => {
    try {
      // currentMessage.current = ''
      controller.current = new AbortController()
      setLoading(true);
      
      const data = await requestMessage(fetchPath, query, chatMode, controller.current);
      const assistantReply = data.answer;
      // Fake message typing effect
      let currentText = '';
      const words = assistantReply.split(' ');

      for (let i = 0; i < words.length; i++) {
        currentText += words[i] + ' ';
        setStreamedMessage(currentText);
        await new Promise((resolve) => setTimeout(resolve, 5)); // Speed: 20ms per word
    }

      setStreamedMessage('');  //  Clears the streamed message after it's done

      await addMessage(conversationId, ChatRole.Assistant, assistantReply);
      const updatedConv = await getConversation(conversationId)
      setCurrentConversation(updatedConv || null);

      setLoading(false);
      scrollDown();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
      /* const reader = await requestMessage(fetchPath, messages, controller.current)
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
    } */
  }

  const onSend = (message: ChatMessage) => {
    // Add message asynchronously but don't block the UI
    addMessage(conversationId, message.role, message.content).then(async () => {
      const updatedConv = await getConversation(conversationId)
      setCurrentConversation(updatedConv || null);
    }).catch(error => {
      console.error('Error saving message:', error);
    });

    const healthPrompt = healthData
      ? `User: ${healthData.age} years, ${healthData.weight}kg, ${healthData.height}cm, ${healthData.activityLevel}, ${healthData.sleepHours}h sleep—`
      : '' ;

    const fullQuery = `${healthPrompt}${message.content}`;
    fetchMessage(fullQuery);
    /* const fullMessage = { ...message, content: `${healthPrompt}${message.content}` }
    fetchMessage([
      ...((currentConversation?.messages || []).map(msg => ({
        ...msg,
        timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString()
      }))),
      fullMessage
    ]) */
  }

  const onClear = async () => {
    clearConversation(conversationId)
    const updatedConv = await getConversation(conversationId)
    setCurrentConversation(updatedConv || null)
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
    streamedMessage,
    onSend,
    onClear,
    onStop
} 

}

