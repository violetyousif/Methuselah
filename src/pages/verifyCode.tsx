// Syed Rabbey, 07/04/2025, Page to verify code sent to user's email for password reset. Appears after user submits email for reset code.
// Mohammad Hoque, 07/06/2025, Updated styling to match other auth pages - fixed background colors, centering, mobile responsiveness, and consistent design patterns.
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

  // Force light mode for verify code page since user hasn't logged in yet
  useEffect(() => {
    document.body.dataset.theme = 'default';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/verify-reset-code', {
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
    <div style={styles.page} className="verify-code-page">
      <div style={styles.card} className="verify-code-card mobile-card-shadow">
        <Link href="/login">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton} className="back-button-mobile">
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

          <Form.Item style={styles.submitContainer}>
            <Button
              type="primary"
              htmlType="submit"
              style={styles.submitButton}
              className="verify-code-submit-button"
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
    backgroundColor: '#F1F1EB', // Changed to match other pages
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem 1rem', // Added horizontal padding for better mobile experience
  },
  card: {
    maxWidth: 400,
    width: '100%',
    padding: '2rem',
    backgroundColor: '#A0B6AA', // Changed to match other pages
    borderRadius: '2rem', // Changed to match other pages
    boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(32,54,37,0.1)', // Added consistent box shadow
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
  submitContainer: {
    textAlign: 'center' as const
  },
  submitButton: {
    marginTop: '8px',
    width: '40%', // Changed to match register page width
    backgroundColor: '#203625',
    color: '#e0e0e0',
    borderRadius: '1rem'
  },
} as const
