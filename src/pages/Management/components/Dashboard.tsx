import React from 'react';
import { Card, Col, Row, Statistic, Progress } from 'antd';
import type { Product, Order } from '@/models/useAppModel';

interface Props {
	products: Product[];
	orders: Order[];
}

const Dashboard: React.FC<Props> = ({ products, orders }) => {
	const totalStockValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
	const revenue = orders.filter((o) => o.status === 'Hoàn thành').reduce((sum, o) => sum + o.totalAmount, 0);

	const statusCounts = {
		pending: orders.filter((o) => o.status === 'Chờ xử lý').length,
		shipping: orders.filter((o) => o.status === 'Đang giao').length,
		completed: orders.filter((o) => o.status === 'Hoàn thành').length,
		cancelled: orders.filter((o) => o.status === 'Đã hủy').length,
	};

	return (
		<Row gutter={16}>
			<Col span={6}>
				<Card bordered={false}>
					<Statistic title='Tổng sản phẩm' value={products.length} />
				</Card>
			</Col>
			<Col span={6}>
				<Card bordered={false}>
					<Statistic
						title='Giá trị tồn kho'
						value={totalStockValue}
						suffix='VNĐ'
						formatter={(val) => val.toLocaleString()}
					/>
				</Card>
			</Col>
			<Col span={6}>
				<Card bordered={false}>
					<Statistic title='Tổng đơn hàng' value={orders.length} />
				</Card>
			</Col>
			<Col span={6}>
				<Card bordered={false}>
					<Statistic
						title='Doanh thu thực tế'
						value={revenue}
						valueStyle={{ color: '#3f8600' }}
						suffix='VNĐ'
						formatter={(val) => val.toLocaleString()}
					/>
				</Card>
			</Col>
			<Col span={24} style={{ marginTop: 16 }}>
				<Card title='Tỉ lệ đơn hàng' size='small'>
					<div style={{ display: 'flex', gap: 20 }}>
						<div>Chờ xử lý: {statusCounts.pending}</div>
						<div>Đang giao: {statusCounts.shipping}</div>
						<div>Hoàn thành: {statusCounts.completed}</div>
					</div>
					<Progress percent={(statusCounts.completed / (orders.length || 1)) * 100} status='active' />
				</Card>
			</Col>
		</Row>
	);
};

export default Dashboard;
