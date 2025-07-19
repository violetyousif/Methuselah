// Mohammad Hoque, 07/18/2025, Created admin page to view user feedback

import React, { useEffect, useState } from 'react';
import { Card, Typography, message, Spin, Button } from 'antd';
import { CommentOutlined, UserOutlined, CalendarOutlined, ReloadOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import AdminLayout from '../../components/AdminLayout';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface FeedbackItem {
  _id: string;
  rating: number;
  comments: string;
  createdAt: string;
  conversationId?: {
    title?: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const AdminViewFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/admin/feedback', { 
        credentials: 'include' 
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          message.error('Unauthorized access. Please login as admin.');
          return;
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setFeedback(data.data || []);
        console.log(`Loaded ${data.count || 0} feedback entries`);
      } else {
        throw new Error(data.error || 'Failed to fetch feedback');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      message.error(`Failed to load feedback: ${errorMessage}`);
      setFeedback([]); // Clear any existing data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#499f1eff'; // green
    if (rating >= 3) return '#e5a44ff1'; // yellow
    return '#c21e26ff'; // red
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <StarFilled
              key={star}
              style={{
                color: '#e5a44ff1',
                fontSize: '16px'
              }}
            />
          ) : (
            <StarOutlined
              key={star}
              style={{
                color: '#d9d9d9',
                fontSize: '16px'
              }}
            />
          )
        )}
      </div>
    );
  };

  const averageRating = feedback.length > 0
  ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1)
  : '0';

  const ratingDistribution = {
    5: feedback.filter(f => f.rating === 5).length,
    4: feedback.filter(f => f.rating === 4).length,
    3: feedback.filter(f => f.rating === 3).length,
    2: feedback.filter(f => f.rating === 2).length,
    1: feedback.filter(f => f.rating === 1).length,
  };

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Title level={3} style={styles.header}>
              <CommentOutlined style={{ marginRight: 12, color: '#1D1E2C' }} />
              User Feedback Overview
            </Title>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchFeedback}
              loading={loading}
              style={styles.refreshButton}
            >
              Refresh
            </Button>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <Card style={{ flex: 1, minWidth: 200, backgroundColor: '#8AA698', borderRadius: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <StarOutlined style={{ fontSize: '24px', color: '#1D1E2C', marginBottom: '8px' }} />
                  <Title level={3} style={{ margin: 0, color: getRatingColor(parseFloat(averageRating)) }}>
                    <span style={{
                      fontWeight: 700, 
                      fontSize: '2rem',
                      textShadow: '1px 1px 5px rgba(0, 0, 0, 0.2)',
                      }}>{averageRating}</span>
                  </Title>
                <Text style={{ color: '#1D1E2C' }}>Average Rating</Text>
              </div>
            </Card>
            
            <Card style={{ flex: 1, minWidth: 200, backgroundColor: '#8AA698', borderRadius: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <CommentOutlined style={{ fontSize: '24px', color: '#1D1E2C', marginBottom: '8px' }} />
                <Title level={3} style={{ margin: 0, color: '#1D1E2C' }}>
                  {feedback.length}
                </Title>
                <Text style={{ color: '#1D1E2C' }}>Total Feedback</Text>
              </div>
            </Card>

            <Card style={{ flex: 2, minWidth: 300, backgroundColor: '#8AA698', borderRadius: '1rem' }}>
              <Text strong style={{ marginBottom: '12px', display: 'block', color: '#1D1E2C' }}>Rating Distribution</Text>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.entries(ratingDistribution).reverse().map(([rating, count]) => (
                  <span 
                    key={rating} 
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      margin: '2px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      backgroundColor: getRatingColor(parseInt(rating)),
                      color: 'white'
                    }}
                  >
                    {rating}⭐ ({count})
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* Feedback List */}
          <Card style={{ backgroundColor: '#F1F1EB', borderRadius: '1rem' }}>
            <Spin spinning={loading}>
              {feedback.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <CommentOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <Paragraph>No feedback submitted yet</Paragraph>
                </div>
              ) : (
                <div>
                  {/* Simple pagination info */}
                  <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                    <Text type="secondary">
                      Showing {feedback.length} feedback entries
                    </Text>
                  </div>
                  
                  {/* Feedback items */}
                  {feedback.map((item: FeedbackItem) => (
                    <div key={item._id} style={{ marginBottom: '16px' }}>
                      <Card 
                        size="small" 
                        style={{ marginBottom: '8px', borderRadius: '0.5rem' }}
                        hoverable
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            <div>
                              <Text strong>{item.user.firstName} {item.user.lastName}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {item.user.email}
                              </Text>
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                              {renderStars(item.rating)}
                              <Text style={{ marginLeft: 8, fontWeight: 'bold' }}>
                                {item.rating}/5
                              </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {dayjs(item.createdAt).format('MMM DD, YYYY h:mm A')}
                              </Text>
                            </div>
                          </div>
                        </div>
                        
                        <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #f0f0f0' }} />
                        
                        <div>
                          <Text strong>Comments:</Text>
                          <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #d9d9d9' }}>
                            {item.comments ? (
                              <div style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                {item.comments}
                              </div>
                            ) : (
                              <Text type="secondary" style={{ fontStyle: 'italic' }}>No comments provided</Text>
                            )}
                          </div>
                          
                          {item.conversationId?.title && (
                            <div style={{ marginTop: '12px' }}>
                              <Text strong>Related Conversation: </Text>
                              <Text>{item.conversationId.title}</Text>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </Spin>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminViewFeedback;

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
    fontWeight: 'bold',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#203625',
    borderColor: '#203625',
    color: '#e0e0e0',
    borderRadius: '1rem',
  },
} as const;
