// components/AdminLayout.tsx
// Violet Yousif, 07/12/2025, Created base concept for AdminLayout component with antd responsive sidebar for admin dashboard
// Mohammad Hoque, 07/18/2025, Enhanced with collapsible sidebar and responsive design

import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import AdminSidebar from './adminSidebar';

const { Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const SIDEBAR_BREAKPOINT = 768;

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const prevWidth = windowWidth;
      setWindowWidth(newWidth);
      
      console.log('AdminLayout resize:', { newWidth, prevWidth, collapsed, isManuallyCollapsed });
      
      // Only auto-collapse/expand when crossing the breakpoint AND user hasn't manually controlled it recently
      if (!isManuallyCollapsed) {
        // Auto-collapse when going below breakpoint (like user sidebar)
        if (newWidth < SIDEBAR_BREAKPOINT && !collapsed) {
          console.log('AdminLayout: Auto-collapsing for mobile');
          setCollapsed(true);
        } 
        // Auto-expand when going above breakpoint (like user sidebar)
        else if (newWidth >= SIDEBAR_BREAKPOINT && collapsed) {
          console.log('AdminLayout: Auto-expanding for desktop');
          setCollapsed(false);
        }
      }
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Check initial window size
    handleResize();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed, isManuallyCollapsed]);

  const handleCollapse = (isCollapsed: boolean) => {
    console.log('AdminLayout: handleCollapse called with:', isCollapsed);
    setCollapsed(isCollapsed);
    setIsManuallyCollapsed(true); // Mark as manually controlled - no reset
  };

  const getLayoutStyle = () => {
    const baseStyle = {
      marginLeft: collapsed ? 48 : 250,
      transition: 'margin-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Match user sidebar timing
      backgroundColor: '#F1F1EB',
      minHeight: '100vh'
    };

    // Always use collapsed margin on mobile for consistent behavior
    if (windowWidth < SIDEBAR_BREAKPOINT) {
      return {
        ...baseStyle,
        marginLeft: 48,
      };
    }

    return baseStyle;
  };

  return (
    <Layout hasSider style={{ minHeight: '100vh', backgroundColor: '#F1F1EB' }}>
      <AdminSidebar collapsed={collapsed} onCollapse={handleCollapse} />
      
      {/* Overlay for mobile when sidebar is open */}
      {!collapsed && windowWidth < SIDEBAR_BREAKPOINT && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'block',
          }}
          onClick={() => handleCollapse(true)}
        />
      )}
      
      <Layout style={getLayoutStyle()}>
        <Content 
          className="admin-content-area"
          style={{ 
            padding: '2rem', 
            background: '#F1F1EB', 
            minHeight: '100vh',
            overflow: 'auto'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;