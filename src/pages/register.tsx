// Mizanur Mizan, 5/26/25 (modified 5/29/25), Created the register page frontend layout and input boxes for name, email, and password
// Violet Yousif, 06/01/2025, Reformatted the code to simplify project's coding style.
// Violet Yousif, 06/01/2025, Edited function to fetch backend data, include error handling
// Mohammad Hoque, 06/02/2025, Added dynamic dark mode theme support and enhanced phone formatting + form validation
// Viktor Gjorgjevski, 06/03/2025, Added user profile pic option when registering right under gender. Added it to onFinish function to be sent to database as well

import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Checkbox, Select } from 'antd'
import Link from 'next/link'
import { ArrowLeftOutlined } from '@ant-design/icons'
import ModalTerms from '../components/TermsModal'
import { useRouter } from 'next/router'
//import { profilePicPresets } from '../components/profilePicker'; //imports users choice on profile image


// Dark mode theme state
// function getThemeFromBody(): 'default' | 'dark' {
//   return (document?.body?.dataset?.theme as 'default' | 'dark') || 'default'
// }

// Format US-style phone number
function formatPhoneNumber(value: string) {  
  const digits = value.replace(/\D/g, '')   // Remove all non-digit characters
  // Format: 000-000-0000
  if (digits.length === 10) {
    return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6,10)}`;
  }
  return value; // Return as is if not 10 digits
}


  // Edited function to fetch backend data with error handling 
  // (make names lowercase, edited pw check, errorMsg, etc.) and to validate user doesn't already exist.
function register() {
  const [form] = Form.useForm();
  const [termsVisible, setTermsVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [theme, setTheme] = useState<'default' | 'dark'>('default')
  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      const payload = {
        firstName: values.firstName.toLowerCase(),
        lastName: values.lastName.toLowerCase(),
        email: values.email.toLowerCase(),
        phoneNum: values.phoneNum,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender
        //profilePic: values.profilePic || '/avatars/avatar1.png'
      }
      
      // connect to backend API to register user
      const res = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // Edited by: Violet Yousif
  // Date: 06/01/2025Add commentMore actions
  // Description: Edited function to fetch backend data, include
  // error handling and run validation in the register form submission.
  // const onFinish = async (values: any) => {
  // try {
  //   const res = await fetch('/api/register', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(values)
  //   });

  //   const result = await res.json();

  //   if (!res.ok) throw new Error(result.message);
  //   console.log('register successful: ', result);
  //   } catch (error) {
  //     console.error('ERROR: register failed: ', error);
  //   }
  // };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Back to login */}
        <Link href="/login">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton}>
            Back
          </Button>
        </Link>

        <h2 style={styles.header}>Create an Account</h2>

        <Form form={form} name="register" layout="vertical" onFinish={onFinish}>

          { /* First Name */ }
          <Form.Item
            style={ styles.rowSpacing }
            label={<span style={ styles.label }>First Name</span>}
            name="firstName"
            rules={[
              { required: true, message: 'Please enter your first name' },
              { pattern: /^[A-Za-z\s'-]+$/, message: "Only letters, dashes, spaces, and apostrophes are allowed" }
            ]}
          >
            <Input placeholder="Jane" style={styles.placeholderStyle} />
          </Form.Item>

          { /* Last Name */ }
          <Form.Item
            style={ styles.rowSpacing }
            label={<span style={styles.label}>Last Name</span>}
            name="lastName"
            rules={[
              { required: true, message: 'Please enter your last name' },
              { pattern: /^[A-Za-z\s'-]+$/, message: "Only letters, dashes, spaces, and apostrophes are allowed" }
            ]}
          >
            <Input placeholder="Doe" style={styles.placeholderStyle} />
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

          {/* Phone Number */}
          <Form.Item
            style={ styles.rowSpacing }
            label={<span style={styles.label}>Phone Number</span>}
            name="phoneNum"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              {
                validator: (_, value) => {
                  const digits = value ? value.replace(/\D/g, '') : '';
                  if (digits.length === 10) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Phone number must be exactly 10 digits');
                  }
                }
            ]}
          >
            {/* Input field for phone number with formatting */}
            <Input
              placeholder="000-000-0000"
              style={styles.placeholderStyle}
              onBlur={e => {
                const formatted = formatPhoneNumber(e.target.value);
                form.setFieldsValue({ phoneNum: formatted });
              }}
              onChange={e => {
                // Only allow up to 10 digits
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                let formatted = digits;
                if (digits.length === 10) {
                  formatted = formatPhoneNumber(digits);
                }
                form.setFieldsValue({ phoneNum: formatted });
              }}
            />
          </Form.Item>

          <div style={styles.shortInputContainer}>
          { /* Date of Birth */}
          <Form.Item
            style={{ ...styles.rowSpacing, ...styles.halfWidth }} // half width for date of birth
            label={<span style={styles.label}>Date of Birth</span>}
            name="dateOfBirth"
            rules={[{ required: true, message: 'Please enter your birth date' }]}
          >
            <Input type="date" style={styles.placeholderStyle} />
          </Form.Item>

          { /* Gender */}
          <Form.Item
            style={{ ...styles.rowSpacing, ...styles.halfWidth }} // half width for gender
            label={<span style={styles.label}>Gender</span>}
            name="gender"
            rules={[{ required: true, message: 'Select Gender' }]}
          >
            <Select placeholder="Select Gender" style={styles.placeholderStyle}>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="other">Other</Select.Option>
              <Select.Option value="prefer_not_to_say">Prefer not to say</Select.Option>
            </Select>
          </Form.Item>
          </div>
          
          { /* Profile Picker */}
            {/* <Form.Item label={<span style={styles.label}>Choose Your profile picture</span>} name="profilePic">
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {profilePicPresets.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={'Profile ${idx + 1}'}
                    onClick={() =>  form.setFieldsValue({avatar: url})}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      border: form.getFieldValue('profilePic') === url ? '3px solid #318182' : '2px solid transparent',
                      cursor: 'pointer'
                    }}
                    />
                ))}
              </div>
            </Form.Item> */}
          { /* Terms and Conditions Agreement */}
          <Form.Item
            name="agreedToTerms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject('You must agree to the terms'),
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
            <Button type="primary" htmlType="submit" style={styles.submitButton}>
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
    backgroundColor: '#1D1E2C',
    displauy: 'block',
    position: 'absolute' as const,
    minHeight: '100vh',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
  },
  card: {
    maxWidth: 400,
    margin: '1rem auto',
    padding: '2rem',
    backgroundColor: '#F1F1EB',
    borderRadius: '20px',
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
    width: '100%',
    backgroundColor: '#203625',
    color: '#e0e0e0',
    borderRadius: '1rem'
  },
} as const;











// import React, { useState, useEffect } from 'react'
// import { Form, Input, Button, Checkbox, Select } from 'antd'
// import Link from 'next/link'
// import { ArrowLeftOutlined } from '@ant-design/icons'
// import ModalTerms from '../components/TermsModal'
// import { useRouter } from 'next/router'

// // Dark mode theme state
// const getThemeFromBody = (): 'default' | 'dark' =>
//   (document?.body?.dataset?.theme as 'default' | 'dark') || 'default'

// // Format US-style phone number
// function formatPhoneNumber(value: string) {  
//   const digits = value.replace(/\D/g, '')   // Remove all non-digit characters
//   // Format: 000-000-0000
//   if (digits.length === 10) 
//     return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
//   return value
// }

// function Register() {
//   const [form] = Form.useForm()
//   const [termsVisible, setTermsVisible] = useState(false)
//   const [errorMsg, setErrorMsg] = useState('')
//   const [theme, setTheme] = useState<'default' | 'dark'>('default')
//   const router = useRouter()

//   // Load current theme from <body data-theme>
//   useEffect(() => {
//     const currentTheme = getThemeFromBody()
//     setTheme(currentTheme)
//   }, [])

//   // Form submit handler – sends data to backend
//   const onFinish = async (values: any) => {
//     try {
//       const payload = {
//         firstName: values.firstName.toLowerCase(),
//         lastName: values.lastName.toLowerCase(),
//         email: values.email.toLowerCase(),
//         phoneNum: values.phoneNum,
//         dateOfBirth: values.dateOfBirth,
//         gender: values.gender
//       }
      
//       // connect to backend API to register user
//       const res = await fetch('http://localhost:8080/api/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       })

//       const result = await res.json()
//       if (!res.ok) throw new Error(result.message || 'Registration failed')

//       router.push('/login') // Redirects to login page if registration is successful
//     } catch (error) {
//       if (!errorMsg) setErrorMsg('Registration failed. Please try again.')
//       console.error('ERROR - Registration failed: ', error)
//     }
//   }

//   // Dynamic styles based on dark/light theme
//   const styles = {
//     page: {
//       backgroundColor: theme === 'dark' ? '#0f0f17' : '#F1F1EB',
//       minHeight: '100vh',
//       padding: '1.5rem'
//     },
//     card: {
//       maxWidth: 400,
//       margin: 'auto',
//       padding: '2rem',
//       backgroundColor: theme === 'dark' ? '#252525' : '#A0B6AA',
//       borderRadius: '20px',
//       border: '3px solid',
//       borderColor: theme === 'dark' ? '#4b5563' : '#000000'
//     },
//     backButton: {
//       marginBottom: '24px',
//       backgroundColor: theme === 'dark' ? '#4b5563' : '#203625',
//       color: 'white',
//       borderColor: theme === 'dark' ? '#4b5563' : '#203625',
//       borderRadius: '9999px'
//     },
//     header: {
//       color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
//       textAlign: 'center' as const,
//       fontWeight: 'bold' as const
//     },
//     label: {
//       color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
//       fontSize: '0.95rem',
//       marginTop: '0.5rem'
//     },
//     placeholderStyle: {
//       backgroundColor: theme === 'dark' ? '#2f2f2f' : '#ffffff',
//       color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C',
//       borderColor: theme === 'dark' ? '#4b5563' : undefined,
//       opacity: 0.9
//     },
//     submitButton: {
//       marginTop: '8px',
//       width: '100%',
//       backgroundColor: theme === 'dark' ? '#4b5563' : '#203625',
//       color: '#ffffff',
//       borderRadius: '1rem'
//     },
//     loginRedirect: {
//       textAlign: 'center' as const,
//       color: theme === 'dark' ? '#F1F1EA' : '#1D1E2C'
//     },
//     linkColor: {
//       color: '#C9F4DC',
//       fontWeight: '600',
//       textDecoration: 'underline'
//     },
//     shortInputContainer: {
//       display: 'flex',
//       gap: '16px'
//     },
//     halfWidth: {
//       flex: 1.7,
//       minWidth: 0
//     },
//     submitContainer: {
//       marginTop: '16px'
//     }
//   }

//   return (
//     <div style={styles.page}>
//       <div style={styles.card}>
//         {/* Back to homepage */}
//         <Link href="/">
//           <Button icon={<ArrowLeftOutlined />} style={styles.backButton}>
//             Back
//           </Button>
//         </Link>

//         <h2 style={styles.header}>Create an Account</h2>

//         <Form form={form} name="register" layout="vertical" onFinish={onFinish}>
//           {/* First Name */}
//           <Form.Item label={<span style={styles.label}>First Name</span>} name="firstName" rules={[
//             { required: true, message: 'Please enter your first name' },
//             { pattern: /^[A-Za-z\s'-]+$/, message: "Only letters, dashes, spaces, and apostrophes allowed" }
//           ]}>
//             <Input placeholder="Jane" style={styles.placeholderStyle} />
//           </Form.Item>

//           { /* Last Name */ }
//           <Form.Item label={<span style={styles.label}>Last Name</span>} name="lastName" rules={[
//             { required: true, message: 'Please enter your last name' },
//             { pattern: /^[A-Za-z\s'-]+$/, message: "Only letters, dashes, spaces, and apostrophes allowed" }
//           ]}>
//             <Input placeholder="Doe" style={styles.placeholderStyle} />
//           </Form.Item>

//           {/* Valid Email */}
//           <Form.Item label={<span style={styles.label}>Email</span>} name="email" rules={[
//             { required: true, message: 'Please enter your email' },
//             { type: 'email', message: 'Enter a valid email' }
//           ]}>
//             <Input placeholder="janedoe@example.com" style={styles.placeholderStyle} />
//           </Form.Item>

//           {/* Set password input to require at least 10 characters, 1 number, 1 special char, 1 uppercase, 1 lowercase */}
//           <Form.Item label={<span style={styles.label}>Password</span>} name="password" rules={[
//             { required: true, message: 'Please enter a secure password' },
//             { min: 10, message: 'Minimum 10 characters' },
//             { pattern: /.*\d.*/, message: 'Must include number' },
//             { pattern: /.*[A-Z].*/, message: 'Must include uppercase letter' },
//             { pattern: /.*[a-z].*/, message: 'Must include lowercase letter' },
//             { pattern: /.*[!@#$%*].*/, message: 'Must include special char (!,@,#,$,%,*)' }
//           ]}>
//             <Input.Password placeholder="Minimum 10 characters" style={styles.placeholderStyle} />
//           </Form.Item>

//           { /* Confirm Password */}
//           <Form.Item label={<span style={styles.label}>Confirm Password</span>} name="confirmPassword" dependencies={['password']} rules={[
//             { required: true, message: 'Please confirm your password' },
//             ({ getFieldValue }) => ({
//               validator(_, value) {
//                 return !value || getFieldValue('password') === value
//                   ? Promise.resolve()
//                   : Promise.reject('Passwords do not match')
//               }
//             })
//           ]}>
//             <Input.Password placeholder="Verify Password" style={styles.placeholderStyle} />
//           </Form.Item>

//           {/* Phone Number */}
//           <Form.Item label={<span style={styles.label}>Phone Number</span>} name="phoneNum" rules={[
//             { required: true, message: 'Enter phone number' },
//             {
//               validator: (_, value) => {
//                 const digits = value ? value.replace(/\D/g, '') : ''
//                 return digits.length === 10
//                   ? Promise.resolve()
//                   : Promise.reject('Phone must be exactly 10 digits')
//               }
//             }
//           ]}>
//             {/* Input field for phone number with formatting */}
//             <Input
//               placeholder="000-000-0000"
//               style={styles.placeholderStyle}
//               onBlur={(e) => form.setFieldsValue({ phoneNum: formatPhoneNumber(e.target.value) })}
//               onChange={(e) => {
//                 // Only allow up to 10 digits
//                 const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
//                 form.setFieldsValue({ phoneNum: formatPhoneNumber(digits) })
//               }}
//             />
//           </Form.Item>

//           <div style={styles.shortInputContainer}>
//             { /* Date of Birth */}
//             <Form.Item label={<span style={styles.label}>Date of Birth</span>} name="dateOfBirth" style={styles.halfWidth} rules={[
//               { required: true, message: 'Enter your birth date' }
//             ]}>
//               <Input type="date" style={styles.placeholderStyle} />
//             </Form.Item>
            
//             { /* Gender */}
//             <Form.Item label={<span style={styles.label}>Gender</span>} name="gender" style={styles.halfWidth} rules={[
//               { required: true, message: 'Select Gender' }
//             ]}>
//               <Select placeholder="Select Gender" style={styles.placeholderStyle}>
//                 <Select.Option value="female">Female</Select.Option>
//                 <Select.Option value="male">Male</Select.Option>
//                 <Select.Option value="other">Other</Select.Option>
//                 <Select.Option value="prefer_not_to_say">Prefer not to say</Select.Option>
//               </Select>
//             </Form.Item>
//           </div>

//           { /* Terms and Conditions Agreement */}
//           <Form.Item name="agreedToTerms" valuePropName="checked" rules={[
//             {
//               validator: (_, value) =>
//                 value ? Promise.resolve() : Promise.reject('You must agree to the terms')
//             }
//           ]}>
//             <Checkbox>
//               I agree to the{' '}
//               <span onClick={() => setTermsVisible(true)}>
//                 <span data-theme='extPages'>Terms of Service</span>
//               </span>
//             </Checkbox>
//           </Form.Item>

//           <ModalTerms visible={termsVisible} onClose={() => setTermsVisible(false)} />

//           { /* Submit Button */}
//           <Form.Item style={styles.submitContainer}>
//             <Button type="primary" htmlType="submit" style={styles.submitButton}>
//               Sign Up
//             </Button>
//           </Form.Item>
//         </Form>

//         { /* Redirect to Login Page */}
//         <div>
//           Already have an account? <span data-theme='extPages'><Link href="/login">Login</Link></span>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Register;

// const styles = {
//   page: {
//     backgroundColor: '#1D1E2C',
//     displauy: 'block',
//     position: 'absolute' as const,
//     minHeight: '100vh',
//     left: 0,
//     top: 0,
//     right: 0,
//     bottom: 0,
//     height: '100%',
//     width: '100%',
//   },
//   card: {
//     maxWidth: 400,
//     margin: '1rem auto',
//     padding: '2rem',
//     backgroundColor: '#F1F1EB',
//     borderRadius: '20px',
//     paddingBottom: '24px',
//   },
//   rowSpacing: {
//     marginBottom: '0.6px'
//   },
//   backButton: {
//     marginBottom: '24px',
//     backgroundColor: '#203625',
//     color: 'white',
//     border: 'none',
//     borderRadius: '9999px'
//   },
//   header: {
//     color: '#1D1E2C',
//     textAlign: 'center' as const,
//     fontWeight: 'bold' as const
//   },
//   label: {
//     color: '#1D1E2C',
//     fontSize: '0.95rem',
//     display: 'block',
//     alignItems: 'center',
//     gap: '0.25rem',  // spacing between input boxes
//     marginTop: '0.5rem',  // space below the label and input box
//   },
//   placeholderStyle: {
//     opacity: 0.8,     // Text transparency in input fields
//     color: '#1D1E2C'
//   },
//   shortInputContainer: {
//     display: 'flex',
//     gap: '16px', // space between fields
//   },
//   halfWidth: {
//     flex: 1.7,
//     minWidth: 0,
//   },
//   checkBoxlabel: {
//     color: '#1D1E2C',
//     fontSize: '0.95rem',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.5rem',  // spacing between checkbox and label
//   },
//   submitContainer: {
//     textAlign: 'center' as const
//   },
//   submitButton: {
//     marginTop: '8px',
//     width: '100%',
//     backgroundColor: '#203625',
//     color: '#e0e0e0',
//     borderRadius: '1rem'
//   },
// } as const;
