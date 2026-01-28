import React from 'react';
import { Tabs } from 'antd';
import { useModel } from 'umi';
import Dashboard from './components/Dashboard';
import ProductTab from './components/ProductTab';
import OrderTab from './components/OrderTab';

const ManagementPage: React.FC = () => {
	const { products, orders } = useModel('useAppModel');

	return (
		<div style={{ padding: 24 }}>
			<h2>Hệ thống Quản lý Bán hàng</h2>

			<Dashboard products={products} orders={orders} />

			<div style={{ marginTop: 24, background: '#fff', padding: 24 }}>
				<Tabs defaultActiveKey='1'>
					<Tabs.TabPane key='1' tab='Quản lý Sản phẩm'>
						<ProductTab />
					</Tabs.TabPane>
					<Tabs.TabPane key='2' tab='Quản lý Đơn hàng'>
						<OrderTab />
					</Tabs.TabPane>
				</Tabs>
			</div>
		</div>
	);
};

export default ManagementPage;
