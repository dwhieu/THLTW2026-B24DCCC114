import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { getTasks, Task } from '@/utils/taskStorage';
import { CheckCircleOutlined, ClockCircleOutlined, ProjectOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = () => setTasks(getTasks());
    fetchTasks();
    
    window.addEventListener('focus', fetchTasks);
    return () => window.removeEventListener('focus', fetchTasks);
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  
  const now = new Date();
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'DONE' && new Date(t.deadline) < now
  ).length;

  return (
    <div style={{ padding: '24px 24px 0' }}>
      <Title level={2} style={{ marginBottom: 24, fontWeight: 700 }}>Tổng quan Công việc</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card hoverable style={{ borderRadius: 12, borderLeft: '6px solid #1890ff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: 16, fontWeight: 500 }}>Tổng số Task</span>}
              value={totalTasks}
              prefix={<ProjectOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable style={{ borderRadius: 12, borderLeft: '6px solid #52c41a', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: 16, fontWeight: 500 }}>Đã Hoàn thành</span>}
              value={completedTasks}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable style={{ borderRadius: 12, borderLeft: '6px solid #f5222d', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title={<span style={{ fontSize: 16, fontWeight: 500 }}>Quá hạn</span>}
              value={overdueTasks}
              prefix={<ClockCircleOutlined style={{ color: '#f5222d', marginRight: 8 }} />}
              valueStyle={{ color: '#f5222d', fontWeight: 'bold', fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
