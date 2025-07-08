// Name: Viktor Gjorgjevski
// Date: 6/13/2025
// Description: Created frontend page for feedback

// Name: Viktor Gjorgjevski
// Date: 6/18/2025
// Description: updated for proper user authentication

// Syed Rabbey, 07/07/2025, added toast message

import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, notification } from 'antd';
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
          notification.success({
            message: 'Thank You!',
            description: 'Your feedback has been submitted successfully.',
            placement: 'topRight',
            duration: 4
          });
          router.push('/chatBot');
        } else {
          notification.error({
            message: 'Submission Failed',
            description: data.message || 'Something went wrong. Please try again.',
            placement: 'topRight',
            duration: 4
          });
        }
        } catch (err) {
          notification.error({
            message: 'Server Error',
            description: 'Could not submit feedback. Please try again later.',
            placement: 'topRight',
            duration: 4
          });
        }
    };

    const styles = getStyles(theme);

return (
    <div style={styles.page} className="feedback-page">
      <div style={styles.card} className="feedback-card mobile-card-shadow">
        <Link href="/chatBot">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton} className="feedbackBackButton back-button-mobile">
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
      
      {/* Global styles for dropdown and modern input styling */}
      <style jsx global>{`
        /* Modern input and select styling for feedback page */
        .feedback-page .ant-input,
        .feedback-page .ant-select-selector {
          background-color: ${theme === 'dark' ? 'rgba(25, 27, 38, 0.9)' : 'rgba(230, 230, 220, 0.9)'} !important;
          border: 1px solid ${theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : 'rgba(32, 54, 37, 0.3)'} !important;
          border-radius: 6px !important;
          color: ${theme === 'dark' ? '#F1F1EA' : '#1D1E2C'} !important;
          transition: all 0.2s ease-in-out !important;
        }

        .feedback-page .ant-input:hover,
        .feedback-page .ant-select:hover .ant-select-selector {
          border-color: ${theme === 'dark' ? 'rgba(49, 129, 130, 0.5)' : 'rgba(32, 54, 37, 0.5)'} !important;
          background-color: ${theme === 'dark' ? 'rgba(25, 27, 38, 1.0)' : 'rgba(230, 230, 220, 1.0)'} !important;
        }

        .feedback-page .ant-input:focus,
        .feedback-page .ant-input-focused,
        .feedback-page .ant-select-focused .ant-select-selector {
          border-color: ${theme === 'dark' ? '#318182' : '#203625'} !important;
          box-shadow: 0 0 0 2px ${theme === 'dark' ? 'rgba(49, 129, 130, 0.2)' : 'rgba(32, 54, 37, 0.2)'} !important;
          background-color: ${theme === 'dark' ? 'rgba(25, 27, 38, 1.0)' : 'rgba(230, 230, 220, 1.0)'} !important;
        }

        .feedback-page .ant-select-arrow {
          color: ${theme === 'dark' ? '#F1F1EA' : '#1D1E2C'} !important;
        }

        .feedback-page .ant-select-dropdown {
          background-color: ${theme === 'dark' ? 'rgba(39, 41, 61, 0.95)' : '#ffffff'} !important;
          border: 1px solid ${theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : 'rgba(32, 54, 37, 0.3)'} !important;
          border-radius: 6px !important;
          backdrop-filter: blur(10px) !important;
          box-shadow: ${theme === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)'} !important;
        }

        .feedback-page .ant-select-item {
          background-color: transparent !important;
          color: ${theme === 'dark' ? '#F1F1EA' : '#1D1E2C'} !important;
          border-radius: 4px !important;
          margin: 2px 4px !important;
        }

        .feedback-page .ant-select-item-option-selected {
          background-color: ${theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : 'rgba(32, 54, 37, 0.1)'} !important;
          color: ${theme === 'dark' ? '#F1F1EA' : '#1D1E2C'} !important;
        }

        .feedback-page .ant-select-item-option:hover {
          background-color: ${theme === 'dark' ? 'rgba(49, 129, 130, 0.2)' : 'rgba(32, 54, 37, 0.05)'} !important;
        }

        .feedback-page .ant-select-item-option-active {
          background-color: ${theme === 'dark' ? 'rgba(49, 129, 130, 0.2)' : 'rgba(32, 54, 37, 0.08)'} !important;
        }

        /* Button styles */
        .feedback-page .ant-btn-primary {
          background-color: ${theme === 'dark' ? '#318182' : '#203625'} !important;
          border-color: ${theme === 'dark' ? '#318182' : '#203625'} !important;
          border-radius: 6px !important;
        }

        .feedback-page .ant-btn-primary:hover {
          background-color: ${theme === 'dark' ? '#3a9394' : '#2a4730'} !important;
          border-color: ${theme === 'dark' ? '#3a9394' : '#2a4730'} !important;
        }
        
        /* Fix error message colors */
        .feedback-page .ant-form-item-explain-error {
          color: ${theme === 'dark' ? '#ff7875' : '#dc3545'} !important;
        }
        
        /* Fix placeholder text visibility */
        .feedback-page .ant-select-selection-placeholder {
          color: ${theme === 'dark' ? '#8c8c8c' : '#999999'} !important;
        }

        /* Global dark mode styles for feedback dropdowns - ensure they override default styles */
        body[data-theme='dark'] .feedback-page .ant-select-dropdown,
        body[data-theme='dark'] .ant-select-dropdown {
          background-color: rgba(39, 41, 61, 0.95) !important;
          border: 1px solid rgba(49, 129, 130, 0.3) !important;
          border-radius: 6px !important;
          backdrop-filter: blur(10px) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        }

        body[data-theme='dark'] .feedback-page .ant-select-item,
        body[data-theme='dark'] .ant-select-item {
          background-color: transparent !important;
          color: #F1F1EA !important;
        }

        body[data-theme='dark'] .feedback-page .ant-select-item-option-selected,
        body[data-theme='dark'] .ant-select-item-option-selected {
          background-color: rgba(49, 129, 130, 0.3) !important;
          color: #F1F1EA !important;
        }

        body[data-theme='dark'] .feedback-page .ant-select-item:hover,
        body[data-theme='dark'] .ant-select-item:hover {
          background-color: rgba(49, 129, 130, 0.2) !important;
        }

        body[data-theme='dark'] .feedback-page .ant-select-item-option-active,
        body[data-theme='dark'] .ant-select-item-option-active {
          background-color: rgba(49, 129, 130, 0.2) !important;
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
    backgroundColor: theme === 'dark' ? 'rgba(45, 47, 65, 0.6)' : '#ffffff',
    borderColor: theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : '#203625',
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '6px',
    borderWidth: '1px'
  },
  select: {
    width: '100%',
    backgroundColor: theme === 'dark' ? 'rgba(45, 47, 65, 0.6)' : '#ffffff',
    borderColor: theme === 'dark' ? 'rgba(49, 129, 130, 0.3)' : '#203625',
    color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
    borderRadius: '6px',
    borderWidth: '1px'
  },
  primaryButton: {
    width: '100%',
    backgroundColor: theme === 'dark' ? '#318182' : '#203625',
    color: '#ffffff',
    borderColor: theme === 'dark' ? '#318182' : '#203625',
    borderRadius: '9999px'
  }
});