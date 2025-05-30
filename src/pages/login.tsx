// Name: Mizanur Mizan
// Description: Created the login page frontend layout and input boxes for email and password
// Date: 5/27/25
// Modified by Mizan: 5/29/25
// pages/login.tsx

import React from 'react';
import { Form, Input, Button } from 'antd';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons'

function Login() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Login Data:', values);
  };

  const textColorStyle = { color: '#1D1E2C' };

  return (
    <div style={{backgroundColor: '#F1F1EB', minHeight: '100vh', padding: '6rem'}}>
    <div style={{
      maxWidth: 400,
      margin: 'auto',
      padding: '2rem',
      backgroundColor: '#A0B6AA',
      borderRadius: '2rem',
      border: '3px solid'
      }}>
      <Link href="/">
          <Button
            icon={<ArrowLeftOutlined />}
            style={{
              marginBottom: '24px',
              backgroundColor: '#203625',
              color: 'white',
              borderColor: '#203625',
              borderRadius: '9999px'
            }}
          >
            Back
          </Button>
        </Link>
      <h2 style={{color: '#1D1E2C', textAlign: 'center', fontWeight: 'bold'}}>Log In</h2>
      <Form
        form={form}
        name="login"
        layout="vertical"
        onFinish={onFinish}
      >

        <Form.Item
          label={<span style={textColorStyle}>Email</span>}
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={<span style={textColorStyle}>Password</span>}
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password />
        </Form.Item>


        <Form.Item style={{textAlign: 'center'}}>
          <Button
          type="primary"
          htmlType="submit"
          style ={{
              marginTop: '8px',
              width: '100%',
              backgroundColor: '#4b5563',
              borderColor: '#4b5563',
              color: '#e0e0e0',
              borderRadius: '1rem'
            }}
          >Submit
          </Button>
        </Form.Item>
      </Form>
    <div style={{textAlign: 'center'}}>Don't have an account?
        <Link href="/signup"> Sign Up</Link>
    </div>
    </div>
    </div>
  );
}

export default Login;
