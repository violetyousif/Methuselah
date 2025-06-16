// Syed Rabbey, 5/27/25, Created a settings page using antd, moment, and other libraries to save user settings for application.

// Violet Yousif, 06/01/2025, Reformatted the code to simplify project's coding style.

// Mohammad Hoque, 06/02/2025, Added persistent theme and font settings, synced with <body> attributes, enabled dark mode UI styles dynamically

// Mohammad Hoque, 06/02/2025, Sync selected theme to <body> attribute for global dark mode styling
// Viktor Gjorgjevski, 06/03/2025, Added profile picking option into settings
// Mizan: 6/12/2025, Changed save button event handler for backend connection

// Violet Yousif, 6/16/2025, Removed unused walletAddress prop from Settings component function parameters.
// Violet Yousuf, 6/16/2025, Removed dateOfBirth field since it's handled by profile endpoint
import { useState, useEffect } from 'react'
import { Button, Select, Input, DatePicker, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import moment from 'moment'
import { profilePicPresets } from '../components/profilePicker'


const { Option } = Select

export default function Settings() {
  const [fontSize, setFontSize] = useState('regular')
  const [theme, setTheme] = useState('default')
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
          setTheme(settings.preferences?.theme || 'default');
          
          // Apply theme and fontSize to UI immediately
          document.body.dataset.theme = settings.preferences?.theme || 'default';
          document.body.dataset.fontsize = settings.preferences?.fontSize || 'regular';
        } else {
          console.warn('Failed to load settings from backend, using defaults');
          // Don't fallback to localStorage - use defaults instead to ensure clean state
          setFontSize('regular');
          setTheme('default');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Don't fallback to localStorage - use defaults instead to ensure clean state
        setFontSize('regular');
        setTheme('default');
      }
    };

    loadSettings();
  }, [])

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
      //// Prev: localStorage.setItem('userSettings', JSON.stringify(settings)); // Removed - data now persisted in database only
      message.success('Settings saved to database!');
      
      // Update localStorage for theme and fontSize for immediate UI application
      localStorage.setItem('theme', theme);
      localStorage.setItem('fontSize', fontSize);
    } else {
      message.error(data.message || 'Failed to update settings');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    message.error('Error saving settings');
  }
};

  return (
    <div className="fadeIn settingsPage">
      <div className="settingsCard">
        <Link href="/chatBot">
          <Button icon={<ArrowLeftOutlined />} className="settingsBackButton">
            Back
          </Button>
        </Link>

        <h1 className="settingsHeader">Settings</h1>

        <div className="settingsForm">
          {/* Name Fields */}
          <div>
            <div className="settingsLabel">First Name:</div>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="settingsInput" />
          </div>
          <div>
            <div className="settingsLabel">Last Name:</div>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="settingsInput" />
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
            <div className="settingsLabel">Profile Picture:</div>
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
                    border: profilePic === pic ? '3px solid #318182' : '2px solid transparent',
                  }}
                  onClick={() => setProfilePic(pic)}
                />
              ))}
            </div>
          </div>
          
          {/* Theme Field */}
          <div>
            <div className="settingsLabel">Theme:</div>
            <Select value={theme} onChange={(val) => setTheme(val)} className="settingsInput">
              <Option value="default">Light</Option>
              <Option value="dark">Dark</Option>
            </Select>
          </div>

          {/* Font Size Field */}
          <div>
            <div className="settingsLabel">Font Size:</div>
            <Select value={fontSize} onChange={(val) => setFontSize(val)} className="settingsInput">
              <Option value="regular">Regular</Option>
              <Option value="large">Large</Option>
              <Option value="extra-large">Extra Large</Option>
            </Select>
          </div>

          <Button type="primary" onClick={handleSave} className="settingsSaveButton">
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
      `}</style>
      <style jsx>{`
        .settingsPage {
          min-height: 100vh;
          background-color: ${theme === 'dark' ? '#1D1E2C' : '#F1F1EB'};
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
        }
        .settingsCard {
          background-color: ${theme === 'dark' ? '#27293d' : '#A0B6AA'};
          border-radius: 2rem;
          border: 3px solid ${theme === 'dark' ? '#318182' : '#000000'};
          padding: 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .settingsBackButton {
          margin-bottom: 24px;
          background-color: ${theme === 'dark' ? '#318182' : '#203625'};
          color: white !important;
          border-color: ${theme === 'dark' ? '#318182' : '#203625'};
          border-radius: 9999px;
        }
        .settingsHeader {
          text-align: center;
          font-size: 24px;
          margin-bottom: 32px;
          color: ${theme === 'dark' ? '#F1F1EA' : '#1D1E2C'};
        }
        .settingsForm {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .settingsLabel {
          font-weight: bold;
          margin-bottom: 4px;
          color: ${theme === 'dark' ? '#F1F1EA' : 'inherit'};
        }
        .settingsInput {
          width: 100%;
          border-radius: 12px;
          background-color: ${theme === 'dark' ? '#1D1E2C' : 'inherit'};
          color: ${theme === 'dark' ? '#F1F1EA' : 'inherit'};
          border-color: ${theme === 'dark' ? '#318182' : 'inherit'};
        }
        .settingsSaveButton {
          margin-top: 16px;
          background-color: ${theme === 'dark' ? '#318182' : '#203625'};
          color: white !important;
          border-color: ${theme === 'dark' ? '#318182' : '#203625'};
          border-radius: 9999px;
        }
      `}</style>
    </div>
  )
}
