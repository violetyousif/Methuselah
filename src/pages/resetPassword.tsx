// Syed Rabbey, 07/06/2025, Lets user enter new password after code verification, updates it in DB, and redirects to login.
// Mohammad Hoque, 07/06/2025, Added default mode enforcement and improved styling consistency

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message, notification } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function ResetPassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { email } = router.query;

  useEffect(() => {
    document.body.dataset.theme = 'default';
  }, []);

  const handleSubmit = async (values: any) => {
    if (!email) return message.error('Missing email. Please restart the reset process.');

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: values.newPassword }),
      });

      const data = await res.json();

    if (res.ok) {
      notification.success({
        message: 'Password Successfully Reset!',
        description: 'You can now log in with your new password.',
        placement: 'topRight',
        duration: 3,
      });
      router.push('/login');
    } else {
        message.error(data.message || 'Failed to update password.');
      }
    } catch (err) {
      message.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link href="/forgotPassword">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton}>
            Back
          </Button>
        </Link>

        <h1 style={styles.header}>Reset Your Password</h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            style={styles.rowSpacing}
            label={<span style={styles.label}>New Password</span>}
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter a secure password' },
              { min: 10, message: 'Password must be at least 10 characters long' },
              { pattern: /.*\d.*/, message: 'Password must contain at least one number' },
              { pattern: /.*[A-Z].*/, message: 'Password must contain at least one uppercase letter' },
              { pattern: /.*[a-z].*/, message: 'Password must contain at least one lowercase letter' },
              { pattern: /.*[!@#$%*].*/, message: 'Password must contain at least one special character (!,@,#,$,%,*)' },
              { pattern: /^[^\\'\"<>`]*$/, message: 'Password cannot contain \\, \' , \" , < , > , or ` characters' }
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              style={styles.placeholderStyle}
            />
          </Form.Item>

          <Form.Item
            style={styles.rowSpacing}
            label={<span style={styles.label}>Confirm Password</span>}
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              })
            ]}
          >
            <Input.Password
              placeholder="Confirm new password"
              style={styles.placeholderStyle}
            />
          </Form.Item>

          <Form.Item style={styles.submitContainer}>
            <Button
              type="primary"
              htmlType="submit"
              style={styles.submitButton}
              loading={loading}
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#F1F1EB',
    display: 'block',
    position: 'absolute' as const,
    minHeight: '100vh',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '2rem'
  },
  card: {
    maxWidth: 400,
    margin: '1rem auto',
    padding: '2rem',
    backgroundColor: '#A0B6AA',
    borderRadius: '2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(32,54,37,0.1)',
    paddingBottom: '24px'
  },
  rowSpacing: {
    marginBottom: '0.6px'
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: '#203625',
    color: '#F1F1EB',
    border: 'none',
    borderRadius: '9999px'
  },
  header: {
    color: '#1D1E2C',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const
  },
  label: {
    color: '#1D1E2C',
    fontSize: '0.95rem',
    display: 'block',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.5rem'
  },
  placeholderStyle: {
    opacity: 0.8,
    color: '#1D1E2C'
  },
  submitContainer: {
    textAlign: 'center' as const
  },
  submitButton: {
    marginTop: '8px',
    width: '40%',
    backgroundColor: '#203625',
    color: '#e0e0e0',
    borderRadius: '1rem'
  }
} as const;
