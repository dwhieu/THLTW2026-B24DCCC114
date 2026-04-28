import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

interface HealthMetric {
  id: string;
  date: string;
  weight: number; // kg
  height: number; // cm
  bmi?: number;
  restingHeartRate: number; // bpm
  sleepHours: number;
}

const defaultMetrics: HealthMetric[] = [
  {
    id: '1',
    date: moment().subtract(1, 'days').toISOString(),
    weight: 70,
    height: 175,
    bmi: 70 / Math.pow(175 / 100, 2),
    restingHeartRate: 65,
    sleepHours: 7.5,
  },
  {
    id: '2',
    date: moment().toISOString(),
    weight: 69.5,
    height: 175,
    bmi: 69.5 / Math.pow(175 / 100, 2),
    restingHeartRate: 64,
    sleepHours: 8,
  },
];

const HealthMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const stored = localStorage.getItem('fitness_health_metrics');
    if (stored) {
      setMetrics(JSON.parse(stored));
    } else {
      setMetrics(defaultMetrics);
      localStorage.setItem('fitness_health_metrics', JSON.stringify(defaultMetrics));
    }
  }, []);

  const saveMetrics = (newMetrics: HealthMetric[]) => {
    // Sort by date descending
    newMetrics.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());
    setMetrics(newMetrics);
    localStorage.setItem('fitness_health_metrics', JSON.stringify(newMetrics));
  };

  const calculateBMI = (weight: number, heightCm: number) => {
    if (!weight || !heightCm) return 0;
    const heightM = heightCm / 100;
    return Number((weight / (heightM * heightM)).toFixed(2));
  };

  const getBMITag = (bmi: number) => {
    if (bmi < 18.5) return <Tag color="blue">Thiếu cân ({bmi})</Tag>;
    if (bmi >= 18.5 && bmi <= 24.9) return <Tag color="green">Bình thường ({bmi})</Tag>;
    if (bmi >= 25 && bmi <= 29.9) return <Tag color="gold">Thừa cân ({bmi})</Tag>;
    if (bmi >= 30) return <Tag color="red">Béo phì ({bmi})</Tag>;
    return <Tag>{bmi}</Tag>;
  };

  const handleAdd = () => {
    setEditingMetric(null);
    form.resetFields();
    // Default values
    if (metrics.length > 0) {
      const latest = metrics[0];
      form.setFieldsValue({
        date: moment(),
        height: latest.height,
        weight: latest.weight,
        restingHeartRate: latest.restingHeartRate,
        sleepHours: latest.sleepHours
      });
    } else {
      form.setFieldsValue({ date: moment() });
    }
    setIsModalVisible(true);
  };

  const handleEdit = (record: HealthMetric) => {
    setEditingMetric(record);
    form.setFieldsValue({
      ...record,
      date: moment(record.date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newMetrics = metrics.filter((m) => m.id !== id);
    saveMetrics(newMetrics);
    message.success('Đã xóa bản ghi');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const bmi = calculateBMI(Number(values.weight), Number(values.height));
      const newRecord: HealthMetric = {
        id: editingMetric ? editingMetric.id : Date.now().toString(),
        date: values.date.toISOString(),
        weight: Number(values.weight),
        height: Number(values.height),
        bmi,
        restingHeartRate: Number(values.restingHeartRate),
        sleepHours: Number(values.sleepHours),
      };

      if (editingMetric) {
        const newMetrics = metrics.map((m) => (m.id === editingMetric.id ? newRecord : m));
        saveMetrics(newMetrics);
        message.success('Cập nhật thành công');
      } else {
        saveMetrics([...metrics, newRecord]);
        message.success('Thêm mới thành công');
      }
      setIsModalVisible(false);
    });
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Cân nặng (kg)',
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: 'Chiều cao (cm)',
      dataIndex: 'height',
      key: 'height',
    },
    {
      title: 'BMI',
      dataIndex: 'bmi',
      key: 'bmi',
      render: (bmi: number) => getBMITag(bmi),
    },
    {
      title: 'Nhịp tim lúc nghỉ (bpm)',
      dataIndex: 'restingHeartRate',
      key: 'restingHeartRate',
    },
    {
      title: 'Giờ ngủ (h)',
      dataIndex: 'sleepHours',
      key: 'sleepHours',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: HealthMetric) => (
        <span>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bản ghi này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Nhật ký chỉ số sức khỏe</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm chỉ số
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={metrics} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingMetric ? 'Sửa chỉ số' : 'Thêm chỉ số mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="date" label="Ngày" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="weight" label="Cân nặng (kg)" rules={[{ required: true, message: 'Vui lòng nhập cân nặng' }]}>
            <Input type="number" step="0.1" />
          </Form.Item>
          <Form.Item name="height" label="Chiều cao (cm)" rules={[{ required: true, message: 'Vui lòng nhập chiều cao' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="restingHeartRate" label="Nhịp tim lúc nghỉ (bpm)">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="sleepHours" label="Giờ ngủ (h)">
            <Input type="number" step="0.5" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthMetrics;
