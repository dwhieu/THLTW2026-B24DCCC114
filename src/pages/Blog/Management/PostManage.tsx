import {
	Button,
	Card,
	Col,
	Form,
	Input,
	Modal,
	Popconfirm,
	Row,
	Select,
	Space,
	Table,
	Tag,
	Typography,
	message,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';

const { Title } = Typography;
const { Option } = Select;

const PostManage: React.FC = () => {
	const { posts, tags, getBlogData, addPost, updatePost, deletePost } = useModel('blog');
	const [visible, setVisible] = useState(false);
	const [editingPost, setEditingPost] = useState<any>(null);
	const [searchText, setSearchText] = useState('');
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [form] = Form.useForm();

	useEffect(() => {
		getBlogData();
	}, [getBlogData]);

	const filteredPosts = posts.filter((p) => {
		const matchesSearch = p.title.toLowerCase().includes(searchText.toLowerCase());
		const matchesStatus = statusFilter ? p.status === statusFilter : true;
		return matchesSearch && matchesStatus;
	});

	const handleAddOrEdit = (values: any) => {
		if (editingPost) {
			updatePost(editingPost.id, values);
			message.success('Cập nhật bài viết thành công');
		} else {
			addPost(values);
			message.success('Thêm bài viết mới thành công');
		}
		setVisible(false);
		form.resetFields();
	};

	const columns = [
		{
			title: 'Tiêu đề',
			dataIndex: 'title',
			key: 'title',
			width: '30%',
			render: (text: string) => <strong>{text}</strong>,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			width: 120,
			render: (status: string) => (
				<Tag color={status === 'Published' ? 'green' : 'orange'}>
					{status === 'Published' ? 'Đã đăng' : 'Nháp'}
				</Tag>
			),
		},
		{
			title: 'Thẻ',
			dataIndex: 'tags',
			key: 'tags',
			render: (tagsList: string[]) => (
				<>
					{tagsList.map((tag) => (
						<Tag key={tag}>{tag}</Tag>
					))}
				</>
			),
		},
		{
			title: 'Lượt xem',
			dataIndex: 'viewCount',
			key: 'viewCount',
			align: 'right' as const,
			width: 100,
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'date',
			key: 'date',
			width: 120,
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
							setEditingPost(record);
							form.setFieldsValue(record);
							setVisible(true);
						}}
					/>
					<Popconfirm
						title='Bạn có chắc chắn muốn xóa bài viết này?'
						onConfirm={() => {
							deletePost(record.id);
							message.success('Xóa bài viết thành công');
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
				title={<Title level={3}>Quản lý bài viết</Title>}
				extra={
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={() => {
							setEditingPost(null);
							form.resetFields();
							form.setFieldsValue({ status: 'Draft', author: 'Admin' });
							setVisible(true);
						}}
					>
						Viết bài mới
					</Button>
				}
				bordered={false}
				style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
			>
				<Row gutter={16} style={{ marginBottom: 24 }}>
					<Col span={8}>
						<Input
							placeholder='Tìm theo tiêu đề...'
							prefix={<SearchOutlined />}
							onChange={(e) => setSearchText(e.target.value)}
							allowClear
						/>
					</Col>
					<Col span={6}>
						<Select
							placeholder='Lọc theo trạng thái'
							style={{ width: '100%' }}
							allowClear
							onChange={(value) => setStatusFilter(value)}
						>
							<Option value='Published'>Đã đăng</Option>
							<Option value='Draft'>Nháp</Option>
						</Select>
					</Col>
				</Row>

				<Table
					columns={columns}
					dataSource={filteredPosts}
					rowKey='id'
					pagination={{ pageSize: 10 }}
				/>
			</Card>

			<Modal
				title={editingPost ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
				visible={visible}
				onCancel={() => setVisible(false)}
				onOk={() => form.submit()}
				width={1000}
				destroyOnClose
			>
				<Form form={form} layout='vertical' onFinish={handleAddOrEdit}>
					<Row gutter={16}>
						<Col span={16}>
							<Form.Item
								name='title'
								label='Tiêu đề bài viết'
								rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
							>
								<Input placeholder='Ví dụ: Khám phá thế giới React...' />
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item
								name='slug'
								label='Slug'
								rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
							>
								<Input placeholder='vi-du-kham-pha-react' />
							</Form.Item>
						</Col>
					</Row>

					<Form.Item name='summary' label='Tóm tắt bài viết'>
						<Input.TextArea rows={2} placeholder='Mô tả ngắn gọn về bài viết...' />
					</Form.Item>

					<Form.Item
						name='content'
						label='Nội dung (Markdown)'
						rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
					>
						<Input.TextArea rows={12} placeholder='# Tiêu đề lớn...' />
					</Form.Item>

					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='avatar' label='URL Ảnh đại diện'>
								<Input placeholder='https://example.com/image.jpg' />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item
								name='tags'
								label='Thẻ (Tags)'
								rules={[{ required: true, message: 'Chọn ít nhất 1 thẻ' }]}
							>
								<Select mode='multiple' placeholder='Chọn thẻ'>
									{tags.map((tag) => (
										<Option key={tag.name} value={tag.name}>
											{tag.name}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item name='status' label='Trạng thái'>
								<Select>
									<Option value='Draft'>Nháp</Option>
									<Option value='Published'>Đã đăng</Option>
								</Select>
							</Form.Item>
						</Col>
					</Row>
					<Form.Item name='author' hidden>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default PostManage;
