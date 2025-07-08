// Modified: 6/3/25 by Syed to add timestamps to messages.
// Violet Yousif, 6/16/2025, Removed unused walletAddress prop from Dashboard component function parameters to prevent errors.
// Mizanur Mizan, 6/23/2025, Added extended interface for placing current avatar image next to the user messages
// Syed Rabbey, 6/27/2025, Adjusted the display speed of the assistant's message to be more natural and readable.
// Mohammad Hoque, 7/3/2025, Added user name display functionality - shows "Methuselah" under AI messages and user's first name under user messages, with improved name and timestamp positioning above message bubbles.
// Mohammad Hoque, 7/6/2025, Enhanced timestamp display to show both date and time for better message history clarity


import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { ChatMessageItemProps } from './interface'
import Image from 'next/image'
import 'katex/dist/katex.min.css' 


interface MessageItemProps extends ChatMessageItemProps {
  assistantColor?: string
  userColor?: string
  userAvatar?: string
  userName?: string
}

const MessageItem = (props: MessageItemProps) => {  /* props: ChatMessageItemProps & { assistantColor?: string, userColor?: string } */
  const { message, assistantColor = '#9AB7A9', userColor = '#F1F1EA', userAvatar = '/avatars/avatar1.png', userName = 'User' } = props
  
  const isUser = message.role === 'user'
  const bgColor = isUser ? userColor : assistantColor

  const timestamp = new Date(message.timestamp || Date.now()).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const [displayedText, setDisplayedText] = useState<string>(message.content)

  useEffect(() => {
    if (message.role !== 'assistant') {
      setDisplayedText(message.content)
      return
    }

    let index = 0
    const interval = setInterval(() => {
      setDisplayedText(message.content.slice(0, index))
      index++
      if (index > message.content.length) clearInterval(interval)
    }, 3)  // Speed of typing (adjust this if needed)

    return () => clearInterval(interval)
  }, [message.content, message.role])


  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Name and timestamp together above the message */}
      <div className={`message-header ${isUser ? 'align-right' : 'align-left'}`} style={{ marginBottom: '4px' }}>
        <span style={{
          fontSize: '12px',
          color: '#888',
          fontWeight: '600',
          marginRight: '8px'
        }}>
          {isUser ? userName : 'Methuselah'}
        </span>
        <span style={{
          fontSize: '11px',
          color: '#aaa',
          fontWeight: '400'
        }}>
          {timestamp}
        </span>
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
      >
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
        >
          {displayedText}
        </ReactMarkdown>
      </div>
      {isUser && (
        <div style={{ marginLeft: 8 }}>
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
