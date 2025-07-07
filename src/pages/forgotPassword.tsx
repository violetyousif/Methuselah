// Mohammad Hoque, 06/01/2025, Created Forgot Password page – allows users to request a reset link
// Syed Rabbey, 07/04/2025, Added functionality to send reset code and navigate to verification page

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Title, Text } = Typography;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Force light mode for forgot password page since user hasn't logged in yet
  useEffect(() => {
    document.body.dataset.theme = 'default';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onFinish({ email });
  };

  const onFinish = async (values: any) => {
    try {
      const res = await fetch('http://localhost:8080/api/auth/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('resetToken', data.token);
        router.push(`/verifyCode?email=${encodeURIComponent(values.email)}`);
      } else {
        setMessage(data.message || 'Failed to send code.');
      }
    } catch (err) {
      setMessage('Something went wrong.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page} className="forgot-password-page">
      <div style={styles.card} className="forgot-password-card mobile-card-shadow">
        
        {/* Back Button to Home */}
        <Link href="/login">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton} className="back-button-mobile">
            Back
          </Button>
        </Link>

        <h2 className="forgot-password-header">Forgot Password?</h2>
        <p  className="forgot-password-subtext">Enter your email and we'll send a reset link.</p>

        <Form layout="vertical" onSubmitCapture={handleSubmit}>
          <Form.Item label={<span style={styles.label}>Email</span>} required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              style={styles.placeholderStyle}
            />
          </Form.Item>

          {message && <Text type="danger" style={{ color: 'red' }}>{message}</Text>}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={styles.submitButton}
              className="forgot-password-submit-button"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </Form.Item>
          
        </Form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#1D1E2C',
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
    padding: '6rem 0',
  },
  card: {
    maxWidth: 400,
    margin: '1rem auto',
    padding: '2rem',
    backgroundColor: '#A0B6AA',
    borderRadius: '2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(32,54,37,0.1)'
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: '#203625',
    color: 'white',
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
    marginTop: '0.5rem',
  },
  placeholderStyle: {
    opacity: 0.8,
    color: '#1D1E2C',
  },
  submitButton: {
    marginTop: '8px',
    width: '100%',
    backgroundColor: '#203625',
    color: '#e0e0e0',
    borderRadius: '1rem'
  }

};