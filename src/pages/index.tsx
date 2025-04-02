// src/pages/index.tsx
import ChatGPT from '@/components/ChatGPT'
import { Layout, Button, Avatar, Typography } from 'antd'
const { Sider, Content } = Layout
import FooterBar from '@/components/FooterBar'
import styles from './index.module.less'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { message } from 'antd'
import { getConversations, addConversation, Conversation } from '../models'

const { Text } = Typography

declare global {
  interface Window {
    ethereum?: import('ethers').Eip1193Provider
  }
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<Conversation[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [fadeTriggers, setFadeTriggers] = useState<Record<string, number>>({}) // Per-item fade triggers

  useEffect(() => {
    const wallet = walletAddress || 'default-wallet'
    const convs = getConversations(wallet)
    if (convs.length === 0) {
      const newId = addConversation(wallet, 'Chat 1')
      setChatHistory(getConversations(wallet))
      setSelectedChatId(newId)
      setFadeTriggers((prev) => ({ ...prev, [newId]: (prev[newId] || 0) + 1 })) // Fade new chat
    } else {
      setChatHistory(convs)
      setSelectedChatId(convs[0].conversationId)
    }
  }, [walletAddress])

  const connectWallet = async () => {
    if (!window.ethereum) {
      message.error('MetaMask is not installed!')
      return
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      setWalletAddress(accounts[0])
      message.success('Wallet connected successfully!')
    } catch (error) {
      console.error('Error connecting wallet:', error)
      message.error('Failed to connect wallet')
    }
  }

  const handleNewChat = () => {
    const wallet = walletAddress || 'default-wallet'
    const newChatTitle = `Chat ${chatHistory.length + 1}`
    const newId = addConversation(wallet, newChatTitle)
    setChatHistory(getConversations(wallet))
    setSelectedChatId(newId)
    setFadeTriggers((prev) => ({ ...prev, [newId]: (prev[newId] || 0) + 1 })) // Fade new chat
  }

  // Watch for summary updates
  useEffect(() => {
    const wallet = walletAddress || 'default-wallet'
    const convs = getConversations(wallet)
    const updatedConvs = convs.map((conv) => {
      const prevConv = chatHistory.find((c) => c.conversationId === conv.conversationId)
      if (prevConv && prevConv.summary !== conv.summary) {
        // Summary changed, trigger fade for this item
        setFadeTriggers((prev) => ({
          ...prev,
          [conv.conversationId]: (prev[conv.conversationId] || 0) + 1
        }))
      }
      return conv
    })
    setChatHistory(updatedConvs)
  }, [selectedChatId, walletAddress])

  return (
    <Layout className={styles.layout} style={{ minHeight: '100vh', backgroundColor: '#1e1e1e' }}>
      <Sider
        width={250}
        style={{
          backgroundColor: '#252525',
          padding: '16px',
          position: 'fixed',
          height: '100vh',
          top: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Button
          type="primary"
          style={{
            marginBottom: '16px',
            backgroundColor: '#4b5563',
            borderColor: '#4b5563',
            borderRadius: '1rem'
          }}
          onClick={handleNewChat}
        >
          + New Chat
        </Button>

        <div
          className={styles.chatHistory}
          style={{
            flex: 1,
            overflowY: 'auto',
            height: 'calc(100vh - 230px)'
          }}
        >
          <Text strong style={{ color: '#e0e0e0', marginBottom: '8px', display: 'block' }}>
            Chat History
          </Text>
          {chatHistory.map((chat) => (
            <div
              key={chat.conversationId}
              className={`${styles.chatItem} ${
                fadeTriggers[chat.conversationId] > 0 ? styles.fadeIn : ''
              }`}
              style={{
                padding: '8px 12px',
                marginBottom: '8px',
                backgroundColor: selectedChatId === chat.conversationId ? '#3a3a3a' : 'transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#d1d5db'
              }}
              onClick={() => setSelectedChatId(chat.conversationId)}
            >
              <Avatar size="small" style={{ marginRight: '8px', backgroundColor: '#4b5563' }} />
              {chat.summary || chat.title}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            backgroundColor: '#2f2f2f',
            borderTop: '1px solid #3a3a3a',
            borderRadius: '0 0 8px 8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Avatar size="large" style={{ backgroundColor: '#4b5563', marginRight: '8px' }} />
            <div>
              <Text strong style={{ color: '#e0e0e0', display: 'block' }}>
                John Doe
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: '12px' }}>johndoe@gmail.com</Text>
            </div>
          </div>
          <Button
            onClick={connectWallet}
            style={{
              width: '100%',
              backgroundColor: '#4b5563',
              borderColor: '#4b5563',
              color: '#e0e0e0',
              borderRadius: '1rem'
            }}
          >
            {walletAddress
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : 'Connect to your wallet'}
          </Button>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 250, backgroundColor: '#1e1e1e' }}>
        <Content
          className={styles.main}
          style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}
        >
          {selectedChatId && (
            <ChatGPT
              fetchPath="/api/chat-completion"
              conversationId={selectedChatId}
              walletAddress={walletAddress || 'default-wallet'}
            />
          )}
        </Content>
        <FooterBar />
      </Layout>
    </Layout>
  )
}
