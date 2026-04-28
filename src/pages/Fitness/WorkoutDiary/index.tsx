import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Popconfirm, message, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

interface Workout {
  id: string;
  date: string;
  type: string;
  name: string; // Tên bài tập
  duration: number; // phút
  calories: number;
  notes: string;
  status: 'Hoàn thành' | 'Bỏ lỡ';
}

const WORKOUT_TYPES = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Other'];

const defaultWorkouts: Workout[] = [
  {
    id: '1',
    date: moment().subtract(1, 'days').toISOString(),
    type: 'Cardio',
    name: 'Chạy bộ công viên',
    duration: 30,
    calories: 250,
    notes: 'Chạy nhẹ nhàng',
    status: 'Hoàn thành',
  },
  {
    id: '2',
    date: moment().toISOString(),
    type: 'Strength',
    name: 'Tập ngực và tay sau',
    duration: 60,
    calories: 400,
    notes: 'Tạ đơn 10kg',
    status: 'Hoàn thành',
  },
];

const WorkoutDiary: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [form] = Form.useForm();

  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('fitness_workouts');
    if (stored) {
      setWorkouts(JSON.parse(stored));
    } else {
      setWorkouts(defaultWorkouts);
      localStorage.setItem('fitness_workouts', JSON.stringify(defaultWorkouts));
    }
  }, []);

  const saveWorkouts = (newWorkouts: Workout[]) => {
    newWorkouts.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());
    setWorkouts(newWorkouts);
    localStorage.setItem('fitness_workouts', JSON.stringify(newWorkouts));
  };

  const handleAdd = () => {
    setEditingWorkout(null);
    form.resetFields();
    form.setFieldsValue({ date: moment(), status: 'Hoàn thành' });
    setIsModalVisible(true);
  };

  const handleEdit = (record: Workout) => {
    setEditingWorkout(record);
    form.setFieldsValue({
      ...record,
      date: moment(record.date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newWorkouts = workouts.filter((w) => w.id !== id);
    saveWorkouts(newWorkouts);
    message.success('Đã xóa buổi tập');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const newRecord: Workout = {
        id: editingWorkout ? editingWorkout.id : Date.now().toString(),
        date: values.date.toISOString(),
        type: values.type,
        name: values.name,
        duration: Number(values.duration),
        calories: Number(values.calories),
        notes: values.notes || '',
        status: values.status,
      };

      if (editingWorkout) {
        const newWorkouts = workouts.map((w) => (w.id === editingWorkout.id ? newRecord : w));
        saveWorkouts(newWorkouts);
        message.success('Cập nhật thành công');
      } else {
        saveWorkouts([...workouts, newRecord]);
        message.success('Thêm mới thành công');
      }
      setIsModalVisible(false);
    });
  };

  // Lọc dữ liệu
  const filteredWorkouts = workouts.filter(w => {
    const matchName = w.name.toLowerCase().includes(searchText.toLowerCase());
    const matchType = filterType ? w.type === filterType : true;
    let matchDate = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const wDate = moment(w.date);
      matchDate = wDate.isSameOrAfter(dateRange[0], 'day') && wDate.isSameOrBefore(dateRange[1], 'day');
    }
    return matchName && matchType && matchDate;
  });

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => moment(text).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Tên bài tập',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại bài tập',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Calo đốt',
      dataIndex: 'calories',
      key: 'calories',
      render: (calo: number) => <span style={{ color: '#fa8c16' }}>{calo} kcal</span>
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Hoàn thành' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Workout) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bản ghi này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
        <Space wrap>
          <Search 
            placeholder="Tìm theo tên bài..." 
            allowClear 
            onSearch={setSearchText} 
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }} 
          />
          <Select 
            placeholder="Loại bài tập" 
            allowClear 
            style={{ width: 150 }}
            onChange={setFilterType}
          >
            {WORKOUT_TYPES.map(t => <Option key={t} value={t}>{t}</Option>)}
          </Select>
          <RangePicker 
            onChange={(dates) => setDateRange(dates as any)}
            format="DD/MM/YYYY"
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm buổi tập
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredWorkouts} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingWorkout ? 'Sửa buổi tập' : 'Thêm buổi tập mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="date" label="Ngày tập" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
            <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
          </Form.Item>
          <Form.Item name="name" label="Tên bài tập" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Loại bài tập" rules={[{ required: true, message: 'Vui lòng chọn loại' }]}>
            <Select>
              {WORKOUT_TYPES.map(t => <Option key={t} value={t}>{t}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="calories" label="Calo đốt (kcal)" rules={[{ required: true, message: 'Vui lòng nhập calo' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select>
              <Option value="Hoàn thành">Hoàn thành</Option>
              <Option value="Bỏ lỡ">Bỏ lỡ</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkoutDiary;
