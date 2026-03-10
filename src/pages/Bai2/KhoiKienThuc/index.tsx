import { Button, Form, Input, Modal, Popconfirm, Space, Table, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import { useModel } from 'umi';
import type { KhoiKienThuc } from '@/models/bai2/khoiKienThuc';

const KhoiKienThucPage: React.FC = () => {
	const { danhSach, themMoi, capNhat, xoa } = useModel('bai2.khoiKienThuc');
	const [visible, setVisible] = useState(false);
	const [editing, setEditing] = useState<KhoiKienThuc | null>(null);
	const [form] = Form.useForm<{ ten: string }>();

	const openCreate = () => {
		setEditing(null);
		form.resetFields();
		setVisible(true);
	};

	const openEdit = (record: KhoiKienThuc) => {
		setEditing(record);
		form.setFieldsValue({ ten: record.ten });
		setVisible(true);
	};

	const onSubmit = async () => {
		const values = await form.validateFields();
		if (!values.ten?.trim()) {
			message.error('Vui lòng nhập tên khối kiến thức');
			return;
		}
		if (editing) await capNhat(editing.id, values);
		else await themMoi(values);
		setVisible(false);
	};

	const columns = useMemo(
		() => [
			{
				title: 'STT',
				width: 80,
				render: (_: any, __: KhoiKienThuc, index: number) => index + 1,
			},
			{
				title: 'Tên khối kiến thức',
				dataIndex: 'ten',
			},
			{
				title: 'Thao tác',
				width: 220,
				render: (_: any, record: KhoiKienThuc) => (
					<Space>
						<Button onClick={() => openEdit(record)}>Sửa</Button>
						<Popconfirm title='Xóa khối kiến thức này?' onConfirm={() => xoa(record.id)}>
							<Button danger>Xóa</Button>
						</Popconfirm>
					</Space>
				),
			},
		],
		[danhSach],
	);

	return (
		<div>
			<Typography.Title level={2}>Danh mục khối kiến thức</Typography.Title>
			<Button type='primary' onClick={openCreate}>
				Thêm khối kiến thức
			</Button>

			<Table<KhoiKienThuc>
				style={{ marginTop: 16 }}
				rowKey='id'
				dataSource={danhSach}
				columns={columns as any}
				pagination={false}
				locale={{ emptyText: 'Chưa có dữ liệu' }}
			/>

			<Modal
				destroyOnClose
				visible={visible}
				title={editing ? 'Cập nhật khối kiến thức' : 'Thêm khối kiến thức'}
				onCancel={() => setVisible(false)}
				onOk={onSubmit}
				okText='Lưu'
				cancelText='Hủy'
			>
				<Form form={form} layout='vertical'>
					<Form.Item name='ten' label='Tên khối kiến thức' rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
						<Input placeholder='VD: Tổng quan, Chuyên sâu...' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default KhoiKienThucPage;
