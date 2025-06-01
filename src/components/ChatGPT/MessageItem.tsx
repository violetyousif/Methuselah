
import React from 'react'
import MarkdownIt from 'markdown-it'
import mdHighlight from 'markdown-it-highlightjs'
import mdKatex from 'markdown-it-katex'
import { ChatMessageItemProps } from './interface'
import Image from 'next/image'

const md = MarkdownIt({ html: true }).use(mdKatex).use(mdHighlight)

const MessageItem = (props: ChatMessageItemProps & { assistantColor?: string, userColor?: string }) => {
  const { message, assistantColor = '#9AB7A9', userColor = '#318182' } = props

  const isUser = message.role === 'user'
  const bgColor = isUser ? userColor : assistantColor

  return (
    <div className="message-item" style={{ display: 'flex', marginBottom: 12, alignItems: 'flex-start' }}>
      {!isUser && (
        <div style={{ marginRight: 12 }}>
          <Image src="/methuselah_tree.png" alt="Methuselah" width={36} height={36} />
        </div>
      )}
      <div
        style={{
          background: bgColor,
          borderRadius: '12px',
          padding: '12px 16px',
          maxWidth: '80%',
          color: '#1E1E1E'
        }}
        dangerouslySetInnerHTML={{ __html: md.render(message.content) }}
      />
      {isUser && (
        <div style={{ marginLeft: 12 }}>
          <div style={{
            backgroundColor: '#318182',
            borderRadius: '50%',
            width: 36,
            height: 36
          }} />
        </div>
      )}
    </div>
  )
}

export default MessageItem
