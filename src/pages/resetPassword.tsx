// Syed Rabbey, 07/06/2025, Lets user enter new password after code verification, updates it in DB, and redirects to login.

import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { email } = router.query;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return message.error('Missing email. Please restart the reset process.');

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        message.success('Password updated successfully. You can now log in.');
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
    <div className="fadeIn settingsPage">
      <div className="settingsCard">
        <Link href="/forgotPassword">
          <Button icon={<ArrowLeftOutlined />} className="settingsBackButton">
            Back
          </Button>
        </Link>

        <Title level={3} className="settingsHeader">Reset Your Password</Title>

        <Form layout="vertical" onSubmitCapture={handleSubmit} className="settingsForm">
          <Form.Item label="New Password" required>
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="settingsInput"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="settingsSaveButton"
              loading={loading}
              block
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Keep your global and local styles below */}
      <style jsx global>{`
        body[data-fontsize='regular'] { font-size: 16px; }
        body[data-fontsize='large'] { font-size: 18px; }
        body[data-fontsize='extra-large'] { font-size: 20px; }
        body[data-fontsize='large'] input,
        body[data-fontsize='large'] .settingsSaveButton {
          font-size: 1.2em !important;
        }
        body[data-fontsize='extra-large'] input,
        body[data-fontsize='extra-large'] .settingsSaveButton {
          font-size: 1.4em !important;
        }
        body[data-theme='dark'] .settingsCard {
          background-color: #27293d;
          color: #F1F1EA;
        }
        body[data-theme='dark'] .settingsSaveButton {
          background-color: #318182;
        }
      `}</style>

      <style jsx>{`
        .settingsPage {
          min-height: 100vh;
          background-color: var(--bg-color, #F1F1EB);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
        }
        .settingsCard {
          background-color: #A0B6AA;
          border-radius: 2rem;
          padding: 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .settingsHeader {
          text-align: center;
          margin-bottom: 24px;
          color: inherit;
        }
        .settingsForm {
          margin-top: 24px;
        }
        .settingsInput {
          border-radius: 12px;
        }
        .settingsSaveButton {
          background-color: #203625;
          border: none;
          color: white;
          border-radius: 9999px;
        }
        .settingsBackButton {
          margin-bottom: 16px;
          background-color: #203625;
          color: white;
          border-color: #203625;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}
