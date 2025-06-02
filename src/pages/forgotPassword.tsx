// Name: Mohammad Hoque
// Description: Forgot Password page – allows users to request a reset link
// Date: 06/01/2025

import React from 'react';
import { Form, Input, Button, message } from 'antd';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons';

function ForgotPassword() {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const response = await fetch('http://localhost:8080/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok) {
        message.success('Password reset link sent. Please check your email.');
        form.resetFields();
      } else {
        message.error(data.message || 'Unable to send reset link.');
      }
    } catch (err) {
      message.error('Server error. Please try again later.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        
        {/* Back Button to Home */}
        <Link href="/">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton}>
            Back
          </Button>
        </Link>

        <h2 style={styles.header}>Forgot Password?</h2>
        <p style={styles.subtext}>Enter your email and we'll send a reset link.</p>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={<span style={styles.label}>Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="janedoe@example.com" style={styles.placeholderStyle} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block style={styles.submitButton}>
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>

        {/* Navigation Links */}
        <div style={styles.linkGroup}>
          <div>
            <Link href="/login" style={styles.linkColor}>Back to Login</Link>
          </div>
          <div style={{ marginTop: '1rem' }}>
            Don’t have an account? <Link href="/register" style={styles.linkColor}>Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

const styles = {
  page: {
    backgroundColor: '#F1F1EB',
    minHeight: '100vh',
    padding: '6rem',
  },
  card: {
    maxWidth: 400,
    margin: 'auto',
    padding: '2rem',
    backgroundColor: '#A0B6AA',
    borderRadius: '2rem',
    border: '3px solid',
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: '#203625',
    color: 'white',
    borderColor: '#203625',
    borderRadius: '9999px',
  },
  header: {
    color: '#1D1E2C',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
  },
  subtext: {
    textAlign: 'center' as const,
    marginBottom: '1rem',
    color: '#1D1E2C',
  },
  label: {
    color: '#1D1E2C',
  },
  placeholderStyle: {
    opacity: 0.8,
    color: '#1D1E2C',
  },
  submitButton: {
    backgroundColor: '#203625',
    borderColor: '#203625',
    color: '#e0e0e0',
    borderRadius: '1rem',
  },
  linkColor: {
    color: '#C9F4DC',
    fontWeight: '600' as const,
    textDecoration: 'underline' as const,
  },
  linkGroup: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
  },
};
