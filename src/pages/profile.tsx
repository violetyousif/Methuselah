// src/pages/profile.tsx

// Edited by: Violet Yousif
// Date: 06/01/2025
// Reformatted the code to simplify project's coding style and fixed deprecated Ant Design Modal properties like bodyStle and maskStyle.

import React, { useState, useEffect } from 'react'
import { Modal, Form, InputNumber, Select, Button, Input } from 'antd'
import { UserData } from '../models'

interface ProfileProps {
  visible: boolean
  walletAddress: string | null
  onClose: () => void
}

const Profile: React.FC<ProfileProps> = ({ visible, walletAddress, onClose }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible && walletAddress) {
      fetch(`/api/user-data?walletAddress=${walletAddress}`)
        .then((res) => res.json())
        .then((data: UserData) => {
          if (data) form.setFieldsValue(data)
        })
        .catch((error) => console.error('Error fetching user data:', error))
    }
  }, [visible, walletAddress, form])

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
      onClose() // Close modal after successful save
    } catch (error) {
      console.error('Error saving user data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={<span style={styles.modalTitle}>User Profile - Health Data</span>}
      open={visible}
      onCancel={onClose}
      footer={null}
      style={styles.modal}
      styles={{
        body: styles.modalBody,
        mask: styles.modalMask
      }}
      closable
      wrapClassName="custom-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ activityLevel: 'moderate', name: 'John Doe', email: 'johndoe@gmail.com' }}
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
          <Button onClick={onClose} style={styles.cancelButton}>Cancel</Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Profile

const styles = {
  modalTitle: {
    color: '#e0e0e0'
  },
  modal: {
    backgroundColor: '#252525',
    borderRadius: '8px'
  },
  modalBody: {
    backgroundColor: '#252525',
    padding: '16px',
    borderRadius: '8px'
  },
  modalMask: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  form: {
    color: '#e0e0e0'
  },
  label: {
    color: '#e0e0e0'
  },
  input: {
    backgroundColor: '#2f2f2f',
    borderColor: '#4b5563',
    color: '#e0e0e0'
  },
  inputNumber: {
    width: '100%',
    backgroundColor: '#2f2f2f',
    borderColor: '#4b5563',
    color: '#FFFFFF'
  },
  select: {
    width: '100%',
    backgroundColor: '#2f2f2f',
    borderColor: '#4b5563',
    color: '#e0e0e0'
  },
  option: {
    color: '#e0e0e0',
    backgroundColor: '#2f2f2f'
  },
  primaryButton: {
    backgroundColor: '#4b5563',
    borderColor: '#4b5563',
    color: '#e0e0e0',
    borderRadius: '1rem'
  },
  cancelButton: {
    marginLeft: 8,
    backgroundColor: '#2f2f2f',
    borderColor: '#4b5563',
    color: '#e0e0e0',
    borderRadius: '1rem'
  }
}
