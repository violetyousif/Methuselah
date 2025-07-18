// Violet Yousif, 07/06/25, Created Admin sidebar component for navigation

// components/AdminSidebar.tsx

import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UploadOutlined,
  DatabaseOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Sider } = Layout;

const AdminSidebar: React.FC = () => {
  const router = useRouter();

  const handleMenuClick = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      await fetch('http://localhost:8080/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/');
    } else {
      router.push(`/admin/${key}`);
    }
  };

  return (
    <Sider
      width={220}
      style={{
        height: '100vh',
        background: '#203625',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div style={{ color: 'white', padding: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
        Methuselah Admin
      </div>
      <Menu
        mode="inline"
        theme="dark"
        defaultSelectedKeys={['adminUpload']}
        onClick={handleMenuClick}
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
  );
};

export default AdminSidebar;
