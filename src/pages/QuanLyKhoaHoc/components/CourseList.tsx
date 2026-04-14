import React, { useState } from 'react';
import { Table, Input, Select, Button, Space, Popconfirm, Tag, message, Card, Typography, Modal } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Course } from '../index';
import CourseForm from './CourseForm';

const { Title } = Typography;

interface CourseListProps {
  courses: Course[];
  onDelete: (id: string) => void;
  onUpdate: (values: any) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onDelete, onUpdate }) => {
  const [searchText, setSearchText] = useState('');
  const [lecturerFilter, setLecturerFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);

  const lecturers = Array.from(new Set(courses.map((c) => c.lecturer)));

  const filteredData = courses.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesLecturer = lecturerFilter ? course.lecturer === lecturerFilter : true;
    const matchesStatus = statusFilter ? course.status === statusFilter : true;
    return matchesSearch && matchesLecturer && matchesStatus;
  });

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center' as const },
    { title: 'Tên khóa học', dataIndex: 'name', key: 'name', align: 'center' as const },
    { title: 'Giảng viên', dataIndex: 'lecturer', key: 'lecturer', align: 'center' as const },
    { 
      title: 'Học viên', 
      dataIndex: 'students', 
      key: 'students', 
      align: 'center' as const,
      sorter: (a: Course, b: Course) => a.students - b.students,
      render: (count: number) => <b>{count}</b>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Ended') color = 'red';
        if (status === 'Paused') color = 'orange';
        const labels: Record<string, string> = {
          Open: 'Đang mở',
          Ended: 'Đã kết thúc',
          Paused: 'Tạm dừng',
        };
        return <Tag color={color}>{labels[status]}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center' as const,
      render: (_: any, record: Course) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            onClick={() => setEditingCourse(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa khóa học này?"
            onConfirm={() => {
              if (record.students > 0) {
                message.error('Không thể xóa khóa học đã có học viên!');
              } else {
                onDelete(record.id);
                message.success('Đã xóa khóa học thành công');
              }
            }}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card 
        title={<Title level={4}>Danh sách khóa học Online</Title>}
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <Space style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo tên khóa học"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Lọc theo giảng viên"
            allowClear
            style={{ width: 180 }}
            onChange={setLecturerFilter}
          >
            {lecturers.map((l) => (
              <Select.Option key={l} value={l}>{l}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 180 }}
            onChange={setStatusFilter}
          >
            <Select.Option value="Open">Đang mở</Select.Option>
            <Select.Option value="Ended">Đã kết thúc</Select.Option>
            <Select.Option value="Paused">Tạm dừng</Select.Option>
          </Select>
        </Space>
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        visible={!!editingCourse}
        footer={null}
        onCancel={() => setEditingCourse(undefined)}
        width={800}
        destroyOnClose
      >
        {editingCourse && (
          <CourseForm
            initialValues={editingCourse}
            courseNames={courses.map((c) => (c.id === editingCourse.id ? '' : c.name))}
            onSubmit={(values) => {
              onUpdate({ ...values, id: editingCourse.id });
              setEditingCourse(undefined);
            }}
            onCancel={() => setEditingCourse(undefined)}
          />
        )}
      </Modal>
    </>
  );
};

export default CourseList;
