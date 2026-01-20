import React, { useState } from 'react';
import type { Product } from '@/models/product';
import { Table, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;

const ProductManagement: React.FC = () => {
	const initialProducts: Product[] = [
		{ id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
		{ id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
		{ id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
		{ id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
		{ id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
	];

	const [products, setProducts] = useState<Product[]>(initialProducts);
	const [searchText, setSearchText] = useState<string>('');
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	const [form] = Form.useForm<Product>();

	const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()));

	const handleAddProduct = (values: Omit<Product, 'id'>) => {
		const newProduct: Product = {
			id: Date.now(),
			...values,
		};

		setProducts((prev) => [...prev, newProduct]);
		message.success('Thêm sản phẩm thành công');
		form.resetFields();
		setIsModalOpen(false);
	};

	const handleDelete = (id: number) => {
		setProducts((prev) => prev.filter((p) => p.id !== id));
		message.success('Xóa sản phẩm thành công');
	};

	const columns: ColumnsType<Product> = [
		{
			title: 'STT',
			render: (_, __, index) => index + 1,
		},
		{
			title: 'Tên sản phẩm',
			dataIndex: 'name',
		},
		{
			title: 'Giá (VNĐ)',
			dataIndex: 'price',
			render: (price: number) => price.toLocaleString(),
		},
		{
			title: 'Số lượng',
			dataIndex: 'quantity',
		},
		{
			title: 'Thao tác',
			render: (_, record) => (
				<Popconfirm title='Bạn có chắc chắn muốn xóa?' onConfirm={() => handleDelete(record.id)}>
					<Button danger>Xóa</Button>
				</Popconfirm>
			),
		},
	];

	return (
		<div style={{ padding: 24 }}>
			<h2>Quản lý danh sách sản phẩm</h2>

			<Space style={{ marginBottom: 16 }}>
				<Search
					placeholder='Tìm kiếm theo tên sản phẩm'
					allowClear
					onChange={(e) => setSearchText(e.target.value)}
					style={{ width: 300 }}
				/>

				<Button type='primary' onClick={() => setIsModalOpen(true)}>
					Thêm sản phẩm
				</Button>
			</Space>

			<Table<Product> columns={columns} dataSource={filteredProducts} rowKey='id' />

			<Modal
				title='Thêm sản phẩm mới'
				visible={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				footer={null}
				destroyOnClose
			>
				<Form<Product> form={form} layout='vertical' onFinish={handleAddProduct}>
					<Form.Item
						label='Tên sản phẩm'
						name='name'
						rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label='Giá'
						name='price'
						rules={[
							{ required: true, message: 'Vui lòng nhập giá' },
							{
								validator: (_, value) => (value > 0 ? Promise.resolve() : Promise.reject('Giá phải là số dương')),
							},
						]}
					>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>

					<Form.Item
						label='Số lượng'
						name='quantity'
						rules={[
							{ required: true, message: 'Vui lòng nhập số lượng' },
							{
								validator: (_, value) =>
									Number.isInteger(value) && value > 0
										? Promise.resolve()
										: Promise.reject('Số lượng phải là số nguyên dương'),
							},
						]}
					>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>

					<Button type='primary' htmlType='submit' block>
						Thêm
					</Button>
				</Form>
			</Modal>
		</div>
	);
};

export default ProductManagement;
