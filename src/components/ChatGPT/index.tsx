// src/components/ChatGPT/index.tsx

// Violet Yousif, 06/01/2025, Reformatted the code to simplify project's coding style and fixed ChatGPTProps missing properties in interface.ts.
// Violet Yousif, 6/16/2025, Checks if the user is logged in before allowing chat functionality.
// Syed Rabbey, 6/26/2025, Added streamed message functionality to display the assistant's response as it is being generated.

import * as React from 'react'
import { ChatGPTProps, ChatRole, ChatMessage } from './interface'
import MessageItem from './MessageItem'
import SendBar from './SendBar'
import { useChatGPT } from './useChatGPT'
import './index.less'
import 'highlight.js/styles/atom-one-dark.css'
import { Typography } from 'antd'

const { Text } = Typography

const ChatGPT = ({
  assistantBubbleColor = '#9AB7A9',
  userBubbleColor = '#318182',
  inputBarColor = '#9AB7A9',
  isLoggedIn = false,
  userAvatar = '/avatars/avatar1.png',
  userName = 'User',
  ...props
}: ChatGPTProps & { conversationId: string; walletAddress: string; userAvatar?: string; userName?: string }) => {
  const { loading, disabled, messages, currentMessage, streamedMessage, onSend, onClear, onStop } = useChatGPT({
    fetchPath: props.fetchPath,
    conversationId: props.conversationId,
    isLoggedIn,
    inputBarColor,
    assistantBubbleColor,
    userBubbleColor,
    userAvatar,
    userName,
    //chatMode: props.chatMode,
    //walletAddress: props.walletAddress
  })

  return (
    <div className="chat-wrapper">
      <div className="message-list">
        {messages.length === 0 && !currentMessage.current && (
          <div className="welcome-message">
            <Text strong style={styles.welcomeTitle}>
              Methuselah, Your Personal AI-driven Health Advisor.
            </Text>
            <Text style={styles.welcomeSubtitle}>
              If you have questions, ask away!
            </Text>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageItem
            key={index}
            // Converts message.timestamp into a string for chat display
            message={{
              ...message,
              timestamp: typeof message.timestamp === 'string'
                ? message.timestamp
                : message.timestamp?.toISOString?.() ?? ''
            } as ChatMessage}
            assistantColor={assistantBubbleColor}
            userColor={userBubbleColor}
            userAvatar={userAvatar}
            userName={userName}
            isStreaming={false} // Existing messages should not be animated
          />
        ))}

        {(currentMessage.current || streamedMessage) && (
          <MessageItem
            message={{
              content: streamedMessage || currentMessage.current,
              role: ChatRole.Assistant,
              timestamp: new Date().toISOString()
            }}
            assistantColor={assistantBubbleColor}
            userColor={userBubbleColor}
            userAvatar={userAvatar}
            userName={userName}
            isStreaming={true} // This message is currently being streamed, so it should animate
          />
        )}
      </div>

      <SendBar
        loading={loading}
        disabled={disabled}
        onSend={onSend}
        onClear={onClear}
        onStop={onStop}
        //inputColor={inputBarColor}
      />
    </div>
  )
}

export default ChatGPT

const styles = {
  welcomeTitle: {
    fontSize: '24px',
    color: '#000000'
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#555',
    marginTop: '8px'
  }
} as const

