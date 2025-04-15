// src/components/ChatGPT/index.tsx
import React from 'react'
import { ChatGPTProps, ChatRole, ChatMessage } from './interface'
import MessageItem from './MessageItem'
import SendBar from './SendBar'
import { useChatGPT } from './useChatGPT'
import './index.less'
import 'highlight.js/styles/atom-one-dark.css'
import { Typography } from 'antd'

const { Text } = Typography

const ChatGPT = (props: ChatGPTProps & { conversationId: string; walletAddress: string }) => {
  const { loading, disabled, messages, currentMessage, onSend, onClear, onStop } = useChatGPT(props)

  return (
    <div className="chat-wrapper">
      <div className="message-list">
        {messages.length === 0 && !currentMessage.current && (
          <div className="welcome-message">
            <Text strong style={{ fontSize: '24px', color: '#e0e0e0' }}>
              Methuselah, Your first AI-driven health advisor
            </Text>
            <Text style={{ fontSize: '16px', color: '#9ca3af', marginTop: '8px' }}>
              If you have questions, ask away!
            </Text>
          </div>
        )}
        {messages.map((message, index) => (
          <MessageItem key={index} message={message as ChatMessage} />
        ))}
        {currentMessage.current && (
          <MessageItem
            message={{ content: currentMessage.current, role: ChatRole.Assistant }} // Use enum
          />
        )}
      </div>

      <SendBar
        loading={loading}
        disabled={disabled}
        onSend={onSend}
        onClear={onClear}
        onStop={onStop}
      />
    </div>
  )
}

export default ChatGPT
