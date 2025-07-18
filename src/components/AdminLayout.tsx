import React from 'react';
import { Layout } from 'antd';
import AdminSidebar from './AdminSidebar';

const { Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => (
  <Layout hasSider style={{ minHeight: '100vh' }}>
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{ background: '#203625' }}
      width={220}
    >
      <div style={{ color: 'white', padding: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
        Methuselah Admin
      </div>
      <AdminSidebar />
    </Sider>
    <Layout style={{ marginLeft: 0 }}>
      <Content style={{ padding: '2rem', background: '#F1F1EB', minHeight: '100vh' }}>
        {children}
      </Content>
    </Layout>
  </Layout>
);

export default AdminLayout;