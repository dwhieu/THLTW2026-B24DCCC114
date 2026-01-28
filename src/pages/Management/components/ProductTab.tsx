import React, { useState, useMemo } from 'react';
import { Table, Tag, Space, Button, Input, Select, Slider, Modal, Form, InputNumber } from 'antd';
import { useModel } from 'umi';
import type { Product } from '@/models/useAppModel';

const ProductTab: React.FC = () => {
	const { products, updateProduct } = useModel('useAppModel');
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [form] = Form.useForm();

	const [searchText, setSearchText] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);

	const filteredData = useMemo(() => {
		return products.filter((item) => {
			const matchName = item.name.toLowerCase().includes(searchText.toLowerCase());
			const matchCategory = categoryFilter ? item.category === categoryFilter : true;
			const matchPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
			return matchName && matchCategory && matchPrice;
		});
	}, [products, searchText, categoryFilter, priceRange]);

	const categories = Array.from(new Set(products.map((p) => p.category)));

	const handleEdit = (record: Product) => {
		setEditingProduct(record);
		form.setFieldsValue(record);
	};

	const handleSave = () => {
		form.validateFields().then((values) => {
			if (editingProduct) {
				updateProduct({ ...editingProduct, ...values });
				setEditingProduct(null);
			}
		});
	};

	const columns = [
		{ title: 'STT', key: 'index', render: (_: any, __: any, index: number) => index + 1 },
		{ title: 'Tên sản phẩm', dataIndex: 'name', sorter: (a: Product, b: Product) => a.name.localeCompare(b.name) },
		{ title: 'Danh mục', dataIndex: 'category' },
		{
			title: 'Giá',
			dataIndex: 'price',
			render: (val: number) => val.toLocaleString() + ' đ',
			sorter: (a: Product, b: Product) => a.price - b.price,
		},
		{
			title: 'Tồn kho',
			dataIndex: 'quantity',
			sorter: (a: Product, b: Product) => a.quantity - b.quantity,
		},
		{
			title: 'Trạng thái',
			key: 'status',
			render: (_: any, record: Product) => {
				let color = 'green';
				let text = 'Còn hàng';
				if (record.quantity === 0) {
					color = 'red';
					text = 'Hết hàng';
				} else if (record.quantity <= 10) {
					color = 'orange';
					text = 'Sắp hết';
				}
				return <Tag color={color}>{text}</Tag>;
			},
		},
		{
			title: 'Thao tác',
			key: 'action',
			render: (_: any, record: Product) => (
				<Button type='link' onClick={() => handleEdit(record)}>
					Sửa
				</Button>
			),
		},
	];

	return (
		<div>
			<Space style={{ marginBottom: 16 }} wrap>
				<Input.Search placeholder='Tìm tên SP' onSearch={setSearchText} allowClear style={{ width: 200 }} />
				<Select placeholder='Chọn danh mục' allowClear onChange={setCategoryFilter} style={{ width: 150 }}>
					{categories.map((c) => (
						<Select.Option key={c} value={c}>
							{c}
						</Select.Option>
					))}
				</Select>
				<div style={{ width: 300, padding: '0 10px' }}>
					<span>Khoảng giá: </span>
					<Slider range min={0} max={100000000} defaultValue={[0, 100000000]} onAfterChange={setPriceRange} />
				</div>
			</Space>

			<Table dataSource={filteredData} columns={columns} rowKey='id' pagination={{ pageSize: 5 }} />

			<Modal title='Sửa sản phẩm' visible={!!editingProduct} onOk={handleSave} onCancel={() => setEditingProduct(null)}>
				<Form form={form} layout='vertical'>
					<Form.Item name='name' label='Tên sản phẩm' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='category' label='Danh mục'>
						<Input />
					</Form.Item>
					<Form.Item name='price' label='Giá'>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='quantity' label='Số lượng'>
						<InputNumber style={{ width: '100%' }} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ProductTab;
