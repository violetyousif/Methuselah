// Syed Rabbey, 07/04/2025, Page to verify code sent to user's email for password reset. Appears after user submits email for reset code.
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { useRouter } from 'next/router';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function VerifyCodePage() {
  const router = useRouter();
  const { email } = router.query;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('resetToken') : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, token }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/resetPassword?email=${email}`);
      } else {
        setError(data.message || 'Invalid code');
      }
    } catch (err) {
      setError('Something went wrong.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link href="/login">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton}>
            Back
          </Button>
        </Link>

        <Title level={3} style={styles.header}>Verify Your Email</Title>

        {email && <Text style={styles.subtext}>Code sent to: {email}</Text>}

        <Form layout="vertical" onSubmitCapture={handleSubmit}>
          <Form.Item label={<span style={styles.label}>6-digit Code</span>} required>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter the code"
              maxLength={6}
              style={styles.placeholderStyle}
            />
          </Form.Item>

          {error && <Text type="danger" style={{ color: 'red' }}>{error}</Text>}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={styles.submitButton}
            >
              Verify Code
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
    backgroundColor: '#F1F1EB',
    borderRadius: '20px',
    paddingBottom: '24px',
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
  subtext: {
    textAlign: 'center' as const,
    marginBottom: '1rem',
    color: '#1D1E2C',
    display: 'block'
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
  },
} as const
