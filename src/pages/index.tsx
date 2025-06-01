// src/pages/index.tsx

// Edited by: Violet Yousif
// Date: 06/01/2025
// Reformatted the code to simplify project's coding style.
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
    <Layout style={styles.page}>
      <Sider width={collapsed ? 48 : 250} style={styles.sider}>
        {collapsed ? (
          <div style={styles.collapsedMenu}>
            <Button icon={<MenuOutlined />} onClick={() => setCollapsed(false)} style={styles.transparentBtn} />
          </div>
        ) : (
          <>
            <div style={styles.avatarContainer}>
              <Button icon={<MenuOutlined />} onClick={() => setCollapsed(true)} style={styles.menuButton} />
              <div onClick={() => setProfileVisible(true)} style={{ cursor: 'pointer' }}>
                <Avatar size={64} src="/methuselah-avatar.png" style={styles.avatar} />
                <Text strong style={{ display: 'block', marginTop: 8 }}>{userData?.name || 'Guest'}</Text>
              </div>
              <div style={styles.authButtons}>
                <Link href="/login"><Button style={styles.smallBtn}>Login</Button></Link>
                <Link href="/register"><Button style={styles.smallBtn}>Register</Button></Link>
              </div>
            </div>

            <div style={styles.menuSection}>
              <Button onClick={handleNewChat} style={styles.primaryBtn}>+ New Chat</Button>
              <Text strong style={{ display: 'block', margin: '16px 0 8px' }}>Chat History</Text>
              {chatHistory.map((chat) => (
                <div
                  key={chat.conversationId}
                  style={{
                    ...styles.chatItem,
                    backgroundColor: selectedChatId === chat.conversationId ? '#6F9484' : 'transparent'
                  }}
                  onClick={() => setSelectedChatId(chat.conversationId)}
                >
                  {chat.summary || chat.title}
                </div>
              ))}
            </div>

            <div style={{ flexGrow: 1 }} />

            <div style={styles.footerButtons}>
              <Link href="/settings"><Button style={styles.primaryBtn}>Settings</Button></Link>
              <Button onClick={() => setDashboardVisible(true)} style={styles.primaryBtn}>Dashboard</Button>
              <Button style={styles.primaryBtn}>Feedback</Button>
            </div>
          </>
        )}
      </Sider>

      <Layout style={styles.contentArea}>
        <Content style={styles.content}>
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
        <div style={styles.footer}>LongevityAI © 2025</div>
      </Layout>

      <Profile visible={profileVisible} walletAddress={walletAddress} onClose={() => setProfileVisible(false)} />
      <Dashboard visible={dashboardVisible} walletAddress={walletAddress} onClose={() => setDashboardVisible(false)} />
    </Layout>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#FFFFFF'
  } as React.CSSProperties,
  sider: {
    backgroundColor: '#9AB7A9',
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-start',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000
  } as React.CSSProperties,
  collapsedMenu: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    paddingTop: '8px'
  } as React.CSSProperties,
  transparentBtn: {
    backgroundColor: 'transparent',
    border: 'none'
  } as React.CSSProperties,
  avatarContainer: {
    backgroundColor: '#8AA698',
    padding: '16px',
    textAlign: 'center',
    position: 'relative'
  } as React.CSSProperties,
  menuButton: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: 'transparent',
    border: 'none'
  } as React.CSSProperties,
  avatar: {
    marginTop: 16
  } as React.CSSProperties,
  authButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12
  } as React.CSSProperties,
  menuSection: {
    padding: '16px'
  } as React.CSSProperties,
  primaryBtn: {
    width: '100%',
    backgroundColor: '#203625',
    color: '#F1F1EA',
    border: 'none',
    borderRadius: '1rem'
  } as React.CSSProperties,
  smallBtn: {
    backgroundColor: '#203625',
    color: '#F1F1EA',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '12px',
    padding: '4px 12px',
    height: '28px'
  } as React.CSSProperties,
  chatItem: {
    padding: '8px 12px',
    marginBottom: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#203625'
  } as React.CSSProperties,
  footerButtons: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  } as React.CSSProperties,
  contentArea: {
    marginLeft: 250,
    backgroundColor: '#FFFFFF'
  } as React.CSSProperties,
  content: {
    padding: '24px',
    maxWidth: '960px',
    margin: '0 auto',
    width: '100%'
  } as React.CSSProperties,
  footer: {
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    padding: '12px 0',
    color: '#000000'
  } as React.CSSProperties
}