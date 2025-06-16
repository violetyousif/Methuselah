// Creator: Syed Rabbey
// Date: 5/27/25
// Description: Created a settings page using antd, moment, and other libraries to save user settings for application.

// Edited by: Violet Yousif
// Date: 06/01/2025
// Reformatted the code to simplify project's coding style.

// Edited by: Mohammad Hoque
// Date: 06/02/2025
// Enhancements: Added persistent theme and font settings, synced with <body> attributes, enabled dark mode UI styles dynamically

// Edited by: Viktor Gjorgjevski
// Date: 06/03/2025
// -Added profile picking option into settings

import { useState, useEffect } from 'react'
import { Button, Select, Input, DatePicker, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import moment from 'moment'
import { profilePicPresets } from '../components/profilePicker'


const { Option } = Select

// Register and store list of country names
countries.registerLocale(enLocale)
const allCountries = Object.values(countries.getNames('en'))

export default function Settings() {
  const [fontSize, setFontSize] = useState('regular')
  const [theme, setTheme] = useState('default')
  const [name, setName] = useState('')
  const [birthday, setBirthday] = useState<moment.Moment | null>(null)
  const [profilePic, setProfilePic] = useState('')


  // Added by: Mohammad Hoque - 06/02/2025
  // Restores user settings on component mount (persistent state)
  useEffect(() => {
    const saved = localStorage.getItem('userSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      setName(settings.name || '')
      setFontSize(settings.fontSize || 'regular')
      setTheme(settings.theme || 'default')
      setBirthday(settings.birthday ? moment(settings.birthday) : null)
      setProfilePic(settings.profilePic || '') // added by  Viktor Gjorgjevski - 06/03/2025
    }
  }, [])

  // Added by: Mohammad Hoque - 06/02/2025
  // Sync selected theme to <body> attribute for global dark mode styling
  useEffect(() => {
    document.body.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  // Added by: Mohammad Hoque - 06/02/2025
  // Sync selected font size to <body> attribute
  useEffect(() => {
    document.body.dataset.fontsize = fontSize
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

// Modified by Mizan: 6/12/2025
// Changed save button event handler for backend connection
  const handleSave = async () => {
  const settings = {
    name,
    birthday: birthday ? birthday.toISOString() : null,
    theme,
    fontSize,
    profilePic
  };

  try {
    const res = await fetch('/api/update-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // includes JWT cookie
      body: JSON.stringify(settings)
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      message.success('Settings saved to database!');
    } else {
      message.error(data.message || 'Failed to update settings');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    message.error('Error saving settings');
  }
};

  // Modified by: Mohammad Hoque - 06/02/2025
  // Dynamically apply dark or light styles using ternary conditions
  const styles: { [key: string]: React.CSSProperties } = {
    page: {
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#1D1E2C' : '#F1F1EB',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px'
    },
    card: {
      backgroundColor: theme === 'dark' ? '#27293d' : '#A0B6AA',
      borderRadius: '2rem',
      border: '3px solid',
      borderColor: theme === 'dark' ? '#318182' : '#000000',
      padding: '40px',
      width: '100%',
      maxWidth: '480px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    backButton: {
      marginBottom: '24px',
      backgroundColor: theme === 'dark' ? '#318182' : '#203625',
      color: 'white',
      borderColor: theme === 'dark' ? '#318182' : '#203625',
      borderRadius: '9999px'
    },
    header: {
      textAlign: 'center',
      fontSize: '24px',
      marginBottom: '32px',
      color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    label: {
      fontWeight: 'bold',
      marginBottom: '4px',
      color: theme === 'dark' ? '#F1F1EA' : 'inherit'
    },
    input: {
      width: '100%',
      borderRadius: '12px',
      backgroundColor: theme === 'dark' ? '#1D1E2C' : undefined,
      color: theme === 'dark' ? '#F1F1EA' : undefined,
      borderColor: theme === 'dark' ? '#318182' : undefined
    },
    saveButton: {
      marginTop: '16px',
      backgroundColor: theme === 'dark' ? '#318182' : '#203625',
      color: 'white',
      borderColor: theme === 'dark' ? '#318182' : '#203625',
      borderRadius: '9999px'
    }
  }

  return (
    <div className="fade-in" style={styles.page}>
      <div style={styles.card}>
        <Link href="/chatBot">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton}>
            Back
          </Button>
        </Link>

        <h1 style={styles.header}>Settings</h1>

        <div style={styles.form}>
          {/* Name Field */}
          <div>
            <div style={styles.label}>Name:</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
          </div>

          {/* Date of Birth Field */}
          <div>
            <div style={styles.label}>Date of Birth:</div>
            <DatePicker
              value={birthday}
              onChange={(date) => setBirthday(date)}
              style={styles.input}
            />
          </div>

          {/* Profile Pic selection */} {/* added by viktor gjorgjevski 6/3/2025 */}
          <div>
            <div style={styles.label}>Profile Picture:</div>
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
            <div style={styles.label}>Theme:</div>
            <Select value={theme} onChange={(val) => setTheme(val)} style={styles.input}>
              <Option value="default">Light</Option>
              <Option value="dark">Dark</Option>
            </Select>
          </div>

          {/* Font Size Field */}
          <div>
            <div style={styles.label}>Font Size:</div>
            <Select value={fontSize} onChange={(val) => setFontSize(val)} style={styles.input}>
              <Option value="regular">Regular</Option>
              <Option value="large">Large</Option>
              <Option value="extra-large">Extra Large</Option>
            </Select>
          </div>

          {/* Global font size scaling */}
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

          <Button type="primary" onClick={handleSave} style={styles.saveButton}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
