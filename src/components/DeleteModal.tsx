// components/DeleteModal.tsx
// Mohammad Hoque, 7/3/2025, Created custom delete confirmation modal to replace Modal.confirm for React 19 compatibility

import { Modal, Button } from 'antd';

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
}: DeleteModalProps) => (
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
  >
    <p>{message}</p>
  </Modal>
);

export default DeleteModal;
