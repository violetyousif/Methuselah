// Name: Mizanur Mizan
// Description: Created the register page frontend layout and input boxes for name, email, and password
// Date: 5/26/25
// Modified by Mizan: 5/29/25
// pages/register.tsx

// Edited by: Violet Yousif
// Date: 06/01/2025
// Reformatted the code to simplify project's coding style.

import React from 'react';
import { Form, Input, Button } from 'antd';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons';

function register() {
  const [form] = Form.useForm();

  // Edited by: Violet Yousif
  // Date: 06/01/2025
  // Description: Edited function to fetch backend data, include
  // error handling and run validation in the register form submission.
  const onFinish = async (values: any) => {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);
    console.log('register successful: ', result);
    } catch (error) {
      console.error('ERROR: register failed: ', error);
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

        <h2 style={styles.header}>Create an Account</h2>

        <Form form={form} name="register" layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={<span style={styles.label}>Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input />
          </Form.Item>

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

          {/* Set password input to require at least 8 characters, 1 number, and other constraints */}
          <Form.Item
            label={<span style={styles.label}>Password</span>}
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters long' },
              { pattern: /.*\d.*/, message: 'Password must contain at least one number' },
              { pattern: /.*[A-Z].*/, message: 'Password must contain at least one uppercase letter' },
              { pattern: /.*[!@#$%*].*/, message: 'Password must contain at least one special character (!,@,#,$,%,*)' },
              { pattern: /^[^\\'"<>`]*$/, message: 'Password cannot contain \\, \', ", <, >, or ` characters' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label={<span style={styles.label}>Confirm Password</span>}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                }
              })
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item style={styles.submitContainer}>
            <Button type="primary" htmlType="submit" style={styles.submitButton}>
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <div style={styles.loginRedirect}>
          Already have an account? <Link href="/userLogin">Log In</Link>
        </div>
      </div>
    </div>
  );
}

export default register;

const styles = {
  page: {
    backgroundColor: '#F1F1EB',
    minHeight: '100vh',
    padding: '4rem'
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
    textAlign: 'center' as const
  },
  submitButton: {
    marginTop: '8px',
    width: '100%',
    backgroundColor: '#4b5563',
    borderColor: '#4b5563',
    color: '#e0e0e0',
    borderRadius: '1rem'
  },
  loginRedirect: {
    textAlign: 'center' as const
  }
} as const;
