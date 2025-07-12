import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, message, Popconfirm, Typography } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Chunk {
  _id: string;
  content: string;
  source: string;
  topic?: string;
}

const ManageChunks: React.FC = () => {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingChunk, setEditingChunk] = useState<Chunk | null>(null);
  const [editValues, setEditValues] = useState({ content: '', source: '', topic: '' });
  const [loading, setLoading] = useState(false);

  const fetchChunks = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/chunks', { credentials: 'include' });
      const data = await res.json();
      setChunks(data);
    } catch (err) {
      message.error('Failed to load chunks.');
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
      title: 'Content',
      dataIndex: 'content',
      render: (text: string) => <span style={{ whiteSpace: 'pre-wrap' }}>{text.slice(0, 100)}...</span>,
    },
    {
      title: 'Source',
      dataIndex: 'source',
    },
    {
      title: 'Topic',
      dataIndex: 'topic',
    },
    {
      title: 'Actions',
      render: (_: any, record: Chunk) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            setEditingChunk(record);
            setEditValues({
              content: record.content,
              source: record.source,
              topic: record.topic || '',
            });
          }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <Title level={3}>Manage Pretraining Chunks</Title>

      <Table
        rowKey="_id"
        dataSource={chunks}
        columns={columns}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        pagination={{ pageSize: 10 }}
        bordered
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
          style={{ marginTop: '1rem' }}
        >
          Delete Selected
        </Button>
      </Popconfirm>

      <Modal
        title="Edit Chunk"
        visible={!!editingChunk}
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
  );
};

export default ManageChunks;
