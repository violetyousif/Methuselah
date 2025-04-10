// src/pages/profile.tsx
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
      const response = await fetch('/api/user-data', {
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
      title={<span style={{ color: '#e0e0e0' }}>User Profile - Health Data</span>}
      open={visible}
      onCancel={onClose}
      footer={null}
      style={{ backgroundColor: '#252525', borderRadius: '8px' }}
      bodyStyle={{
        backgroundColor: '#252525',
        padding: '16px',
        borderRadius: '8px'
      }}
      closable
      maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      wrapClassName="custom-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ activityLevel: 'moderate', name: 'John Doe', email: 'johndoe@gmail.com' }}
        style={{ color: '#e0e0e0' }}
      >
        <Form.Item
          label={<span style={{ color: '#e0e0e0' }}>Name</span>}
          name="name"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <Input
            style={{
              backgroundColor: '#2f2f2f',
              borderColor: '#4b5563',
              color: '#e0e0e0'
            }}
          />
        </Form.Item>
        <Form.Item
          label={<span style={{ color: '#e0e0e0' }}>Email</span>}
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input
            style={{
              backgroundColor: '#2f2f2f',
              borderColor: '#4b5563',
              color: '#e0e0e0'
            }}
          />
        </Form.Item>
        <Form.Item
          label={<span style={{ color: '#e0e0e0' }}>Age (years)</span>}
          name="age"
          rules={[
            { required: true, message: 'Please enter your age' },
            { type: 'number', min: 0, message: 'Age must be positive' }
          ]}
        >
          <InputNumber
            min={0}
            style={{
              width: '100%',
              backgroundColor: '#2f2f2f',
              borderColor: '#4b5563',
              color: '#e0e0e0'
            }}
          />
        </Form.Item>
        <Form.Item
          label={<span style={{ color: '#e0e0e0' }}>Weight (kg)</span>}
          name="weight"
          rules={[
            { required: true, message: 'Please enter your weight' },
            { type: 'number', min: 0, message: 'Weight must be positive' }
          ]}
        >
          <InputNumber
            min={0}
            step={0.1}
            style={{
              width: '100%',
              backgroundColor: '#2f2f2f',
              borderColor: '#4b5563',
              color: '#e0e0e0'
            }}
          />
        </Form.Item>
        <Form.Item
          label={<span style={{ color: '#e0e0e0' }}>Height (cm)</span>}
          name="height"
          rules={[
            { required: true, message: 'Please enter your height' },
            { type: 'number', min: 0, message: 'Height must be positive' }
          ]}
        >
          <InputNumber
            min={0}
            step={0.1}
            style={{
              width: '100%',
              backgroundColor: '#2f2f2f',
              borderColor: '#4b5563',
              color: '#e0e0e0'
            }}
          />
        </Form.Item>
        <Form.Item
          label={<span style={{ color: '#e0e0e0' }}>Activity Level</span>}
          name="activityLevel"
          rules={[{ required: true, message: 'Please select an activity level' }]}
        >
          <Select
            style={{
              width: '100%',
              backgroundColor: '#2f2f2f',
              borderColor: '#4b5563',
              color: '#e0e0e0'
            }}
            dropdownStyle={{ backgroundColor: '#2f2f2f', border: '1px solid #4b5563' }}
            className="custom-select"
          >
            <Select.Option
              value="sedentary"
              style={{ color: '#e0e0e0', backgroundColor: '#2f2f2f' }}
            >
              Sedentary
            </Select.Option>
            <Select.Option
              value="moderate"
              style={{ color: '#e0e0e0', backgroundColor: '#2f2f2f' }}
            >
              Moderate
            </Select.Option>
            <Select.Option value="active" style={{ color: '#e0e0e0', backgroundColor: '#2f2f2f' }}>
              Active
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label={<span style={{ color: '#e0e0e0' }}>Sleep Hours (per night)</span>}
          name="sleepHours"
          rules={[
            { required: true, message: 'Please enter sleep hours' },
            { type: 'number', min: 0, max: 24, message: 'Sleep must be between 0-24 hours' }
          ]}
        >
          <InputNumber
            min={0}
            max={24}
            step={0.5}
            style={{
              width: '100%',
              backgroundColor: '#2f2f2f',
              borderColor: '#4b5563',
              color: '#e0e0e0'
            }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              backgroundColor: '#4b5563',
              borderColor: '#4b5563',
              color: '#e0e0e0',
              borderRadius: '1rem'
            }}
          >
            Save
          </Button>
          <Button
            style={{
              marginLeft: 8,
              backgroundColor: '#2f2f2f',
              borderColor: '#4b5563',
              color: '#e0e0e0',
              borderRadius: '1rem'
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Profile
