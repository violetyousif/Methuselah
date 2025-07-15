import React from 'react';
import { Layout, Menu } from 'antd';
import { useRouter } from 'next/router';
import {
  UploadOutlined,
  DatabaseOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const AdminIndex: React.FC = () => {
  const router = useRouter();

  const handleNav = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      try {
        await fetch('http://localhost:8080/api/logout', {
          method: 'POST',
          credentials: 'include',
        });
        router.push('/');
      } catch {
        // handle error
      }
    } else {
      router.push(`/admin/${key}`);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" style={{ background: '#203625' }}>
        <div style={{ color: 'white', padding: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
          Methuselah Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[router.pathname.replace('/admin/', '')]}
          onClick={handleNav}
          items={[
            {
              key: 'adminUpload',
              icon: <UploadOutlined />,
              label: 'Upload Content',
            },
            {
              key: 'adminManageData',
              icon: <DatabaseOutlined />,
              label: 'Manage Chunks',
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
            },
          ]}
        />
      </Sider>

      <Layout>
        <Content
          style={{
            margin: '2rem',
            background: '#f5f5f5',
            borderRadius: '1rem',
            minHeight: 'calc(100vh - 4rem)',
            padding: '2rem',
          }}
        >
          <h1>Welcome to the Admin Dashboard</h1>
          <p>Select a section from the sidebar to begin managing pretraining data.</p>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminIndex;
