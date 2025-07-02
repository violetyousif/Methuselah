'use client'

import React from 'react'
import { Layout } from 'antd'
import ChatModeToggle from '../../pages/ChatModeToggle'
import styles from './index.module.less'

const { Header } = Layout

interface ChatHeaderBarProps {
  collapsed: boolean
  chatMode: 'direct' | 'conversational'
  onChatModeChange: (mode: 'direct' | 'conversational') => void
  theme?: 'default' | 'dark'
}

const ChatHeaderBar: React.FC<ChatHeaderBarProps> = ({ 
  collapsed, 
  chatMode, 
  onChatModeChange,
  theme = 'default'
}) => {
  return (
    <Header className={`${styles.header} ${collapsed ? styles.collapsed : ''} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.leftSection}>
        <ChatModeToggle mode={chatMode} onChange={onChatModeChange} />
      </div>
      <div className={styles.rightSection}>
        {/* Additional header content can go here */}
      </div>
    </Header>
  )
}

export default ChatHeaderBar
