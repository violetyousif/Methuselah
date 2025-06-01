
// src/pages/index.tsx
import ChatGPT from '@/components/ChatGPT'
import { Layout, Button, Avatar, Typography } from 'antd'
import { MenuOutlined, SettingOutlined } from '@ant-design/icons'
import Link from 'next/link'
import FooterBar from '@/components/FooterBar'
import Profile from './profile'
import Dashboard from './dashboard'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { message } from 'antd'
import { getConversations, addConversation, Conversation, UserData } from '../models'

const { Sider, Content } = Layout
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
  const [fadeTriggers, setFadeTriggers] = useState<Record<string, number>>({})
  const [profileVisible, setProfileVisible] = useState(false)
  const [dashboardVisible, setDashboardVisible] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (walletAddress) {
        const response = await fetch(`/api/user-data?walletAddress=${walletAddress}`)
        const data = await response.json()
        setUserData(data || { name: 'John Doe', email: 'johndoe@gmail.com' })
      }
    }
    fetchUserData()

    const wallet = walletAddress || 'default-wallet'
    const convs = getConversations(wallet)
    if (convs.length === 0) {
      const newId = addConversation(wallet, 'Chat 1')
      setChatHistory(getConversations(wallet))
      setSelectedChatId(newId)
      setFadeTriggers((prev) => ({ ...prev, [newId]: (prev[newId] || 0) + 1 }))
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
    setFadeTriggers((prev) => ({ ...prev, [newId]: (prev[newId] || 0) + 1 }))
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <Sider
        width={collapsed ? 48 : 250}
        style={{
          backgroundColor: '#9AB7A9',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000
        }}
      >
        {collapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px' }}>
            <Button
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(false)}
              style={{ backgroundColor: 'transparent', border: 'none' }}
            />
          </div>
        ) : (
          <>
            <div style={{ backgroundColor: '#8AA698', padding: '16px', textAlign: 'center', position: 'relative' }}>
              <Button
                icon={<MenuOutlined />}
                onClick={() => setCollapsed(true)}
                style={{ position: 'absolute', left: 8, top: 8, backgroundColor: 'transparent', border: 'none' }}
              />
              <div onClick={() => setProfileVisible(true)} style={{ cursor: 'pointer' }}>
                <Avatar size={64} src="/methuselah-avatar.png" style={{ marginTop: 16 }} />
                <Text strong style={{ display: 'block', marginTop: 8 }}>
                  {userData?.name || 'Guest'}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                <Link href="/login"><Button style={smallBtn}>Login</Button></Link>
                <Link href="/signup"><Button style={smallBtn}>Register</Button></Link>
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              <Button onClick={handleNewChat} style={buttonStyle}>+ New Chat</Button>
              <Text strong style={{ display: 'block', margin: '16px 0 8px' }}>Chat History</Text>
              {chatHistory.map((chat) => (
                <div
                  key={chat.conversationId}
                  style={{
                    padding: '8px 12px',
                    marginBottom: '8px',
                    backgroundColor: selectedChatId === chat.conversationId ? '#6F9484' : 'transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#203625'
                  }}
                  onClick={() => setSelectedChatId(chat.conversationId)}
                >
                  {chat.summary || chat.title}
                </div>
              ))}
            </div>

            <div style={{ flexGrow: 1 }} /> {/* Pushes the buttons down */}

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/settings"><Button style={buttonStyle}>Settings</Button></Link>
              <Button onClick={() => setDashboardVisible(true)} style={buttonStyle}>Dashboard</Button>
              <Button style={buttonStyle}>Feedback</Button>
            </div>
          </>
        )}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 48 : 250, backgroundColor: '#FFFFFF' }}>
        <Content style={{ padding: '24px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
          {selectedChatId && (
            <ChatGPT
              fetchPath="/api/chat-completion"
              conversationId={selectedChatId}
              walletAddress={walletAddress || 'default-wallet'}
              inputBarColor="#9AB7A9"
              assistantBubbleColor="#9AB7A9"
              userBubbleColor="#318182"
            />
          )}
        </Content>
        <div style={{
          backgroundColor: '#FFFFFF',
          textAlign: 'center',
          padding: '12px 0',
          color: '#000000'
        }}>
          LongevityAI © 2025
        </div>
      </Layout>

      <Profile
        visible={profileVisible}
        walletAddress={walletAddress}
        onClose={() => setProfileVisible(false)}
      />

      <Dashboard
        visible={dashboardVisible}
        walletAddress={walletAddress}
        onClose={() => setDashboardVisible(false)}
      />
    </Layout>
  )
}

const buttonStyle = {
  width: '100%',
  backgroundColor: '#203625',
  color: '#F1F1EA',
  border: 'none',
  borderRadius: '1rem'
}

const smallBtn = {
  backgroundColor: '#203625',
  color: '#F1F1EA',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '12px',
  padding: '4px 12px',
  height: '28px'
}
