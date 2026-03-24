import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker } from 'antd';
import { useModel } from 'umi';

export default function QuyetDinh() {
	const { quyetDinhList, themQuyetDinh, soVanBangList, luotTraCuuTheoQuyetDinh } = useModel('quanLyVanBang');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();

	const soVanBangById = new Map(soVanBangList.map((so) => [so.id, so]));

	const handleFinish = (values: any) => {
		themQuyetDinh({ ...values, ngayBanHanh: values.ngayBanHanh.format('DD/MM/YYYY') });
		setIsModalOpen(false);
		form.resetFields();
	};

	return (
		<Card title='Quản lý Quyết định tốt nghiệp'>
			<Button type='primary' onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>
				Thêm Quyết định
			</Button>
			<Table
				dataSource={quyetDinhList}
				rowKey='id'
				columns={[
					{
						title: 'Sổ văn bằng',
						key: 'soVanBang',
						render: (_, record: any) => {
							const so = soVanBangById.get(record.soVanBangId);
							if (!so) return '—';
							return `${so.tenSo} (${so.nam})`;
						},
					},
					{ title: 'Số QĐ', dataIndex: 'soQD', key: 'soQD' },
					{ title: 'Ngày ban hành', dataIndex: 'ngayBanHanh', key: 'ngayBanHanh' },
					{ title: 'Trích yếu', dataIndex: 'trichYeu', key: 'trichYeu' },
					{
						title: 'Lượt tra cứu',
						key: 'luotTraCuu',
						render: (_, record: any) => luotTraCuuTheoQuyetDinh?.[record.id] ?? 0,
					},
				]}
			/>
			<Modal
				title='Thêm Quyết Định'
				visible={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onOk={() => form.submit()}
			>
				<Form form={form} layout='vertical' onFinish={handleFinish}>
					<Form.Item name='soVanBangId' label='Thuộc sổ văn bằng' rules={[{ required: true }]}>
						<Select>
							{soVanBangList.map((so) => (
								<Select.Option key={so.id} value={so.id}>
									{so.tenSo} ({so.nam})
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='soQD' label='Số Quyết định' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='ngayBanHanh' label='Ngày ban hành' rules={[{ required: true }]}>
						<DatePicker format='DD/MM/YYYY' style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item name='trichYeu' label='Trích yếu'>
						<Input.TextArea />
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
}
