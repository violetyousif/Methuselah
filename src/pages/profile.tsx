// src/pages/profile.tsx

// Violet Yousif, 06/01/2025, Reformatted the code to simplify project's coding style and fixed deprecated Ant Design Modal properties like bodyStyle and maskStyle.
// Mohammad Hoque, 06/02/2025, Added dynamic theme support for dark and default themes using localStorage
// Violet Yousif, 6/16/2025, Removed walletAddress prop from ProfileProps interface and component function parameters.
// Violet Yousif, 6/16/25, Added commented out phone number to end of page if we want to use it. Added gender to list of options.

import React, { useState, useEffect } from 'react'
import { Modal, Form, InputNumber, Select, Button, Input } from 'antd'
import { UserData } from '../models'

interface ProfileProps {
  visible: boolean
  //// Prev: walletAddress: string | null
  onClose: () => void
}

const Profile: React.FC<ProfileProps> = ({ visible, onClose }) => {
//// Prev: const Profile: React.FC<ProfileProps> = ({ visible, walletAddress, onClose }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<'default' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (document.body.dataset.theme as 'default' | 'dark') || 'default'
    }
    return 'default'
  })

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'default'
    setCurrentTheme(storedTheme as 'default' | 'dark')
  }, [visible])

  useEffect(() => {
    if (visible) {
      fetch(`http://localhost:8080/api/user-data`, {
        credentials: 'include'
      })
        .then((res) => res.json())
        .then((data: UserData) => {
          if (data) form.setFieldsValue(data)
        })
        .catch((error) => console.error('Error fetching user data:', error))
    }
  }, [visible, form])

  //// Prev code:
  // useEffect(() => {
  //   if (visible && walletAddress) {
  //     fetch(`/api/user-data?walletAddress=${walletAddress}`)
  //       .then((res) => res.json())
  //       .then((data: UserData) => {
  //         if (data) form.setFieldsValue(data)
  //       })
  //       .catch((error) => console.error('Error fetching user data:', error))
  //   }
  // }, [visible, walletAddress, form])

  const onFinish = async (values: UserData) => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values)
      })
      if (!response.ok) throw new Error('Failed to save user data')
      onClose()
    } catch (error) {
      console.error('Error saving user data:', error)
    } finally {
      setLoading(false)
    }
  }

  //// Prev code:
  // const onFinish = async (values: UserData) => {
  //   if (!walletAddress) return
  //   setLoading(true)
  //   try {
  //     const response = await fetch('/api/profile', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       credentials: 'include',
  //       body: JSON.stringify({ walletAddress, ...values })
  //     })
  //     if (!response.ok) throw new Error('Failed to save user data')
  //     onClose()
  //   } catch (error) {
  //     console.error('Error saving user data:', error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const styles = getStyles(currentTheme)

  return (
    <Modal
      title={<span style={styles.modalTitle}>User Profile - Health Data</span>}
      open={visible}
      onCancel={onClose}
      footer={null}
      styles={{
        mask: styles.modalMask
      }}
      closable
      wrapClassName="custom-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ activityLevel: 'moderate', email: 'johndoe@gmail.com' }}
        //// Prev: initialValues={{ activityLevel: 'moderate', name: 'John Doe', email: 'johndoe@gmail.com' }}
        style={styles.form}
      >
        <Form.Item label={<span style={styles.label}>First Name</span>} name="firstName" rules={[{ required: true, message: 'Please enter your first name' }]}>
          <Input style={styles.input} />
        </Form.Item>

        <Form.Item label={<span style={styles.label}>Last Name</span>} name="lastName" rules={[{ required: true, message: 'Please enter your last name' }]}>
          <Input style={styles.input} />
        </Form.Item>

        {/* //// Prev: <Form.Item label={<span style={styles.label}>Name</span>} name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
          <Input style={styles.input} />
        </Form.Item> */}

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

        {/* Gender */}
        <Form.Item
          //style={{ ...styles.rowSpacing, ...styles.halfWidth }} // half width for gender
          label={<span style={styles.label}>Gender</span>}
          name="gender"
          rules={[{ required: true, message: 'Select Gender' }]}
        >
          <Select placeholder="Select Gender" style={styles.placeholderStyle}>
            <Select.Option value="female">Female</Select.Option>
            <Select.Option value="male">Male</Select.Option>
            <Select.Option value="other">Other</Select.Option>
            <Select.Option value="prefer_not_to_say">Prefer not to say</Select.Option>
          </Select>
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

const getStyles = (theme: 'default' | 'dark') => ({
  modalTitle: {
    color: theme === 'dark' ? '#e0e0e0' : '#1D1E2C',
    fontWeight: 'bold',
    fontSize: '1.1rem'
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
    rowSpacing: {
    marginBottom: '0.6px'
  },
    placeholderStyle: {
    opacity: 0.8,     // Text transparency in input fields
    color: '#1D1E2C'
  },
})


// For phone number input, you can use the following code snippet:
// (potentially for 2 factor authentication)
// <Form.Item
//   style={styles.rowSpacing}
//   label={<span style={styles.label}>Phone Number</span>}
//   name="phoneNum"
//   rules={[
//     { required: true, message: 'Please enter your phone number' },
//     {
//       validator: (_, value) => {
//         const digits = value ? value.replace(/\D/g, '') : '';
//         if (digits.length === 10) {
//           return Promise.resolve();
//         }
//         return Promise.reject('Phone number must be exactly 10 digits');
//       }
//     }
//   ]}
// >
//   <Input
//     placeholder="000-000-0000"
//     style={styles.placeholderStyle}
//     onBlur={e => {
//       const formatted = formatPhoneNumber(e.target.value);
//       form.setFieldsValue({ phoneNum: formatted });
//     }}
//     onChange={e => {
//       // Only allow up to 10 digits
//       const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
//       let formatted = digits;
//       if (digits.length === 10) {
//         formatted = formatPhoneNumber(digits);
//       }
//       form.setFieldsValue({ phoneNum: formatted });
//     }}
//   />
// </Form.Item>
