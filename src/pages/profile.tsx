// src/pages/profile.tsx

// Edited by: Violet Yousif
// Date: 06/01/2025
// Reformatted the code to simplify project's coding style and fixed deprecated Ant Design Modal properties like bodyStyle and maskStyle.

// Modified by: Mohammad Hoque
// Date: 06/02/2025
// Added dynamic theme support for dark and default themes using localStorage

// Updated by: Mohammad Hoque
// Date: 06/13/2025
// Refactored to standalone page layout with back button to /chatBot.

import React, { useState, useEffect } from 'react'
import { Form, InputNumber, Select, Button, Input, message } from 'antd'
import { UserData } from '../models'
import Link from 'next/link'
import { ArrowLeftOutlined } from '@ant-design/icons'



const Profile: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState<'default' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (document.body.dataset.theme as 'default' | 'dark') || 'default'
    }
    return 'default'
  })

  useEffect(() => {
    const stored = localStorage.getItem('walletAddress')
    setWalletAddress(stored)
    const storedTheme = localStorage.getItem('theme') || 'default'
    setCurrentTheme(storedTheme as 'default' | 'dark')
  }, [])

  useEffect(() => {
    if (walletAddress) {
      fetch(`/api/user-data?walletAddress=${walletAddress}`)
        .then((res) => res.json())
        .then((data: UserData) => {
          if (data) form.setFieldsValue(data)
        })
        .catch((error) => console.error('Error fetching user data:', error))
    }
  }, [walletAddress, form])

  const onFinish = async (values: UserData) => {
    if (!walletAddress) return
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, ...values })
      })
      if (!response.ok) throw new Error('Failed to save user data')
      message.success('Profile saved successfully!')

    } catch (error) {
      console.error('Error saving user data:', error)
      message.error('There was an error saving your profile.')

    } finally {
      setLoading(false)
    }
  }

  const styles = getStyles(currentTheme)

  return (
    <div style={styles.page}>
        <div style={styles.card}>
      <Link href="/chatBot">
      < Button icon={<ArrowLeftOutlined />} style={styles.backButton}>
          Back
        </Button>
      </Link>
      <h2 style={styles.modalTitle}>User Profile - Health Data</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ activityLevel: 'moderate', name: '', email: '' }}
        style={styles.form}
      >
        <Form.Item label={<span style={styles.label}>Name</span>} name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
          <Input style={styles.input} />
        </Form.Item>

        <Form.Item label={<span style={styles.label}>Email</span>} name="email" rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}>
          <Input style={styles.input} />
        </Form.Item>

        <Form.Item label={<span style={styles.label}>Age (years)</span>} name="age" rules={[
          { required: true, message: 'Please enter your age' },
          { type: 'number', min: 0, message: 'Age must be positive' }
        ]}>
          <InputNumber min={0} style={styles.inputNumber} />
        </Form.Item>

        <Form.Item label={<span style={styles.label}>Weight (kg)</span>} name="weight" rules={[
          { required: true, message: 'Please enter your weight' },
          { type: 'number', min: 0, message: 'Weight must be positive' }
        ]}>
          <InputNumber min={0} step={0.1} style={styles.inputNumber} />
        </Form.Item>

        <Form.Item label={<span style={styles.label}>Height (cm)</span>} name="height" rules={[
          { required: true, message: 'Please enter your height' },
          { type: 'number', min: 0, message: 'Height must be positive' }
        ]}>
          <InputNumber min={0} step={0.1} style={styles.inputNumber} />
        </Form.Item>

        <Form.Item label={<span style={styles.label}>Activity Level</span>} name="activityLevel" rules={[{ required: true, message: 'Please select an activity level' }]}>
          <Select style={styles.select} className="custom-select">
            <Select.Option value="sedentary" style={styles.option}>Sedentary</Select.Option>
            <Select.Option value="moderate" style={styles.option}>Moderate</Select.Option>
            <Select.Option value="active" style={styles.option}>Active</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label={<span style={styles.label}>Sleep Hours (per night)</span>} name="sleepHours" rules={[
          { required: true, message: 'Please enter sleep hours' },
          { type: 'number', min: 0, max: 24, message: 'Sleep must be between 0–24 hours' }
        ]}>
          <InputNumber min={0} max={24} step={0.5} style={styles.inputNumber} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={styles.primaryButton}>Save</Button>
          <Button htmlType="button" onClick={() => form.resetFields()} style={styles.cancelButton}>Reset</Button>
        </Form.Item>
      </Form>
    </div>
    </div>
  )
}

export default Profile

const getStyles = (theme: 'default' | 'dark') => ({
  page: {
  backgroundColor: theme === 'dark' ? '#0f0f17' : '#F1F1EB',
  minHeight: '100vh',
  padding: '6rem'
},
  modalTitle: {
    color: theme === 'dark' ? '#e0e0e0' : '#1D1E2C',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  card: {
  maxWidth: 600,
  margin: 'auto',
  padding: '2rem',
  backgroundColor: theme === 'dark' ? '#252525' : '#A0B6AA',
  borderRadius: '2rem',
  border: '3px solid',
  borderColor: theme === 'dark' ? '#4b5563' : '#000000'
},
  modalMask: {
    backgroundColor: theme === 'dark'
      ? 'rgba(0, 0, 0, 0.7)'
      : 'rgba(0, 0, 0, 0.1)'
  },
  form: {
    color: theme === 'dark' ? '#e0e0e0' : '#1D1E2C'
  },
  label: {
    color: theme === 'dark' ? '#e0e0e0' : '#1D1E2C',
    fontWeight: 'bold',
    marginBottom: 4
  },
  input: {
    backgroundColor: theme === 'dark' ? '#2f2f2f' : '#ffffff',
    borderColor: theme === 'dark' ? '#4b5563' : '#203625',
    color: theme === 'dark' ? '#e0e0e0' : '#1D1E2C',
    borderRadius: '8px'
  },
  inputNumber: {
    width: '100%',
    backgroundColor: theme === 'dark' ? '#2f2f2f' : '#ffffff',
    borderColor: theme === 'dark' ? '#4b5563' : '#203625',
    color: theme === 'dark' ? '#e0e0e0' : '#1D1E2C',
    borderRadius: '8px'
  },
  select: {
    width: '100%',
    backgroundColor: theme === 'dark' ? '#2f2f2f' : '#ffffff',
    borderColor: theme === 'dark' ? '#4b5563' : '#203625',
    color: theme === 'dark' ? '#e0e0e0' : '#1D1E2C',
    borderRadius: '8px'
  },
  option: {
    color: theme === 'dark' ? '#e0e0e0' : '#1D1E2C',
    backgroundColor: theme === 'dark' ? '#2f2f2f' : '#ffffff'
  },
  primaryButton: {
    backgroundColor: theme === 'dark' ? '#4b5563' : '#203625',
    borderColor: theme === 'dark' ? '#4b5563' : '#203625',
    color: '#ffffff',
    borderRadius: '1rem',
    marginRight: '8px'
  },
  cancelButton: {
    backgroundColor: theme === 'dark' ? '#2f2f2f' : '#F1F1EB',
    borderColor: theme === 'dark' ? '#4b5563' : '#203625',
    color: theme === 'dark' ? '#e0e0e0' : '#203625',
    borderRadius: '1rem'
  },
  backButton: {
  marginBottom: '24px',
  backgroundColor: theme === 'dark' ? '#4b5563' : '#203625',
  color: '#ffffff',
  borderColor: theme === 'dark' ? '#4b5563' : '#203625',
  borderRadius: '9999px'
}
})
