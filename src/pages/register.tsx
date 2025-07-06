// Mizanur Mizan, 5/26/25 (modified 5/29/25), Created the register page frontend layout and input boxes for name, email, and password
// Violet Yousif, 06/01/2025, Reformatted the code to simplify project's coding style.
// Violet Yousif, 06/01/2025, Edited function to fetch backend data, include error handling
// Mohammad Hoque, 06/02/2025, Added dynamic dark mode theme support and enhanced phone formatting + form validation
// Viktor Gjorgjevski, 06/03/2025, Added user profile pic option when registering right under gender. Added it to onFinish function to be sent to database as well
// Violet Yousif, 6/16/2025, Removed walletAddress prop from RegisterProps interface and component function parameters. Removed phone number and gender from design.
// Violet Yousif, 7/5/2025, Fixed hyperlink styles for Terms of Service and Login links to match design and each other.

import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Checkbox, Select } from 'antd'
import Link from 'next/link'
import { ArrowLeftOutlined } from '@ant-design/icons'
import ModalTerms from '../components/TermsModal'
import { useRouter } from 'next/router'
//import { profilePicPresets } from '../components/profilePicker'; //imports users choice on profile image


// Format US-style phone number
// function formatPhoneNumber(value: string) {  
//   const digits = value.replace(/\D/g, '')   // Remove all non-digit characters
//   // Format: 000-000-0000
//   if (digits.length === 10) {
//     return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6,10)}`;
//   }
//   return value; // Return as is if not 10 digits
// }


  // Edited function to fetch backend data with error handling 
  // (make names lowercase, edited pw check, errorMsg, etc.) and to validate user doesn't already exist.
function register() {
  const [form] = Form.useForm();
  const [termsVisible, setTermsVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  // Force light mode for register page since user hasn't logged in yet
  useEffect(() => {
    document.body.dataset.theme = 'default';
  }, []);

  const onFinish = async (values: any) => {
    try {
      // connect to backend API to register user
      const res = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values)
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.message || 'Registration failed')
      console.log('Registered successfully: ', result);
      router.push('/login') // Redirects to login page if registration is successful
    } catch (error) {
      if (!errorMsg) setErrorMsg('Registration failed. Please try again.');
      console.error('ERROR - Registration failed: ', error);
    }
  };


  return (
    <div style={styles.page} className="register-page">
      <div style={styles.card} className="register-card mobile-card-shadow">
        {/* Back to login */}
        <Link href="/login">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton} className="back-button-mobile">
            Back
          </Button>
        </Link>

        <h2 style={styles.header} className="register-header">Create an Account</h2>

        <Form form={form} name="register" layout="vertical" onFinish={onFinish}>

          { /* First Name */ }
          <Form.Item
            style={ styles.rowSpacing }
            label={<span style={ styles.label }>Name</span>}
            name="firstName"
            rules={[
              { required: true, message: 'Please enter your first name' },
              { pattern: /^[A-Za-z\s'-]+$/, message: "Only letters, dashes, spaces, and apostrophes are allowed" }
            ]}
          >
            <Input placeholder="Jane" style={styles.placeholderStyle} />
          </Form.Item>

          {/* Valid Email */}
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

          {/* Set password input to require at least 10 characters, 1 number, 1 special char, 1 uppercase, 1 lowercase */}
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

          { /* Confirm Password */}
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


          {/* <div style={styles.shortInputContainer}> */}
          { /* Date of Birth */}
          <Form.Item
            style={styles.rowSpacing}
            label={<span style={styles.label}>Date of Birth</span>}
            name="dateOfBirth"
            rules={[
              { required: true, message: 'Please enter your birth date' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const today = new Date();
                  const selected = new Date(value);
                  // Remove time portion for accurate comparison
                  today.setHours(0, 0, 0, 0);
                  selected.setHours(0, 0, 0, 0);

                  if (selected > today) {
                    return Promise.reject('Birth date cannot be in the future');
                  }

                  // Calculate age
                  let age = today.getFullYear() - selected.getFullYear();
                  const m = today.getMonth() - selected.getMonth();
                  if (m < 0 || (m === 0 && today.getDate() < selected.getDate())) {
                    age--;
                  }
                  if (age < 18) {
                    return Promise.reject('You must be 18 or older to register.');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              type="date"
              style={styles.placeholderStyle}
              max={new Date().toISOString().split('T')[0]}
            />
          </Form.Item>

          { /* Terms and Conditions Agreement */}
          <Form.Item
            name="agreedToTerms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject('You must agree to the Terms of Service to proceed.'),
              },
            ]}
          >
            <Checkbox>
              I agree to the{' '}
              <span onClick={() => setTermsVisible(true)}>
                <span data-theme='extPages'>Terms of Service</span>
              </span>
            </Checkbox>
          </Form.Item>
          <ModalTerms visible={termsVisible} onClose={() => setTermsVisible(false)} />

          { /* Submit Button */}
          <Form.Item style={styles.submitContainer}>
            <Button type="primary" htmlType="submit" style={styles.submitButton} className="register-submit-button">
              Sign Up
            </Button>
          </Form.Item>
          </Form>

        { /* Redirect to Login Page */}
        <div>
          Already have an account? <span data-theme='extPages'><Link href="/login">Login</Link></span>
        </div>
      </div>
    </div>
  );
}

export default register;

const styles = {
  page: {
    backgroundColor: '#F1F1EB', // Changed from dark '#1D1E2C' to light for consistency
    display: 'block',
    position: 'absolute' as const,
    minHeight: '100vh',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '2rem',
  },
  card: {
    maxWidth: 400,
    margin: '1rem auto',
    padding: '2rem',
    backgroundColor: '#A0B6AA',
    borderRadius: '2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(32,54,37,0.1)',
    paddingBottom: '24px',
  },
  rowSpacing: {
    marginBottom: '0.6px'
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: '#203625',
    color: 'white',
    border: 'none',
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
  shortInputContainer: {
    display: 'flex',
    gap: '16px', // space between fields
  },
  halfWidth: {
    flex: 1.7,
    minWidth: 0,
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
    width: '40%',
    backgroundColor: '#203625',
    color: '#e0e0e0',
    borderRadius: '1rem'
  },
} as const;
