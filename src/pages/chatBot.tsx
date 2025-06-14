// Syed Rabbey, 5/31/2025, rearranged buttons and color scheme
// Violet Yousif, 6/01/2025, Reformatted the code to simplify project's coding style.
// Viktor Gjorgjevski, 6/3/2025, Edited Logout button and added profile pic
// Mohammad Hoque, 6/2/2025, Added persistent theme and font settings, synced with <body> attributes, enabled dark mode UI styles dynamically
// Violet Yousif, 6/8/2025, Fixed logout functionality to clear user data using backend connection and redirect to login page.

import ChatGPT from '@/components/ChatGPT'
import { Layout, Button, Avatar, Typography, message } from 'antd'
import { MenuOutlined, SettingOutlined, CameraOutlined, BulbOutlined } from '@ant-design/icons'
import Link from 'next/link'
import Profile from './profile'
import Dashboard from './dashboard'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getConversations, addConversation, Conversation, UserData } from '../models'
import { useRouter } from 'next/router'
import '@/styles/globals.css'

const { Sider, Content } = Layout
const { Text } = Typography

const Chatbot = () => {
  const router = useRouter()

  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<Conversation[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [fadeTriggers, setFadeTriggers] = useState<Record<string, number>>({})
  const [profileVisible, setProfileVisible] = useState(false)
  const [dashboardVisible, setDashboardVisible] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<'default' | 'dark'>('default')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check login status on initial render
  useEffect(() => {
  const checkLoginStatus = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/checkAuth', {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const result = await res.json();
        setIsLoggedIn(true);
        setUserData(result.user);   // will set user data if available/logged in
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  };

  checkLoginStatus();
}, []);


  // Load theme and font size from localStorage on initial render
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'default'
    const fontSize = localStorage.getItem('fontSize') || 'regular'
    document.body.dataset.theme = theme
    document.body.dataset.fontsize = fontSize
    setCurrentTheme(theme as 'default' | 'dark')
  }, [])

  // Load wallet address from localStorage (grad students' code)
  useEffect(() => {
    // const fetchUserData = async () => {
    //   if (walletAddress) {
    //     const response = await fetch(`/api/user-data?walletAddress=${walletAddress}`)
    //     const data = await response.json()
    //     setUserData(data || { name: 'John Doe', email: 'johndoe@gmail.com' })
    //   }
    // }
    // fetchUserData()

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

  // Message transfer from landing page
  useEffect(() => {
    const savedMessage = localStorage.getItem('initialMessage')
    if (savedMessage && selectedChatId) {
      localStorage.removeItem('initialMessage')
      const inputBox = document.querySelector('textarea') as HTMLTextAreaElement
      if (inputBox) {
        inputBox.value = savedMessage
        const event = new Event('input', { bubbles: true })
        inputBox.dispatchEvent(event)
      }
    }
  }, [selectedChatId])

  // --- Hiding this for now, as we are not using MetaMask integration. This is from the grad students. ---
  /* const connectWallet = async () => {
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
  }} */

  const handleNewChat = () => {
    const wallet = walletAddress || 'default-wallet'
    const newChatTitle = `Chat ${chatHistory.length + 1}`
    const newId = addConversation(wallet, newChatTitle)
    setChatHistory(getConversations(wallet))
    setSelectedChatId(newId)
    setFadeTriggers((prev) => ({ ...prev, [newId]: (prev[newId] || 0) + 1 }))
  }

  // Styles moved to bottom, see `styles` below
  const buttonStyle = styles.buttonStyle(currentTheme)
  const smallBtn = styles.smallBtn(currentTheme)

  return (
    <Layout style={styles.layout(currentTheme)}>
      <Sider
        width={collapsed ? 48 : 250}
        style={styles.sider(currentTheme)}
      >
        {collapsed ? (
          <div style={styles.collapsedMenu}>
            <Button icon={<MenuOutlined />} onClick={() => setCollapsed(false)} style={styles.transparentBtn} />
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'space-between' }}>
              <div>
                <div style={styles.avatarContainer}>
                  <Button
                    icon={<MenuOutlined />}
                    onClick={() => setCollapsed(true)}
                    style={styles.menuButton}
                  />
                  <div onClick={() => setProfileVisible(true)} style={{ cursor: 'pointer' }}>
                    <Avatar size={64} src={userData?.profilePic || '/avatars/avatar1.png'} style={styles.avatar} />
                    <Text strong style={{ display: 'block', marginTop: 8 }}>
                      {userData?.firstName && userData?.lastName ? (`${userData.firstName} ${userData.lastName}`) : ('Guest')}
                    </Text>
                  </div>
                  {/* Logout button */}
                  {/* TODO: move login and registration buttons to landing page (index.tsx) */}
                  <div style={styles.authButtons}>
                    {!isLoggedIn && (
                      <>
                        <Link href="/login"><Button style={smallBtn}>Login</Button></Link>
                        <Link href="/register"><Button style={smallBtn}>Register</Button></Link>
                      </>
                    )}
                    {isLoggedIn && (
                      <Button
                        style={styles.logoutBtn}
                        onClick={ async () => {
                          try {
                            const res = await fetch('http://localhost:8080/api/logout', {
                              method: 'POST',
                              credentials: 'include', // Send cookies
                            });

                            if (res.ok) {
                              setIsLoggedIn(false);
                              setUserData(null);
                              router.push('/login');
                            } else {
                              message.error('Logout failed.');
                            }
                          } catch (error) {
                            console.error('Logout error:', error);
                            message.error('Server error during logout.');
                          }
                        }}
                      >
                        Logout
                      </Button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={styles.menuSection}>
                    <Button onClick={handleNewChat} style={buttonStyle}>+ New Chat</Button>
                    <Text strong style={{ display: 'block', margin: '16px 0 8px' }}>Chat History</Text>
                  </div>
                  <div style={{ flexGrow: 1 }} />
                  <div style={styles.footerButtons}>
                    <div
                      style={{
                        flexGrow: 1,
                        maxHeight: '400px',
                        overflowY: chatHistory.length > 10 ? 'auto' : 'visible',
                        padding: '0 16px 16px 16px'
                      }}
                    >
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
                  </div>
                </div>
              </div>
              {/* Bottom buttons */}
              <div style={styles.bottomButtons}>
                <Link href="/settings">
                  <Button style={buttonStyle} icon={<SettingOutlined />}>Settings</Button>
                </Link>
                <Button onClick={() => setDashboardVisible(true)} style={buttonStyle} icon={<CameraOutlined />}>Dashboard</Button>
                <Button style={buttonStyle} icon={<BulbOutlined />}>Feedback</Button>
              </div>
            </div>
          </div>
        )}
      </Sider>
      <Layout style={styles.contentArea(collapsed, currentTheme)}>
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
      </Layout>
      <div style={styles.footer as React.CSSProperties}>LongevityAI © 2025</div>
      <Profile visible={profileVisible} walletAddress={walletAddress} onClose={() => setProfileVisible(false)} />
      <Dashboard visible={dashboardVisible} walletAddress={walletAddress} onClose={() => setDashboardVisible(false)} />
    </Layout>
  )
}

export default Chatbot

// All CSS moved here:
const styles = {
  layout: (theme: 'default' | 'dark') => ({
    minHeight: '100vh',
    backgroundColor: theme === 'dark' ? '#0f0f17' : '#FFFFFF'
  }),
  sider: (theme: 'default' | 'dark') => ({
    backgroundColor: theme === 'dark' ? '#2b4240' : '#8AA698',
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-start',
    height: '100vh',
    position: 'fixed' as 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000
  }),
  collapsedMenu: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    paddingTop: '8px'
  },
  transparentBtn: {
    backgroundColor: 'transparent',
    border: 'none'
  },
  avatarContainer: {
    backgroundColor: '#8AA698',
    padding: '16px',
    textAlign: 'center' as const,
    position: 'relative' as const
  },
  menuButton: {
    position: 'absolute' as React.CSSProperties['position'],
    left: 8,
    top: 8,
    backgroundColor: 'transparent',
    border: 'none'
  },
  avatar: {
    marginTop: 16
  },
  authButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12
  },
  menuSection: {
    padding: '16px'
  },
  buttonStyle: (theme: 'default' | 'dark') => ({
    width: '100%',
    backgroundColor: theme === 'dark' ? '#318182' : '#F1F1EA',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    border: 'none',
    borderRadius: '1rem'
  }),
  smallBtn: (theme: 'default' | 'dark') => ({
    backgroundColor: theme === 'dark' ? '#318182' : '#F1F1EA',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '12px',
    padding: '4px 12px',
    height: '28px'
  }),
  chatItem: {
    padding: '8px 12px',
    marginBottom: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#203625'
  },
  footerButtons: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  bottomButtons: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginBottom: '60px'
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#1D1E2C',
    padding: 0,
    boxShadow: 'none',
    textAlign: 'left' as const,
    cursor: 'pointer',
    fontSize: 16,
    textDecoration: 'none',
    borderRadius: '3rem',
  },
  contentArea: (collapsed: boolean, theme: 'default' | 'dark') => ({
    marginLeft: collapsed ? 48 : 250,
    backgroundColor: theme === 'dark' ? '#0f0f17' : '#FFFFFF'
  }),
  content: {
    padding: '24px',
    maxWidth: '960px',
    margin: '0 auto',
    width: '100%',
    paddingBottom: '60px'
  },
  footer: {
    position: 'fixed',
    left: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#1D1E2C',
    color: '#ffffff',
    textAlign: 'center',
    padding: '12px 0',
    zIndex: 1000
  }
}
