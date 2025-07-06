import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Typography, Card, Spin } from 'antd';
import { UploadOutlined, InboxOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { UploadRequestOption } from 'rc-upload/lib/interface';

const { Dragger } = Upload;
const { Title, Paragraph } = Typography;

function AdminUpload() {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.body.dataset.theme = 'default';
  }, []);


  const customRequest = async ({ file, onSuccess, onError }: UploadRequestOption) => {
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/api/admin/uploadData', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        message.success(`Upload successful: ${data.chunks} chunks processed.`);
        onSuccess?.(data, new XMLHttpRequest());
      } else {
        message.error(data.message || 'Upload failed');
        onError?.(new Error(data.message || 'Upload failed'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = (err instanceof Error && err.message) ? err.message : 'Unknown error';
      message.error('Upload failed: ' + errorMsg);
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
    <div style={styles.page} className="admin-upload-page">
      <div style={styles.card} className="admin-upload-card">
        <Link href="/admin">
          <Button icon={<ArrowLeftOutlined />} style={styles.backButton} className="back-button-mobile">
            Back
          </Button>
        </Link>

        <Title level={3} style={styles.header}>Upload Pretraining Content</Title>
        <Paragraph>Upload a file to ingest into the AI system.</Paragraph>

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
  );
}

export default AdminUpload;

const styles = {
  page: {
    backgroundColor: '#F1F1EB',
    display: 'block',
    position: 'absolute',
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
    maxWidth: 500,
    margin: '1rem auto',
    padding: '2rem',
    backgroundColor: '#A0B6AA',
    borderRadius: '2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(32,54,37,0.1)',
    paddingBottom: '24px',
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
    textAlign: 'center',
    fontWeight: 'bold'
  },
  submitContainer: {
    textAlign: 'center'
  },
  submitButton: {
    marginTop: '16px',
    width: '40%',
    backgroundColor: '#203625',
    color: '#e0e0e0',
    borderRadius: '1rem'
  }
} as const;



// import React, { useState } from 'react';
// import { Upload, Button, message, Typography, Card, Spin } from 'antd';
// import { UploadOutlined, InboxOutlined } from '@ant-design/icons';

// const { Dragger } = Upload;
// const { Title, Paragraph } = Typography;

// const AdminUpload: React.FC = () => {
//   const [uploading, setUploading] = useState(false);

//   const customRequest = async ({ file, onSuccess, onError }: any) => {
//     setUploading(true);

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const response = await fetch('http://localhost:8080/api/admin/uploadData', {
//         method: 'POST',
//         credentials: 'include',
//         body: formData
//       });

//       const data = await response.json();

//       if (response.ok) {
//         message.success(`Upload successful: ${data.chunks} chunks processed.`);
//         onSuccess?.(data, new XMLHttpRequest());
//       } else {
//         message.error(data.message || 'Upload failed');
//         onError?.(new Error(data.message || 'Upload failed'));
//       }
//     } catch (err: any) {
//       console.error('Upload error:', err);
//       message.error('Upload failed: ' + err.message);
//       onError?.(err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div style={{ padding: '2rem max(2rem, 10%)' }}>
//       <Card style={{ background: '#fafafa', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
//         <Title level={3}>Upload Pretraining Content</Title>
//         <Paragraph>
//           Upload PDF, CSV, text, Excel, JSON, or image files for ingestion into the AI system.
//         </Paragraph>

//         <Dragger
//           name="file"
//           multiple={false}
//           accept=".pdf,.txt,.json,.csv,.xls,.xlsx,.png,.jpg,.jpeg"
//           customRequest={customRequest}
//           disabled={uploading}
//         >
//           <p className="ant-upload-drag-icon">
//             <InboxOutlined />
//           </p>
//           <p className="ant-upload-text">Click or drag file to upload</p>
//           <p className="ant-upload-hint">
//             Supports PDF, TXT, JSON, CSV, XLS(X), JPG, PNG.
//           </p>
//         </Dragger>

//         <div style={{ marginTop: '1rem', textAlign: 'right' }}>
//           <Button
//             type="primary"
//             icon={<UploadOutlined />}
//             loading={uploading}
//             disabled={uploading}
//             onClick={() => message.info('Use the drag area above to upload')}
//           >
//             {uploading ? 'Uploading...' : 'Submit File'}
//           </Button>
//         </div>

//         {uploading && <Spin style={{ marginTop: '1rem' }} />}
//       </Card>
//     </div>
//   );
// };

// export default AdminUpload;
