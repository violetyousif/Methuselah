// Admin Dashboard - Main overview page
// Mohammad Hoque, 07/18/2025, Updated to use new AdminLayout pattern

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button, message } from 'antd';
import { 
  UploadOutlined, 
  DatabaseOutlined, 
  CommentOutlined, 
  UserOutlined,
  FileTextOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

const { Title, Text } = Typography;

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState({
    userCount: 0,
    documentCount: 0,
    feedbackCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      // Fetch user count
      const userResponse = await fetch('http://localhost:8080/api/admin/users', {
        credentials: 'include'
      });
      
      // Fetch feedback count
      const feedbackResponse = await fetch('http://localhost:8080/api/admin/feedback', {
        credentials: 'include'
      });

      let userCount = 0;
      let feedbackCount = 0;

      if (userResponse.ok) {
        const userData = await userResponse.json();
        userCount = userData.count || userData.data?.length || 0;
      }

      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        feedbackCount = feedbackData.count || feedbackData.data?.length || 0;
      }

      setDashboardStats({
        userCount,
        documentCount: 0, // Will add this when document endpoint is available
        feedbackCount
      });

      console.log(`Dashboard stats loaded: ${userCount} users, ${feedbackCount} feedback entries`);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      message.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const dashboardCards = [
    {
      title: 'Upload Content',
      description: 'Upload and manage documents for the knowledge base',
      icon: <UploadOutlined style={{ fontSize: '24px', color: '#8AA698' }} />,
      onClick: () => router.push('/admin/adminUpload'),
      color: '#8AA698'
    },
    {
      title: 'Manage Data',
      description: 'View and manage knowledge base chunks',
      icon: <DatabaseOutlined style={{ fontSize: '24px', color: '#318182' }} />,
      onClick: () => router.push('/admin/adminManageData'),
      color: '#318182'
    },
    {
      title: 'View Feedback',
      description: 'Review user feedback and ratings',
      icon: <CommentOutlined style={{ fontSize: '24px', color: '#7a9688' }} />,
      onClick: () => router.push('/admin/adminViewFeedback'),
      color: '#7a9688'
    }
  ];

  const stats = [
    {
      title: 'Total Users',
      value: loading ? '...' : dashboardStats.userCount,
      icon: <UserOutlined style={{ color: '#8AA698' }} />
    },
    {
      title: 'Total Documents',
      value: loading ? '...' : dashboardStats.documentCount,
      icon: <FileTextOutlined style={{ color: '#318182' }} />
    },
    {
      title: 'Total Feedback',
      value: loading ? '...' : dashboardStats.feedbackCount,
      icon: <MessageOutlined style={{ color: '#7a9688' }} />
    }
  ];

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.card}>
          <Title level={2} style={styles.header}>
            Admin Dashboard
          </Title>
          
          <Text style={styles.subtitle}>
            Welcome to the Methuselah Admin Panel. Manage your knowledge base, review feedback, and monitor system performance.
          </Text>

          {/* Statistics Overview */}
          <div style={{ marginBottom: '32px', marginTop: '24px' }}>
            <Title level={4} style={styles.sectionHeader}>
              System Statistics
            </Title>
            <Row gutter={[16, 16]}>
              {stats.map((stat, index) => (
                <Col xs={24} sm={8} key={index}>
                  <Card style={styles.statCard}>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      prefix={stat.icon}
                      valueStyle={{ fontSize: '24px', color: '#1D1E2C' }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Quick Actions */}
          <div>
            <Title level={4} style={styles.sectionHeader}>
              Quick Actions
            </Title>
            
            <Row gutter={[16, 16]}>
              {dashboardCards.map((card, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card
                    hoverable
                    style={{ 
                      ...styles.actionCard,
                      borderColor: card.color,
                    }}
                    onClick={card.onClick}
                    styles={{ body: styles.actionCardBody }}
                  >
                    <Space direction="vertical" size="large" align="center">
                      <div style={{ 
                        ...styles.iconContainer,
                        backgroundColor: `${card.color}15`,
                        border: `2px solid ${card.color}20`
                      }}>
                        {card.icon}
                      </div>
                      <div>
                        <Title level={4} style={{ margin: 0, color: card.color }}>
                          {card.title}
                        </Title>
                        <Text style={styles.cardDescription}>
                          {card.description}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* System Status */}
          <Card 
            title={<span style={{ color: '#1D1E2C' }}>System Status</span>}
            style={styles.statusCard}
            extra={
              <Button 
                onClick={fetchDashboardStats}
                loading={loading}
                style={styles.refreshButton}
              >
                Refresh Status
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic 
                  title="System Status" 
                  value="Online" 
                  valueStyle={{ color: '#318182' }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Database Status" 
                  value="Connected" 
                  valueStyle={{ color: '#318182' }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Last Updated" 
                  value="Now" 
                  valueStyle={{ color: '#8AA698' }}
                />
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

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
  subtitle: {
    fontSize: '16px',
    display: 'block',
    color: '#1D1E2C',
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  sectionHeader: {
    color: '#1D1E2C',
    marginBottom: '16px',
    fontWeight: 'bold',
  },
  statCard: {
    backgroundColor: '#8AA698',
    borderRadius: '1rem',
    border: 'none',
  },
  actionCard: {
    height: '200px',
    borderWidth: '2px',
    cursor: 'pointer',
    backgroundColor: '#F1F1EB',
    borderRadius: '1rem',
  },
  actionCardBody: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center' as const,
  },
  iconContainer: {
    padding: '16px',
    borderRadius: '50%',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#666',
  },
  statusCard: {
    marginTop: '32px',
    backgroundColor: '#8AA698',
    borderRadius: '1rem',
  },
  refreshButton: {
    backgroundColor: '#203625',
    borderColor: '#203625',
    color: '#e0e0e0',
    borderRadius: '1rem',
  },
} as const;
