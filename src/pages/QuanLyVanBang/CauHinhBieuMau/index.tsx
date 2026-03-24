import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { useModel } from 'umi';

export default function CauHinhBieuMau() {
	const { cauHinhList, themCauHinh, suaCauHinh, xoaCauHinh } = useModel('quanLyVanBang');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editing, setEditing] = useState<any | undefined>();
	const [form] = Form.useForm();

	const handleFinish = (values: any) => {
		if (editing?.id) {
			const res = suaCauHinh(editing.id, values);
			if (!res?.ok) {
				message.error(res?.message || 'Không thể cập nhật cấu hình.');
				return;
			}
			message.success('Đã cập nhật cấu hình.');
		} else {
			const res = themCauHinh(values);
			if (!res?.ok) {
				message.error(res?.message || 'Không thể thêm cấu hình.');
				return;
			}
			message.success('Đã thêm cấu hình.');
		}
		setIsModalOpen(false);
		setEditing(undefined);
		form.resetFields();
	};

	const openAdd = () => {
		setEditing(undefined);
		form.resetFields();
		setIsModalOpen(true);
	};

	const openEdit = (record: any) => {
		setEditing(record);
		form.setFieldsValue(record);
		setIsModalOpen(true);
	};

	return (
		<Card title='Cấu hình trường thông tin văn bằng'>
			<Button type='primary' onClick={openAdd} style={{ marginBottom: 16 }}>
				Thêm trường
			</Button>
			<Table
				dataSource={cauHinhList}
				rowKey='id'
				columns={[
					{ title: 'Mã trường', dataIndex: 'fieldCode', key: 'fieldCode' },
					{ title: 'Tên hiển thị', dataIndex: 'fieldName', key: 'fieldName' },
					{ title: 'Kiểu dữ liệu', dataIndex: 'dataType', key: 'dataType' },
					{
						title: 'Thao tác',
						render: (_, record: any) => (
							<>
								<Button type='link' onClick={() => openEdit(record)}>
									Sửa
								</Button>
								<Button type='link' danger onClick={() => xoaCauHinh(record.id)}>
									Xóa
								</Button>
							</>
						),
					},
				]}
			/>
			<Modal
				title={editing?.id ? 'Cập nhật cấu hình' : 'Thêm cấu hình'}
				visible={isModalOpen}
				onCancel={() => {
					setIsModalOpen(false);
					setEditing(undefined);
					form.resetFields();
				}}
				onOk={() => form.submit()}
			>
				<Form form={form} layout='vertical' onFinish={handleFinish}>
					<Form.Item name='fieldCode' label='Mã trường (viết liền không dấu)' rules={[{ required: true }]}>
						<Input disabled={!!editing?.id} />
					</Form.Item>
					<Form.Item name='fieldName' label='Tên hiển thị' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='dataType' label='Kiểu dữ liệu' rules={[{ required: true }]}>
						<Select>
							<Select.Option value='String'>String</Select.Option>
							<Select.Option value='Number'>Number</Select.Option>
							<Select.Option value='Date'>Date</Select.Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
}
