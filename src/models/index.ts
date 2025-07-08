// src/models/index.ts
// Viktor Gjorgjevski, 6/3/2025, Updated interface UserData to include profile pic, firstName, lastName
// Violet Yousif, 6/10,2025, Changed the UserData interface to include added age, weight, height, activityLevel, sleepHours, and removed profilePic and name.
// Mohammad Hoque, 6/18/2025, Added gender to UserData interface.
// Mohammad Hoque, 7/1/2025, Added functions for updating conversation title and deleting conversations.
// Mohammad Hoque, 7/3/2025, Integrated backend MongoDB conversation storage with frontend conversation management.

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

export interface UserData {
  //name?: string
  firstName?: string
  lastName?: string
  email?: string
  gender?: 'female' | 'male' | 'other' | 'prefer not to say'
  dateOfBirth: string // ISO format, e.g. '1990-01-01'
  weight: number // kg
  height: number // cm
  activityLevel: 'sedentary' | 'moderate' | 'active'
  sleepHours: number
  profilePic?: string
}

let inMemoryConversations: Record<string, Conversation> = {}

// Backend API functions for conversation management
export const getConversations = async (userEmail?: string): Promise<Conversation[]> => {
  try {
    const response = await fetch('http://localhost:8080/api/conversations', {
      method: 'GET',
      credentials: 'include'
    })
    
    if (response.ok) {
      const conversations = await response.json()
      // Update in-memory cache
      conversations.forEach((conv: Conversation) => {
        inMemoryConversations[conv.conversationId] = conv
      })
      return conversations
    } else {
      // Fallback to in-memory if backend fails
      return Object.values(inMemoryConversations).filter((conv) => conv.walletAddress === (userEmail || 'default-user'))
    }
  } catch (error) {
    console.error('Error fetching conversations from backend:', error)
    // Fallback to in-memory if backend fails
    return Object.values(inMemoryConversations).filter((conv) => conv.walletAddress === (userEmail || 'default-user'))
  }
}

export const getConversation = async (conversationId: string): Promise<Conversation | undefined> => {
  // Check in-memory cache first
  if (inMemoryConversations[conversationId]) {
    return inMemoryConversations[conversationId]
  }
  
  try {
    const response = await fetch(`http://localhost:8080/api/conversations/${conversationId}`, {
      method: 'GET',
      credentials: 'include'
    })
    
    if (response.ok) {
      const conversation = await response.json()
      // Update in-memory cache
      inMemoryConversations[conversation.conversationId] = conversation
      return conversation
    } else {
      return undefined
    }
  } catch (error) {
    console.error('Error fetching conversation from backend:', error)
    return inMemoryConversations[conversationId]
  }
}

export const addConversation = async (walletAddress: string, title: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:8080/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ title })
    })
    
    if (response.ok) {
      const conversation = await response.json()
      // Update in-memory cache
      inMemoryConversations[conversation.conversationId] = conversation
      return conversation.conversationId
    } else {
      throw new Error('Failed to create conversation on backend')
    }
  } catch (error) {
    console.error('Error creating conversation on backend:', error)
    // Fallback to in-memory creation
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
}

export const addMessage = async (conversationId: string, role: ChatRole, content: string): Promise<void> => {
  try {
    const response = await fetch(`http://localhost:8080/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        sender: role === ChatRole.User ? 'user' : 'AI',
        text: content
      })
    })
    
    if (response.ok) {
      const message = await response.json()
      // Update in-memory cache
      const conversation = inMemoryConversations[conversationId]
      if (conversation) {
        const newMessage: Message = {
          messageId: message.messageId,
          role,
          content,
          timestamp: new Date(message.timestamp)
        }
        conversation.messages.push(newMessage)
        conversation.updatedAt = new Date()
      }
    } else {
      throw new Error('Failed to add message to backend')
    }
  } catch (error) {
    console.error('Error adding message to backend:', error)
    // Fallback to in-memory addition
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
}

export const updateConversationTitle = async (conversationId: string, newTitle: string): Promise<void> => {
  try {
    const response = await fetch(`http://localhost:8080/api/conversations/${conversationId}/title`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ title: newTitle })
    })
    
    if (response.ok) {
      // Update in-memory cache
      const conversation = inMemoryConversations[conversationId]
      if (conversation) {
        conversation.title = newTitle
        conversation.updatedAt = new Date()
      }
    } else {
      throw new Error('Failed to update conversation title on backend')
    }
  } catch (error) {
    console.error('Error updating conversation title on backend:', error)
    // Fallback to in-memory update
    const conversation = inMemoryConversations[conversationId]
    if (conversation) {
      conversation.title = newTitle
      conversation.updatedAt = new Date()
    }
  }
}

export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    const response = await fetch(`http://localhost:8080/api/conversations/${conversationId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    
    if (response.ok) {
      // Remove from in-memory cache
      delete inMemoryConversations[conversationId]
    } else {
      throw new Error('Failed to delete conversation from backend')
    }
  } catch (error) {
    console.error('Error deleting conversation from backend:', error)
    // Fallback to in-memory deletion
    delete inMemoryConversations[conversationId]
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
