import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import { useModel } from 'umi';
import type { MonHoc } from '@/models/bai2/monHoc';

type FormValues = { maMon: string; tenMon: string; soTinChi: number };

const MonHocPage: React.FC = () => {
	const { danhSach, themMoi, capNhat, xoa } = useModel('bai2.monHoc');
	const [visible, setVisible] = useState(false);
	const [editing, setEditing] = useState<MonHoc | null>(null);
	const [form] = Form.useForm<FormValues>();

	const openCreate = () => {
		setEditing(null);
		form.resetFields();
		setVisible(true);
	};

	const openEdit = (record: MonHoc) => {
		setEditing(record);
		form.setFieldsValue({ maMon: record.maMon, tenMon: record.tenMon, soTinChi: record.soTinChi });
		setVisible(true);
	};

	const onSubmit = async () => {
		const values = await form.validateFields();
		if (!values.maMon?.trim() || !values.tenMon?.trim()) {
			message.error('Vui lòng nhập đầy đủ thông tin môn học');
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
				render: (_: any, __: MonHoc, index: number) => index + 1,
			},
			{ title: 'Mã môn', dataIndex: 'maMon', width: 160 },
			{ title: 'Tên môn', dataIndex: 'tenMon' },
			{ title: 'Số tín chỉ', dataIndex: 'soTinChi', width: 120 },
			{
				title: 'Thao tác',
				width: 220,
				render: (_: any, record: MonHoc) => (
					<Space>
						<Button onClick={() => openEdit(record)}>Sửa</Button>
						<Popconfirm title='Xóa môn học này?' onConfirm={() => xoa(record.id)}>
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
			<Typography.Title level={2}>Danh mục môn học</Typography.Title>
			<Button type='primary' onClick={openCreate}>
				Thêm môn học
			</Button>

			<Table<MonHoc>
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
				title={editing ? 'Cập nhật môn học' : 'Thêm môn học'}
				onCancel={() => setVisible(false)}
				onOk={onSubmit}
				okText='Lưu'
				cancelText='Hủy'
			>
				<Form form={form} layout='vertical'>
					<Form.Item name='maMon' label='Mã môn' rules={[{ required: true, message: 'Vui lòng nhập mã môn' }]}>
						<Input placeholder='VD: INT123' />
					</Form.Item>
					<Form.Item name='tenMon' label='Tên môn' rules={[{ required: true, message: 'Vui lòng nhập tên môn' }]}>
						<Input placeholder='VD: Lập trình Web' />
					</Form.Item>
					<Form.Item
						name='soTinChi'
						label='Số tín chỉ'
						rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ' }]}
						initialValue={3}
					>
						<InputNumber min={1} max={20} style={{ width: '100%' }} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default MonHocPage;
