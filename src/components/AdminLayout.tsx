// components/AdminLayout.tsx
// Violet Yousif, 07/12/2025, Created base concept for AdminLayout component with antd responsive sidebar for admin dashboard
// Mohammad Hoque, 07/18/2025, Enhanced with collapsible sidebar and responsive design

import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import AdminSidebar from './AdminSidebar';

const { Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    // Initialize with localStorage value if available (prevents flash)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminSidebarCollapsed');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(() => {
    // Initialize with localStorage value if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminSidebarManual');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isInitialized, setIsInitialized] = useState(false);
  const SIDEBAR_BREAKPOINT = 768;

  // Mark as initialized after component mounts
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return; // Don't run until component is initialized

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const prevWidth = windowWidth;
      setWindowWidth(newWidth);
      
      // Auto-collapse when going below breakpoint (responsive behavior)
      // But don't auto-collapse if we're already on mobile and user just opened it
      if (newWidth < SIDEBAR_BREAKPOINT && !collapsed && prevWidth >= SIDEBAR_BREAKPOINT) {
        // Only auto-collapse when transitioning FROM desktop TO mobile
        setCollapsed(true);
        setIsManuallyCollapsed(false); // Reset manual state for mobile
        // Save auto-collapse state
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminSidebarCollapsed', JSON.stringify(true));
          localStorage.setItem('adminSidebarManual', JSON.stringify(false));
        }
      } 
      // Only auto-expand when going above breakpoint if user hasn't manually collapsed it
      else if (newWidth >= SIDEBAR_BREAKPOINT && collapsed && !isManuallyCollapsed) {
        setCollapsed(false);
        // Save auto-expand state
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminSidebarCollapsed', JSON.stringify(false));
          localStorage.setItem('adminSidebarManual', JSON.stringify(false));
        }
      }
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Check initial window size (but don't force changes on initial load)
    const currentWidth = window.innerWidth;
    setWindowWidth(currentWidth);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed, isManuallyCollapsed, isInitialized, windowWidth]);

  const handleCollapse = (isCollapsed: boolean) => {
    setCollapsed(isCollapsed);
    
    // On mobile, don't mark as manually collapsed when opening the sidebar
    // This allows the overlay click to work properly and doesn't interfere with responsive behavior
    const isMobile = windowWidth < SIDEBAR_BREAKPOINT;
    if (isMobile && !isCollapsed) {
      // Opening sidebar on mobile - don't mark as manually controlled
      setIsManuallyCollapsed(false);
    } else {
      // Desktop behavior or closing on mobile
      setIsManuallyCollapsed(true);
    }
    
    // Save state to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminSidebarCollapsed', JSON.stringify(isCollapsed));
      localStorage.setItem('adminSidebarManual', JSON.stringify(!isMobile || isCollapsed));
    }
  };

  const getLayoutStyle = () => {
    const baseStyle = {
      marginLeft: collapsed ? 48 : 250,
      transition: isInitialized ? 'margin-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
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
      <AdminSidebar 
        collapsed={collapsed} 
        onCollapse={handleCollapse}
        isInitialized={isInitialized}
      />
      
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
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleCollapse(true);
          }}
        />
      )}
      
      <Layout style={getLayoutStyle()}>
        <Content 
          className="admin-content-area"
          style={{ 
            padding: '2rem', 
            background: '#F1F1EB', 
            minHeight: '100vh',
            overflow: 'auto',
            transition: isInitialized ? 'margin-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;