// pages/signup.tsx

import React from 'react';
import { Form, Input, Button } from 'antd';

function Signup() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Signup Data:', values);
  };

  const textColorStyle = { color: '#F1F1EB' };

  return (
    <div style={{backgroundColor: '#1D1E2C', minHeight: '100vh'}}>
    <div style={{
      maxWidth: 400,
      margin: 'auto',
      padding: '2rem',
      backgroundColor: '#1D1E2C'
      }}>
      <h2 style={{color: '#F1F1EB', textAlign: 'center'}}>Create an Account</h2>
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

        <Form.Item
          label={<span style={textColorStyle}>Password</span>}
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
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
          >Sign Up
          </Button>
        </Form.Item>
      </Form>
    </div>
    </div>
  );
}

export default Signup;
