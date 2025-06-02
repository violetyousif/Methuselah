// Name: Mizanur Mizan
// Description: Created the login page frontend layout and input boxes for email and password
// Date: 5/27/25
// Modified by Mizan: 5/29/25
// pages/userLogin.tsx

// Edited by: Violet Yousif
// Date: 06/01/2025
// Reformatted the code to simplify project's coding style.

// Modified by: Mohammad Hoque
// Date: 06/01/2025
// Description: Added "Forgot Password?" link below password field


import React from 'react';
import { Form, Input, Button, message } from 'antd';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

  // Edited by: Violet Yousif
  // Date: 06/01/2025
  // Description: Edited function to fetch backend data, include
  // error handling in the login submission and route after successful login.
function Login() {
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      // Connect to backend API to sign-in user
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token); //grabs tokens from backend when user logs in. Stores them in browser local storage -Viktor 6/2/2025
        message.success('Login successful');
        router.push('/');   // Redirect to home page (index.tsx)
      } else {
        message.error(data.message || 'Login failed');
      }
    } catch (err) {
      message.error('Server error');
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
              <Link href="/forgotPassword" style={{ color: '#203625', fontWeight: 'bold' }}>
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

const styles = {
  page: {
    backgroundColor: '#F1F1EB',
    minHeight: '100vh',
    padding: '6rem'
  },
  card: {
    maxWidth: 400,
    margin: 'auto',
    padding: '2rem',
    backgroundColor: '#A0B6AA',
    borderRadius: '2rem',
    border: '3px solid'
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: '#203625',
    color: 'white',
    borderColor: '#203625',
    borderRadius: '9999px'
  },
  header: {
    color: '#1D1E2C',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const
  },
  label: {
    color: '#1D1E2C'
  },
  submitContainer: {
    textAlign: 'center' as 'center'
  },
  submitButton: {
    marginTop: '8px',
    width: '100%',
    backgroundColor: '#4b5563',
    borderColor: '#4b5563',
    color: '#e0e0e0',
    borderRadius: '1rem'
  },
  registerRedirect: {
    textAlign: 'center' as const
  }
};
