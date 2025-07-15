// components/AdminLayout.tsx
import React from 'react';
import { Layout } from 'antd';
import AdminSidebar from './AdminSidebar';

const { Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <Layout hasSider>
      <AdminSidebar />
      <Layout style={{ marginLeft: 220 }}>
        <Content style={{ padding: '2rem', background: '#F1F1EB', minHeight: '100vh' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
