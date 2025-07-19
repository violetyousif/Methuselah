// Mizanur Mizan, 5/27/25, Created the login page frontend layout and input boxes for email and password
// Mizanur Mizan, 5/29/25, Modified login page
// Violet Yousif, 06/01/2025, Reformatted code to simplify project's coding style
// Mohammad Hoque, 06/01/2025, Added "Forgot Password?" link
// Viktor Gjrogjevski, 6/2/2025, stores user data in local storage
// Mohammad Hoque, 06/02/2025, Added dark mode support based on saved user theme
// Violet Yousif, 6/2/2025, Stores user's first name in local storage
// Violet Yousif, 6/8/2025, uses the "user" object from backend/server response to get data 
// Viktor Gjrogjevski, 06/03/2025, Fixed token and data not being removed when logging out
// Violet Yousif, 6/16/2025, Removed walletAddress prop from Login component function parameters.
// Violet Yousif, 6/16/2025, Removed unused localStorage code for user data and changed layout to reflect public design.
// Violet Yousif, 7/5/2025, Changed submit button for Login to smaller size.
// Violet Yousif, 7/5/2025, Added role-based access control to the login page.
// Syed Rabbey, 07/05/2025, 07/07/2025, Added Reset Password link and added Toast notifications for success and error message.


import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, notification} from 'antd';
import Link from 'next/link';
import { ArrowLeftOutlined, VerticalAlignMiddleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { isCypress } from '@/utils/isCypress';


function Login() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [theme, setTheme] = useState<'default' | 'dark'>('default');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<{ email?: string; password?: string }>({});


  // Force light mode for login page since user hasn't logged in yet
  // useEffect(() => {
  //   document.body.dataset.theme = 'default';
  //   setTheme('default');
  // }, []);
  useEffect(() => {
  if (typeof window !== 'undefined' && document?.body && !window.Cypress) {
    document.body.dataset.theme = 'default';
    setTheme('default');
  }
  }, []);


  const onFinish = async (values: any) => {
    setLoading(true); 
    //const isCypress = typeof window !== 'undefined' && window.Cypress;

  // Mock login for Cypress tests
  // if (isCypress()) {
  //   const data = {
  //     user: {
  //       email: values.email,
  //       password: values.password,
  //       firstName: 'Admin',
  //       role: 'admin',
  //     },
  //   };
  //   notification.success({
  //     message: 'Successfully Logged In (Test)',
  //     description: `Welcome, ${data.user.firstName}!`,
  //     placement: 'topRight',
  //     duration: 3,
  //   });
  //   if (data.user.role === 'admin') {
  //     router.push('/admin');
  //   } else {
  //     router.push('/chatBot');
  //   }
  //   setLoading(false);
  //   return; // Exit early to avoid making the real API call
  // }
    
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',     // Include cookies for session management request
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok) {
        notification.success({
          message: 'Successfully Logged In',
          description: `Welcome, ${data.user.firstName || 'User'}!`,
          placement: 'topRight',
          duration: 3
        });

        if (data.user.role === 'admin') {
          // Redirect to admin dashboard
          router.push('/admin');
        }
        else {
          // Redirect to user dashboard or perform user-specific actions
          router.push('/chatBot')
        }
      
        // localStorage.setItem('usersName', data.user.firstName || 'Guest') 
            
        // localStorage.setItem('userData', JSON.stringify(data.user)); 
        // message.success('Login successful');
        // after successful login
        //router.push('/');
      } else {
          const errorMessage = data.message?.toLowerCase().includes('user') || data.message?.toLowerCase().includes('not found')
            ? 'Invalid email and/or password. Please try again or reset your password.'
            : data.message || 'Login failed';

          notification.error({
            message: 'Login Failed',
            description: errorMessage,
            placement: 'topRight',
            duration: 4
          });
      }
    } catch (err) {
      message.error('Server error');
    } finally {
      setLoading(false)
    }
  }

    const handleBack = () => {
    router.back()
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Button 
          onClick={handleBack}
          style={styles.backButton}
        >
          ← Back
        </Button>
        
        <h1 style={styles.header}>Login</h1>
        
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          //autoComplete="off"
          layout="vertical"
        >
          <div style={styles.rowSpacing}>
            <Form.Item
              label={<span style={styles.label}>Email</span>}
              name="email"
              validateStatus={loginError.email ? 'error' : undefined}
              help={loginError.email}
              rules={[
                { required: true, message: 'Please input your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input
                name="email"
                placeholder="Enter your email"
                style={styles.placeholderStyle}
                autoComplete="email"
              />
            </Form.Item>
          </div>

          <div style={styles.rowSpacing}>
            <Form.Item
              label={<span style={styles.label}>Password</span>}
              name="password"
              validateStatus={loginError.password ? 'error' : undefined}
              help={loginError.password}
              rules={[
                { required: true, message: 'Please input your password' },
                { min: 10, message: 'Password must be at least 10 characters.' }
              ]}
            >
              <Input.Password 
                name="password"
                placeholder="Enter your password"
                style={styles.placeholderStyle}
                autoComplete="current-password"
              />
            </Form.Item>
          </div>

          <p className="text-sm text-center mt-2">
            <span className="text-gray-600">Forgot password? </span>
            <Link href="/forgotPassword" className="text-blue-600 font-semibold hover:underline">
              Reset 
            </Link>
          </p>

        
          <div style={styles.submitContainer}>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={styles.submitButton}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form.Item>
          </div>
        </Form>
        <div>
          Don&apos;t have an account? <span data-theme='extPages'><Link href='/register'>Sign Up</Link></span>
        </div>
      </div>
    </div>
  )
}
export default Login;

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
    padding: '6rem 1rem', // Reduced side padding for mobile
    '@media (max-width: 768px)': {
      padding: '2rem 1rem',
    },
    '@media (max-width: 480px)': {
      padding: '1rem 0.5rem',
    }
  },
  card: {
    maxWidth: 400,
    width: '100%', // Make it fully responsive
    margin: '1rem auto',
    padding: '2rem',
    backgroundColor: '#A0B6AA',
    borderRadius: '2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(32,54,37,0.1)',
    paddingBottom: '24px',
    '@media (max-width: 480px)': {
      margin: '0.5rem auto',
      padding: '1.5rem',
      borderRadius: '16px',
    }
  },
  rowSpacing: {
    marginBottom: '0.6px'
  },
  backButton: {
    marginBottom: '24px',
    backgroundColor: '#203625',
    color: '#F1F1EB',
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
    gap: '0.25rem',
    marginTop: '0.5rem',
  },
  placeholderStyle: {
    opacity: 0.8,
    color: '#1D1E2C'
  },
  shortInputContainer: {
    display: 'flex',
    gap: '16px',
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
    gap: '0.5rem',
  },
  submitContainer: {
    textAlign: 'center' as const
  },
  submitButton: {
    marginTop: '8px',
    width: '30%',
    backgroundColor: '#203625',
    color: '#F1F1EB',
    borderRadius: '1rem'
  },
} as const;


// CSS-in-JS styles moved to the bottom
// function getStyles(theme: 'default' | 'dark') {
//   return {
//     page: {
//       backgroundColor: theme === 'dark' ? '#0f0f17' : '#F1F1EB',
//       minHeight: '100vh',
//       padding: '6rem'
//     },
//     card: {
//       maxWidth: 400,
//       margin: 'auto',
//       padding: '2rem',
//       backgroundColor: theme === 'dark' ? '#252525' : '#A0B6AA',
//       borderRadius: '2rem',
//       border: '3px solid',
//       borderColor: theme === 'dark' ? '#4b5563' : '#000000'
//     },
//     backButton: {
//       marginBottom: '24px',
//       backgroundColor: theme === 'dark' ? '#4b5563' : '#203625',
//       color: '#ffffff',
//       borderColor: theme === 'dark' ? '#4b5563' : '#203625',
//       borderRadius: '9999px'
//     },
//     header: {
//       color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
//       textAlign: 'center' as const,
//       fontWeight: 'bold' as const
//     },
//     label: {
//       color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
//     },
//     submitContainer: {
//       textAlign: 'center' as const
//     },
//     submitButton: {
//       marginTop: '8px',
//       width: '100%',
//       backgroundColor: theme === 'dark' ? '#4b5563' : '#203625',
//       borderColor: theme === 'dark' ? '#4b5563' : '#203625',
//       color: '#ffffff',
//       borderRadius: '1rem'
//     },
//     registerRedirect: {
//       textAlign: 'center' as const,
//       color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
//     },
//     forgotLink: {
//       color: theme === 'dark' ? '#F1F1EA' : '#203625',
//       fontWeight: 'bold'
//     }
//   };
// }
