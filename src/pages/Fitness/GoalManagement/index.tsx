import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Tag, Button, Drawer, Form, Input, DatePicker, Select, Popconfirm, message, Progress, Segmented, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

interface Goal {
  id: string;
  name: string;
  type: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: 'Đang thực hiện' | 'Đã đạt' | 'Đã hủy';
}

const GOAL_TYPES = ['Giảm cân', 'Tăng cơ', 'Cải thiện sức bền', 'Khác'];
const STATUSES = ['Đang thực hiện', 'Đã đạt', 'Đã hủy'];

const defaultGoals: Goal[] = [
  {
    id: '1',
    name: 'Giảm 5kg trong 2 tháng',
    type: 'Giảm cân',
    targetValue: 70,
    currentValue: 73,
    deadline: moment().add(2, 'months').toISOString(),
    status: 'Đang thực hiện',
  },
  {
    id: '2',
    name: 'Chạy 5km dưới 25 phút',
    type: 'Cải thiện sức bền',
    targetValue: 25,
    currentValue: 30,
    deadline: moment().add(1, 'month').toISOString(),
    status: 'Đang thực hiện',
  },
];

const GoalManagement: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('Tất cả');
  
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const stored = localStorage.getItem('fitness_goals');
    if (stored) {
      setGoals(JSON.parse(stored));
    } else {
      setGoals(defaultGoals);
      localStorage.setItem('fitness_goals', JSON.stringify(defaultGoals));
    }
  }, []);

  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem('fitness_goals', JSON.stringify(newGoals));
  };

  const showDrawer = () => {
    form.resetFields();
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  const handleAddGoal = () => {
    form.validateFields().then((values) => {
      const newGoal: Goal = {
        id: Date.now().toString(),
        name: values.name,
        type: values.type,
        targetValue: Number(values.targetValue),
        currentValue: Number(values.currentValue) || 0,
        deadline: values.deadline.toISOString(),
        status: values.status || 'Đang thực hiện',
      };
      saveGoals([...goals, newGoal]);
      message.success('Đã thêm mục tiêu mới');
      closeDrawer();
    });
  };

  const handleDelete = (id: string) => {
    const newGoals = goals.filter((g) => g.id !== id);
    saveGoals(newGoals);
    message.success('Đã xóa mục tiêu');
  };

  const handleUpdateCurrentValue = (id: string, value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    
    const newGoals = goals.map((g) => {
      if (g.id === id) {
        let newStatus = g.status;

        return { ...g, currentValue: numValue };
      }
      return g;
    });
    saveGoals(newGoals);
  };

  const handleMarkAsDone = (id: string) => {
    const newGoals = goals.map((g) => g.id === id ? { ...g, status: 'Đã đạt' as const } : g);
    saveGoals(newGoals);
    message.success('Chúc mừng bạn đã đạt mục tiêu!');
  };

  const filteredGoals = goals.filter(g => filterStatus === 'Tất cả' || g.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đang thực hiện': return 'processing';
      case 'Đã đạt': return 'success';
      case 'Đã hủy': return 'error';
      default: return 'default';
    }
  };


  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    let percent = (current / target) * 100;

    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;
    return Math.round(percent);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <Segmented
          options={['Tất cả', ...STATUSES]}
          value={filterStatus}
          onChange={(val) => setFilterStatus(val as string)}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={showDrawer}>
          Thêm mục tiêu
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {filteredGoals.map((goal) => (
          <Col xs={24} sm={12} lg={8} key={goal.id}>
            <Card
              title={goal.name}
              extra={<Tag color={getStatusColor(goal.status)}>{goal.status}</Tag>}
              actions={[
                <Popconfirm
                  key="delete"
                  title="Xóa mục tiêu này?"
                  onConfirm={() => handleDelete(goal.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <DeleteOutlined style={{ color: 'red' }} />
                </Popconfirm>,
                goal.status === 'Đang thực hiện' && (
                  <Button 
                    type="link" 
                    icon={<CheckCircleOutlined />} 
                    onClick={() => handleMarkAsDone(goal.id)}
                    style={{ color: 'green' }}
                  >
                    Hoàn thành
                  </Button>
                )
              ]}
            >
              <p><strong>Loại:</strong> <Tag color="blue">{goal.type}</Tag></p>
              <p><strong>Deadline:</strong> {moment(goal.deadline).format('DD/MM/YYYY')}</p>
              
              <div style={{ marginBottom: 16 }}>
                <strong>Giá trị mục tiêu:</strong> {goal.targetValue}
                <br />
                <strong>Giá trị hiện tại:</strong>{' '}
                <Input
                  size="small"
                  style={{ width: 80, marginLeft: 8 }}
                  defaultValue={goal.currentValue}
                  onBlur={(e) => handleUpdateCurrentValue(goal.id, e.target.value)}
                  onPressEnter={(e: any) => handleUpdateCurrentValue(goal.id, e.target.value)}
                  disabled={goal.status !== 'Đang thực hiện'}
                />
              </div>

              <div>
                <strong>Tiến độ:</strong>
                <Progress percent={calculateProgress(goal.currentValue, goal.targetValue)} status={goal.status === 'Đã đạt' ? 'success' : 'active'} />
              </div>
            </Card>
          </Col>
        ))}
        {filteredGoals.length === 0 && (
          <Col span={24} style={{ textAlign: 'center', padding: '40px 0' }}>
            Không có mục tiêu nào phù hợp.
          </Col>
        )}
      </Row>

      <Drawer
        title="Thêm mục tiêu mới"
        width={400}
        onClose={closeDrawer}
        visible={isDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={closeDrawer}>Hủy</Button>
            <Button onClick={handleAddGoal} type="primary">
              Thêm
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'Đang thực hiện', currentValue: 0 }}>
          <Form.Item name="name" label="Tên mục tiêu" rules={[{ required: true, message: 'Vui lòng nhập tên mục tiêu' }]}>
            <Input placeholder="Vd: Giảm 5kg" />
          </Form.Item>
          <Form.Item name="type" label="Loại mục tiêu" rules={[{ required: true, message: 'Vui lòng chọn loại' }]}>
            <Select>
              {GOAL_TYPES.map(t => <Option key={t} value={t}>{t}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="targetValue" label="Giá trị mục tiêu (số)" rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}>
            <Input type="number" placeholder="Vd: 70" />
          </Form.Item>
          <Form.Item name="currentValue" label="Giá trị hiện tại (số)">
            <Input type="number" placeholder="Vd: 75" />
          </Form.Item>
          <Form.Item name="deadline" label="Deadline" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              {STATUSES.map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default GoalManagement;
