// Mohammad Hoque, 6/19/2025, Created a modal to explain Activity Level options for user profile clarity.

import * as React from 'react';
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
  return (
    <Modal
      title="Activity Level Selection"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: '12px',
          backgroundColor: '#F1F1EB',
          margin: '0 auto',
        }
      }}
      modalRender={(modal) => (
        <div style={{ marginTop: '1vh' }}>{modal}</div>
      )}
    >
      <Typography>
        <Title level={4}>Choose Your Activity Level</Title>
        <Paragraph>
          Please select the activity level that best matches your typical week, considering both work and leisure activities. Being honest helps us personalize your health recommendations.
        </Paragraph>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {levels.map(level => (
            <div key={level.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Button
                type={selected === level.key ? 'primary' : 'default'}
                onClick={() => onSelect(level.key)}
                style={{ minWidth: 110 }}
              >
                {level.label}
              </Button>
              <div>
                <Text strong>{level.label}:</Text> {level.description}
              </div>
            </div>
          ))}
        </Space>
      </Typography>
    </Modal>
  );
};

export default ActivityLevelModal;