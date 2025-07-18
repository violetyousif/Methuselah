// Violet Yousif, 07/06/25, Created Admin upload page for uploading pretraining content
// Violet Yousif, 07/07/25, Edited to include URL upload functionality
// Violet Yousif, 07/10/25, Edited to connect with sidebar navigation and authentication checks


import React, { useState, useEffect } from 'react';
import { Upload, Input, Button, message, notification, Typography, Spin, Layout } from 'antd';
const { Content } = Layout;
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import AdminLayout from '../../components/AdminLayout'; 

const { Dragger } = Upload;
const { Title, Paragraph } = Typography;


function AdminUpload() {
  const [uploading, setUploading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [urlInput, setUrlInput] = useState('');
  const router = useRouter();

  // useEffect(() => {
  // async function checkLogin() {
  //   try {
  //     const res = await fetch('http://localhost:8080/api/checkAuth', {
  //       credentials: 'include',
  //     });
  //     if (!res.ok) throw new Error('Not authenticated');
  //     const data = await res.json();
  //     setUserData(data.user);
  //     setIsLoggedIn(true);
  //   } catch (err) {
  //     setIsLoggedIn(false);
  //     router.push('/login'); // or redirect elsewhere
  //   }
  // }
  //   checkLogin();
  // }, []);


  useEffect(() => {
  const checkLoginStatus = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/checkAuth', {
        method: 'GET',
        credentials: 'include',        
      });
      if (res.ok) {
        const result = await res.json();
        setIsLoggedIn(true);
        setUserData(result.user);   // will set user data if available/logged in
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  };

  checkLoginStatus();
}, []);

  useEffect(() => {
    document.body.dataset.theme = 'default';
  }, []);

  const customRequest = async ({ file, onSuccess, onError }: UploadRequestOption) => {
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8080/api/admin/uploadData', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (res.status === 401) {
        notification.error({ message: 'Unauthorized: Admin login required.' });
        router.push('/login'); // Optional: redirect to login
        return;
      }
      if (res.ok) {
        //message.success(`Upload successful: ${data.chunks} chunks processed.`);
        notification.success({
          message: 'Upload Successful',
          description: `File uploaded successfully. ${data.chunks} chunks processed.`,
        });
        onSuccess?.(data, new XMLHttpRequest());
      } else {
        notification.error({ message: data.notification || 'Upload failed' });
        onError?.(new Error(data.notification || 'Upload failed'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = (err instanceof Error && err.message) ? err.message : 'Unknown error';
      notification.error({ message: 'Upload failed: ' + errorMsg });
      if (err instanceof Error) {
        onError?.(err);
      } else {
        onError?.(new Error(errorMsg));
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.card}>
          <Title level={3} style={styles.header}>
            Upload Pretraining Content
          </Title>
          <Paragraph style={{ textAlign: 'center', color: '#1D1E2C' }}>
            Upload a file <strong>or</strong> enter a URL to ingest into the AI system.
          </Paragraph>
          
          <Input.Search
            style={{ marginTop: '1rem', marginBottom: '2rem'}}
            placeholder="https://example.com/article"
            enterButton={
              <Button 
                type="primary" 
                style={{ 
                  backgroundColor: '#203625', 
                  borderColor: '#203625',
                  color: '#e0e0e0'
                }}
              >
                Submit URL
              </Button>
            }
            size="middle"
            value={urlInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrlInput(e.target.value)}
            onSearch={async (value: string) => {
              if (!value || !value.startsWith('http')) {
                return notification.warning({ message: 'Please enter a valid URL.' });
              }

              setUploading(true);
              try {
                const res = await fetch('http://localhost:8080/api/admin/uploadURL', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ url: value }),
                });

                const data = await res.json();
                if (!res.ok) {
                  notification.error({ message: 'Failed to process URL', description: data.message });
                  return;
                }

                notification.success({
                  message: 'URL Uploaded',
                  description: `${data.chunks} chunks extracted from: ${data.source}`
                });
                setUrlInput('');
              } catch (err) {
                console.error('URL upload failed:', err);
                notification.error({ 
                  message: 'Upload failed', 
                  description: err instanceof Error ? err.message : 'Unknown error' 
                });
              } finally {
                setUploading(false);
              }
            }}
          />

          <Dragger
            name="file"
            multiple={false}
            accept=".pdf,.txt,.json,.csv,.xls,.xlsx,.png,.jpg,.jpeg"
            customRequest={customRequest}
            disabled={uploading}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">Supports PDF, TXT, JSON, CSV, XLS(X), JPG, PNG.</p>
          </Dragger>

          <div style={styles.submitContainer}>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={uploading}
              disabled={uploading}
              onClick={() => message.info('Use the drag area above to upload')}
              style={styles.submitButton}
            >
              {uploading ? 'Uploading...' : 'Submit File'}
            </Button>
          </div>

          {uploading && <Spin style={{ marginTop: '1rem' }} />}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminUpload;

const styles = {
  page: {
    backgroundColor: '#F1F1EB',
    minHeight: '100vh',
    padding: '2rem',
  },
  card: {
    maxWidth: 500,
    margin: '1rem auto',
    padding: '2rem',
    backgroundColor: '#A0B6AA',
    borderRadius: '2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(32,54,37,0.1)',
    paddingBottom: '24px',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#1D1E2C',
    padding: 0,
    boxShadow: 'none',
    textAlign: 'left' as const,
    cursor: 'pointer',
    fontSize: 16,
    textDecoration: 'none',
    borderRadius: '2rem',
  },
  header: {
    color: '#1D1E2C',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  submitContainer: {
    textAlign: 'center',
  },
  submitButton: {
    marginTop: '16px',
    width: '40%',
    backgroundColor: '#203625',
    color: '#e0e0e0',
    borderRadius: '1rem',
  },
} as const;
