import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, message, Popconfirm, Typography } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import AdminLayout from '../../components/AdminLayout';

const { Title } = Typography;

interface Chunk {
  _id: string;
  content: string;
  source: string;
  topic?: string;
}

function ManageChunks() {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingChunk, setEditingChunk] = useState<Chunk | null>(null);
  const [editValues, setEditValues] = useState({ content: '', source: '', topic: '' });
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const fetchChunks = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/chunks', { credentials: 'include' });
      const data = await res.json();
      setChunks(data);
    } catch (err) {
      console.error('Failed to load chunks:', err);
    }
  };

  useEffect(() => {
    fetchChunks();
  }, []);

  const handleDelete = async () => {
    if (!selectedRowKeys.length) return;
    try {
      const res = await fetch('http://localhost:8080/api/admin/chunks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: selectedRowKeys }),
      });
      const result = await res.json();
      message.success(`Deleted ${result.deletedCount} entries`);
      setSelectedRowKeys([]);
      fetchChunks();
    } catch (err) {
      message.error('Delete failed.');
    }
  };

  const handleEditSave = async () => {
    if (!editingChunk) return;
    try {
      const res = await fetch(`http://localhost:8080/api/admin/chunks/${editingChunk._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editValues),
      });
      const updated = await res.json();
      message.success('Chunk updated');
      setChunks((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setEditingChunk(null);
    } catch (err) {
      message.error('Update failed.');
    }
  };

  const columns = [
    {
      title: 'Idx',
      // create a counter column
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Topic',
      dataIndex: 'topic',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      render: (text: string) => <span style={{ whiteSpace: 'pre-wrap' }}>{text.slice(0, 100)}...</span>,
    },
    {
      title: 'Source',
      dataIndex: 'source',
      render: (text: string) => <span style={{ wordBreak: 'break-all' }}>{text}</span>,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      render: (text: string) => <span>{new Date(text).toLocaleString()}</span>,
    },
    {
      title: 'Actions',
      render: (_: any, record: Chunk) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            setEditingChunk(record);
            setEditValues({
              topic: record.topic || '',
              content: record.content,
              source: record.source,
            });
          }}
        />
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.card}>
          <Title level={3} style={styles.header}>
            Manage Pretraining Chunks
          </Title>

          <Table
            rowKey="_id"
            //dataSource={chunks}
            dataSource={Array.isArray(chunks) ? chunks : []}
            columns={columns}
            rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
            pagination={{
                onShowSizeChange: (current: number, size: number) => setPageSize(size),
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                pageSize: pageSize,
              }}            bordered
            style={{ marginTop: '1.5rem' }}
          />

          <Popconfirm
            title="Are you sure you want to delete these?"
            onConfirm={handleDelete}
            okText="Yes"
            cancelText="No"
            disabled={!selectedRowKeys.length}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              disabled={!selectedRowKeys.length}
              style={styles.deleteButton}
            >
              Delete Selected
            </Button>
          </Popconfirm>

      <Modal
        title="Edit Chunk"
        open={!!editingChunk}
        //visible={!!editingChunk}
        onCancel={() => setEditingChunk(null)}
        onOk={handleEditSave}
        okText="Save"
      >
        <Input.TextArea
          rows={4}
          value={editValues.content}
          onChange={(e) => setEditValues((v) => ({ ...v, content: e.target.value }))}
        />
        <Input
          style={{ marginTop: '1rem' }}
          placeholder="Source"
          value={editValues.source}
          onChange={(e) => setEditValues((v) => ({ ...v, source: e.target.value }))}
        />
        <Input
          style={{ marginTop: '1rem' }}
          placeholder="Topic"
          value={editValues.topic}
          onChange={(e) => setEditValues((v) => ({ ...v, topic: e.target.value }))}
        />
      </Modal>
    </div>
    </div>
    </AdminLayout>
  );
}

export default ManageChunks;

const styles = {
  page: {
    backgroundColor: '#F1F1EB',
    minHeight: '100vh',
    padding: '2rem',
  },
  card: {
    maxWidth: 1200,
    margin: '1rem auto',
    padding: '2rem',
    backgroundColor: '#A0B6AA',
    borderRadius: '2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(32,54,37,0.1)',
    paddingBottom: '24px',
  },
  header: {
    color: '#1D1E2C',
    textAlign: 'center' as const,
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  deleteButton: {
    marginTop: '1rem',
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
    borderRadius: '1rem',
  },
} as const;
