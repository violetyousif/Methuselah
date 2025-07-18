// Violet Yousif, 07/06/25, Created Admin sidebar component for navigation
// Mohammad Hoque, 07/18/2025, Enhanced with better layout integration and responsive design to match user sidebar

import React from 'react';
import { Layout, Button, Avatar, Typography } from 'antd';
import {
  UploadOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  CommentOutlined,
  MenuOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import '@/styles/admin.css';

const { Sider } = Layout;
const { Text } = Typography;

interface AdminSidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed = false, onCollapse }) => {
  const router = useRouter();

  const handleCollapse = (newCollapsed: boolean) => {
    console.log('AdminSidebar: handleCollapse called with:', newCollapsed);
    onCollapse?.(newCollapsed);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getCurrentSelectedKey = () => {
    const path = router.pathname;
    if (path.includes('adminUpload')) return 'adminUpload';
    if (path.includes('adminManageData')) return 'adminManageData';
    if (path.includes('adminViewFeedback')) return 'adminViewFeedback';
    if (path === '/admin') return 'dashboard';
    return 'dashboard';
  };

  // Button style matching user sidebar exactly
  const buttonStyle = {
    width: '100%',
    backgroundColor: '#F1F1EA',
    color: '#000000', // Match user sidebar exactly
    border: 'none',
    borderRadius: '1rem',
    marginBottom: '8px',
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '12px 16px',
    height: 'auto',
    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    transform: 'translateX(0)',
  };

  const selectedButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(29, 30, 44, 0.15)',
    fontWeight: 600,
  };

  return (
    <Sider
      width={collapsed ? 48 : 250}
      className="admin-sidebar"
      style={{
        backgroundColor: '#8AA698', // Match user interface green
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Match user sidebar timing
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {collapsed ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '8px',
          height: '100vh',
          gap: '8px',
          opacity: 1,
          transform: 'translateX(0)',
          transition: 'all 0.3s ease-in-out',
        }}>
          <Button 
            icon={<MenuOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              handleCollapse(false);
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#000000', // Match user sidebar
              padding: '8px',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Open Menu"
            type="text"
          />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px',
            animation: 'fadeInFromLeft 0.4s ease-out',
          }}>
            <Button
              icon={<DashboardOutlined />}
              onClick={() => handleNavigation('/admin')}
              className="admin-collapsed-btn"
              style={{
                backgroundColor: getCurrentSelectedKey() === 'dashboard' ? 'rgba(29, 30, 44, 0.2)' : 'transparent',
                border: 'none',
                color: '#000000', // Match user sidebar
                padding: '8px',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
              }}
              title="Dashboard"
              type="text"
            />
            <Button
              icon={<UploadOutlined />}
              onClick={() => handleNavigation('/admin/adminUpload')}
              className="admin-collapsed-btn"
              style={{
                backgroundColor: getCurrentSelectedKey() === 'adminUpload' ? 'rgba(29, 30, 44, 0.2)' : 'transparent',
                border: 'none',
                color: '#000000', // Match user sidebar
                padding: '8px',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
              }}
              title="Upload Content"
              type="text"
            />
            <Button
              icon={<DatabaseOutlined />}
              onClick={() => handleNavigation('/admin/adminManageData')}
              className="admin-collapsed-btn"
              style={{
                backgroundColor: getCurrentSelectedKey() === 'adminManageData' ? 'rgba(29, 30, 44, 0.2)' : 'transparent',
                border: 'none',
                color: '#000000', // Match user sidebar
                padding: '8px',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
              }}
              title="Manage Data"
              type="text"
            />
            <Button
              icon={<CommentOutlined />}
              onClick={() => handleNavigation('/admin/adminViewFeedback')}
              className="admin-collapsed-btn"
              style={{
                backgroundColor: getCurrentSelectedKey() === 'adminViewFeedback' ? 'rgba(29, 30, 44, 0.2)' : 'transparent',
                border: 'none',
                color: '#000000', // Match user sidebar
                padding: '8px',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
              }}
              title="View Feedback"
              type="text"
            />
          </div>
        </div>
      ) : (
        <div className="sidebar-content" style={{ animation: 'slideInFromLeft 0.4s ease-out' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* Avatar Container - matching user sidebar exactly */}
              <div style={{ 
                backgroundColor: '#8AA698', // Match user sidebar exactly
                padding: '16px', 
                textAlign: 'center',
                position: 'relative'
              }}>
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCollapse(true);
                  }}
                  style={{
                    position: 'absolute',
                    left: 8,
                    top: 8,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#000000', // Match user sidebar exactly
                    boxShadow: 'none',
                  }}
                  className="hamburger-button"
                />
                <div style={{ cursor: 'pointer' }}>
                  <Avatar size={64} style={{ 
                    backgroundColor: '#6b8d7a', // Keep this for admin distinction
                    marginTop: 16 
                  }}>
                    A
                  </Avatar>
                  <Text strong style={{ 
                    display: 'block', 
                    marginTop: 8,
                    color: '#000000', // Match user sidebar text color
                    fontSize: '16px'
                  }}>
                    Admin Panel
                  </Text>
                </div>
              </div>
              
              {/* Menu Section - matching user sidebar structure */}
              <div style={{ padding: '16px' }}>
                <Text strong style={{ 
                  display: 'block', 
                  margin: '16px 0 8px',
                  color: '#000000' // Match user sidebar text color
                }}>
                  Navigation
                </Text>
              </div>
              
              {/* Navigation Buttons - matching user sidebar chat list */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 16px',
                minHeight: 0,
                maxHeight: 'calc(100vh - 280px)'
              }}>
                <Button 
                  className="sidebar-button"
                  onClick={() => handleNavigation('/admin')}
                  style={getCurrentSelectedKey() === 'dashboard' ? selectedButtonStyle : buttonStyle}
                  icon={<DashboardOutlined />}
                >
                  Dashboard
                </Button>
                <Button 
                  className="sidebar-button"
                  onClick={() => handleNavigation('/admin/adminUpload')}
                  style={getCurrentSelectedKey() === 'adminUpload' ? selectedButtonStyle : buttonStyle}
                  icon={<UploadOutlined />}
                >
                  Upload Content
                </Button>
                <Button 
                  className="sidebar-button"
                  onClick={() => handleNavigation('/admin/adminManageData')}
                  style={getCurrentSelectedKey() === 'adminManageData' ? selectedButtonStyle : buttonStyle}
                  icon={<DatabaseOutlined />}
                >
                  Manage Data
                </Button>
                <Button 
                  className="sidebar-button"
                  onClick={() => handleNavigation('/admin/adminViewFeedback')}
                  style={getCurrentSelectedKey() === 'adminViewFeedback' ? selectedButtonStyle : buttonStyle}
                  icon={<CommentOutlined />}
                >
                  View Feedback
                </Button>
              </div>
            </div>
            
            {/* Bottom buttons - matching user sidebar exactly */}
            <div style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '60px',
              flexShrink: 0,
              backgroundColor: 'inherit'
            }}>
              <Button 
                className="sidebar-button"
                onClick={handleLogout}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#e74c3c',
                  color: '#ffffff',
                }}
                icon={<LogoutOutlined />}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </Sider>
  );
};

export default AdminSidebar;
