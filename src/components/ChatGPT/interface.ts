// Violet Yousif, 6/16/2025, Checks if the user is logged in before allowing chat functionality.
// Syed Rabbey, 6/26/2025, Added chatmode interface and props for toggling between direct and conversational modes.
import type { ReactNode } from 'react'

export enum ChatRole {
  Assistant = 'assistant',
  User = 'user',
  System = 'system'
}

export interface ChatGPTProps {
  fetchPath: string;
  conversationId: string;
  isLoggedIn: boolean;
  inputBarColor: string;
  assistantBubbleColor: string;
  userBubbleColor: string;
  userAvatar?: string;
  userName?: string;
  chatMode: 'direct' | 'conversational';

}

export interface ChatMessage {
  content: string
  role: ChatRole
  timestamp?: string
}

export interface ChatMessageItemProps {
  message: ChatMessage
}

export interface SendBarProps {
  loading: boolean
  disabled: boolean
  onSend: (message: ChatMessage) => void
  onClear: () => void
  onStop: () => void
}

export interface ShowProps {
  loading?: boolean
  fallback?: ReactNode
  children?: ReactNode
}
