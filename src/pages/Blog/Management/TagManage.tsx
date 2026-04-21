import { Button, Card, Form, Input, Modal, Popconfirm, Space, Table, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';

const { Title } = Typography;

const TagManage: React.FC = () => {
	const { tags, getBlogData, addTag, updateTag, deleteTag } = useModel('blog');
	const [visible, setVisible] = useState(false);
	const [editingTag, setEditingTag] = useState<any>(null);
	const [form] = Form.useForm();

	useEffect(() => {
		getBlogData();
	}, [getBlogData]);

	const handleAddOrEdit = (values: { name: string }) => {
		if (editingTag) {
			updateTag(editingTag.id, values.name);
			message.success('Cập nhật thẻ thành công');
		} else {
			addTag(values.name);
			message.success('Thêm thẻ mới thành công');
		}
		setVisible(false);
		form.resetFields();
	};

	const columns = [
		{
			title: 'Tên thẻ',
			dataIndex: 'name',
			key: 'name',
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Số bài viết',
			dataIndex: 'postCount',
			key: 'postCount',
			align: 'center' as const,
			render: (count: number) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{count}</span>,
		},
		{
			title: 'Thao tác',
			key: 'action',
			width: 150,
			align: 'center' as const,
			render: (_: any, record: any) => (
				<Space>
					<Button
						type='text'
						icon={<EditOutlined style={{ color: '#1890ff' }} />}
						onClick={() => {
							setEditingTag(record);
							form.setFieldsValue({ name: record.name });
							setVisible(true);
						}}
					/>
					<Popconfirm
						title='Bạn có chắc chắn muốn xóa thẻ này?'
						onConfirm={() => {
							deleteTag(record.id);
							message.success('Xóa thẻ thành công');
						}}
						okText='Xóa'
						cancelText='Hủy'
					>
						<Button type='text' danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: '24px' }}>
			<Card
				title={<Title level={3}>Quản lý thẻ</Title>}
				extra={
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={() => {
							setEditingTag(null);
							form.resetFields();
							setVisible(true);
						}}
					>
						Thêm thẻ mới
					</Button>
				}
				bordered={false}
				style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
			>
				<Table 
					columns={columns} 
					dataSource={tags} 
					rowKey='id' 
					pagination={{ pageSize: 10 }}
				/>
			</Card>

			<Modal
				title={editingTag ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới'}
				visible={visible}
				onCancel={() => setVisible(false)}
				onOk={() => form.submit()}
				destroyOnClose
			>
				<Form form={form} layout='vertical' onFinish={handleAddOrEdit}>
					<Form.Item
						name='name'
						label='Tên thẻ'
						rules={[{ required: true, message: 'Vui lòng nhập tên thẻ' }]}
					>
						<Input placeholder='Ví dụ: React, TypeScript, ...' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default TagManage;
