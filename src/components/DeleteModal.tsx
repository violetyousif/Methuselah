// components/DeleteModal.tsx
// Mohammad Hoque, 7/3/2025, Created custom delete confirmation modal to replace Modal.confirm for React 19 compatibility

import { Modal, Button } from 'antd';
import { useEffect, useState } from 'react';

interface DeleteModalProps {
  open: boolean; // Changed from 'visible' to 'open' for newer AntD versions
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

const DeleteModal = ({ 
  open, 
  onConfirm, 
  onCancel, 
  title, 
  message, 
  loading = false 
}: DeleteModalProps) => {
  const [theme, setTheme] = useState<'default' | 'dark'>('default');

  // Detect current theme
  useEffect(() => {
    const currentTheme = document.body.dataset.theme as 'default' | 'dark' || 'default';
    setTheme(currentTheme);
  }, [open]); // Re-check theme when modal opens

  const modalStyle = {
    ...(theme === 'dark' && {
      backgroundColor: 'rgba(39, 41, 61, 0.95)',
      color: '#F1F1EA'
    })
  };

  return (
    <>
      <Modal
        title={title}
        open={open}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            danger 
            onClick={onConfirm}
            loading={loading}
          >
            Delete
          </Button>,
        ]}
        closable={!loading}
        maskClosable={!loading}
        styles={{
          content: modalStyle
        }}
      >
        <p style={{ color: theme === 'dark' ? '#F1F1EA' : 'inherit' }}>
          {message}
        </p>
      </Modal>

      {/* Global dark mode styles for this modal */}
      <style jsx global>{`
        body[data-theme='dark'] .ant-modal-content {
          background-color: rgba(39, 41, 61, 0.95) !important;
          color: #F1F1EA !important;
          border-radius: 12px !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(49, 129, 130, 0.2) !important;
        }
        body[data-theme='dark'] .ant-modal-header {
          background-color: transparent !important;
          border-color: rgba(49, 129, 130, 0.2) !important;
          border-radius: 12px 12px 0 0 !important;
        }
        body[data-theme='dark'] .ant-modal-title {
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-modal-close {
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-modal-close:hover {
          background-color: rgba(49, 129, 130, 0.2) !important;
        }
        body[data-theme='dark'] .ant-modal-footer {
          background-color: transparent !important;
          border-color: rgba(49, 129, 130, 0.2) !important;
        }
        body[data-theme='dark'] .ant-btn:not(.ant-btn-primary) {
          background-color: transparent !important;
          border-color: rgba(49, 129, 130, 0.3) !important;
          color: #F1F1EA !important;
        }
        body[data-theme='dark'] .ant-btn:not(.ant-btn-primary):hover {
          background-color: rgba(49, 129, 130, 0.2) !important;
          border-color: rgba(49, 129, 130, 0.5) !important;
        }
      `}</style>
    </>
  );
};

export default DeleteModal;
