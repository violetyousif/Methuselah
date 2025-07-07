// Syed Rabbey, 5/27/25, Created a settings page using antd, moment, and other libraries to save user settings for application.
// Violet Yousif, 06/01/2025, Reformatted the code to simplify project's coding style.
// Mohammad Hoque, 06/02/2025, Added persistent theme and font settings, synced with <body> attributes, enabled dark mode UI styles dynamically
// Mohammad Hoque, 06/02/2025, Sync selected theme to <body> attribute for global dark mode styling
// Viktor Gjorgjevski, 06/03/2025, Added profile picking option into settings
// Mizan, 6/12/2025, Changed save button event handler for backend connection
// Violet Yousif, 6/16/2025, Removed unused walletAddress prop from Settings component function parameters.
// Violet Yousuf, 6/16/2025, Removed dateOfBirth field since it's handled by profile endpoint
// Mizanur Mizan, 6/24/2025, Added upload handler for custom avatar image

import { useState, useEffect } from 'react'
import { Button, Select, Input, DatePicker, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import moment from 'moment'
import { profilePicPresets } from '../components/profilePicker'
import { Upload, Avatar } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import ImgCrop from 'antd-img-crop'


const { Option } = Select

export default function Settings() {
  const [fontSize, setFontSize] = useState('regular')
  const [theme, setTheme] = useState<'default' | 'dark'>('default')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  //// Prev: const [dateOfBirth, setDateOfBirth] = useState<moment.Moment | null>(null)
  const [profilePic, setProfilePic] = useState('')

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
          setProfilePic(settings.profilePic || '');
          setFontSize(settings.preferences?.fontSize || 'regular');
          setTheme((settings.preferences?.theme as 'default' | 'dark') || 'default');
          
          // Apply theme and fontSize to UI immediately
          document.body.dataset.theme = settings.preferences?.theme || 'default';
          document.body.dataset.fontsize = settings.preferences?.fontSize || 'regular';
        } else {
          console.warn('Failed to load settings from backend, using defaults');
          setFontSize('regular');
          setTheme('default');
          document.body.dataset.theme = 'default';
          document.body.dataset.fontsize = 'regular';
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setFontSize('regular');
        setTheme('default');
        document.body.dataset.theme = 'default';
        document.body.dataset.fontsize = 'regular';
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
        setProfilePic(base64)
        message.success('Profile picture updated!')
      } else {
        const data = await res.json()
        message.error(data.message || 'Failed to update profile picture')
      }
    } catch (err) {
      console.error('Upload failed', err)
      message.error('Failed to update profile picture')
    }
  }
  reader.readAsDataURL(file)
  }

  useEffect(() => {
    document.body.dataset.theme = theme // Only saved once user clicks save
  }, [theme])


  useEffect(() => {
    document.body.dataset.fontsize = fontSize
  }, [fontSize])

  const handleSave = async () => {
  const settings = {
    firstName,
    lastName,
    //// Prev: dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
    profilePic,
    preferences: {
      theme,
      fontSize,
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
      message.success('Settings updated successfully!');
      // Apply updated preferences immediately to UI
      document.body.dataset.theme = theme;
      document.body.dataset.fontsize = fontSize;
    } else {
      message.error(data.message || 'Failed to update settings');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    message.error('Error saving settings');
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
                style={{ borderRadius: 12, marginTop: '10px', marginRight: '10px' }}
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
                  <Button icon={<UploadOutlined />} style={styles.uploadButton}>Upload Custom Profile Pic</Button>
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
          <div>
            <div style={styles.label} className="settingsLabel">Font Size:</div>
            <Select value={fontSize} onChange={(val) => setFontSize(val)} style={styles.select} className="settingsInput">
              <Option value="regular">Regular</Option>
              <Option value="large">Large</Option>
              <Option value="extra-large">Extra Large</Option>
            </Select>
          </div>

          <Button type="primary" onClick={handleSave} style={styles.primaryButton} className="settingsSaveButton">
            Save Changes
          </Button>
        </div>
      </div>
      <style jsx global>{`
        body[data-fontsize='regular'] {
          font-size: 16px;
        }
        body[data-fontsize='large'] {
          font-size: 18px;
        }
        body[data-fontsize='extra-large'] {
          font-size: 20px;
        }
        body[data-fontsize='large'] h1,
        body[data-fontsize='large'] h2,
        body[data-fontsize='large'] input,
        body[data-fontsize='large'] .ant-select-selector {
          font-size: 2em !important;
        }
        body[data-fontsize='extra-large'] h1,
        body[data-fontsize='extra-large'] h2,
        body[data-fontsize='extra-large'] input,
        body[data-fontsize='extra-large'] .ant-select-selector {
          font-size: 2.5em !important;
        }
        /* Fix for the Select dropdown arrow visibility in dark mode */
        body[data-theme='dark'] .ant-select-arrow {
        color: #F1F1EA !important; /* light color for dark bg */
        }
        body[data-theme='dark'] .ant-select-selector {
        background-color: #1D1E2C !important;
        color: #F1F1EA !important;
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
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#ffffff',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '12px'
  },
  select: {
    width: '100%',
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#ffffff',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '12px'
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
    borderRadius: '1rem'
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: theme === 'dark' ? '#318182' : '#203625',
    color: '#ffffff',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    borderRadius: '9999px'
  }
})
