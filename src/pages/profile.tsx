// src/pages/profile.tsx

// Violet Yousif, 06/01/2025, Reformatted the code to simplify project's coding style and fixed deprecated Ant Design Modal properties like bodyStyle and maskStyle.
// Mohammad Hoque, 06/02/2025, Added dynamic theme support for dark and default themes using localStorage
// Mohammad Hoque, 06/13/2025, Refactored to standalone page layout with back button to /chatBot.
// Violet Yousif, 6/16/2025, Removed walletAddress prop from ProfileProps interface and component function parameters.
// Violet Yousif, 6/16/25, Added commented out phone number to end of page if we want to use it. Added gender to list of options.
// Mohammad Hoque, 06/18/2025, Change from POST to PATCH and changed units of weight and height to imperial (lb, inch) instead of metric (kg, cm).
// Mohammad Hoque, 06/19/2025, Switched Activity Level to modal selection with dropdown icon and helper text.
// Violet Yousif, 06/21/2025, Added confirmation message on successful profile update.
// Mizanur Mizan, 07/03/2025-07/04/2025, Added Health Metrics section with date selection for sleep hours, exercise hours, mood, calories, and meals

import React, { useState, useEffect } from 'react'
import { Form, InputNumber, Select, Button, Input, message, notification } from 'antd'
import { UserData } from '../models'
import Link from 'next/link'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { DownOutlined } from '@ant-design/icons'; // For dropdown arrow icon
import dayjs from 'dayjs';
import { Tabs } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);
import { Calendar, Modal } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import ActivityLevelModal from '../components/ActivityLevelModal';

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
  const [weight, setWeight] = useState<number>(0);
  const [calories, setCalories] = useState<number>(0);
  const [allMetrics, setAllMetrics] = useState<Record<string, any>>({});
  const [mealInputs, setMealInputs] = useState({
    breakfast: '',
    lunch: '',
    dinner: ''
  });
  const [mood, setMood] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);

  // Calendar cell click
  /* const onSelectDate = (date: dayjs.Dayjs) => {
    setSelectedDate(date.format('YYYY-MM-DD'));
    setModalVisible(true);
  }; */
/* 
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
  }; */

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
          mood,
          weight,
          calories,
          meals: mealInputs
        })
      });

      if (!res.ok) throw new Error('Submission failed');
      notification.success({
        message: 'Health Metrics Saved',
        description: 'Your wellness updates were successfully recorded.',
        placement: 'topRight',
        duration: 4,
      });
      setModalVisible(false);
      // Update local metrics state so it's available immediately
      setAllMetrics(prev => ({
        ...prev,
        [selectedDate]: {
          sleepHours,
          exerciseHours,
          mood,
          calories,
          weight,
          meals: mealInputs
        }
      }));
    } catch (err) {
      console.error(err);
      notification.error({
        message: 'Save Failed',
        description: 'We were unable to save your health metrics. Please try again.',
        placement: 'topRight',
        duration: 4,
      });
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

  /* useEffect(() => {
    const today = dayjs().format('YYYY-MM-DD');
    setSelectedDate(today); // Ensure it's set

    const existing = allMetrics[today];
    if (existing) {
      setSleepHours(existing.sleepHours ?? 0);
      setExerciseHours(existing.exerciseHours ?? 0);
      setCalories(existing.calories ?? 0);
    } else {
      setSleepHours(0);
      setExerciseHours(0);
      setCalories(0);
    }
}, [allMetrics]); */

  useEffect(() => {
    const today = dayjs().format('YYYY-MM-DD');
    setSelectedDate(today); // Ensure it's set
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const existing = allMetrics[selectedDate];
    if (existing) {
      setSleepHours(existing.sleepHours ?? 0);
      setExerciseHours(existing.exerciseHours ?? 0);
      setCalories(existing.calories ?? 0);
      setMealInputs({
        breakfast: existing.meals?.breakfast || '',
        lunch: existing.meals?.lunch || '',
        dinner: existing.meals?.dinner || ''
      });
      setMood(existing.mood || '');
      setWeight(existing.weight ?? 0);
    } else {
      setSleepHours(0);
      setExerciseHours(0);
      setCalories(0);
      setMealInputs({
        breakfast: '',
        lunch: '',
        dinner: ''
      });
      setMood('');
      // Try to get previous day's weight
      const prevDate = dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
      const prev = allMetrics[prevDate];
      if (prev && prev.weight > 0) {
        setWeight(prev.weight);
      } else {
        setWeight(0);
      }
      }
  }, [selectedDate, allMetrics]); // depends on selected date or new data


  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/settings', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (res.ok) {
          const settings = await res.json();
          const theme = settings.preferences?.theme || 'default';
          setCurrentTheme(theme as 'default' | 'dark');
        } else {
          setCurrentTheme('default');
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        setCurrentTheme('default');
      }
    };

    loadPreferences();
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
        notification.success({
          message: 'Profile Updated',
          description: 'Your personal information was successfully saved.',
          placement: 'topRight',
          duration: 3,
        });

      } else {
        const errorData = await res.json()
        notification.error({
          message: 'Profile Save Failed',
          description: errorData.message || 'There was an issue saving your profile.',
          placement: 'topRight',
          duration: 4,
        });
      }
      //if (!res.ok) throw new Error('Failed to save user data')
    } catch (error) {
      console.error('Error saving user data:', error)
      notification.error({
        message: 'Unexpected Error',
        description: 'Something went wrong while saving your profile.',
        placement: 'topRight',
        duration: 4,
      });


    } finally {
      setLoading(false)
    }
  }

  const styles = getStyles(currentTheme)

  return (
    <div style={styles.page} className="profile-page">
        <div style={styles.card} className="profile-card mobile-card-shadow">
      <Link href="/chatBot">
      < Button icon={<ArrowLeftOutlined />} style={styles.backButton} className="back-button-mobile">
          Home
        </Button>
      </Link>
      {/* <h2 style={styles.modalTitle}>User Profile - Health Data</h2> */}
      <Tabs
        defaultActiveKey="general" centered className="profile-tabs" items={[
        {
          key: 'general',
          label: 'General',
          children: (
          <>
      <h2 style={styles.modalTitle} className="profile-modal-title">User Profile - Health Data</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ activityLevel: 'moderate' }}
        style={styles.form}
        className="profile-form"
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

        {/*<Form.Item label={<span style={styles.label}>Weight (lb)</span>} name="weight" rules={[
          { required: true, message: 'Please enter your weight' },
          { type: 'number', min: 0, message: 'Weight must be positive' }
        ]}>
          <InputNumber min={0} step={0.1} style={styles.inputNumber} />
        </Form.Item> */}

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
          <Modal
            title="Select Activity Level"
            open={activityModalVisible}
            onCancel={() => setActivityModalVisible(false)}
            footer={null}
            centered
          >
            <Select
              style={{ width: '100%' }}
              value={selectedActivityLevel}
              onChange={level => {
                setSelectedActivityLevel(level);
                form.setFieldsValue({ activityLevel: level });
                setActivityModalVisible(false);
              }}
              options={[
                { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
                { value: 'light', label: 'Light (light exercise/sports 1-3 days/week)' },
                { value: 'moderate', label: 'Moderate (moderate exercise/sports 3-5 days/week)' },
                { value: 'active', label: 'Active (hard exercise/sports 6-7 days/week)' },
                { value: 'very_active', label: 'Very Active (very hard exercise & physical job)' }
              ]}
            />
            <div style={{ marginTop: 16, color: '#888' }}>
              Choose the option that best matches your typical daily activity.
            </div>
          </Modal>
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
          <div className="profile-button-group">
            <Button type="primary" htmlType="submit" loading={loading} style={styles.primaryButton}>Save</Button>
            <Button htmlType="button" onClick={() => form.resetFields()} style={styles.cancelButton}>Reset</Button>
          </div>
        </Form.Item>
      </Form>
    </>
    )},
    {
    key: 'metrics',
    label: 'Daily Health Metrics',
    children: (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Button
            icon={<CalendarOutlined />}
            onClick={() => setCalendarVisible(true)}
            style={{ 
              marginLeft: 'auto',
              backgroundColor: currentTheme === 'dark' ? '#318182' : '#203625',
              color: '#ffffff',
              borderColor: currentTheme === 'dark' ? '#318182' : '#203625',
              borderRadius: '12px'
            }}
          >
            Calendar
          </Button>
        </div>
        <Modal
          title={<span style={styles.modalTitle}>Select a Date</span>}
          open={calendarVisible}
          onCancel={() => setCalendarVisible(false)}
          footer={null}
        >
          <Calendar
            fullscreen={false}
            value={dayjs(selectedDate)}
            onSelect={date => {
              setSelectedDate(date.format('YYYY-MM-DD'));
              setCalendarVisible(false);
            }}
            disabledDate={current => current && current > dayjs().endOf('day')}
          />
        </Modal>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }} className="profile-date-navigation">
          <Button 
            icon={<LeftOutlined />} 
            style={styles.navigationButton}
            onClick={() => {
              const prev = dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
              setSelectedDate(prev);
              const existing = allMetrics[prev];
              setSleepHours(existing?.sleepHours || 0);
              setExerciseHours(existing?.exerciseHours || 0);
              setCalories(existing?.calories || 0);
            }} 
          />

          <h3 style={styles.dateHeader}>{dayjs(selectedDate).format('MMMM Do, YYYY')}</h3>

          <Button 
            icon={<RightOutlined />} 
            style={styles.navigationButton}
            onClick={() => {
              const next = dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD');
              if (dayjs(next).isAfter(dayjs(), 'day')) return; // prevent future dates
              setSelectedDate(next);
              const existing = allMetrics[next];
              setSleepHours(existing?.sleepHours || 0);
              setExerciseHours(existing?.exerciseHours || 0);
              setCalories(existing?.calories || 0);
            }} 
          />
        </div>

        <Form layout="vertical">
          <Form.Item label={<span style={styles.metricsLabel}>Sleep Hours</span>}>
            <InputNumber 
              min={0} 
              max={12} 
              value={sleepHours} 
              onChange={(v) => v !== null && setSleepHours(v)} 
              style={styles.inputNumber} 
            />
          </Form.Item>
          <Form.Item label={<span style={styles.metricsLabel}>Exercise Hours</span>}>
            <InputNumber 
              min={0} 
              max={12} 
              value={exerciseHours} 
              onChange={(v) => v !== null && setExerciseHours(v)} 
              style={styles.inputNumber} 
            />
          </Form.Item>
          <Form.Item label={<span style={styles.metricsLabel}>Mood</span>}>
            <Select
              value={mood}
              onChange={setMood}
              style={styles.select}
              placeholder="Select your mood"
            >
              <Select.Option value="happy">Happy</Select.Option>
              <Select.Option value="neutral">Neutral</Select.Option>
              <Select.Option value="sad">Sad</Select.Option>
              <Select.Option value="stressed">Stressed</Select.Option>
              <Select.Option value="excited">Excited</Select.Option>
              <Select.Option value="tired">Tired</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={<span style={styles.metricsLabel}>Weight (lb)</span>}>
            <InputNumber
              min={0}
              step={0.1}
              value={weight}
              onChange={(v) => v !== null && setWeight(v)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          {/* <Form.Item label="Calories"> */}
          <Form.Item label={<span style={styles.metricsLabel}>Calories</span>}>
            <InputNumber 
              min={0} 
              value={calories} 
              onChange={(v) => v !== null && setCalories(v)} 
              style={styles.inputNumber} 
            />
          </Form.Item>

          <Form.Item label={<span style={styles.metricsLabel}>Breakfast</span>}>
            <Input.TextArea
              value={mealInputs.breakfast}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMealInputs({ ...mealInputs, breakfast: e.target.value })}
              placeholder="E.g. 2 eggs, toast, orange juice"
              style={styles.input}
              autoSize
            />
          </Form.Item>

          <Form.Item label={<span style={styles.metricsLabel}>Lunch</span>}>
            <Input.TextArea
              value={mealInputs.lunch}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMealInputs({ ...mealInputs, lunch: e.target.value })}
              placeholder="E.g. chicken sandwich, salad"
              style={styles.input}
              autoSize
            />
          </Form.Item>

          <Form.Item label={<span style={styles.metricsLabel}>Dinner</span>}>
            <Input.TextArea
              value={mealInputs.dinner}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMealInputs({ ...mealInputs, dinner: e.target.value })}
              placeholder="E.g. salmon, rice, broccoli"
              style={styles.input}
              autoSize
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={submitHealthMetric} style={styles.primaryButton}>Save</Button>
          </Form.Item>
        </Form>
      </div>
    
  )
}
]} />
</div>

      {/* Global styles for dropdown and error messages - consistent with feedback and settings */}
      <style jsx global>{`
        /* Fix for the Select dropdown visibility in dark mode */
        body[data-theme='dark'] .ant-select-dropdown {
          background-color: rgba(39, 41, 61, 0.95) !important;
          border: 1px solid rgba(49, 129, 130, 0.3) !important;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        }
        body[data-theme='dark'] .ant-select-item {
          background-color: transparent !important;
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-select-item:hover {
          background-color: rgba(49, 129, 130, 0.2) !important;
        }
        body[data-theme='dark'] .ant-select-item-option-selected {
          background-color: rgba(49, 129, 130, 0.3) !important;
        }
        body[data-theme='dark'] .ant-select-arrow {
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-select-selector {
          background-color: rgba(25, 27, 38, 0.9) !important;
          border-color: rgba(49, 129, 130, 0.3) !important;
          color: #F1F1EA !important;
          border-radius: 6px !important;
        }
        
        /* Fix error message colors */
        body[data-theme='dark'] .ant-form-item-explain-error {
          color: #ff7875 !important; /* Softer red for dark mode */
        }
        body[data-theme='default'] .ant-form-item-explain-error {
          color: #dc3545 !important; /* Standard red for light mode */
        }
        
        /* Fix form validation styling */
        body[data-theme='dark'] .ant-form-item-has-error .ant-input {
          border-color: #ff7875 !important;
        }
        body[data-theme='dark'] .ant-form-item-has-error .ant-input:focus {
          border-color: #ff7875 !important;
          box-shadow: 0 0 0 2px rgba(255, 120, 117, 0.2) !important;
        }
        body[data-theme='dark'] .ant-form-item-has-error .ant-select-selector {
          border-color: #ff7875 !important;
        }
        body[data-theme='dark'] .ant-form-item-has-error .ant-input-number {
          border-color: #ff7875 !important;
        }
        
        /* Fix placeholder text visibility */
        body[data-theme='dark'] .ant-select-selection-placeholder {
          color: #8c8c8c !important;
        }
        
        /* Fix Input and TextArea placeholder text */
        body[data-theme='dark'] .ant-input::placeholder,
        body[data-theme='dark'] .ant-input-number-input::placeholder {
          color: #8c8c8c !important;
        }
        
        /* Fix InputNumber styling in dark mode */
        body[data-theme='dark'] .ant-input-number {
          background-color: rgba(25, 27, 38, 0.9) !important;
          border-color: rgba(49, 129, 130, 0.3) !important;
          color: #F1F1EA !important;
          border-radius: 6px !important;
        }
        body[data-theme='dark'] .ant-input-number-input {
          background-color: transparent !important;
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-input-number-handler-wrap {
          background-color: rgba(25, 27, 38, 0.9) !important;
          border-color: rgba(49, 129, 130, 0.3) !important;
        }
        body[data-theme='dark'] .ant-input-number-handler {
          color: #F1F1EA !important;
          border-color: rgba(49, 129, 130, 0.3) !important;
        }
        body[data-theme='dark'] .ant-input-number-handler:hover {
          background-color: rgba(49, 129, 130, 0.2) !important;
          color: #ffffff !important;
        }
        /* Fix InputNumber addon (like "hours" text) styling */
        body[data-theme='dark'] .ant-input-number-group-addon {
          background-color: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(49, 129, 130, 0.3) !important;
          color: #F1F1EA !important;
          border-radius: 0 6px 6px 0 !important;
        }
        
        /* Fix TextArea styling in dark mode */
        body[data-theme='dark'] .ant-input {
          background-color: rgba(25, 27, 38, 0.9) !important;
          border-color: rgba(49, 129, 130, 0.3) !important;
          color: #F1F1EA !important;
          border-radius: 6px !important;
        }
        body[data-theme='dark'] .ant-input:focus,
        body[data-theme='dark'] .ant-input-focused {
          border-color: rgba(49, 129, 130, 0.8) !important;
          box-shadow: 0 0 0 2px rgba(49, 129, 130, 0.15) !important;
        }
        /* Fix Select focus styling */
        body[data-theme='dark'] .ant-select-focused .ant-select-selector {
          border-color: rgba(49, 129, 130, 0.8) !important;
          box-shadow: 0 0 0 2px rgba(49, 129, 130, 0.15) !important;
        }
        /* Fix InputNumber focus styling */
        body[data-theme='dark'] .ant-input-number-focused {
          border-color: rgba(49, 129, 130, 0.8) !important;
          box-shadow: 0 0 0 2px rgba(49, 129, 130, 0.15) !important;
        }
        
        /* Fix Modal styling in dark mode */
        body[data-theme='dark'] .ant-modal-content {
          background-color: rgba(39, 41, 61, 0.95) !important;
          color: #F1F1EA !important;
          border-radius: 12px !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(49, 129, 130, 0.2) !important;
        }
        body[data-theme='dark'] .ant-modal-header {
          background-color: transparent !important;
          border-color: rgba(49, 129, 130, 0.2) !important;
          border-radius: 12px 12px 0 0 !important;
        }
        body[data-theme='dark'] .ant-modal-title {
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-modal-close {
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-modal-close:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Fix Date Input styling */
        body[data-theme='dark'] input[type="date"] {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(49, 129, 130, 0.3) !important;
          color: #F1F1EA !important;
          border-radius: 6px !important;
        }
        body[data-theme='dark'] input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.7;
        }
        body[data-theme='dark'] input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        
        /* Fix Tabs styling in dark mode */
        body[data-theme='dark'] .ant-tabs-tab {
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-tabs-tab-active {
          color: #318182 !important;
        }
        body[data-theme='dark'] .ant-tabs-tab:hover {
          color: #318182 !important;
        }
        body[data-theme='dark'] .ant-tabs-ink-bar {
          background-color: #318182 !important;
        }
        body[data-theme='dark'] .ant-tabs-content-holder {
          background-color: transparent !important;
        }
        body[data-theme='dark'] .ant-tabs-nav {
          border-color: #318182 !important;
        }
        body[data-theme='dark'] .ant-tabs-nav::before {
          border-color: #318182 !important;
        }
        
        /* Fix Button hover and disabled states */
        body[data-theme='dark'] .ant-btn-primary:hover {
          background-color: rgba(49, 129, 130, 0.8) !important;
          border-color: rgba(49, 129, 130, 0.8) !important;
        }
        body[data-theme='dark'] .ant-btn-default:hover {
          background-color: #318182 !important;
          border-color: #318182 !important;
          color: #ffffff !important;
        }
        body[data-theme='dark'] .ant-btn:disabled,
        body[data-theme='dark'] .ant-btn[disabled] {
          background-color: #333333 !important;
          border-color: #444444 !important;
          color: #666666 !important;
        }
        body[data-theme='dark'] .ant-btn-loading-icon {
          color: #F1F1EA !important;
        }
        
        /* Fix navigation button hover effects */
        body[data-theme='dark'] .profile-date-navigation .ant-btn:hover {
          background-color: rgba(49, 129, 130, 0.2) !important;
          border-color: rgba(49, 129, 130, 0.5) !important;
          color: #F1F1EA !important;
        }

        /* Light mode input styling - darker than page background */
        body[data-theme='default'] .ant-input {
          background-color: rgba(230, 230, 220, 0.9) !important;
        }
        body[data-theme='default'] .ant-input-number {
          background-color: rgba(230, 230, 220, 0.9) !important;
        }
        body[data-theme='default'] .ant-input-number-handler-wrap {
          background-color: rgba(230, 230, 220, 0.9) !important;
        }
        body[data-theme='default'] .ant-select-selector {
          background-color: rgba(230, 230, 220, 0.9) !important;
        }
      `}</style>

      {/* Activity Level Modal */}
      <ActivityLevelModal
        visible={activityModalVisible}
        onClose={() => setActivityModalVisible(false)}
        selected={selectedActivityLevel}
        onSelect={(level) => {
          setSelectedActivityLevel(level);
          form.setFieldsValue({ activityLevel: level });
          setActivityModalVisible(false);
        }}
      />
    </div>
  )
}

export default Profile

const getStyles = (theme: 'default' | 'dark') => ({
  page: {
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#F1F1EB',
    minHeight: '100vh',
    padding: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  modalTitle: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    fontWeight: 'bold',
    fontSize: '24px',
    textAlign: 'center' as const,
    marginBottom: '32px'
  },
  card: {
    maxWidth: 600,
    width: '100%',
    margin: 'auto',
    padding: '40px',
    backgroundColor: theme === 'dark' ? '#27293d' : '#A0B6AA',
    borderRadius: '2rem',
    boxShadow: theme === 'dark' 
      ? '0 8px 32px rgba(0,0,0,0.4), 0 4px 16px rgba(49,129,130,0.2)' 
      : '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(32,54,37,0.1)'
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
  metricsLabel: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    marginBottom: 4
  },
  navigationButton: {
    backgroundColor: theme === 'dark' ? 'rgba(49, 129, 130, 0.1)' : 'rgba(32, 54, 37, 0.1)',
    color: theme === 'dark' ? '#F1F1EA' : '#203625',
    borderColor: theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : 'rgba(32, 54, 37, 0.3)',
    borderRadius: '6px',
    borderWidth: '1px'
  },
  dateHeader: {
    margin: 0,
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
  },
  input: {
    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
    borderColor: theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : 'rgba(32, 54, 37, 0.3)',
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '6px',
    borderWidth: '1px'
  },
  inputNumber: {
    width: '100%',
    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
    borderColor: theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : 'rgba(32, 54, 37, 0.3)',
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '6px',
    borderWidth: '1px'
  },
  select: {
    width: '100%',
    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
    borderColor: theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : 'rgba(32, 54, 37, 0.3)',
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '6px',
    borderWidth: '1px'
  },
  option: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#ffffff'
  },
  primaryButton: {
    backgroundColor: theme === 'dark' ? '#318182' : '#203625',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    color: '#ffffff',
    borderRadius: '9999px',
    marginRight: '8px'
  },
  cancelButton: {
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#F1F1EB',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    color: theme === 'dark' ? '#F1F1EA' : '#203625',
    borderRadius: '9999px'
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: theme === 'dark' ? '#318182' : '#203625',
    color: '#ffffff',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
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