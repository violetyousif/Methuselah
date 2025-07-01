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
// Mohammad Hoque, 7/1/2025, Added chat tab edit name and delete functionality


import ChatGPT from '@/components/ChatGPT'
import { Layout, Button, Avatar, Typography, message, Input, Modal, Dropdown } from 'antd'
import { MenuOutlined, SettingOutlined, CameraOutlined, BulbOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons'
import Link from 'next/link'
import Profile from './profile' // Checked by Mohammad, 06/18/2025
import Dashboard from './dashboard'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getConversations, addConversation, updateConversationTitle, deleteConversation, Conversation, UserData } from '../models'
import { useRouter } from 'next/router'
import '@/styles/globals.css'
import ChatModeToggle from './ChatModeToggle';



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
  const [chatMode, setChatMode] = useState<'direct' | 'conversational'>('direct');
  // Mohammad Hoque, 7/1/2025: Added state for inline edit chat functionality
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingChatTitle, setEditingChatTitle] = useState('')
  
  // Mohammad Hoque, 7/1/2025: Added responsive sidebar state management
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  // Responsive breakpoint for sidebar (adjust this value as needed)
  const SIDEBAR_BREAKPOINT = 768 // pixels


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

  // Mohammad Hoque, 7/1/2025: Window resize handler for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth
      setWindowWidth(newWidth)
      
      // Auto-collapse sidebar when window is too small, unless manually controlled
      if (newWidth < SIDEBAR_BREAKPOINT && !collapsed) {
        setCollapsed(true)
      } else if (newWidth >= SIDEBAR_BREAKPOINT && collapsed && !isManuallyCollapsed) {
        setCollapsed(false)
      }
    }

    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Check initial window size
    handleResize()

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [collapsed, isManuallyCollapsed])

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

  // Mohammad Hoque, 7/1/2025: Handle manual sidebar toggle for responsive behavior
  const handleSidebarToggle = (newCollapsedState: boolean) => {
    setCollapsed(newCollapsedState)
    setIsManuallyCollapsed(newCollapsedState)
    
    // If user manually expands on small screen, respect their choice temporarily
    // But reset manual override when they resize to large screen and back
    if (!newCollapsedState && windowWidth < SIDEBAR_BREAKPOINT) {
      // User wants to expand on small screen - allow it but reset manual flag on next resize
      setTimeout(() => {
        if (window.innerWidth < SIDEBAR_BREAKPOINT) {
          setIsManuallyCollapsed(false)
        }
      }, 100)
    }
  }

  // Mohammad Hoque, 7/1/2025: Added functions for inline edit and delete chat functionality
  const handleEditChat = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId)
    setEditingChatTitle(currentTitle)
  }

  const handleSaveEditChat = () => {
    if (editingChatId && editingChatTitle.trim()) {
      updateConversationTitle(editingChatId, editingChatTitle.trim())
      const userId = userData?.email || 'default-user'
      setChatHistory(getConversations(userId))
      setEditingChatId(null)
      setEditingChatTitle('')
      message.success('Chat name updated successfully!')
    }
  }

  const handleCancelEdit = () => {
    setEditingChatId(null)
    setEditingChatTitle('')
  }

  const handleDeleteChat = (chatId: string) => {
    Modal.confirm({
      title: 'Delete Chat',
      content: 'Are you sure you want to delete this chat? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        deleteConversation(chatId)
        const userId = userData?.email || 'default-user'
        const updatedHistory = getConversations(userId)
        setChatHistory(updatedHistory)
        
        // If deleted chat was selected, select another chat or create new one
        if (selectedChatId === chatId) {
          if (updatedHistory.length > 0) {
            setSelectedChatId(updatedHistory[0].conversationId)
          } else {
            // Create a new chat if no chats left
            const newId = addConversation(userId, 'Chat 1')
            setChatHistory(getConversations(userId))
            setSelectedChatId(newId)
          }
        }
        message.success('Chat deleted successfully!')
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
            <Button 
              icon={<MenuOutlined />} 
              onClick={() => handleSidebarToggle(false)} 
              style={styles.collapsedIconBtn(currentTheme)}
              className="collapsed-sidebar-icon"
            />
            <div style={styles.collapsedIconContainer}>
              <Button 
                icon={<Avatar size={20} src={userData?.profilePic || '/avatars/avatar1.png'} />}
                onClick={() => router.push('/profile')}
                style={styles.collapsedIconBtn(currentTheme)}
                className="collapsed-sidebar-icon"
                title="Profile"
              />
              <Button 
                icon={<SettingOutlined />}
                onClick={() => router.push('/settings')}
                style={styles.collapsedIconBtn(currentTheme)}
                className="collapsed-sidebar-icon"
                title="Settings"
              />
              <Button 
                icon={<CameraOutlined />}
                onClick={() => setDashboardVisible(true)}
                style={styles.collapsedIconBtn(currentTheme)}
                className="collapsed-sidebar-icon"
                title="Dashboard"
              />
              <Button 
                icon={<BulbOutlined />}
                onClick={() => router.push('/feedback')}
                style={styles.collapsedIconBtn(currentTheme)}
                className="collapsed-sidebar-icon"
                title="Feedback"
              />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={styles.avatarContainer}>
                  <Button
                    icon={<MenuOutlined />}
                    onClick={() => handleSidebarToggle(true)}
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
                
                <div style={styles.menuSection}>
                  <Button onClick={handleNewChat} style={buttonStyle}>+ New Chat</Button>
                  <Text strong style={styles.chatHistoryText(currentTheme)}>Chat History</Text>
                </div>
                
                <div
                  className="chat-list-container"
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0 16px',
                    minHeight: 0,
                    maxHeight: 'calc(100vh - 280px)' // Ensure space for bottom buttons
                  }}
                >
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.conversationId}
                      style={{
                        ...styles.chatItem,
                        backgroundColor: selectedChatId === chat.conversationId ? '#6F9484' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      {/* Mohammad Hoque, 7/1/2025: Modified chat item to include inline edit and delete options */}
                      {editingChatId === chat.conversationId ? (
                        <Input
                          value={editingChatTitle}
                          onChange={(e) => setEditingChatTitle(e.target.value)}
                          onPressEnter={handleSaveEditChat}
                          onBlur={handleSaveEditChat}
                          autoFocus
                          size="small"
                          style={{ 
                            flex: 1, 
                            marginRight: 8,
                            backgroundColor: currentTheme === 'dark' ? '#3a3a3a' : '#ffffff',
                            color: currentTheme === 'dark' ? '#ffffff' : '#000000'
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              handleCancelEdit()
                            }
                          }}
                        />
                      ) : (
                        <div
                          style={{ flex: 1, cursor: 'pointer' }}
                          onClick={() => setSelectedChatId(chat.conversationId)}
                        >
                          {chat.summary || chat.title}
                        </div>
                      )}
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'edit',
                              label: 'Rename',
                              icon: <EditOutlined />,
                              onClick: () => handleEditChat(chat.conversationId, chat.title)
                            },
                            {
                              key: 'delete',
                              label: 'Delete',
                              icon: <DeleteOutlined />,
                              danger: true,
                              onClick: () => handleDeleteChat(chat.conversationId)
                            }
                          ]
                        }}
                        placement="bottomRight"
                        trigger={['click']}
                      >
                        <Button
                          type="text"
                          icon={<MoreOutlined />}
                          size="small"
                          style={{ 
                            color: currentTheme === 'dark' ? '#F1F1EA' : '#1D1E2C',
                            opacity: 0.7
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Dropdown>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Bottom buttons - always visible */}
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
       <Layout style={styles.contentArea(collapsed, currentTheme)} className="content-area-responsive">
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
      
      {/* Mohammad Hoque, 7/1/2025: Removed edit modal - now using inline editing */}
      
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
    zIndex: 1000,
    transition: 'width 0.3s ease' // Smooth transition for width changes
  }),
  collapsedMenu: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    paddingTop: '8px',
    height: '100vh',
    gap: '8px'
  },
  collapsedIconContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px'
  },
  collapsedIconBtn: (theme: 'default' | 'dark') => ({
    backgroundColor: 'transparent',
    border: 'none',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    cursor: 'pointer'
  }),
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
  bottomButtons: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginBottom: '60px',
    flexShrink: 0, // Prevent shrinking
    backgroundColor: 'inherit' // Inherit background to match sidebar
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
    backgroundColor: theme === 'dark' ? '#0f0f17' : '#FFFFFF',
    transition: 'margin-left 0.3s ease' // Smooth transition for responsive behavior
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
