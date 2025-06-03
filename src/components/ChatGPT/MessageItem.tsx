// Modified: 6/3/25 by Syed to add timestamps to messages.
import React from 'react'
import MarkdownIt from 'markdown-it'
import mdHighlight from 'markdown-it-highlightjs'
import mdKatex from 'markdown-it-katex'
import { ChatMessageItemProps } from './interface'
import Image from 'next/image'

const md = MarkdownIt({ html: true }).use(mdKatex).use(mdHighlight)

const MessageItem = (props: ChatMessageItemProps & { assistantColor?: string, userColor?: string }) => {
  const { message, assistantColor = '#9AB7A9', userColor = '#F1F1EA' } = props

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
      <div style={{ fontStyle: 'italic', fontSize: '12px', color: '#000', marginBottom: '4px', textAlign: isUser ? 'right' : 'left' }}>
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
          <Image src="/methuselah_tree.png" alt="Methuselah" width={36} height={36} />
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
          <div
            style={{
              backgroundColor: '#F1F1EA',
              borderRadius: '50%',
              width: 36,
              height: 36
            }}
          />
        </div>
      )}
    </div>
  </div>
  )

}

export default MessageItem
