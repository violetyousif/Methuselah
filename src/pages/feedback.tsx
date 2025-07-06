// Name: Viktor Gjorgjevski
// Date: 6/13/2025
// Description: Created frontend page for feedback

// Name: Viktor Gjorgjevski
// Date: 6/18/2025
// Description: updated for proper user authentication

import React, { useState, useEffect } from 'react';
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

    // Effect hook to detect current theme from body attribute
    useEffect(() => {
        const currentTheme = document.body.dataset.theme as 'default' | 'dark' || 'default';
        setTheme(currentTheme);
    }, []);

    // Handles form submission: sends POST request with feedback data and token
    const handleSubmit = async (values: any) => {
    try{
        const res = await fetch('http://localhost:8080/api/submit-feedback', {
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
            router.push('/');
        } else {
            message.error(data.message || 'Submission failed');
        }
        } catch (err) {
            message.error('Server error');
        }
    };
    




const styles = {
    page: {
      backgroundColor: theme === 'dark' ? '#0f0f17' : '#F1F1EB',
      minHeight: '100vh',
      padding: '6rem'
    },
    card: {
      maxWidth: 600,
      margin: 'auto',
      padding: '2rem',
      backgroundColor: theme === 'dark' ? '#252525' : '#A0B6AA',
      borderRadius: '2rem',
      boxShadow: theme === 'dark' 
        ? '0 8px 32px rgba(0,0,0,0.4), 0 4px 16px rgba(75,85,99,0.2)' 
        : '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(32,54,37,0.1)'
    },
    backButton: {
      marginBottom: '24px',
      backgroundColor: theme === 'dark' ? '#4b5563' : '#203625',
      color: '#ffffff',
      borderColor: theme === 'dark' ? '#4b5563' : '#203625',
      borderRadius: '9999px'
    },
    header: {
      color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
      textAlign: 'center' as const,
      fontWeight: 'bold' as const,
      fontSize: '24px'
    },
    submitButton: {
      width: '100%',
      backgroundColor: theme === 'dark' ? '#4b5563' : '#203625',
      color: '#ffffff',
      borderColor: theme === 'dark' ? '#4b5563' : '#203625',
      borderRadius: '1rem'
    }
}



return (
    <div style={styles.page} className="feedback-page">
      <div style={styles.card} className="feedback-card mobile-card-shadow">
        <Link href="/">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton} className="back-button-mobile">
            Back
          </Button>
        </Link>

        <h2 style={styles.header} className="feedback-header">Submit Feedback</h2>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Comments"
            name="comments"
            rules={[{ required: true, message: 'Please enter your feedback' }]}
          >
            <TextArea rows={4} className="feedback-textarea" />
          </Form.Item>

          <Form.Item
            label="Rating"
            name="rating"
            rules={[{ required: true, message: 'Please select a rating' }]}
            className="feedback-rating-container"
          >
            <Select placeholder="Select a rating">
              {[1, 2, 3, 4, 5].map(num => (
                <Select.Option key={num} value={num}>{num}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                      label="Comments"
                      name="comments"
                      rules={[{ required: true, message: 'Please enter your feedback' }]}
                    >
                      <TextArea rows={4} />
                    </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={styles.submitButton} className="feedback-submit-button">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}