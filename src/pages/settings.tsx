// Creator: Syed Rabbey
// Date: 5/27/25
// Description: Created a settings page using antd, moment, and other libraries to save user settings for application.

// Edited by: Violet Yousif
// Date: 06/01/2025
// Reformatted the code to simplify project's coding style.

import { useState, useEffect } from 'react'
import { Button, Select, Input, DatePicker, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import moment from 'moment'

const { Option } = Select

// Register and store list of country names
countries.registerLocale(enLocale)
const allCountries = Object.values(countries.getNames('en'))

// Settings component with user options for Methuselah
export default function Settings() {
  const [fontSize, setFontSize] = useState('regular')
  const [theme, setTheme] = useState('default')
  // const [country, setCountry] = useState('United States')
  const [name, setName] = useState('')
  const [birthday, setBirthday] = useState<moment.Moment | null>(null)

  // Updates document body and saves to LOCAL storage for font size change
  useEffect(() => {
    document.body.dataset.fontsize = fontSize
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  const handleSave = () => {
    const settings = {
      name,
      birthday: birthday ? birthday.toISOString() : null,
      theme,
      fontSize
    }
    localStorage.setItem('userSettings', JSON.stringify(settings))
    message.success('Settings saved!')
  }

  return (
    <div className="fade-in" style={styles.page}>
      <div style={styles.card}>
        <Link href="/">
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

          {/* Country Field */}
          {/* <div>
            <div style={styles.label}>Country:</div>
            <Select
              showSearch
              value={country}
              onChange={(val) => setCountry(val)}
              style={styles.input}
              placeholder="Select your country"
            >
              {allCountries.map((c, i) => (
                <Option key={i} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </div> */}

          {/* Theme Field */}
          <div>
            <div style={styles.label}>Theme:</div>
            <Select value={theme} onChange={(val) => setTheme(val)} style={styles.input}>
              <Option value="default">Default</Option>
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

          {/* Save Button */}
          <Button type="primary" onClick={handleSave} style={styles.saveButton}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F1F1EB',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px'
  },
  card: {
    backgroundColor: '#A0B6AA',
    borderRadius: '2rem',
    border: '3px solid',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: '#203625',
    color: 'white',
    borderColor: '#203625',
    borderRadius: '9999px'
  },
  header: {
    textAlign: 'center',
    fontSize: '24px',
    marginBottom: '32px',
    color: '#1D1E2C'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  label: {
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  input: {
    width: '100%',
    borderRadius: '12px'
  },
  saveButton: {
    marginTop: '16px',
    backgroundColor: '#203625',
    color: 'white',
    borderColor: '#203625',
    borderRadius: '9999px'
  }
}
