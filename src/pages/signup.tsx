// Name: Mizanur Mizan
// Description: Created the signup page frontend layout and input boxes for name, email, and password
// Date: 5/26/25
// Modified by Mizan: 5/29/25
// pages/signup.tsx

import React from 'react';
import { Form, Input, Button } from 'antd';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons'

function Signup() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Signup Data:', values);
  };

  const textColorStyle = { color: '#1D1E2C' };

  return (
    <div style={{backgroundColor: '#F1F1EB', minHeight: '100vh', padding: '4rem'}}>
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
      <h2 style={{color: '#1D1E2C', textAlign: 'center', fontWeight: 'bold'}}>Create an Account</h2>
      <Form
        form={form}
        name="signup"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label={<span style={textColorStyle}>Name</span>}
          name="name"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <Input />
        </Form.Item>

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

        {/*Set password input to require at least 8 characters, 1 number, and other constraints */}
        <Form.Item
          label={<span style={textColorStyle}>Password</span>}
          name="password"
          rules={[{ required: true, message: 'Please enter your password' },
            { min: 8, message: 'Password must be at least 8 characters long' },
            { pattern: /.*\d.*/, message: 'Password must contain at least one number' },
            { pattern: /.*[A-Z].*/, message: 'Password must contain at least one uppercase letter' },
            { pattern: /.*[@#$%].*/, message: 'Password must contain at least one special character (@, #, $, %)' },
            { pattern: /^[^\\'"<>`]*$/, message: 'Password cannot contain \\, \', ", <, >, or ` characters' }
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label={<span style={textColorStyle}>Confirm Password</span>}
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
              },
            }),
          ]}
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
          >Sign Up
          </Button>
        </Form.Item>
      </Form>
    <div style={{textAlign: 'center'}}>Already have an account?
        <Link href="/login"> Log In</Link>
    </div>
    </div>
    </div>
  );
}

export default Signup;
