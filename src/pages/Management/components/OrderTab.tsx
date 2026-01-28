import React, { useState, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Space, InputNumber, Row, Col } from 'antd';
import { useModel } from 'umi';
import type { Order, OrderItem } from '@/models/useAppModel';
import moment from 'moment';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderTab: React.FC = () => {
	const { orders, products, createOrder, updateOrderStatus } = useModel('useAppModel');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [detailOrder, setDetailOrder] = useState<Order | null>(null);
	const [form] = Form.useForm();

	const [searchCust, setSearchCust] = useState('');
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [dateRange, setDateRange] = useState<any>(null);

	const [currentTotal, setCurrentTotal] = useState(0);

	const filteredOrders = useMemo(() => {
		return orders.filter((o) => {
			const matchName = o.customerName.toLowerCase().includes(searchCust.toLowerCase()) || o.id.includes(searchCust);
			const matchStatus = statusFilter ? o.status === statusFilter : true;
			const matchDate = dateRange ? moment(o.createdAt).isBetween(dateRange[0], dateRange[1], 'day', '[]') : true;
			return matchName && matchStatus && matchDate;
		});
	}, [orders, searchCust, statusFilter, dateRange]);

	const handleCreateOrder = () => {
		form.validateFields().then((values) => {
			// Tính toán chi tiết
			const orderItems: OrderItem[] = values.items.map((item: any) => {
				const prod = products.find((p) => p.id === item.productId);
				return {
					productId: item.productId,
					productName: prod?.name || '',
					quantity: item.quantity,
					price: prod?.price || 0,
				};
			});

			const total = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
			const newOrder: Order = {
				id: `DH${Date.now()}`,
				customerName: values.customerName,
				phone: values.phone,
				address: values.address,
				products: orderItems,
				totalAmount: total,
				status: 'Chờ xử lý',
				createdAt: moment().format('YYYY-MM-DD'),
			};

			createOrder(newOrder);
			setIsModalOpen(false);
			form.resetFields();
		});
	};

	// Tính lại tổng tiền khi form thay đổi
	const onFormValuesChange = (_: any, allValues: any) => {
		if (allValues.items) {
			const total = allValues.items.reduce((sum: number, item: any) => {
				const prod = products.find((p) => p.id === item?.productId);
				return sum + (prod?.price || 0) * (item?.quantity || 0);
			}, 0);
			setCurrentTotal(total);
		}
	};

	const columns = [
		{ title: 'Mã ĐH', dataIndex: 'id' },
		{ title: 'Khách hàng', dataIndex: 'customerName' },
		{ title: 'Số SP', render: (_: any, r: Order) => r.products.length },
		{
			title: 'Tổng tiền',
			dataIndex: 'totalAmount',
			render: (val: number) => val.toLocaleString(),
			sorter: (a: Order, b: Order) => a.totalAmount - b.totalAmount,
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createdAt',
			sorter: (a: Order, b: Order) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			render: (status: string, record: Order) => (
				<Select
					defaultValue={status}
					style={{ width: 120 }}
					onChange={(val: string) => updateOrderStatus(record.id, val as Order['status'])}
					status={status === 'Đã hủy' ? 'error' : status === 'Hoàn thành' ? 'warning' : undefined}
				>
					<Option value='Chờ xử lý'>Chờ xử lý</Option>
					<Option value='Đang giao'>Đang giao</Option>
					<Option value='Hoàn thành'>Hoàn thành</Option>
					<Option value='Đã hủy'>Đã hủy</Option>
				</Select>
			),
		},
		{
			title: 'Thao tác',
			render: (_: any, record: Order) => (
				<Button type='link' onClick={() => setDetailOrder(record)}>
					Chi tiết
				</Button>
			),
		},
	];

	return (
		<div>
			<Space style={{ marginBottom: 16 }}>
				<Button type='primary' onClick={() => setIsModalOpen(true)}>
					+ Tạo đơn hàng
				</Button>
				<Input
					placeholder='Tìm tên KH / Mã ĐH'
					onChange={(e) => setSearchCust(e.target.value)}
					style={{ width: 200 }}
				/>
				<Select placeholder='Trạng thái' allowClear onChange={setStatusFilter} style={{ width: 150 }}>
					<Option value='Chờ xử lý'>Chờ xử lý</Option>
					<Option value='Đang giao'>Đang giao</Option>
					<Option value='Hoàn thành'>Hoàn thành</Option>
					<Option value='Đã hủy'>Đã hủy</Option>
				</Select>
				<RangePicker onChange={setDateRange} />
			</Space>

			<Table dataSource={filteredOrders} columns={columns} rowKey='id' />

			{/* Modal Tạo Đơn */}
			<Modal
				title='Tạo đơn hàng mới'
				visible={isModalOpen}
				onOk={handleCreateOrder}
				onCancel={() => setIsModalOpen(false)}
				width={700}
			>
				<Form form={form} layout='vertical' onValuesChange={onFormValuesChange}>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='customerName' label='Tên khách hàng' rules={[{ required: true }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name='phone'
								label='Số điện thoại'
								rules={[{ required: true }, { pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ' }]}
							>
								<Input />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item name='address' label='Địa chỉ' rules={[{ required: true }]}>
						<Input />
					</Form.Item>

					<Form.List name='items' initialValue={[{}]}>
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
										<Form.Item
											{...restField}
											name={[name, 'productId']}
											rules={[{ required: true, message: 'Chọn SP' }]}
											style={{ width: 250 }}
										>
											<Select placeholder='Chọn sản phẩm'>
												{products
													.filter((p) => p.quantity > 0)
													.map((p) => (
														<Option key={p.id} value={p.id}>
															{p.name} (Tồn: {p.quantity}, Giá: {p.price.toLocaleString()})
														</Option>
													))}
											</Select>
										</Form.Item>
										<Form.Item
											{...restField}
											name={[name, 'quantity']}
											rules={[{ required: true, message: 'Nhập SL' }]}
											dependencies={['items', name, 'productId']}
										>
											<InputNumber placeholder='SL' min={1} />
										</Form.Item>
										<MinusCircleOutlined onClick={() => remove(name)} />
									</Space>
								))}
								<Form.Item>
									<Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
										Thêm sản phẩm
									</Button>
								</Form.Item>
							</>
						)}
					</Form.List>

					<div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 16 }}>
						Tổng tiền: {currentTotal.toLocaleString()} VNĐ
					</div>
				</Form>
			</Modal>

			<Modal title='Chi tiết đơn hàng' visible={!!detailOrder} onCancel={() => setDetailOrder(null)} footer={null}>
				{detailOrder && (
					<div>
						<p>
							<strong>Khách hàng:</strong> {detailOrder.customerName}
						</p>
						<p>
							<strong>SĐT:</strong> {detailOrder.phone}
						</p>
						<p>
							<strong>Địa chỉ:</strong> {detailOrder.address}
						</p>
						<Table
							dataSource={detailOrder.products}
							rowKey='productId'
							pagination={false}
							size='small'
							columns={[
								{ title: 'Sản phẩm', dataIndex: 'productName' },
								{ title: 'SL', dataIndex: 'quantity' },
								{ title: 'Giá', dataIndex: 'price', render: (v) => v.toLocaleString() },
								{ title: 'Thành tiền', render: (_, r) => (r.price * r.quantity).toLocaleString() },
							]}
						/>
						<h3 style={{ marginTop: 16, textAlign: 'right' }}>Tổng: {detailOrder.totalAmount.toLocaleString()} VNĐ</h3>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default OrderTab;
