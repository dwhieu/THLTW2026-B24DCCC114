import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button } from 'antd';
import moment from 'moment';
import { Task } from '@/utils/taskStorage';

const { TextArea } = Input;
const { Option } = Select;

interface TaskFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (taskData: Omit<Task, 'id'>) => void;
  initialValues?: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ visible, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          deadline: moment(initialValues.deadline),
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      deadline: values.deadline.toISOString(),
    };
    onSave(formattedValues);
  };

  return (
    <Modal
      title={initialValues ? 'Chỉnh sửa Công việc' : 'Thêm mới Công việc'}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ priority: 'Medium', status: 'TODO', tags: [] }}
      >
        <Form.Item
          name="name"
          label="Tên công việc"
          rules={[{ required: true, message: 'Vui lòng nhập tên công việc' }]}
        >
          <Input placeholder="Nhập tên công việc" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea rows={4} placeholder="Nhập mô tả" />
        </Form.Item>

        <Form.Item
          name="deadline"
          label="Deadline"
          rules={[{ required: true, message: 'Vui lòng chọn deadline' }]}
        >
          <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Mức độ ưu tiên"
          rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên' }]}
        >
          <Select>
            <Option value="High">Cao</Option>
            <Option value="Medium">Trung bình</Option>
            <Option value="Low">Thấp</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="tags"
          label="Tags"
        >
          <Select mode="tags" placeholder="Nhập tags (nhấn Enter để thêm)" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select>
            <Option value="TODO">Cần làm</Option>
            <Option value="IN_PROGRESS">Đang làm</Option>
            <Option value="DONE">Hoàn thành</Option>
          </Select>
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm;
