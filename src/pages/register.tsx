// Name: Mizanur Mizan
// Description: Created the register page frontend layout and input boxes for name, email, and password
// Date: 5/26/25
// Modified by Mizan: 5/29/25
// pages/register.tsx

// Edited by: Violet Yousif
// Date: 06/01/2025
// Reformatted the code to simplify project's coding style.

import React, { useState } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import Link from 'next/link';
import { ArrowLeftOutlined } from '@ant-design/icons';
import ModalTerms from '../components/TermsModal';
import { Weight } from 'lucide-react';

function register() {
  const [form] = Form.useForm();
  const [termsVisible, setTermsVisible] = useState(false);

  // Edited by: Violet Yousif
  // Date: 06/01/2025
  // Description: Edited function to fetch backend data, include
  // error handling and run validation in the register form submission.
  const onFinish = async (values: any) => {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);
    console.log('register successful: ', result);
    } catch (error) {
      console.error('ERROR: register failed: ', error);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link href="/">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton}>
            Back
          </Button>
        </Link>

        <h2 style={styles.header}>Create an Account</h2>

        <Form form={form} name="register" layout="vertical" onFinish={onFinish}>
          <Form.Item
            style={ styles.rowSpacing }
            label={<span style={ styles.label }>First Name</span>}
            name="firstName"
            rules={[{ required: true, message: 'Please enter your first name' }]}
          >
            <Input placeholder="Jane" style={styles.placeholderStyle} />
          </Form.Item>

          <Form.Item
            style={ styles.rowSpacing }
            label={<span style={styles.label}>Last Name</span>}
            name="LastName"
            rules={[{ required: true, message: 'Please enter your last name' }]}
          >
            <Input placeholder="Doe" style={styles.placeholderStyle} />
          </Form.Item>

          <Form.Item
            style={ styles.rowSpacing }
            label={<span style={styles.label}>Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="janedoe@example.com" style={styles.placeholderStyle} />
          </Form.Item>

          {/* Set password input to require at least 8 characters, 1 number, and other constraints */}
          <Form.Item
            style={ styles.rowSpacing }
            label={<span style={styles.label}>Password</span>}
            name="password"
            rules={[
              { required: true, message: 'Please enter a secure password' },
              { min: 10, message: 'Password must be at least 10 characters long' },
              { pattern: /.*\d.*/, message: 'Password must contain at least one number' },
              { pattern: /.*[A-Z].*/, message: 'Password must contain at least one uppercase letter' },
              { pattern: /.*[a-z].*/, message: 'Password must contain at least one lowercase letter' },
              { pattern: /.*[!@#$%*].*/, message: 'Password must contain at least one special character (!,@,#,$,%,*)' },
              { pattern: /^[^\\'"<>`]*$/, message: 'Password cannot contain \\, \', ", <, >, or ` characters' }
            ]}
          >
            <Input.Password type="password" placeholder="Minimum 10 characters" style={styles.placeholderStyle} />
          </Form.Item>

          <Form.Item
            style={ styles.rowSpacing }
            label={<span style={styles.label}>Confirm Password</span>}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                }
              })
            ]}
          >
            <Input.Password placeholder="Verify Password" style={styles.placeholderStyle} />
          </Form.Item>

          <Form.Item
            style={ styles.rowSpacing }
            label={<span style={styles.label}>Phone Number</span>}
            name="phoneNum"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              // digits values and amount entered
              { pattern: /^\+?[0-9\-()\s]{7,20}$/, message: 'Please enter a valid phone number' }
            ]}
          >
            <Input placeholder="000-000-0000" style={styles.placeholderStyle} />
          </Form.Item>

          <Form.Item
            style={ styles.rowSpacing }
            label={<span style={styles.label}>Date of Birth</span>}
            name="dateOfBirth"
            rules={[{ required: true, message: 'Please enter your birth date' }]}
          >
            <Input type="date" style={styles.placeholderStyle} />
          </Form.Item>

          <Form.Item
            style={ styles.rowSpacing }
            label={<span style={styles.label}>Country</span>}
            name="country"
            rules={[{ required: true, message: 'Please enter your country' }]}
          >
            <Input placeholder="United States" style={styles.placeholderStyle} />
          </Form.Item>

          <Form.Item
            name="agreedToTerms"
            valuePropName="checked"
            // the rule uses a custom validator to verify the checkbox is checked
            rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject('You must agree to the terms') }]}
          >
            <Checkbox required>
              I agree to the{' '}
              <a onClick={() => setTermsVisible(true)} style={styles.linkColor}>
                Terms of Service
              </a>
            </Checkbox>
            <ModalTerms visible={termsVisible} onClose={() => setTermsVisible(false)} />
            {/* <Checkbox style={styles.checkBoxlabel}>
              I agree to the <Link href="/userLogin">Terms and Conditions</Link>
            </Checkbox> */}
          </Form.Item>


          <Form.Item style={styles.submitContainer}>
            <Button type="primary" htmlType="submit" style={styles.submitButton}>
              Sign Up
            </Button>
          </Form.Item>
          </Form>

        <div style={styles.loginRedirect}>
          Already have an account? <Link href="/userLogin" style={styles.linkColor}>Log In</Link>
        </div>
      </div>
    </div>
  );
}

export default register;

const styles = {
  page: {
    backgroundColor: '#F1F1EB',
    minHeight: '100vh',
    padding: '1.5rem'
  },
  card: {
    maxWidth: 400,
    margin: 'auto',
    padding: '2rem',
    backgroundColor: '#A0B6AA',
    borderRadius: '20px',
  },
  rowSpacing: {
    marginBottom: '0.6px'
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: '#203625',
    color: 'white',
    borderColor: '#203625',
    borderRadius: '9999px'
  },
  header: {
    color: '#1D1E2C',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const
  },
  label: {
    color: '#1D1E2C',
    fontSize: '0.95rem',
    display: 'block',
    alignItems: 'center',
    gap: '0.25rem',  // spacing between input boxes
    marginTop: '0.5rem',  // space below the label and input box
  },
  placeholderStyle: {
    opacity: 0.8,     // Text transparency in input fields
    color: '#1D1E2C'
  },
  checkBoxlabel: {
    color: '#1D1E2C',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',  // spacing between checkbox and label
  },
  submitContainer: {
    textAlign: 'center' as const
  },
  submitButton: {
    marginTop: '8px',
    width: '100%',
    backgroundColor: '#203625',
    color: '#e0e0e0',
    borderRadius: '1rem'
  },
  linkColor: {
    color: '#C9F4DC',
    Weight: '600' as const,
    textDecoration: 'underline' as const,
  },
  loginRedirect: {
    textAlign: 'center' as const
  }
} as const;
