// Creator: Syed Rabbey
// Date: 5/26/25
// Description: Created a popup dashboard page with static charts and pre-written messages for the user. Dashboard component function is declared, an event handler is used to close the modal, 
// and recharts functions are pulled to render sleep/exercise activity.

import React from 'react'
import { Modal } from 'antd'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface DashboardProps {
  visible: boolean
  walletAddress: string | null
  onClose: () => void
}

// Static weekly data - replace with dynamic later
const healthData = [
  { day: 'Mon', sleep: 6.5, exercise: 1.0 },
  { day: 'Tue', sleep: 7.0, exercise: 0.5 },
  { day: 'Wed', sleep: 8.0, exercise: 1.5 },
  { day: 'Thu', sleep: 6.0, exercise: 0.0 },
  { day: 'Fri', sleep: 7.5, exercise: 2.0 },
  { day: 'Sat', sleep: 9.0, exercise: 2.5 },
  { day: 'Sun', sleep: 8.5, exercise: 1.0 }
]

const Dashboard: React.FC<DashboardProps> = ({ visible, walletAddress, onClose }) => {
  return (
    //antd modal to display dashboard overlay
    <Modal
      title={<span style={{ color: '#F1F1EB', fontSize: '28px', fontWeight: 600 }}>Your Health Dashboard</span>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{
        backgroundColor: '#203625',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
      bodyStyle={{
        backgroundColor: '#203625',
        padding: '40px',
        borderRadius: '16px',
        minHeight: '85vh'
      }}
      closable
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '16px'
      }}
      wrapClassName="custom-modal"
    >
      {/* Greeting */}
      <div style={{ color: '#F1F1EB', fontSize: '20px', marginBottom: '30px' }}>
        Welcome back, <strong>{walletAddress || 'Guest'}</strong>! Here's a look at your recent health activity.
      </div>

      {/* Bar Charts Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
        {/* Sleep Chart */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ color: '#318182', textAlign: 'center', marginBottom: '20px', fontSize: '22px' }}>Your Sleep</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData}>
              {/* Axis, hoverover, gridlines */}
              <CartesianGrid stroke="#A0B6AA" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#F1F1EB" />
              <YAxis stroke="#F1F1EB" />
              <Tooltip />
              <Legend />
              <Bar dataKey="sleep" fill="#A0B6AA" name="Hours Slept" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Exercise Chart */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ color: '#318182', textAlign: 'center', marginBottom: '20px', fontSize: '22px' }}>Your Exercise Habits</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData}>
              <CartesianGrid stroke="#A0B6AA" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#F1F1EB" />
              <YAxis stroke="#F1F1EB" />
              <Tooltip />
              <Legend />
              <Bar dataKey="exercise" fill="#F1F1EB" name="Hours Exercised" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Health Tips */}
      <div style={{ marginTop: '50px', fontSize: '20px', lineHeight: '2.2' }}>
        <p style={{ color: '#FF6B6B' }}>☀️ It is recommended that you increase your Vitamin D intake.</p>
        <p style={{ color: '#F1F1EB' }}>
          💪 To meet your weight gain goals, make sure you're getting <span style={{ color: '#FF6B6B' }}>consistent sleep</span> and <span style={{ color: '#FF6B6B' }}>planned exercise routines</span>.
        </p>
        <p style={{ color: '#A0B6AA' }}>👏 Good job on your consistency! You earned it.</p>
      </div>
    </Modal>
  )
}

export default Dashboard
