// Syed Rabbey, 5/26/25, Created a popup dashboard page with static charts and pre-written messages for the user. 
//                       Dashboard component function is declared, an event handler is used to close the modal, 
//                       and recharts functions are pulled to render sleep/exercise activity.

// Violet Yousif, 06/01/2025, Reformatted the code to simplify project's coding style and fixed deprecated Ant Design Modal properties like bodyStle and maskStyle.

// Syed Rabbey, 06/02/2025, Reformatted the code to change colors and add new data point.
// Violet Yousif, 6/14/2025, Removed unused walletAddress prop from DashboardProps interface and component function parameters.

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
  //// Prev: walletAddress: string | null
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

const Dashboard: React.FC<DashboardProps> = ({ visible, onClose }) => {
//// Prev: const Dashboard: React.FC<DashboardProps> = ({ visible, walletAddress, onClose }) => {
  const [currentTheme, setCurrentTheme] = React.useState<'default' | 'dark'>(() => {
  if (typeof window !== 'undefined') {
    return (document.body.dataset.theme as 'default' | 'dark') || 'default'
  }
  return 'default'
})

const isDark = currentTheme === 'dark';
const axisColor = isDark ? '#B8FFF8' : '#000000';       // axes & legend
const gridColor = isDark ? '#318182' : '#203625';       // grid lines
const barColorSleep = isDark ? '#4BC2C4' : '#203625';   // sleep bar
const barColorExercise = isDark ? '#96F2D7' : '#203625';// exercise bar
const chartTitleColor = isDark ? '#4BC2C4' : '#4BC2C4';
const tooltipBg = isDark ? "#232323" : "#fff";
const tooltipText = isDark ? "#e0e0e0" : "#203625";
const legendStyle = { color: axisColor };


React.useEffect(() => {
  const storedTheme = localStorage.getItem('theme') || 'default'
  setCurrentTheme(storedTheme as 'default' | 'dark')
}, [visible])
  const styles = getStyles(currentTheme)

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
        Welcome back, <strong>Guest</strong>! Here's a look at your recent health activity.
      </div>

      <div style={styles.chartSection}>
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Sleep Health</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip contentStyle={{ background: tooltipBg, color: tooltipText }} />
              <Legend wrapperStyle={legendStyle} />
              <Bar dataKey="sleep" fill={barColorSleep} name="Hours Slept" />
            </BarChart>

          </ResponsiveContainer>
        </div>

        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Exercise Habits</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip contentStyle={{ background: tooltipBg, color: tooltipText }} />
              <Legend wrapperStyle={legendStyle} />
              <Bar dataKey="exercise" fill={barColorExercise} name="Hours Exercised" />
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
            <Tooltip contentStyle={{
              background: isDark ? '#232323' : '#fff',
              color: isDark ? '#5eead4' : '#203625'
            }} />

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

const getStyles = (theme: 'default' | 'dark') => ({
  modalTitle: {
    color: theme === 'dark' ? '#F1F1EA' : '#000000',
    fontSize: '28px',
    fontWeight: 600,
    textShadow: theme === 'dark' ? '0 1px 4px rgba(0,0,0,0.55)' : undefined

  },
  modalContainer: {
    backgroundColor: theme === 'dark' ? '#252525' :'#9AB7A9',
    borderRadius: '16px',
    overflow: 'hidden',
    marginTop: 24
  },
  modalBody: {
    backgroundColor: theme === 'dark' ? '#252525' : '#F1F1EB',
    borderRadius: '16px',
    padding: '30px',
    minHeight: '75vh',
  },

  modalMask: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '16px'
  },
  greeting: {
    color: theme === 'dark' ? '#e0e0e0' : '#000000',
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
    color: theme === 'dark' ? '#4BC2C4' : '#203625',
    textAlign: 'center' as const,
    marginBottom: '16px',
    fontSize: '20px'
  },
  tips: {
    marginTop: '20px',
    fontSize: '18px',
    lineHeight: '1.9',
    color: theme === 'dark' ? '#e0e0e0' : '#000000'
  },
  tipPrimary: {
    color: theme === 'dark' ? '#4BC2C4' : '#203625'
  },
  tipNeutral: {
    color: theme === 'dark' ? '#e0e0e0' : '#000000'
  },
  tipHighlight: {
    color: theme === 'dark' ? '#4BC2C4' : '#203625'

  },
  tipSecondary: {
    color: '#4BC2C4'
  }
})
