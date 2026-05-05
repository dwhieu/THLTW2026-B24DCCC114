import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Space, Tag, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Task, getTasks, addTask, updateTask, deleteTask } from '@/utils/taskStorage';
import TaskForm from '../components/TaskForm';

const { Title } = Typography;
const { Option } = Select;

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = () => {
    setTasks(getTasks());
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAdd = () => {
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    fetchTasks();
  };

  const handleSave = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setIsModalVisible(false);
    fetchTasks();
  };

  const filteredTasks = tasks.filter((task) => {
    const matchName = task.name.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter ? task.status === statusFilter : true;
    return matchName && matchStatus;
  });

  const columns: any = [
    {
      title: 'Tên công việc',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text: string) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: string) => {
        let color = status === 'DONE' ? 'green' : status === 'IN_PROGRESS' ? 'geekblue' : 'default';
        let text = status === 'DONE' ? 'Hoàn thành' : status === 'IN_PROGRESS' ? 'Đang làm' : 'Cần làm';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      align: 'center',
      render: (priority: string) => {
        let color = priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green';
        let text = priority === 'High' ? 'Cao' : priority === 'Medium' ? 'Trung bình' : 'Thấp';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      align: 'center',
      sorter: (a: Task, b: Task) => moment(a.deadline).valueOf() - moment(b.deadline).valueOf(),
      render: (deadline: string, record: Task) => {
        const isOverdue = moment(deadline).isBefore(moment()) && record.status !== 'DONE';
        return (
          <span style={{ color: isOverdue ? 'red' : 'inherit', fontWeight: isOverdue ? 'bold' : 'normal' }}>
            {moment(deadline).format('DD/MM/YYYY HH:mm')}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_: any, record: Task) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa công việc này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '80vh', margin: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>Danh sách Công việc</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          Thêm mới
        </Button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
          size="large"
        />
        <Select
          placeholder="Lọc theo trạng thái"
          style={{ width: 200 }}
          allowClear
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          size="large"
        >
          <Option value="TODO">Cần làm</Option>
          <Option value="IN_PROGRESS">Đang làm</Option>
          <Option value="DONE">Hoàn thành</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredTasks}
        rowKey="id"
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
      />

      <TaskForm
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSave}
        initialValues={editingTask}
      />
    </div>
  );
};

export default TaskList;
