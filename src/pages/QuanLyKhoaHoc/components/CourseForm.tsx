import React from 'react';
import { Form, Input, Select, InputNumber, Button, Card, Space, Typography, message } from 'antd';
import { Course } from '../index';

const { Title } = Typography;
const { TextArea } = Input;

interface CourseFormProps {
  initialValues?: Course;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  courseNames: string[];
}

const CourseForm: React.FC<CourseFormProps> = ({ initialValues, onSubmit, onCancel, courseNames }) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    onSubmit(values);
    message.success(initialValues ? 'Cập nhật khóa học thành công' : 'Thêm khóa học mới thành công');
  };

  const lecturers = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Văn D', 'Hoàng Thị E'];

  return (
    <Card 
      title={<Title level={4}>{initialValues ? 'Chỉnh sửa khóa học' : 'Thêm mới khóa học'}</Title>}
      style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: '800px', margin: '0 auto' }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || { status: 'Open', students: 0 }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="name"
          label="Tên khóa học"
          rules={[
            { required: true, message: 'Vui lòng nhập tên khóa học' },
            { max: 100, message: 'Tên khóa học tối đa 100 ký tự' },
            {
              validator: (_, value) => {
                if (value && courseNames.includes(value)) {
                  return Promise.reject(new Error('Tên khóa học đã tồn tại'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Nhập tên khóa học" />
        </Form.Item>

        <Form.Item
          name="lecturer"
          label="Giảng viên"
          rules={[{ required: true, message: 'Vui lòng chọn giảng viên' }]}
        >
          <Select placeholder="Chọn giảng viên">
            {lecturers.map((l) => (
              <Select.Option key={l} value={l}>{l}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="students"
          label="Số lượng học viên"
          rules={[{ required: true, message: 'Vui lòng nhập số lượng học viên' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số lượng học viên" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Select.Option value="Open">Đang mở</Select.Option>
            <Select.Option value="Ended">Đã kết thúc</Select.Option>
            <Select.Option value="Paused">Tạm dừng</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả khóa học"
        >
          <TextArea rows={6} placeholder="Nhập mô tả khóa học" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" size="large">
              {initialValues ? 'Cập nhật' : 'Tạo mới'}
            </Button>
            <Button onClick={onCancel} size="large">
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CourseForm;
