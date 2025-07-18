// components/AdminLayout.tsx
// Mohammad Hoque, 07/18/2025, Enhanced with collapsible sidebar and responsive design

import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import AdminSidebar from './adminSidebar';

const { Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [initialLoad, setInitialLoad] = useState(true);
  const SIDEBAR_BREAKPOINT = 768;

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      
      console.log('AdminLayout resize:', { newWidth, collapsed, isManuallyCollapsed, initialLoad });
      
      // Only auto-collapse on small screens, but respect manual control
      if (newWidth < SIDEBAR_BREAKPOINT && !collapsed && !isManuallyCollapsed) {
        console.log('AdminLayout: Auto-collapsing for mobile');
        setCollapsed(true);
      }
      // Don't auto-expand on large screens - let user control it manually
    };

    window.addEventListener('resize', handleResize);
    
    // Only check initial window size on first load, not on manual state changes
    if (initialLoad) {
      handleResize();
      setInitialLoad(false);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed, isManuallyCollapsed, initialLoad]);

  const handleCollapse = (isCollapsed: boolean) => {
    console.log('AdminLayout: handleCollapse called with:', isCollapsed);
    console.log('AdminLayout: Setting manual control to TRUE');
    setCollapsed(isCollapsed);
    setIsManuallyCollapsed(true); // Mark as manually controlled
    
    // Reset the manual override after some time to allow automatic behavior later
    setTimeout(() => {
      console.log('AdminLayout: Resetting manual control to FALSE');
      setIsManuallyCollapsed(false);
    }, 30000); // Reset after 30 seconds (extended for testing)
  };

  const getLayoutStyle = () => {
    const baseStyle = {
      marginLeft: collapsed ? 48 : 250,
      transition: 'margin-left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      backgroundColor: '#F1F1EB',
    };

    // Use JS for responsive behavior instead of CSS media queries
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
