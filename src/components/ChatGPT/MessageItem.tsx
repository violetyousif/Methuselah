// Modified: 6/3/25 by Syed to add timestamps to messages.
// Violet Yousif, 6/16/2025, Removed unused walletAddress prop from Dashboard component function parameters to prevent errors.
// Mizanur Mizan, 6/23/2025, Added extended interface for placing current avatar image next to the user messages
import React from 'react'
import MarkdownIt from 'markdown-it'
import mdHighlight from 'markdown-it-highlightjs'
import mdKatex from 'markdown-it-katex'
import { ChatMessageItemProps } from './interface'
import Image from 'next/image'

const md = MarkdownIt({ html: true }).use(mdKatex).use(mdHighlight)

interface MessageItemProps extends ChatMessageItemProps {
  assistantColor?: string
  userColor?: string
  userAvatar?: string
}

const MessageItem = (props: MessageItemProps/* props: ChatMessageItemProps & { assistantColor?: string, userColor?: string } */) => {
  const { message, assistantColor = '#9AB7A9', userColor = '#F1F1EA', userAvatar = '/avatars/avatar1.png' } = props

  const isUser = message.role === 'user'
  const bgColor = isUser ? userColor : assistantColor

  const timestamp = new Date(message.timestamp || Date.now()).toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div style={{ marginBottom: '16px' }}>
      <div className={`timestamp ${isUser ? 'align-right' : 'align-left'}`}>
        {timestamp}
    </div>
    <div
      className="message-item"
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        margin: '6px 0',
        alignItems: 'flex-start'
      }}
    >
      {!isUser && (
        <div style={{ marginRight: 8 }}>
          <div className="methuselah-icon-wrapper">
            <Image
              src="/methuselah_tree.png"
              alt="Methuselah"
              width={36}
              height={36}
              style={{ borderRadius: '50%' }}
            />
          </div>
        </div>
      )}

      <div
        style={{
          background: isUser ? '#F1F1EA' : assistantColor,
          borderRadius: '12px',
          padding: '8px 14px',
          maxWidth: '100%',
          color: '#1E1E1E',
          lineHeight: 1.4
        }}
        dangerouslySetInnerHTML={{ __html: md.render(message.content) }}
      />

      {isUser && (
        <div style={{ marginLeft: 8 }}>
          {/* {<div
            style={{
              backgroundColor: '#F1F1EA',
              borderRadius: '50%',
              width: 36,
              height: 36
            }}
          />} */}
          <Image
            src={userAvatar}
            alt="User Avatar"
            width={36}
            height={36}
            style={{ borderRadius: '50%' }}
          />
        </div>
      )}
    </div>
  </div>
  )

}

export default MessageItem
