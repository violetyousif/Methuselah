import ChatGPT from '@/components/ChatGPT'
import { Layout, Button, Avatar, Typography } from 'antd'
const { Sider, Content } = Layout
import FooterBar from '@/components/FooterBar'
import styles from './index.module.less'
import { useState } from 'react'
import { ethers } from 'ethers'
import { message } from 'antd'

const { Text } = Typography

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<string[]>([
    'Mental Health',
    'Stress & Anxiety Relief',
    'Healthier Food Choice',
    'Sleep Schedule',
  ])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

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
    const newChatTitle = `Chat ${chatHistory.length + 1}`
    setChatHistory([newChatTitle, ...chatHistory])
    setSelectedChat(newChatTitle)
  }

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
          flexDirection: 'column',
        }}
      >
        {/* New Chat Button */}
        <Button
          type="primary"
          style={{
            marginBottom: '16px',
            backgroundColor: '#4b5563',
            borderColor: '#4b5563',
            borderRadius: '1rem', // Add rounded corners
          }}
          onClick={handleNewChat}
        >
          + New Chat
        </Button>

        {/* Chat History */}
        <div
          className={styles.chatHistory}
          style={{
            flex: 1,
            overflowY: 'auto',
            height: 'calc(100vh - 230px)',
          }}
        >
          <Text strong style={{ color: '#e0e0e0', marginBottom: '8px', display: 'block' }}>
            Chat History
          </Text>
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              style={{
                padding: '8px 12px',
                marginBottom: '8px',
                backgroundColor: selectedChat === chat ? '#3a3a3a' : 'transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#d1d5db',
              }}
              onClick={() => setSelectedChat(chat)}
            >
              <Avatar size="small" style={{ marginRight: '8px', backgroundColor: '#4b5563' }} />
              {chat}
            </div>
          ))}
        </div>

        {/* User Info and Wallet (Fixed at Bottom) */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            backgroundColor: '#2f2f2f',
            borderTop: '1px solid #3a3a3a',
            borderRadius: '0 0 8px 8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Avatar size="large" style={{ backgroundColor: '#4b5563', marginRight: '8px' }} />
            <div>
              <Text strong style={{ color: '#e0e0e0', display: 'block' }}>
                John Doe
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: '12px' }}>
                johndoe@gmail.com
              </Text>
            </div>
          </div>
          <Button
            onClick={connectWallet}
            style={{
              width: '100%',
              backgroundColor: '#4b5563',
              borderColor: '#4b5563',
              color: '#e0e0e0',
              borderRadius: '1rem', // Add rounded corners
            }}
          >
            {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect to your wallet'}
          </Button>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 250, backgroundColor: '#1e1e1e' }}>
        <Content className={styles.main} style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <ChatGPT fetchPath="/api/chat-completion" />
        </Content>
        <FooterBar />
      </Layout>
    </Layout>
  )
}