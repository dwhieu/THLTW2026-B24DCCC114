import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, message } from 'antd';
import { useModel } from 'umi';

export default function SoVanBang() {
	const { soVanBangList, themSoVanBang } = useModel('quanLyVanBang');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();

	const handleFinish = (values: any) => {
		const res = themSoVanBang(values);
		if (!res?.ok) {
			message.error(res?.message || 'Không thể tạo sổ văn bằng.');
			return;
		}
		message.success('Đã mở sổ văn bằng mới.');
		setIsModalOpen(false);
		form.resetFields();
	};

	return (
		<Card title='Quản lý Sổ văn bằng'>
			<Button type='primary' onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>
				Mở sổ mới
			</Button>
			<Table
				dataSource={soVanBangList}
				rowKey='id'
				columns={[
					{ title: 'Năm', dataIndex: 'nam', key: 'nam' },
					{ title: 'Tên Sổ', dataIndex: 'tenSo', key: 'tenSo' },
				]}
			/>
			<Modal
				title='Mở Sổ Văn Bằng Mới'
				visible={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onOk={() => form.submit()}
			>
				<Form form={form} layout='vertical' onFinish={handleFinish}>
					<Form.Item name='nam' label='Năm' rules={[{ required: true }]}>
						<Input type='number' />
					</Form.Item>
					<Form.Item name='tenSo' label='Tên sổ' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
}
