import { useState } from 'react';
import { Card, Form, Input, Button, Table, message, Row, Col, DatePicker, Modal, Descriptions } from 'antd';
import { useModel } from 'umi';

export default function TraCuu() {
	const [form] = Form.useForm();
	const { vanBangList, quyetDinhList, soVanBangList, cauHinhList, tangLuotTraCuu } = useModel('quanLyVanBang');
	const [ketQua, setKetQua] = useState<any[]>([]);
	const [visibleDetail, setVisibleDetail] = useState(false);
	const [selected, setSelected] = useState<any>();

	const soVanBangById = new Map(soVanBangList.map((so: any) => [so.id, so]));
	const quyetDinhById = new Map(quyetDinhList.map((qd: any) => [qd.id, qd]));

	const isFilled = (val: any) => {
		if (val === null || val === undefined) return false;
		if (typeof val === 'string') return val.trim().length > 0;
		return true;
	};

	const openDetail = (record: any) => {
		setSelected(record);
		setVisibleDetail(true);
		tangLuotTraCuu?.(record?.quyetDinhId);
	};

	const handleSearch = (values: any) => {
		// Lọc các giá trị thực sự được nhập
		const validParams = Object.keys(values).filter((key) => isFilled(values[key]));

		if (validParams.length < 2) {
			message.error('Vui lòng nhập ít nhất 2 tham số để tra cứu!');
			return;
		}

		const normalizedValues: any = { ...values };
		if (normalizedValues.ngaySinh && typeof normalizedValues.ngaySinh.format === 'function') {
			normalizedValues.ngaySinh = normalizedValues.ngaySinh.format('DD/MM/YYYY');
		}

		const result = vanBangList.filter((vb) => {
			return validParams.every((key) => {
				if (key === 'ngaySinh') {
					return String(vb?.ngaySinh || '') === String(normalizedValues.ngaySinh || '');
				}
				return String(vb?.[key] || '')
					.toLowerCase()
					.includes(String(normalizedValues[key]).toLowerCase());
			});
		});

		setKetQua(result);
		if (result.length === 0) message.info('Không tìm thấy văn bằng nào khớp.');
	};

	return (
		<Card title='Tra cứu văn bằng'>
			<Form form={form} layout='vertical' onFinish={handleSearch}>
				<Row gutter={16}>
					<Col span={8}>
						<Form.Item name='soHieu' label='Số hiệu văn bằng'>
							<Input />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item name='soVaoSo' label='Số vào sổ'>
							<Input />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item name='maSV' label='Mã SV'>
							<Input />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item name='hoTen' label='Họ tên'>
							<Input />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item name='ngaySinh' label='Ngày sinh'>
							<DatePicker format='DD/MM/YYYY' style={{ width: '100%' }} />
						</Form.Item>
					</Col>
				</Row>
				<Button type='primary' htmlType='submit'>
					Tra cứu
				</Button>
				<Button
					style={{ marginLeft: 8 }}
					onClick={() => {
						form.resetFields();
						setKetQua([]);
					}}
				>
					Làm mới
				</Button>
			</Form>

			<Table
				dataSource={ketQua}
				rowKey='id'
				style={{ marginTop: 20 }}
				columns={[
					{ title: 'Số vào sổ', dataIndex: 'soVaoSo', key: 'soVaoSo' },
					{ title: 'Số hiệu VB', dataIndex: 'soHieu', key: 'soHieu' },
					{ title: 'Mã SV', dataIndex: 'maSV', key: 'maSV' },
					{ title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
					{ title: 'Ngày sinh', dataIndex: 'ngaySinh', key: 'ngaySinh' },
					{
						title: 'Chi tiết',
						key: 'detail',
						render: (_, record: any) => (
							<Button type='link' onClick={() => openDetail(record)}>
								Xem
							</Button>
						),
					},
				]}
				locale={{ emptyText: 'Vui lòng nhập thông tin và tra cứu' }}
			/>

			<Modal
				title='Chi tiết văn bằng'
				visible={visibleDetail}
				onCancel={() => {
					setVisibleDetail(false);
					setSelected(undefined);
				}}
				footer={null}
				width={800}
				destroyOnClose
			>
				{(() => {
					const vb = selected;
					if (!vb) return null;
					const qd = quyetDinhById.get(vb.quyetDinhId);
					const so = soVanBangById.get(qd?.soVanBangId);
					return (
						<>
							<Descriptions column={1} size='small' bordered>
								<Descriptions.Item label='Số vào sổ'>{vb.soVaoSo}</Descriptions.Item>
								<Descriptions.Item label='Số hiệu văn bằng'>{vb.soHieu}</Descriptions.Item>
								<Descriptions.Item label='Mã sinh viên'>{vb.maSV}</Descriptions.Item>
								<Descriptions.Item label='Họ tên'>{vb.hoTen}</Descriptions.Item>
								<Descriptions.Item label='Ngày sinh'>{vb.ngaySinh || '—'}</Descriptions.Item>
								<Descriptions.Item label='Quyết định'>
									{qd ? `${qd.soQD} - ${qd.trichYeu} (${qd.ngayBanHanh})` : '—'}
								</Descriptions.Item>
								<Descriptions.Item label='Sổ văn bằng'>{so ? `${so.tenSo} (${so.nam})` : '—'}</Descriptions.Item>
							</Descriptions>
							{cauHinhList?.length ? (
								<Descriptions style={{ marginTop: 16 }} column={1} size='small' bordered>
									{cauHinhList.map((cfg: any) => (
										<Descriptions.Item key={cfg.fieldCode} label={cfg.fieldName}>
											{vb?.dynamic_fields?.[cfg.fieldCode] ?? '—'}
										</Descriptions.Item>
									))}
								</Descriptions>
							) : null}
						</>
					);
				})()}
			</Modal>
		</Card>
	);
}
