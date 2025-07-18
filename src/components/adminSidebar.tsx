import React from 'react';
import { Menu } from 'antd';
import { useRouter } from 'next/router';
import {
  UploadOutlined,
  DatabaseOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const AdminSidebar: React.FC = () => {
  const router = useRouter();

  const handleNav = async ({ key }: { key: string }) => {
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

  // Highlight the current route
  const selectedKey = router.pathname.replace('/admin/', '');

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
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
      style={{ height: '100%', borderRight: 0 }}
    />
  );
};

export default AdminSidebar;