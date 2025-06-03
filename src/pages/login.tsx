// Name: Mizanur Mizan
// Description: Created the login page frontend layout and input boxes for email and password
// Date: 5/27/25
// Modified by Mizan: 5/29/25
// Edited by: Violet Yousif
// Date: 06/01/2025 - Reformatted code to simplify project's coding style
// Modified by: Mohammad Hoque
// Date: 06/01/2025 - Added "Forgot Password?" link
// Updated by: Mohammad Hoque
// Date: 06/02/2025 - Added dark mode support based on saved user theme

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

function Login() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [theme, setTheme] = useState<'default' | 'dark'>('default');

  // Load theme from <body data-theme="...">
  useEffect(() => {
    const currentTheme = document.body.dataset.theme as 'default' | 'dark' || 'default';
    setTheme(currentTheme);
  }, []);

  const onFinish = async (values: any) => {
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        message.success('Login successful');
        router.push('/');
      } else {
        message.error(data.message || 'Login failed');
      }
    } catch (err) {
      message.error('Server error');
    }
  };

  const styles = {
    page: {
      backgroundColor: theme === 'dark' ? '#0f0f17' : '#F1F1EB',
      minHeight: '100vh',
      padding: '6rem'
    },
    card: {
      maxWidth: 400,
      margin: 'auto',
      padding: '2rem',
      backgroundColor: theme === 'dark' ? '#252525' : '#A0B6AA',
      borderRadius: '2rem',
      border: '3px solid',
      borderColor: theme === 'dark' ? '#4b5563' : '#000000'
    },
    backButton: {
      marginBottom: '24px',
      backgroundColor: theme === 'dark' ? '#4b5563' : '#203625',
      color: '#ffffff',
      borderColor: theme === 'dark' ? '#4b5563' : '#203625',
      borderRadius: '9999px'
    },
    header: {
      color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
      textAlign: 'center' as const,
      fontWeight: 'bold' as const
    },
    label: {
      color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
    },
    submitContainer: {
      textAlign: 'center' as const
    },
    submitButton: {
      marginTop: '8px',
      width: '100%',
      backgroundColor: theme === 'dark' ? '#4b5563' : '#203625',
      borderColor: theme === 'dark' ? '#4b5563' : '#203625',
      color: '#ffffff',
      borderRadius: '1rem'
    },
    registerRedirect: {
      textAlign: 'center' as const,
      color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
    },
    forgotLink: {
      color: theme === 'dark' ? '#F1F1EA' : '#203625',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link href="/">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton}>
            Back
          </Button>
        </Link>

        <h2 style={styles.header}>Log In</h2>

        <Form form={form} name="login" layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={<span style={styles.label}>Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={<span style={styles.label}>Password</span>}
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Link href="/forgotPassword" style={styles.forgotLink}>
                Forgot your password?
              </Link>
            </div>
          </Form.Item>

          <Form.Item style={styles.submitContainer}>
            <Button type="primary" htmlType="submit" style={styles.submitButton}>
              Submit
            </Button>
          </Form.Item>
        </Form>

        <div style={styles.registerRedirect}>
          Don't have an account? <Link href="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
