// Syed Rabbey, 5/26/25, Created a popup dashboard page with static charts and pre-written messages for the user. 
//                       Dashboard component function is declared, an event handler is used to close the modal, 
//                       and recharts functions are pulled to render sleep/exercise activity.
// Violet Yousif, 06/01/2025, Reformatted the code to simplify project's coding style and fixed deprecated Ant Design Modal properties like bodyStle and maskStyle.
// Syed Rabbey, 06/02/2025, Reformatted the code to change colors and add new data point.
// Violet Yousif, 6/14/2025, Removed unused walletAddress prop from DashboardProps interface and component function parameters.
// Syed Rabbey, 7/6/2025, updated insights layout to be more informative.
// Syed Rabbey, 7/7/2025, Updated insights logic to fetch from backend and display user-specific tips.

import React from 'react'
import { Modal, Tooltip, notification } from 'antd'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
} from 'recharts'
import dayjs from 'dayjs';
import { Tooltip as RechartsTooltip } from 'recharts';

interface DashboardProps {
  visible: boolean
  //// Prev: walletAddress: string | null
  onClose: () => void
}

/* const healthData = [
  { day: 'Mon', sleep: 6.5, exercise: 1.0 },
  { day: 'Tue', sleep: 7.0, exercise: 0.5 },
  { day: 'Wed', sleep: 8.0, exercise: 1.5 },
  { day: 'Thu', sleep: 6.0, exercise: 0.0 },
  { day: 'Fri', sleep: 7.5, exercise: 2.0 },
  { day: 'Sat', sleep: 9.0, exercise: 2.5 },
  { day: 'Sun', sleep: 8.5, exercise: 1.0 }
] */

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

const [userId, setUserId] = React.useState<string | null>(null);
const [tips, setTips] = React.useState({ tip1: '', tip2: '' });//tip3: ''
const [firstName, setFirstName] = React.useState<string>('');


React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'default';
    setCurrentTheme(storedTheme as 'default' | 'dark');
}, [visible]);

  //  Fetch userId from  backend
React.useEffect(() => {
  const fetchUserId = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/user-data', {
        credentials: 'include',
      });
      const userData = await res.json();
      setUserId(userData._id);
      setFirstName(userData.firstName || 'Guest'); // <- store name
    } catch (error) {
      console.error('Failed to load user ID:', error);
    }
  };

  fetchUserId();
}, []);

// Fetch insights when dashboard becomes visible
React.useEffect(() => {
  const fetchInsights = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/healthmetrics/insights', {
        credentials: 'include',
      });

      if (!res.ok) {
        notification.error({
          message: 'Failed to fetch insights',
          description: 'Please try again later.',
          placement: 'topRight',
        });
        return;
      }

      const data = await res.json();

      console.log("INSIGHTS RECEIVED IN REACT:", data); // Debug log

      setTips({
        tip1: data.tip1 || '',
        tip2: data.tip2 || ''
        //tip3: data.tip3 || ''
      });
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  if (visible) {
    fetchInsights();
  }
}, [visible]);


const isDark = currentTheme === 'dark';
const axisColor = isDark ? '#B8FFF8' : '#000000';       // axes & legend
const gridColor = isDark ? '#318182' : '#203625';       // grid lines
const barColorSleep = isDark ? '#4BC2C4' : '#203625';   // sleep bar
const barColorExercise = isDark ? '#96F2D7' : '#203625';// exercise bar
const barColorCalories = isDark ? '#FFD369' : '#203625'// calories bar
const chartTitleColor = isDark ? '#4BC2C4' : '#4BC2C4';
const tooltipBg = isDark ? "#232323" : "#fff";
const tooltipText = isDark ? "#e0e0e0" : "#203625";
const legendStyle = { color: axisColor };


React.useEffect(() => {
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

  if (visible) {
    loadPreferences();
  }
}, [visible])
  const styles = getStyles(currentTheme)
const [metrics, setMetrics] = React.useState<Record<string, any>>({});
const [last7Data, setLast7Data] = React.useState<
  { date: string; sleep: number; exercise: number; calories: number; weight: number }[]
>([]);

React.useEffect(() => {
  fetch('http://localhost:8080/api/health-metrics', { credentials: 'include' })
    .then(res => res.json())
    .then(data => setMetrics(data.dates || {}))
    .catch(console.error);
}, []);

React.useEffect(() => {
  const today = dayjs()
  const arr: { date: string; sleep: number; exercise: number; calories: number; weight: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = today.subtract(i, 'day').format('YYYY-MM-DD')
    const m = metrics[d]
    if (m) {
      arr.push({
        date: dayjs(d).format('ddd'),
        sleep: m.sleepHours,
        exercise: m.exerciseHours,
        calories: m.calories,
        weight: m.weight ?? 0
      })
    }
  }
  setLast7Data(arr);


}, [metrics])

const sleepAvg = last7Data.length
  ? (last7Data.reduce((acc, cur) => acc + cur.sleep, 0) / last7Data.length).toFixed(1)
  : null;

const exerciseDays = last7Data.filter(d => d.exercise > 0);
const exerciseAvg = exerciseDays.length
  ? (exerciseDays.reduce((acc, cur) => acc + cur.exercise, 0) / exerciseDays.length).toFixed(1)
  : null;

  return (
    <Modal
      title={<span style={styles.modalTitle}>Your Health Dashboard</span>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{
        ...styles.modalContainer,
        maxWidth: '1200px'
      }}
      styles={{
        body: styles.modalBody,
        mask: styles.modalMask,
      }}
      closable
      wrapClassName="custom-dashboard-modal" 
    >
      <div style={styles.greeting}>
        Welcome back, <strong>{firstName}</strong>! Here's a look at your recent health activity.
      </div>

      <div style={styles.chartSection}>
        {/* <div style={styles.chartContainer}>
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
        </div> */}
        {[
          { key: 'sleep', label: 'Last 7 Days: Sleep Hours', fill: barColorSleep },
          { key: 'exercise', label: 'Last 7 Days: Exercise Hours', fill: barColorExercise },
          { key: 'calories', label: 'Last 7 Days: Calories', fill: barColorCalories }
        ].map(({ key, label, fill }) => (
          <div style={styles.chartContainer} key={key}>
            <h3 style={styles.chartTitle}>{label}</h3>
          {last7Data.length === 0 ? (
            <div style={styles.noDataMessage}>No data reported for the last 7 days.</div>
          ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7Data}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <RechartsTooltip contentStyle={{ background: tooltipBg, color: tooltipText }} />
              <Legend wrapperStyle={legendStyle} />
              <Bar dataKey={key} name={label.split(': ')[1]}>
                {last7Data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          )}
          </div>
        ))}
      </div>
      {/* Second row: Weight chart */}
      <div style={{ ...styles.chartSection, justifyContent: 'center' }}>
        <div
          style={{
            ...styles.chartContainer,
            flex: '0 1 33%',
            maxWidth: '400px',
            minWidth: '280px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <h3 style={styles.chartTitle}>Last 7 Days: Weight (lb)</h3>
          {last7Data.length === 0 ? (
            <div style={styles.noDataMessage}>No weight data reported for the last 7 days.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={last7Data}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <RechartsTooltip contentStyle={{ background: tooltipBg, color: tooltipText }} />
                <Legend wrapperStyle={legendStyle} />
                <Bar dataKey="weight" fill="#7FB285" name="Weight (lb)">
                  {last7Data.map((_, index) => (
                    <Cell key={`cell-weight-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* <div style={styles.pieChartSection}>
        <h3 style={styles.chartTitle}>Diet Breakdown</h3>
        <ResponsiveContainer width={400} height={300}>
          <PieChart>
            <Pie data={dietData} dataKey="value" cx="50%" cy="50%" outerRadius={100} label>
              {dietData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip contentStyle={{
              background: isDark ? '#232323' : '#fff',
              color: isDark ? '#5eead4' : '#203625'
            }} />

          </PieChart> */}

        {/* </ResponsiveContainer>
      </div> */}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '20px' }}>
        <Tooltip title="Methuselah analyzes your sleep trends over time to determine your wellness aspirations and journey.">
          <div style={{ flex: 1, borderRadius: '16px', padding: '20px', background: '#9AB7A9', transition: 'all 0.3s ease-in-out' }}>
            <p style={{ fontSize: '16px', margin: 0 }}>
              {sleepAvg
                ? <>You are sleeping an average of <strong style={{ color: '#000000' }}>{sleepAvg}</strong> hours a night!</>
                : 'No sleep data reported yet.'}
            </p>
          </div>
        </Tooltip>

        <Tooltip title="Methuselah tracks your exercise logging activity – try to stay on track for Methuselah to generate the most tailored advice and direction for your wellbeing.">
          <div style={{ flex: 1, borderRadius: '16px', padding: '20px', background: '#9AB7A9', transition: 'all 0.3s ease-in-out' }}>
            <p style={{ fontSize: '16px', margin: 0 }}>
              {exerciseAvg
                ? <>Good job! You are exercising an average of <strong style={{ color: '#000000' }}>{exerciseAvg}</strong> hours this week.</>
                : 'Begin tracking your exercise for tailored insights.'}
            </p>
          </div>
        </Tooltip>

        {/* <div style={{ flex: 1, borderRadius: '16px', padding: '20px', background: '#9AB7A9', transition: 'all 0.3s ease-in-out' }}>
          <p style={{ fontSize: '16px', color: '#FFFFFF', margin: 0 }}>{tips.tip3}</p>
        </div> */}
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
  noDataMessage: {
    justifyContent: 'center',
    color: theme === 'dark' ? '#aaa' : '#333',
    fontStyle: 'italic',
    padding: '40px 0',
    fontSize: '16px'
  },
  chartContainer: {
    flex: 1,
    minWidth: '300px',
    '@media (max-width: 768px)': {
      minWidth: '280px'
    },
    '@media (max-width: 480px)': {
      minWidth: '100%'
    }
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
