// Name: Viktor Gjorgjevski
// Date: 6/13/2025
// Description: Created frontend page for feedback

// Name: Viktor Gjorgjevski
// Date: 6/18/2025
// Description: updated for proper user authentication

import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons';


const { TextArea } = Input;

export default function FeedbackPage(){

  // Form instance used for Ant Design validation and state control
    const [form] = Form.useForm();
    const router = useRouter();
    const [theme, setTheme] = useState<'default' | 'dark'>('default');

    // Load current theme from backend settings (consistent with other pages)
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/settings', {
                    method: 'GET',
                    credentials: 'include',
                });
                
                if (res.ok) {
                    const settings = await res.json();
                    const currentTheme = settings.preferences?.theme || 'default';
                    setTheme(currentTheme as 'default' | 'dark');
                } else {
                    setTheme('default');
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
                setTheme('default');
            }
        };

        loadPreferences();
    }, []);

    // Handles form submission: sends POST request with feedback data and token
    const handleSubmit = async (values: any) => {
    try{
        const res = await fetch('http://localhost:8080/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(values)
        });

        const data = await res.json();
        if (res.ok) {
            message.success('Feedback submitted!');
            router.push('/chatBot');
        } else {
            message.error(data.message || 'Submission failed');
        }
        } catch (err) {
            message.error('Server error');
        }
    };

    const styles = getStyles(theme);

return (
    <div style={styles.page} className="feedback-page">
      <div style={styles.card} className="feedback-card mobile-card-shadow">
        <Link href="/chatBot">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton} className="back-button-mobile">
            Home
          </Button>
        </Link>

        <h2 style={styles.header} className="feedback-header">Submit Feedback</h2>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label={<span style={styles.label}>Rating</span>}
            name="rating"
            rules={[{ required: true, message: 'Please select a rating' }]}
            className="feedback-rating-container"
          >
            <Select placeholder="Select a rating" style={styles.select}>
              {[1, 2, 3, 4, 5].map(num => (
                <Select.Option key={num} value={num}>{num}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label={<span style={styles.label}>Comments</span>}
            name="comments"
            rules={[{ required: true, message: 'Please enter your feedback' }]}
          >
            <TextArea rows={4} style={styles.input} />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" style={styles.primaryButton} className="feedback-submit-button">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
      
      {/* Global styles for dropdown and error messages */}
      <style jsx global>{`
        /* Fix for the Select dropdown visibility in dark mode */
        body[data-theme='dark'] .ant-select-dropdown {
          background-color: #27293d !important;
          border: 1px solid #318182 !important;
        }
        body[data-theme='dark'] .ant-select-item {
          background-color: #27293d !important;
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-select-item:hover {
          background-color: #318182 !important;
        }
        body[data-theme='dark'] .ant-select-item-option-selected {
          background-color: #318182 !important;
        }
        body[data-theme='dark'] .ant-select-arrow {
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-select-selector {
          background-color: #1D1E2C !important;
          border-color: #318182 !important;
          color: #F1F1EA !important;
        }
        
        /* Fix error message colors */
        body[data-theme='dark'] .ant-form-item-explain-error {
          color: #ff7875 !important; /* Softer red for dark mode */
        }
        body[data-theme='default'] .ant-form-item-explain-error {
          color: #dc3545 !important; /* Standard red for light mode */
        }
        
        /* Fix placeholder text visibility */
        body[data-theme='dark'] .ant-select-selection-placeholder {
          color: #8c8c8c !important;
        }
      `}</style>
    </div>
  );
}

const getStyles = (theme: 'default' | 'dark') => ({
  page: {
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#F1F1EB',
    minHeight: '100vh',
    padding: '6rem'
  },
  card: {
    maxWidth: 600,
    margin: 'auto',
    padding: '2rem',
    backgroundColor: theme === 'dark' ? '#27293d' : '#A0B6AA',
    borderRadius: '2rem',
    boxShadow: theme === 'dark' 
      ? '0 8px 32px rgba(0,0,0,0.4), 0 4px 16px rgba(49,129,130,0.2)' 
      : '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(32,54,37,0.1)'
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: theme === 'dark' ? '#318182' : '#203625',
    color: '#ffffff',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    borderRadius: '9999px'
  },
  header: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    fontSize: '24px',
    marginBottom: '32px'
  },
  label: {
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    fontWeight: 'bold',
    marginBottom: 4
  },
  input: {
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#ffffff',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '8px'
  },
  select: {
    width: '100%',
    backgroundColor: theme === 'dark' ? '#1D1E2C' : '#ffffff',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '8px'
  },
  primaryButton: {
    width: '100%',
    backgroundColor: theme === 'dark' ? '#318182' : '#203625',
    color: '#ffffff',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    borderRadius: '1rem'
  }
});