// Syed Rabbey, 5/31/2025, rearranged buttons and color scheme
// Violet Yousif, 6/01/2025, Reformatted the code to simplify project's coding style.
// Viktor Gjorgjevski, 6/3/2025, Edited Logout button and added profile pic
// Mohammad Hoque, 6/2/2025, Added persistent theme and font settings, synced with <body> attributes, enabled dark mode UI styles dynamically
// Violet Yousif, 6/8/2025, Fixed logout functionality to clear user data using backend connection and redirect to login page.
// Mohammad Hoque, 6/13/2025, Converted profile modal to redirect to a standalone /profile route for user data entry
// Violet Yousif, 6/16/2025, Commented out the Web3Modal component as it is not used in current program.
// Violet Yousif, 6/16/2025, Fixed logout to remove dark theme wher going to public pages like login, index, and register.
// Edited by: Viktor Gjorgjevski
// Date: 06/13/2025
// added link to button for feedback page
// Mohammad Hoque, 6/27/2025, Implemented chat editing and deletion functionality in Chatbot component

import ChatGPT from '@/components/ChatGPT'
import { Layout, Button, Avatar, Typography, message } from 'antd'
import { MenuOutlined, SettingOutlined, CameraOutlined, BulbOutlined } from '@ant-design/icons'
import Link from 'next/link'
import Profile from './profile' // Checked by Mohammad, 06/18/2025
import Dashboard from './dashboard'
import { useState, useEffect, useRef } from 'react'
//import { ethers } from 'ethers'
import { getConversations, addConversation, Conversation, UserData } from '../models'
import { useRouter } from 'next/router'
import '@/styles/globals.css'
import ChatModeToggle from './ChatModeToggle';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons' //For renaming and deleting chats
import { Modal } from 'antd' // For renaming and deleting chats


const { Sider, Content } = Layout
const { Text } = Typography


const Chatbot = () => {
  const router = useRouter()
  
  //// Prev: const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<Conversation[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [fadeTriggers, setFadeTriggers] = useState<Record<string, number>>({})
  const [dashboardVisible, setDashboardVisible] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<'default' | 'dark'>('default')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [chatMode, setChatMode] = useState<'direct' | 'conversational'>('conversational'); // Default to conversational mode
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>('')
  const editInputRef = useRef<HTMLInputElement>(null)

  // Handle input focus when editing starts
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus()
      // Position cursor at the end of the text
      const length = editInputRef.current.value.length
      editInputRef.current.setSelectionRange(length, length)
    }
  }, [editingChatId])

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

  // Load user data and chat history (updated for session-based auth)
  useEffect(() => {
    // User data is already fetched in the checkLoginStatus function above
    // No need for separate fetch here since checkAuth already returns user data
    
    // Use session-based identifier for chat history (use email or fallback to default)
    const userId = userData?.email || 'default-user'
    const convs = getConversations(userId)
    if (convs.length === 0) {
      const newId = addConversation(userId, 'Chat 1')
      setChatHistory(getConversations(userId))
      setSelectedChatId(newId)
      setFadeTriggers((prev) => ({ ...prev, [newId]: (prev[newId] || 0) + 1 }))
    } else {
      setChatHistory(convs)
      setSelectedChatId(convs[0].conversationId)
    }
  }, [isLoggedIn, userData?.email])

  //// Prev code:
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     if (walletAddress) {
  //       const response = await fetch(`/api/user-data?walletAddress=${walletAddress}`)
  //       const data = await response.json()
  //       setUserData(data || { name: 'John Doe', email: 'johndoe@gmail.com' })
  //     }
  //   }
  //   fetchUserData()
  //   
  //   const wallet = walletAddress || 'default-wallet'
  //   const convs = getConversations(wallet)
  //   if (convs.length === 0) {
  //     const newId = addConversation(wallet, 'Chat 1')
  //     setChatHistory(getConversations(wallet))
  //     setSelectedChatId(newId)
  //     setFadeTriggers((prev) => ({ ...prev, [newId]: (prev[newId] || 0) + 1 }))
  //   } else {
  //     setChatHistory(convs)
  //     setSelectedChatId(convs[0].conversationId)
  //   }
  // }, [walletAddress])


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

  //// Prev code: (grad students)
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
    const userId = userData?.email || 'default-user' // Use email as user identifier, fallback to 'default-user'
    const newChatTitle = `Chat ${chatHistory.length + 1}`
    const newId = addConversation(userId, newChatTitle)
    setChatHistory(getConversations(userId))
    setSelectedChatId(newId)
    setFadeTriggers((prev) => ({ ...prev, [newId]: (prev[newId] || 0) + 1 }))
  }
const handleEditChat = (chat: Conversation) => {
  setEditingChatId(chat.conversationId)
  setEditingTitle(chat.title)
}

const handleEditTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setEditingTitle(e.target.value)
}

const handleEditTitleSave = (chatId: string) => {
  if (!editingTitle.trim()) {
    message.warning('Chat name cannot be empty.');
    return;
  }
  const userId = userData?.email || 'default-user'
  const updated = chatHistory.map(chat =>
    chat.conversationId === chatId ? { ...chat, title: editingTitle } : chat
  )
  setChatHistory(updated)
  setEditingChatId(null)
}

const handleEditTitleCancel = () => {
  setEditingChatId(null)
  setEditingTitle('')
}

const handleDeleteChat = (chatId: string) => {
  Modal.confirm({
    title: 'Delete Chat',
    content: 'Are you sure you want to delete this chat?',
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: () => {
      const updated = chatHistory.filter(chat => chat.conversationId !== chatId)
      setChatHistory(updated)
      if (selectedChatId === chatId) {
        setSelectedChatId(updated[0]?.conversationId || null)
      }
    }
  })
}
  //// Prev code:
  // const handleNewChat = () => {
  //   const wallet = walletAddress || 'default-wallet'
  //   const newChatTitle = `Chat ${chatHistory.length + 1}`
  //   const newId = addConversation(wallet, newChatTitle)
  //   setChatHistory(getConversations(wallet))
  //   setSelectedChatId(newId)
  //   setFadeTriggers((prev) => ({ ...prev, [newId]: (prev[newId] || 0) + 1 }))
  // }

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
                  <div onClick={() => router.push('/profile')} style={{ cursor: 'pointer' }}>
                    <Avatar size={64} src={userData?.profilePic || '/avatars/avatar1.png'} style={styles.avatar} />
                    <Text strong style={{ display: 'block', marginTop: 8 }}>
                      {userData?.firstName && userData?.lastName ? (`${userData.firstName} ${userData.lastName}`) : ('Guest')}
                    </Text>
                  </div>
                  {/* Logout button */}
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
                        onClick={async () => {
                          try {
                            const res = await fetch('http://localhost:8080/api/logout', {
                              method: 'POST',
                              credentials: 'include', // Send cookies
                            });

                            if (res.ok) {
                              // Clear user session state
                              setIsLoggedIn(false);
                              setUserData(null);
                              
                              // Reset theme to light mode
                              localStorage.removeItem('theme');
                              document.body.dataset.theme = 'default';
                              document.body.className = document.body.className.replace(/theme-\w+/g, '');
                              
                              // Clear any other user-specific localStorage data
                              localStorage.removeItem('userData');
                              localStorage.removeItem('userPreferences');
                              
                              // Force light mode styles
                              document.body.style.backgroundColor = '#ffffff';
                              document.body.style.color = '#333333';
                              
                              router.push('/');
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
                    <Text strong style={styles.chatHistoryText(currentTheme)}>Chat History</Text>
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
                            backgroundColor: selectedChatId === chat.conversationId ? '#6F9484' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                          onClick={() => setSelectedChatId(chat.conversationId)}
                        >
                          {editingChatId === chat.conversationId ? (
                            <span style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                              <input
                              ref={editInputRef}
                              value={editingTitle}
                              onChange={handleEditTitleChange}
                              onClick={e => e.stopPropagation()}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleEditTitleSave(editingChatId!)
                                } else if (e.key === 'Escape') {
                                  e.preventDefault()
                                  handleEditTitleCancel()
                                }
                              }}
                              onBlur={() => handleEditTitleSave(editingChatId!)}
                              style={{ flex: 1, marginRight: 8, borderRadius: 4, border: '1px solid #ccc', padding: '2px 6px' }}
                              autoFocus
                            />
                              <CheckOutlined
                                onClick={e => {
                                  e.stopPropagation()
                                  handleEditTitleSave(chat.conversationId)
                                }}
                                style={{ color: '#318182', marginRight: 8, cursor: 'pointer' }}
                              />
                              <CloseOutlined
                                onClick={e => {
                                  e.stopPropagation()
                                  handleEditTitleCancel()
                                }}
                                style={{ color: '#888', cursor: 'pointer' }}
                              />
                            </span>
                          ) : (
                            <>
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {chat.summary || chat.title}
                              </span>
                              <span style={{ marginLeft: 8, display: 'flex', gap: 4 }}>
                                <EditOutlined
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleEditChat(chat)
                                  }}
                                  style={{ color: '#318182', cursor: 'pointer' }}
                                />
                                <DeleteOutlined
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleDeleteChat(chat.conversationId)
                                  }}
                                  style={{ color: '#c0392b', cursor: 'pointer' }}
                                />
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom buttons */}
              <div style={styles.bottomButtons}>
                <Link href="/profile">
                  <Button style={buttonStyle} icon={<Avatar size={20} src={userData?.profilePic || '/avatars/avatar1.png'} />}>
                  Profile
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button style={buttonStyle} icon={<SettingOutlined />}>Settings</Button>
                </Link>
                <Button onClick={() => setDashboardVisible(true)} style={buttonStyle} icon={<CameraOutlined />}>Dashboard</Button>
                <Link href="/feedback">
                  <Button style={buttonStyle} icon={<BulbOutlined />}>
                    Feedback
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Sider>
       <Layout style={styles.contentArea(collapsed, currentTheme)}>
        <Content style={styles.content}>
          {selectedChatId && (
            <ChatGPT
              fetchPath="/api/chat-completion"  // Do we still need this? (from Violet)
              conversationId={selectedChatId}
              walletAddress={userData?.email || 'default-user'}
              isLoggedIn={isLoggedIn}
              inputBarColor="#9AB7A9"
              assistantBubbleColor="#9AB7A9"
              userBubbleColor="#318182"
              userAvatar={userData?.profilePic || '/avatars/avatar1.png'}
              chatMode={chatMode}
            />
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <ChatModeToggle mode={chatMode} onChange={setChatMode} />
          </div>
          {/*//// Prev code:
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
         }*/}
         </Content>
      </Layout>
      <div style={styles.footer as React.CSSProperties}>LongevityAI © 2025</div>
      <Dashboard visible={dashboardVisible} onClose={() => setDashboardVisible(false)} />
      {/* //// Prev: <Profile visible={profileVisible} walletAddress={walletAddress} onClose={() => setProfileVisible(false)} />
          //// Prev: <Dashboard visible={dashboardVisible} walletAddress={walletAddress} onClose={() => setDashboardVisible(false)} /> */}
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
  chatHistoryText: (theme: 'default' | 'dark'): React.CSSProperties => ({
    display: 'block',
    margin: '16px 0 8px',
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
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
