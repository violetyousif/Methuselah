// src/pages/profile.tsx

// Violet Yousif, 06/01/2025, Reformatted the code to simplify project's coding style and fixed deprecated Ant Design Modal properties like bodyStyle and maskStyle.
// Mohammad Hoque, 06/02/2025, Added dynamic theme support for dark and default themes using localStorage
// Mohammad Hoque, 06/13/2025, Refactored to standalone page layout with back button to /chatBot.
// Violet Yousif, 6/16/2025, Removed walletAddress prop from ProfileProps interface and component function parameters.
// Violet Yousif, 6/16/25, Added commented out phone number to end of page if we want to use it. Added gender to list of options.
// Mohammad Hoque, 06/18/2025, Change from POST to PATCH and changed units of weight and height to imperial (lb, inch) instead of metric (kg, cm).
// Mohammad Hoque, 06/19/2025, Switched Activity Level to modal selection with dropdown icon and helper text.
// Violet Yousif, 06/21/2025, Added confirmation message on successful profile update.

import React, { useState, useEffect } from 'react'
import { Form, InputNumber, Select, Button, Input, message} from 'antd'
import { UserData } from '../models'
import Link from 'next/link'
import { ArrowLeftOutlined } from '@ant-design/icons'
import ActivityLevelModal from '../components/ActivityLevelModal'; // Import the new ActivityLevelModal component
import { DownOutlined } from '@ant-design/icons'; // For dropdown arrow icon
import { Calendar, Modal, DatePicker } from 'antd';
import dayjs from 'dayjs';

/* Old Code
interface ProfileProps {
  visible: boolean
  //// Prev: walletAddress: string | null
  onClose: () => void
}*/

const Profile: React.FC = () => {
//// Prev: const Profile: React.FC<ProfileProps> = ({ visible, walletAddress, onClose }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [selectedActivityLevel, setSelectedActivityLevel] = useState<string>('moderate');
  const [currentTheme, setCurrentTheme] = useState<'default' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (document.body.dataset.theme as 'default' | 'dark') || 'default'
    }
    return 'default'
  })
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [sleepHours, setSleepHours] = useState<number>(0);
  const [exerciseHours, setExerciseHours] = useState<number>(0);
  const [calories, setCalories] = useState<number>(0);
  const [allMetrics, setAllMetrics] = useState<Record<string, any>>({});

  // Calendar cell click
  /* const onSelectDate = (date: dayjs.Dayjs) => {
    setSelectedDate(date.format('YYYY-MM-DD'));
    setModalVisible(true);
  }; */

  const onSelectDate = (date: dayjs.Dayjs) => {
    const formatted = date.format('YYYY-MM-DD');
    setSelectedDate(formatted);
    const existing = allMetrics[formatted];

    if (existing) {
      setSleepHours(existing.sleepHours ?? 0);
      setExerciseHours(existing.exerciseHours ?? 0);
      setCalories(existing.calories ?? 0);
    } else {
      setSleepHours(0);
      setExerciseHours(0);
      setCalories(0);
    }
    setModalVisible(true);
  };

  const submitHealthMetric = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/health-metrics', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: selectedDate,
          sleepHours,
          exerciseHours,
          calories
        })
      });

      if (!res.ok) throw new Error('Submission failed');
      message.success('Health metrics saved!');
      setModalVisible(false);
      // Update local metrics state so it's available immediately
      setAllMetrics(prev => ({
        ...prev,
        [selectedDate]: {
          sleepHours,
          exerciseHours,
          calories
        }
      }));
    } catch (err) {
      console.error(err);
      message.error('Error saving health metrics');
    }
  };

  useEffect(() => {
  fetch('http://localhost:8080/api/health-metrics', {
    credentials: 'include',
  })
    .then((res) => res.json())
    .then((data) => {
      setAllMetrics(data.dates || {});
    })
    .catch((err) => {
      console.error('Error fetching health metrics:', err);
    });
  }, []);


  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'default'
    setCurrentTheme(storedTheme as 'default' | 'dark')
  }, [])

  useEffect(() => {
    fetch(`http://localhost:8080/api/user-data`, {
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data: UserData) => {
        form.setFieldsValue(data);
          if (data.activityLevel) setSelectedActivityLevel(data.activityLevel); //for the Activity Level button text
      })
      .catch((error) => console.error('Error fetching user data:', error))
  }, [form])

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
      const res = await fetch('http://localhost:8080/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values)
      })
      if (res.ok) {
        message.success('Profile updated successfully!')

      } else {
        const errorData = await res.json()
        message.error(errorData.message || 'Failed to save profile')
      }
      //if (!res.ok) throw new Error('Failed to save user data')
    } catch (error) {
      console.error('Error saving user data:', error)
      message.error('There was an error saving your profile.')

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
        initialValues={{ activityLevel: 'moderate'}}
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

        {/*<Form.Item label={<span style={styles.label}>Age (years)</span>} name="age" rules={[
          { required: true, message: 'Please enter your age' },
          { type: 'number', min: 0, message: 'Age must be positive' }
        ]}>
          <InputNumber min={0} style={styles.inputNumber} />
        </Form.Item> */}
        {/* Date of Birth */}
        <Form.Item
          style={styles.rowSpacing}
          label={<span style={styles.label}>Date of Birth</span>}
          name="dateOfBirth"
          rules={[
            { required: true, message: 'Please enter your birth date' },
            {
              validator: (_, value) => {
          if (!value) return Promise.resolve();
          const dob = new Date(value);
          const today = new Date();
          const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
          if (dob > minDate) {
            return Promise.reject('You must be at least 18 years old');
          }
          return Promise.resolve();
              }
            }
          ]}
        >
          <Input
            type="date"
            style={styles.input}
            min={(() => {
              const today = new Date();
              return `${today.getFullYear() - 120}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            })()}
            max={(() => {
              const today = new Date();
              return `${today.getFullYear() - 18}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            })()}
            placeholder="YYYY-MM-DD"
            allowClear
          />
        </Form.Item>

        {/* Gender */}
        <Form.Item
          //style={{ ...styles.rowSpacing, ...styles.halfWidth }} // half width for gender
          label={<span style={styles.label}>Gender</span>}
          name="gender"
          rules={[{ required: true, message: 'Select Gender' }]}
        >
          <Select placeholder="Select Gender" style={styles.select}>
            <Select.Option value="female">Female</Select.Option>
            <Select.Option value="male">Male</Select.Option>
            <Select.Option value="other">Other</Select.Option>
            <Select.Option value="prefer_not_to_say">Prefer not to say</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label={<span style={styles.label}>Weight (lb)</span>} name="weight" rules={[
          { required: true, message: 'Please enter your weight' },
          { type: 'number', min: 0, message: 'Weight must be positive' }
        ]}>
          <InputNumber min={0} step={0.1} style={styles.inputNumber} />
        </Form.Item>

        <Form.Item label={<span style={styles.label}>Height (inch)</span>} name="height" rules={[
          { required: true, message: 'Please enter your height' },
          { type: 'number', min: 0, message: 'Height must be positive' }
        ]}>
          <InputNumber min={0} step={0.1} style={styles.inputNumber} />
        </Form.Item>

        <Form.Item
          label={<span style={styles.label}>Activity Level</span>}
          name="activityLevel"
          rules={[{ required: true, message: 'Please select an activity level' }]}
        >
          <Button
            style={{ width: '100%', textAlign: 'left', ...styles.input, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            onClick={() => setActivityModalVisible(true)}
            type="default"
          >
            <span>
              {selectedActivityLevel
                ? selectedActivityLevel.charAt(0).toUpperCase() + selectedActivityLevel.slice(1)
                : 'Select Activity Level'}
            </span>
            <DownOutlined />
          </Button>
        </Form.Item>

        <Form.Item
          label={<span style={styles.label}>Sleep Hours (per night)</span>}
          name="sleepHours"
          rules={[
            { required: true, message: 'Please enter sleep hours' },
            { type: 'number', min: 0, max: 24, message: 'Sleep must be between 0–24 hours' }
          ]}
        >
          <InputNumber
            min={0}
            max={24}
            step={0.5}
            style={styles.inputNumber}
            addonAfter="hours"
            placeholder="Hours"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={styles.primaryButton}>Save</Button>
          <Button htmlType="button" onClick={() => form.resetFields()} style={styles.cancelButton}>Reset</Button>
        </Form.Item>
      </Form>
    </div>
    <ActivityLevelModal
        visible={activityModalVisible}
        onClose={() => setActivityModalVisible(false)}
        selected={selectedActivityLevel}
        onSelect={(level: string) => {
          setSelectedActivityLevel(level);
          form.setFieldsValue({ activityLevel: level });
          setActivityModalVisible(false);
        }}
      />
  <div style={{ marginTop: '3rem' }}>
  <h3 style={styles.modalTitle}>Log Daily Health Metrics</h3>
  <Calendar
    fullscreen={false}
    onSelect={onSelectDate}
    disabledDate={(current) => current && current > dayjs().endOf('day')}
  />
  </div>

  <Modal
    title={`Enter Health Data for ${selectedDate}`}
    visible={modalVisible}
    onCancel={() => setModalVisible(false)}
    onOk={submitHealthMetric}
    okText="Submit"
  >
    <Form layout="vertical">
      <Form.Item label="Sleep Hours">
        {/* <InputNumber min={0} max={24} value={sleepHours} onChange={setSleepHours} style={{ width: '100%' }} /> */}
        <InputNumber min={0} max={12} value={sleepHours} onChange={(value) => value !== null && setSleepHours(value)} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Exercise Hours">
        <InputNumber min={0} max={12} value={exerciseHours} onChange={(value) => value !== null && setExerciseHours(value)} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Calories">
        <InputNumber min={0} value={calories} onChange={(value) => value !== null && setCalories(value)} style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  </Modal>
    </div>
  )
}

export default Profile

const getStyles = (theme: 'default' | 'dark') => ({
  page: {
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#F1F1EB', // Only dark changed
    minHeight: '100vh',
    padding: '6rem'
  },
  modalTitle: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  card: {
    maxWidth: 600,
    margin: 'auto',
    padding: '2rem',
    backgroundColor: theme === 'dark' ? '#27293d' : '#A0B6AA', // Only dark changed
    borderRadius: '2rem',
    border: '3px solid',
    borderColor: theme === 'dark' ? '#318182' : '#000000' // Only dark changed
  },
  modalMask: {
    backgroundColor: theme === 'dark'
      ? 'rgba(0, 0, 0, 0.7)'
      : 'rgba(0, 0, 0, 0.1)'
  },
  form: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
  },
  label: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    fontWeight: 'bold',
    marginBottom: 4
  },
  input: {
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#ffffff', // Only dark changed
    borderColor: theme === 'dark' ? '#318182' : '#203625', // Only dark changed
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '8px'
  },
  inputNumber: {
    width: '100%',
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#ffffff', // Only dark changed
    borderColor: theme === 'dark' ? '#318182' : '#203625', // Only dark changed
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '8px'
  },
  select: {
    width: '100%',
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#ffffff', // Only dark changed
    borderColor: theme === 'dark' ? '#318182' : '#203625', // Only dark changed
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '8px'
  },
  option: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#ffffff'
  },
  primaryButton: {
    backgroundColor: theme === 'dark' ? '#318182' : '#203625', // Only dark changed
    borderColor: theme === 'dark' ? '#318182' : '#203625', // Only dark changed
    color: '#ffffff',
    borderRadius: '1rem',
    marginRight: '8px'
  },
  cancelButton: {
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#F1F1EB', // Only dark changed
    borderColor: theme === 'dark' ? '#318182' : '#203625', // Only dark changed
    color: theme === 'dark' ? '#F1F1EA' : '#203625',
    borderRadius: '1rem'
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: theme === 'dark' ? '#318182' : '#203625', // Only dark changed
    color: '#ffffff',
    borderColor: theme === 'dark' ? '#318182' : '#203625', // Only dark changed
    borderRadius: '9999px'
  },
  rowSpacing: {
    marginBottom: '0.6px'
  },
  placeholderStyle: {
    opacity: 0.8,
    color: '#1D1E2C'
  }
})

// LEAVE THIS! WE NEED IT FOR 2-FACTOR AUTHENTICATION LATER!
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