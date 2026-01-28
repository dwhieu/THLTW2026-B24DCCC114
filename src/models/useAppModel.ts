import { useState, useEffect } from 'react';
import { message } from 'antd';

// Interfaces
export interface Product {
	id: number;
	name: string;
	category: string;
	price: number;
	quantity: number;
}

export interface OrderItem {
	productId: number;
	productName: string;
	quantity: number;
	price: number;
}

export interface Order {
	id: string;
	customerName: string;
	phone: string;
	address: string;
	products: OrderItem[];
	totalAmount: number;
	status: 'Chờ xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';
	createdAt: string;
}

// Dữ liệu mẫu
const initProducts: Product[] = [
	{ id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
	{ id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
	{ id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
	{ id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
	{ id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
	{ id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
	{ id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
	{ id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

const initOrders: Order[] = [
	{
		id: 'DH001',
		customerName: 'Nguyễn Văn A',
		phone: '0912345678',
		address: '123 Nguyễn Huệ, Q1, TP.HCM',
		products: [{ productId: 1, productName: 'Laptop Dell XPS 13', quantity: 1, price: 25000000 }],
		totalAmount: 25000000,
		status: 'Chờ xử lý',
		createdAt: '2024-01-15',
	},
];

export default function useAppModel() {
	// State
	const [products, setProducts] = useState<Product[]>(() => {
		const saved = localStorage.getItem('products');
		return saved ? JSON.parse(saved) : initProducts;
	});

	const [orders, setOrders] = useState<Order[]>(() => {
		const saved = localStorage.getItem('orders');
		return saved ? JSON.parse(saved) : initOrders;
	});

	// Persist Data
	useEffect(() => {
		localStorage.setItem('products', JSON.stringify(products));
	}, [products]);

	useEffect(() => {
		localStorage.setItem('orders', JSON.stringify(orders));
	}, [orders]);

	// Actions Sản phẩm
	const updateProduct = (updatedProduct: Product) => {
		setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
		message.success('Cập nhật sản phẩm thành công!');
	};

	// Actions Đơn hàng
	const createOrder = (newOrder: Order) => {
		setOrders((prev) => [newOrder, ...prev]);
		message.success('Tạo đơn hàng thành công!');
	};

	const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
		const currentOrder = orders.find((o) => o.id === orderId);
		if (!currentOrder) return;
		const oldStatus = currentOrder.status;

		// Logic kho hàng
		let newProducts = [...products];

		// Nếu chuyển sang Hoàn thành -> Trừ kho
		if (newStatus === 'Hoàn thành' && oldStatus !== 'Hoàn thành') {
			let canComplete = true;
			const tempProducts = [...newProducts]; // Copy tạm để check

			currentOrder.products.forEach((item) => {
				const prodIndex = tempProducts.findIndex((p) => p.id === item.productId);
				if (prodIndex > -1) {
					if (tempProducts[prodIndex].quantity < item.quantity) {
						canComplete = false;
						message.error(`Sản phẩm ${item.productName} không đủ tồn kho!`);
					} else {
						tempProducts[prodIndex] = {
							...tempProducts[prodIndex],
							quantity: tempProducts[prodIndex].quantity - item.quantity,
						};
					}
				}
			});

			if (!canComplete) return; // Dừng nếu không đủ kho
			newProducts = tempProducts; // Apply thay đổi
		}

		// Nếu chuyển từ Hoàn thành sang Đã hủy -> Cộng lại kho (Hoàn kho)
		if (oldStatus === 'Hoàn thành' && newStatus === 'Đã hủy') {
			currentOrder.products.forEach((item) => {
				const prodIndex = newProducts.findIndex((p) => p.id === item.productId);
				if (prodIndex > -1) {
					newProducts[prodIndex] = {
						...newProducts[prodIndex],
						quantity: newProducts[prodIndex].quantity + item.quantity,
					};
				}
			});
		}

		setProducts(newProducts);
		setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
		message.success(`Đã cập nhật trạng thái: ${newStatus}`);
	};

	return { products, orders, updateProduct, createOrder, updateOrderStatus };
}
