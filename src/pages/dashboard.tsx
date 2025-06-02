// Creator: Syed Rabbey
// Date: 5/26/25
// Description: Created a popup dashboard page with static charts and pre-written messages for the user. 
// Dashboard component function is declared, an event handler is used to close the modal, 
// and recharts functions are pulled to render sleep/exercise activity.

// Edited by: Violet Yousif
// Date: 06/01/2025
// Reformatted the code to simplify project's coding style and fixed deprecated Ant Design Modal properties like bodyStle and maskStyle.

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
    <Modal
      title={<span style={styles.modalTitle}>Your Health Dashboard</span>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={styles.modalContainer}
      styles={{
        body: styles.modalBody,
        mask: styles.modalMask
      }}
      closable
      wrapClassName="custom-modal"
    >
      {/* Greeting */}
      <div style={styles.greeting}>
        Welcome back, <strong>{walletAddress || 'Guest'}</strong>! Here's a look at your recent health activity.
      </div>

      {/* Bar Charts Section */}
      <div style={styles.chartSection}>
        {/* Sleep Chart */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Sleep Health</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData}>
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
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Exercise Habits</h3>
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
      <div style={styles.tips}>
        <p style={styles.tipPrimary}>☀️ It is recommended that you increase your Vitamin D intake.</p>
        <p style={styles.tipNeutral}>
          💪 To meet your weight gain goals, make sure you're getting{' '}
          <span style={styles.tipHighlight}>consistent sleep</span> and{' '}
          <span style={styles.tipHighlight}>planned exercise routines</span>.
        </p>
        <p style={styles.tipSecondary}>👏 Good job on your consistency! You earned it.</p>
      </div>
    </Modal>
  )
}

export default Dashboard

const styles = {
  modalTitle: {
    color: '#F1F1EB',
    fontSize: '28px',
    fontWeight: 600
  },
  modalContainer: {
    backgroundColor: '#203625',
    borderRadius: '16px',
    overflow: 'hidden'
  },
  modalBody: {
    backgroundColor: '#203625',
    padding: '40px',
    borderRadius: '16px',
    minHeight: '85vh'
  },
  modalMask: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '16px'
  },
  greeting: {
    color: '#F1F1EB',
    fontSize: '20px',
    marginBottom: '30px'
  },
  chartSection: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as 'wrap',
    gap: '40px'
  },
  chartContainer: {
    flex: 1,
    minWidth: '300px'
  },
  chartTitle: {
    color: '#4BC2C4',
    textAlign: 'center' as const,
    marginBottom: '20px',
    fontSize: '22px'
  },
  tips: {
    marginTop: '50px',
    fontSize: '20px',
    lineHeight: '2.2'
  },
  tipPrimary: {
    color: '#4BC2C4'
  },
  tipNeutral: {
    color: '#F1F1EB'
  },
  tipHighlight: {
    color: '#4BC2C4'
  },
  tipSecondary: {
    color: '#A0B6AA'
  }
}
