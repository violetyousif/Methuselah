// Mohammad Hoque, 6/19/2025, Created a modal to explain Activity Level options for user profile clarity.

import React, { useState, useEffect } from 'react';
import { Modal, Typography, Button, Space } from 'antd';

const { Title, Paragraph, Text } = Typography;

interface ActivityLevelModalProps {
  visible: boolean;
  onClose: () => void;
  selected: string;
  onSelect: (level: string) => void;
}

const levels = [
  {
    key: 'sedentary',
    label: 'Sedentary',
    description: 'Little or no physical activity. Most of the day is spent sitting (e.g., desk job, student, minimal exercise).'
  },
  {
    key: 'moderate',
    label: 'Moderate',
    description: 'Some physical activity or exercise 1–3 days per week. Includes light sports, walking, or household chores.'
  },
  {
    key: 'active',
    label: 'Active',
    description: 'Regular physical activity or exercise 4+ days per week. Includes intense sports, running, manual labor, or frequent workouts.'
  }
];

const ActivityLevelModal: React.FC<ActivityLevelModalProps> = ({ visible, onClose, selected, onSelect }) => {
  const [currentTheme, setCurrentTheme] = useState<'default' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (document.body.dataset.theme as 'default' | 'dark') || 'default'
    }
    return 'default'
  })

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

  const styles = getStyles(currentTheme);

  return (
    <Modal
      title={<span style={styles.title}>Activity Level Selection</span>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: '12px',
          backgroundColor: currentTheme === 'dark' ? 'rgba(39, 41, 61, 0.95)' : '#F1F1EB',
          margin: '0 auto',
        }
      }}
      modalRender={(modal) => (
        <div style={{ marginTop: '1vh' }}>{modal}</div>
      )}
    >
      <Typography>
        <Title level={4} style={styles.subtitle}>Choose Your Activity Level</Title>
        <Paragraph style={styles.text}>
          Please select the activity level that best matches your typical week, considering both work and leisure activities. Being honest helps us personalize your health recommendations.
        </Paragraph>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {levels.map(level => (
            <div key={level.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Button
                type={selected === level.key ? 'primary' : 'default'}
                onClick={() => onSelect(level.key)}
                style={{ 
                  minWidth: 110,
                  backgroundColor: selected === level.key 
                    ? (currentTheme === 'dark' ? 'rgba(49, 129, 130, 0.8)' : '#203625')
                    : (currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'),
                  borderColor: currentTheme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : '#203625',
                  color: selected === level.key 
                    ? '#ffffff' 
                    : (currentTheme === 'dark' ? '#F1F1EA' : '#1D1E2C'),
                  borderRadius: '6px'
                }}
              >
                {level.label}
              </Button>
              <div style={styles.description}>
                <Text strong style={styles.text}>{level.label}:</Text> <span style={styles.text}>{level.description}</span>
              </div>
            </div>
          ))}
        </Space>
      </Typography>
    </Modal>
  );
};

const getStyles = (theme: 'default' | 'dark') => ({
  title: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
  },
  subtitle: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
  },
  text: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
  },
  description: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
  }
});

export default ActivityLevelModal;