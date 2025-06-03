// Creator: Syed Rabbey
// Date: 5/26/25
// Description: Created a popup dashboard page with static charts and pre-written messages for the user. 
// Dashboard component function is declared, an event handler is used to close the modal, 
// and recharts functions are pulled to render sleep/exercise activity.

// Edited by: Violet Yousif
// Date: 06/01/2025
// Reformatted the code to simplify project's coding style and fixed deprecated Ant Design Modal properties like bodyStle and maskStyle.

// Edited by: Syed Rabbey
// Date: 06/02/2025
// Reformatted the code to change colors and add new data point.

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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label
} from 'recharts'

interface DashboardProps {
  visible: boolean
  walletAddress: string | null
  onClose: () => void
}

const healthData = [
  { day: 'Mon', sleep: 6.5, exercise: 1.0 },
  { day: 'Tue', sleep: 7.0, exercise: 0.5 },
  { day: 'Wed', sleep: 8.0, exercise: 1.5 },
  { day: 'Thu', sleep: 6.0, exercise: 0.0 },
  { day: 'Fri', sleep: 7.5, exercise: 2.0 },
  { day: 'Sat', sleep: 9.0, exercise: 2.5 },
  { day: 'Sun', sleep: 8.5, exercise: 1.0 }
]

const dietData = [
  { name: 'Protein', value: 25 },
  { name: 'Fruits', value: 25 },
  { name: 'Whole Grains', value: 20 },
  { name: 'Vegetables', value: 30 }
]

const COLORS = ['#2F4F4F', '#3C6E71', '#5A8F7B', '#7FB285']

const Dashboard: React.FC<DashboardProps> = ({ visible, walletAddress, onClose }) => {
  return (
    <Modal
      title={<span style={styles.modalTitle}>Your Health Dashboard</span>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="80%"
      style={styles.modalContainer}
      styles={{
        body: styles.modalBody,
        mask: styles.modalMask,
      }}
      closable
      wrapClassName="custom-dashboard-modal" 
    >
      <div style={styles.greeting}>
        Welcome back, <strong>{walletAddress || 'Guest'}</strong>! Here's a look at your recent health activity.
      </div>

      <div style={styles.chartSection}>
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Sleep Health</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData}>
              <CartesianGrid stroke="#203625" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#000000" />
              <YAxis stroke="#000000" />
              <Tooltip />
              <Legend />
              <Bar dataKey="sleep" fill="#203625" name="Hours Slept" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Exercise Habits</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData}>
              <CartesianGrid stroke="#203625" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#000000" />
              <YAxis stroke="#000000" />
              <Tooltip />
              <Legend />
              <Bar dataKey="exercise" fill="#203625" name="Hours Exercised" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.pieChartSection}>
        <h3 style={styles.chartTitle}>Diet Breakdown</h3>
        <ResponsiveContainer width={400} height={300}>
          <PieChart>
            <Pie data={dietData} dataKey="value" cx="50%" cy="50%" outerRadius={100} label>
              {dietData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

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
    color: '#000000',
    fontSize: '28px',
    fontWeight: 600
  },

  modalContainer: {
    backgroundColor: '#9AB7A9',
    borderRadius: '16px',
    overflow: 'hidden',
    marginTop: 24
  },
  modalBody: {
    backgroundColor: '#F1F1EB',
    padding: '30px',
    borderRadius: '16px',
    minHeight: '75vh'
  },
  modalMask: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '16px'
  },
  greeting: {
    color: '#000000',
    fontSize: '18px',
    marginBottom: '24px'
  },
  chartSection: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '24px'
  },
  chartContainer: {
    flex: 1,
    minWidth: '300px'
  },
  pieChartSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column' as const,
    marginTop: '30px',
    marginBottom: '20px'
  },
  chartTitle: {
    color: '#4BC2C4',
    textAlign: 'center' as const,
    marginBottom: '16px',
    fontSize: '20px'
  },
  tips: {
    marginTop: '20px',
    fontSize: '18px',
    lineHeight: '1.9'
  },
  tipPrimary: {
    color: '#4BC2C4'
  },
  tipNeutral: {
    color: '#000000'
  },
  tipHighlight: {
    color: '#4BC2C4'
  },
  tipSecondary: {
    color: '#203625'
  }
}