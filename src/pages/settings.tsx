// Creator: Syed Rabbey
// Date: 5/27/29
// Description: Created a settings page using antd, moment, and other libraries to save user settings for application.

import { useState, useEffect } from 'react'
import { Button, Select, Input, DatePicker, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import moment from 'moment'

const { Option } = Select

countries.registerLocale(enLocale)
const allCountries = Object.values(countries.getNames('en'))

export default function Settings() {
  const [fontSize, setFontSize] = useState('regular')
  const [theme, setTheme] = useState('default')
  const [country, setCountry] = useState('United States')
  const [name, setName] = useState('')
  const [birthday, setBirthday] = useState<moment.Moment | null>(null)

  useEffect(() => {
    document.body.dataset.fontsize = fontSize
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  const handleSave = () => {
    const settings = {
      name,
      birthday: birthday ? birthday.toISOString() : null,
      country,
      theme,
      fontSize
    }
    localStorage.setItem('userSettings', JSON.stringify(settings))
    message.success('Settings saved!')
  }

  return (
    <div
      className="fade-in"
      style={{
        minHeight: '100vh',
        backgroundColor: '#F1F1EB',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px'
      }}
    >
      <div
        style={{
          backgroundColor: '#A0B6AA',
          borderRadius: '2rem',
          border: '3px solid',
          padding: '40px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Link href="/">
          <Button
            icon={<ArrowLeftOutlined />}
            style={{
              marginBottom: '24px',
              backgroundColor: '#203625',
              color: 'white',
              borderColor: '#203625',
              borderRadius: '9999px'
            }}
          >
            Back
          </Button>
        </Link>

        <h1 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '32px', color: '#1D1E2C' }}>
          Settings
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Name:</div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ borderRadius: '12px' }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Date of Birth:</div>
            <DatePicker
              value={birthday}
              onChange={(date) => setBirthday(date)}
              style={{ width: '100%', borderRadius: '12px' }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Country:</div>
            <Select
              showSearch
              value={country}
              onChange={(val) => setCountry(val)}
              style={{ width: '100%', borderRadius: '12px' }}
              placeholder="Select your country"
            >
              {allCountries.map((c, i) => (
                <Option key={i} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Theme:</div>
            <Select
              value={theme}
              onChange={(val) => setTheme(val)}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="default">Default</Option>
            </Select>
          </div>

          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Font Size:</div>
            <Select
              value={fontSize}
              onChange={(val) => setFontSize(val)}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              <Option value="regular">Regular</Option>
              <Option value="large">Large</Option>
              <Option value="extra-large">Extra Large</Option>
            </Select>
          </div>

          <Button
            type="primary"
            onClick={handleSave}
            style={{
              marginTop: '16px',
              backgroundColor: '#203625',
              color: 'white',
              borderColor: '#203625',
              borderRadius: '9999px'
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
