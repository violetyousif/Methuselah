// Syed Rabbey, 5/27/25, Created a settings page using antd, moment, and other libraries to save user settings for application.
// Violet Yousif, 06/01/2025, Reformatted the code to simplify project's coding style.
// Mohammad Hoque, 06/02/2025, Added persistent theme and font settings, synced with <body> attributes, enabled dark mode UI styles dynamically
// Mohammad Hoque, 06/02/2025, Sync selected theme to <body> attribute for global dark mode styling
// Viktor Gjorgjevski, 06/03/2025, Added profile picking option into settings
// Mizan, 6/12/2025, Changed save button event handler for backend connection
// Violet Yousif, 6/16/2025, Removed unused walletAddress prop from Settings component function parameters.
// Violet Yousuf, 6/16/2025, Removed dateOfBirth field since it's handled by profile endpoint
// Mizanur Mizan, 6/24/2025, Added upload handler for custom avatar image
// Syed Rabbey, 7/7/2025, Added toast message for succesful profile picture update and setting save.
// Mizanur Mizan, 7/14/2025-7/16/2025, Added verification for email change and a change password button/modal

import React, { useState, useEffect } from 'react'
import { Button, Select, Input, DatePicker, message, notification } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import moment from 'moment'
import { profilePicPresets } from '../components/profilePicker'
import { Upload, Avatar } from 'antd'
import { UploadOutlined, LockOutlined } from '@ant-design/icons'
import ImgCrop from 'antd-img-crop'
import { Modal } from 'antd'
import { Form } from 'antd';


const { Option } = Select

export default function Settings() {
  // const [fontSize, setFontSize] = useState('regular')
  const [theme, setTheme] = useState<'default' | 'dark'>('default')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  //// Prev: const [dateOfBirth, setDateOfBirth] = useState<moment.Moment | null>(null)
  const [profilePic, setProfilePic] = useState('')
  const [pendingEmail, setPendingEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const [passwordForm] = Form.useForm();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Load current settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/settings', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (res.ok) {
          const settings = await res.json();
          setFirstName(settings.firstName || '');
          setLastName(settings.lastName || '');
          setEmail(settings.email || '');
          setPendingEmail(settings.email || '');
          setProfilePic(settings.profilePic || '');
          // setFontSize(settings.preferences?.fontSize || 'regular');
          setTheme((settings.preferences?.theme as 'default' | 'dark') || 'default');
          
          // Apply theme and fontSize to UI immediately
          document.body.dataset.theme = settings.preferences?.theme || 'default';
          // document.body.dataset.fontsize = settings.preferences?.fontSize || 'regular';
        } else {
          console.warn('Failed to load settings from backend, using defaults');
          // setFontSize('regular');
          setTheme('default');
          document.body.dataset.theme = 'default';
          // document.body.dataset.fontsize = 'regular';
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // setFontSize('regular');
        setTheme('default');
        document.body.dataset.theme = 'default';
        // document.body.dataset.fontsize = 'regular';
      }
    };

    loadSettings();
  }, [])

  // Upload handler for custom avatar image
  const handleImageChange = async (file: File) => {
  const reader = new FileReader()
  reader.onloadend = async () => {
    const base64 = reader.result as string
    try {
      const res = await fetch('http://localhost:8080/api/updateSettings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePic: base64 }),
        credentials: 'include',
      })

      if (res.ok) {
        setProfilePic(base64);
        notification.success({
          message: 'Profile Picture Updated',
          description: 'Your new avatar has been successfully saved.',
          placement: 'topRight',
          duration: 3,
        });
      } else {
        notification.error({
          message: 'Upload Failed',
          description: 'Could not update profile picture.',
          placement: 'topRight',
          duration: 3,
        });
      }
    } catch (err) {
      console.error('Upload failed', err);
      notification.error({
        message: 'Upload Failed',
        description: 'Could not update profile picture.',
        placement: 'topRight',
        duration: 3,
      });
    }
  };
  reader.readAsDataURL(file)
  }

  useEffect(() => {
    document.body.dataset.theme = theme // Only saved once user clicks save
  }, [theme])

  // Send verification code to new email
  const handleSendVerification = async () => {
    setVerifying(true);
    try {
      const res = await fetch('http://localhost:8080/api/sendEmailVerification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail }),
        credentials: 'include',
      });
      if (res.ok) {
        setVerificationSent(true);
        notification.success({
          message: 'Verification Sent',
          description: 'A verification code was sent to your new email.',
        });
      } else {
        notification.error({
          message: 'Failed to Send',
          description: 'Could not send verification code.',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Failed to Send',
        description: 'Could not send verification code.',
      });
    }
    setVerifying(false);
  };

  // Verify code
  const handleVerifyCode = async () => {
    setVerifying(true);
    try {
      const res = await fetch('http://localhost:8080/api/verifyEmailCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code: verificationCode }),
        credentials: 'include',
      });
      if (res.ok) {
        setEmail(pendingEmail);
        setPendingEmail(pendingEmail);
        setEmailVerified(true);
        setVerificationSent(false);
        notification.success({
          message: 'Email Verified',
          description: 'Your new email has been verified.',
        });
      } else {
        notification.error({
          message: 'Verification Failed',
          description: 'Invalid code. Please try again.',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Verification Failed',
        description: 'Could not verify code.',
      });
    }
    setVerifying(false);
  };

  const handleChangePassword = async (values: any) => {
    const { currentPassword, newPassword, confirmPassword } = values;
    if (!currentPassword || !newPassword || !confirmPassword) {
      notification.error({ message: 'All fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      notification.error({ message: 'New passwords do not match.' });
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch('http://localhost:8080/api/changeSettingsPassword', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      if (res.ok) {
        notification.success({ message: 'Password changed successfully.' });
        passwordForm.resetFields();
        setPasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        notification.error({ message: data.message || 'Failed to change password.' });
      }
    } catch (err) {
      notification.error({ message: 'Failed to change password.' });
    }
    setChangingPassword(false);
  };

  // useEffect(() => {
  //   document.body.dataset.fontsize = fontSize
  // }, [fontSize])

  const handleSave = async () => {
  const settings = {
    firstName,
    lastName,
    email,
    //// Prev: dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
    profilePic,
    preferences: {
      theme,
      // fontSize,
  }
  };

  try {
    const res = await fetch('http://localhost:8080/api/updateSettings', {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(settings),
      credentials: 'include', // includes JWT cookie
    });

    const data = await res.json();

    if (res.ok) {
      notification.success({
        message: 'Settings Saved',
        description: 'Your preferences have been successfully updated.',
        placement: 'topRight',
        duration: 4,
      });
      // Apply updated preferences immediately to UI
      document.body.dataset.theme = theme;
      // document.body.dataset.fontsize = fontSize;
    } else {
      notification.error({
        message: 'Save Failed',
        description: data.message || 'Could not update your settings.',
        placement: 'topRight',
        duration: 4,
      });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    notification.error({
      message: 'Save Failed',
      description: 'Something went wrong while saving your settings.',
      placement: 'topRight',
      duration: 4,
    });
  }
};

  const styles = getStyles(theme);

  return (
    <div style={styles.page} className="fadeIn settingsPage settings-page">
      <div style={styles.card} className="settingsCard settings-card mobile-card-shadow">
        <Link href="/chatBot">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton} className="settingsBackButton back-button-mobile">
            Home
          </Button>
        </Link>

        <h1 style={styles.header} className="settingsHeader settings-header">Settings</h1>

        <div className="settingsForm">
          {/* Name Fields */}
          <div>
            <div style={styles.label} className="settingsLabel">First Name:</div>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={styles.input} className="settingsInput" />
          </div>
          <div>
            <div style={styles.label} className="settingsLabel">Last Name:</div>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} style={styles.input} className="settingsInput" />
          </div>

          <div>
            <div style={styles.label} className="settingsLabel">Email:</div>
            <Input
              value={pendingEmail}
              onChange={e => {
                setPendingEmail(e.target.value);
                setEmailVerified(false);
                setVerificationSent(false);
              }}
              style={styles.input}
              className="settingsInput"
              type="email"
              autoComplete="email"
              // placeholder="your@email.com"
            />
            {!emailVerified && isValidEmail(pendingEmail) && pendingEmail !== email && (
              <div style={{ marginTop: 8 }}>
                {!verificationSent ? (
                  <Button
                    type="primary"
                    onClick={handleSendVerification}
                    disabled={!pendingEmail || pendingEmail === email}
                    loading={verifying}
                  >
                    Send Verification Code
                  </Button>
                ) : (
                  <div style={{ marginTop: 8 }}>
                    <Input
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value)}
                      style={{
                        width: 200,
                        marginRight: 8,
                        color: theme === 'dark' ? '#F1F1EA' : undefined,
                        backgroundColor: theme === 'dark' ? 'rgba(45, 47, 65, 0.6)' : undefined,
                      }}
                      className="verificationCodeInput"
                    />
                    {verificationCode.length === 6 && (
                      <Button
                        type="primary"
                        onClick={handleVerifyCode}
                        loading={verifying}
                        // disabled={!verificationCode}
                        disabled={!/^\d{6}$/.test(verificationCode)}
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                )}
          </div>
        )}
          {/* Change Password Button goes here */}
{/*           <Button
            style={{ marginTop: 12, marginBottom: 8 }}
            onClick={() => setPasswordModalVisible(true)}
          >
            Change Password
          </Button> */}
          <Button
            type="primary"
            danger
            icon={<LockOutlined />}
            block
            className="changePasswordBtn"
            style={{
              marginTop: 12,
              marginBottom: 8,
            }}
            onClick={() => {
              passwordForm.resetFields();
              setPasswordModalVisible(true);
            }}
          >
            Change Password
          </Button>
        </div>

          {/* Date of Birth Field - Moved to Profile page */}
          {/* //// Prev:
          <div>
            <div className="settingsLabel">Date of Birth:</div>
            <DatePicker
              value={dateOfBirth}
              onChange={(date) => setDateOfBirth(date)}
              className="settingsInput"
            />
          </div> */}


          {/* Profile Pic selection */}
          <div>
            <div style={styles.label} className="settingsLabel">Profile Picture:</div>
            {/* Custom Image Upload Option */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Avatar
                size={100}
                src={profilePic || '/avatars/avatar1.png'}
                style={{ borderRadius: '50%', marginTop: '10px', marginRight: '10px' }}
              />
              <ImgCrop>
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
                    if (!isJpgOrPng) {
                      message.error('Only JPG and PNG images are allowed!')
                      return Upload.LIST_IGNORE
                    }
                    handleImageChange(file)
                    return false
                  }}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />} style={styles.uploadButton} className="settingsUploadButton">Upload Custom Profile Pic</Button>
                </Upload>
              </ImgCrop>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {profilePicPresets.map((pic, index) => (
                <img
                  key={index}
                  src={pic}
                  alt={`Profile ${index}`}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: profilePic === pic ? `3px solid ${theme === 'dark' ? '#318182' : '#203625'}` : '2px solid transparent',
                  }}
                  onClick={() => setProfilePic(pic)}
                />
              ))}
            </div>
          </div>
          
          {/* Theme Field */}
          <div>
            <div style={styles.label} className="settingsLabel">Theme:</div>
            <Select value={theme} onChange={(val: 'default' | 'dark') => setTheme(val)} style={styles.select} className="settingsInput">
              <Option value="default">Light</Option>
              <Option value="dark">Dark</Option>
            </Select>
          </div>

          {/*Font Size Field */}
          {/* <div>
            <div style={styles.label} className="settingsLabel">Font Size:</div>
            <Select value={fontSize} onChange={(val) => setFontSize(val)} style={styles.select} className="settingsInput">
              <Option value="regular">Regular</Option>
              <Option value="large">Large</Option>
              <Option value="extra-large">Extra Large</Option>
            </Select>
          </div> */}

          <Button
            type="primary"
            onClick={handleSave}
            style={styles.primaryButton}
            className="settingsSaveButton"
            disabled={pendingEmail !== email && !emailVerified}
          >
            Save Changes
          </Button>
        </div>
            <Modal
              title="Change Password"
              open={passwordModalVisible}
              onCancel={() => {
                passwordForm.resetFields();
                setPasswordModalVisible(false);
              }}
              footer={[
                <Button key="cancel" onClick={() => {
                  passwordForm.resetFields();
                  setPasswordModalVisible(false);
                }} disabled={changingPassword}>
                  Cancel
                </Button>,
                <Button 
                  key="submit" 
                  type="primary" 
                  onClick={() => passwordForm.submit()}
                  loading={changingPassword}
                >
                  Change Password
                </Button>,
              ]}
              closable={!changingPassword}
              maskClosable={!changingPassword}
              styles={{
                content: {
                  ...(theme === 'dark' && {
                    backgroundColor: 'rgba(39, 41, 61, 0.95)',
                    color: '#F1F1EA'
                  })
                }
              }}
            >
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={async (values) => {
                  await handleChangePassword(values);
                }}
              >
                <Form.Item
                  label="Current Password"
                  name="currentPassword"
                  rules={[{ required: true, message: 'Please enter your current password' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="New Password"
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Please enter a secure password' },
                    { min: 10, message: 'Password must be at least 10 characters long' },
                    { pattern: /.*\d.*/, message: 'Password must contain at least one number' },
                    { pattern: /.*[A-Z].*/, message: 'Password must contain at least one uppercase letter' },
                    { pattern: /.*[a-z].*/, message: 'Password must contain at least one lowercase letter' },
                    { pattern: /.*[!@#$%*].*/, message: 'Password must contain at least one special character (!,@,#,$,%,*)' },
                    { pattern: /^[^\\'"<>`]*$/, message: 'Password cannot contain \\, \', ", <, >, or ` characters' }
                  ]}
                  hasFeedback
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="Confirm New Password"
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Please confirm your new password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      }
                    })
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </Form>
            </Modal>
      </div>
      <style jsx global>{`
        /* Modern input and select styling for settings page */
        .settingsPage .ant-input,
        .settingsPage .ant-select-selector {
          background-color: ${theme === 'dark' ? 'rgba(25, 27, 38, 0.9)' : 'rgba(230, 230, 220, 0.9)'} !important;
          border: 1px solid ${theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : 'rgba(32, 54, 37, 0.3)'} !important;
          border-radius: 6px !important;
          color: ${theme === 'dark' ? '#F1F1EA' : '#1D1E2C'} !important;
          transition: all 0.2s ease-in-out !important;
        }

        .settingsPage .verificationCodeInput::placeholder {
          color: ${theme === 'dark' ? '#F1F1EA' : '#1D1E2C'} !important;
          opacity: 1 !important;
        }
        
        .settingsPage .changePasswordBtn {
          background-color: ${theme === 'dark' ? '#ff7875' : '#ff4d4f'} !important;
          border-color: ${theme === 'dark' ? '#ff7875' : '#ff4d4f'} !important;
          color: #fff !important;
          transition: all 0.2s ease-in-out !important;
        }

        .settingsPage .changePasswordBtn:hover {
          background-color: ${theme === 'dark' ? '#ff9c99' : '#ff7875'} !important;
          border-color: ${theme === 'dark' ? '#ff9c99' : '#ff7875'} !important;
        }

        /* Global modal styling exactly like DeleteModal */
        body[data-theme='dark'] .ant-modal-content {
          background-color: rgba(39, 41, 61, 0.95) !important;
          color: #F1F1EA !important;
          border-radius: 12px !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(49, 129, 130, 0.2) !important;
        }
        body[data-theme='dark'] .ant-modal-header {
          background-color: transparent !important;
          border-color: rgba(49, 129, 130, 0.2) !important;
          border-radius: 12px 12px 0 0 !important;
        }
        body[data-theme='dark'] .ant-modal-title {
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-modal-close {
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-modal-close:hover {
          background-color: rgba(49, 129, 130, 0.2) !important;
        }
        body[data-theme='dark'] .ant-modal-footer {
          background-color: transparent !important;
          border-color: rgba(49, 129, 130, 0.2) !important;
        }
        body[data-theme='dark'] .ant-btn:not(.ant-btn-primary) {
          background-color: transparent !important;
          border-color: rgba(49, 129, 130, 0.3) !important;
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-btn:not(.ant-btn-primary):hover {
          background-color: rgba(49, 129, 130, 0.2) !important;
          border-color: rgba(49, 129, 130, 0.5) !important;
        }
        body[data-theme='dark'] .ant-form-item-label > label {
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-input,
        body[data-theme='dark'] .ant-input-password,
        body[data-theme='dark'] .ant-input-password input {
          background-color: rgba(25, 27, 38, 0.8) !important;
          border-color: rgba(49, 129, 130, 0.3) !important;
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-input:hover,
        body[data-theme='dark'] .ant-input-password:hover,
        body[data-theme='dark'] .ant-input-password input:hover {
          border-color: rgba(49, 129, 130, 0.5) !important;
        }
        body[data-theme='dark'] .ant-input:focus,
        body[data-theme='dark'] .ant-input-password:focus,
        body[data-theme='dark'] .ant-input-password input:focus {
          border-color: #318182 !important;
          box-shadow: 0 0 0 2px rgba(49, 129, 130, 0.2) !important;
        }
        body[data-theme='dark'] .ant-input-password .ant-input-suffix {
          color: #F1F1EA !important;
          background-color: transparent !important;
        }
        body[data-theme='dark'] .ant-input-password .ant-input-password-icon {
          color: #F1F1EA !important;
          background-color: transparent !important;
        }
        body[data-theme='dark'] .ant-input-password .ant-input-password-icon:hover {
          color: #318182 !important;
          background-color: rgba(49, 129, 130, 0.1) !important;
        }

        .settingsPage .ant-input:hover,
        .settingsPage .ant-select:hover .ant-select-selector {
          border-color: ${theme === 'dark' ? 'rgba(49, 129, 130, 0.5)' : 'rgba(32, 54, 37, 0.5)'} !important;
          background-color: ${theme === 'dark' ? 'rgba(25, 27, 38, 1.0)' : 'rgba(230, 230, 220, 1.0)'} !important;
        }

        .settingsPage .ant-input:focus,
        .settingsPage .ant-input-focused,
        .settingsPage .ant-select-focused .ant-select-selector {
          border-color: ${theme === 'dark' ? '#318182' : '#203625'} !important;
          box-shadow: 0 0 0 2px ${theme === 'dark' ? 'rgba(49, 129, 130, 0.2)' : 'rgba(32, 54, 37, 0.2)'} !important;
          background-color: ${theme === 'dark' ? 'rgba(25, 27, 38, 1.0)' : 'rgba(230, 230, 220, 1.0)'} !important;
        }

        .settingsPage .ant-select-arrow {
          color: ${theme === 'dark' ? '#F1F1EA' : '#1D1E2C'} !important;
        }

        .settingsPage .ant-select-dropdown {
          background-color: ${theme === 'dark' ? 'rgba(39, 41, 61, 0.95)' : '#ffffff'} !important;
          border: 1px solid ${theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : 'rgba(32, 54, 37, 0.3)'} !important;
          border-radius: 6px !important;
          backdrop-filter: blur(10px) !important;
        }

        .settingsPage .ant-select-item {
          color: ${theme === 'dark' ? '#F1F1EA' : '#1D1E2C'} !important;
          border-radius: 4px !important;
          margin: 2px 4px !important;
        }

        .settingsPage .ant-select-item-option-selected {
          background-color: ${theme === 'dark' ? 'rgba(49, 129, 130, 0.2)' : 'rgba(32, 54, 37, 0.1)'} !important;
          color: ${theme === 'dark' ? '#F1F1EA' : '#1D1E2C'} !important;
        }

        .settingsPage .ant-select-item-option:hover {
          background-color: ${theme === 'dark' ? 'rgba(49, 129, 130, 0.1)' : 'rgba(32, 54, 37, 0.05)'} !important;
        }

        .settingsPage .ant-select-item-option-active {
          background-color: ${theme === 'dark' ? 'rgba(49, 129, 130, 0.15)' : 'rgba(32, 54, 37, 0.08)'} !important;
        }

        /* Upload button styles */
        .settingsPage .ant-upload .ant-btn {
          background-color: ${theme === 'dark' ? '#318182' : '#203625'} !important;
          border-color: ${theme === 'dark' ? '#318182' : '#203625'} !important;
          color: #ffffff !important;
          border-radius: 6px !important;
        }

        .settingsPage .ant-upload .ant-btn:hover {
          background-color: ${theme === 'dark' ? '#3a9394' : '#2a4730'} !important;
          border-color: ${theme === 'dark' ? '#3a9394' : '#2a4730'} !important;
        }

        /* Button styles */
        .settingsPage .ant-btn-primary {
          background-color: ${theme === 'dark' ? '#318182' : '#203625'} !important;
          border-color: ${theme === 'dark' ? '#318182' : '#203625'} !important;
          border-radius: 6px !important;
        }

        .settingsPage .ant-btn-primary:hover {
          background-color: ${theme === 'dark' ? '#3a9394' : '#2a4730'} !important;
          border-color: ${theme === 'dark' ? '#3a9394' : '#2a4730'} !important;
        }
      `}</style>
      <style jsx>{`
        .settingsForm {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
      `}</style>
    </div>
  )
}

const getStyles = (theme: 'default' | 'dark') => ({
  page: {
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#F1F1EB',
    minHeight: '100vh',
    padding: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    maxWidth: 480,
    width: '100%',
    padding: '40px',
    backgroundColor: theme === 'dark' ? '#27293d' : '#A0B6AA',
    borderRadius: '2rem',
    boxShadow: theme === 'dark' 
      ? '0 8px 32px rgba(0,0,0,0.4), 0 4px 16px rgba(49,129,130,0.2)' 
      : '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(32,54,37,0.1)'
  },
  header: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    fontWeight: 'bold',
    fontSize: '24px',
    textAlign: 'center' as const,
    marginBottom: '32px'
  },
  label: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  input: {
    width: '100%',
    backgroundColor: theme === 'dark' ? 'rgba(45, 47, 65, 0.6)' : '#ffffff',
    borderColor: theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : '#203625',
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '6px',
    borderWidth: '1px'
  },
  select: {
    width: '100%',
    backgroundColor: theme === 'dark' ? 'rgba(45, 47, 65, 0.6)' : '#ffffff',
    borderColor: theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : '#203625',
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '6px',
    borderWidth: '1px'
  },
  primaryButton: {
    backgroundColor: theme === 'dark' ? '#318182' : '#203625',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    color: '#ffffff',
    borderRadius: '9999px',
    marginTop: '16px'
  },
  uploadButton: {
    backgroundColor: theme === 'dark' ? '#318182' : '#203625',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    color: '#ffffff',
    borderRadius: '9999px'
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: theme === 'dark' ? '#318182' : '#203625',
    color: '#ffffff',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    borderRadius: '9999px'
  }
})
