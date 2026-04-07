import {
	Button,
	Card,
	Col,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Rate,
	Row,
	Select,
	Space,
	Table,
	Typography,
	Upload,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import ColumnChart from '@/components/Chart/ColumnChart';
import DonutChart from '@/components/Chart/DonutChart';
import { tienVietNam } from '@/utils/utils';
import moment from 'moment';

const { Text } = Typography;

const typeOptions = [
	{ value: 'beach', label: 'Biển' },
	{ value: 'mountain', label: 'Núi' },
	{ value: 'city', label: 'Thành phố' },
];

async function fileToBase64(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(new Error('read-file-failed'));
		reader.readAsDataURL(file);
	});
}

type DestinationFormValues = Omit<Travel.Destination, 'id'>;

const AdminPage = () => {
	const travel = useModel('travel');
	useEffect(() => {
		travel.bootstrap();
	}, []);

	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<Travel.Destination | undefined>(undefined);
	const [form] = Form.useForm<DestinationFormValues>();
	const watchedImageUrl = Form.useWatch('imageUrl', form);
	const previewImageUrl = (watchedImageUrl ? String(watchedImageUrl).trim() : '') || '/logo.png';

	const openCreate = () => {
		setEditing(undefined);
		form.resetFields();
		form.setFieldsValue({
			name: '',
			location: '',
			type: 'city',
			description: '',
			imageUrl: '/logo.png',
			rating: 4,
			price: 0,
			visitDurationHours: 2,
			lat: 0,
			lng: 0,
			costs: { food: 0, lodging: 0, transport: 0, tickets: 0 },
		});
		setModalOpen(true);
	};

	const openEdit = (d: Travel.Destination) => {
		setEditing(d);
		form.setFieldsValue({
			name: d.name,
			location: d.location,
			type: d.type,
			description: d.description,
			imageUrl: d.imageUrl,
			rating: d.rating,
			price: d.price,
			visitDurationHours: d.visitDurationHours,
			lat: d.lat,
			lng: d.lng,
			costs: d.costs,
		});
		setModalOpen(true);
	};

	const submit = async () => {
		const values = await form.validateFields();
		const payload: Omit<Travel.Destination, 'id'> = {
			...values,
			rating: Number(values.rating ?? 0),
			price: Number(values.price ?? 0),
			visitDurationHours: Number(values.visitDurationHours ?? 0),
			lat: Number(values.lat ?? 0),
			lng: Number(values.lng ?? 0),
			costs: {
				food: Number(values.costs?.food ?? 0),
				lodging: Number(values.costs?.lodging ?? 0),
				transport: Number(values.costs?.transport ?? 0),
				tickets: Number(values.costs?.tickets ?? 0),
			},
		};

		if (editing) travel.updateDestination(editing.id, payload);
		else travel.addDestination(payload);

		setModalOpen(false);
		setEditing(undefined);
	};

	const destinationMap = useMemo(
		() => new Map(travel.destinations.map((d) => [d.id, d] as const)),
		[travel.destinations],
	);

	const stats = useMemo(() => {
		const records = travel.records;
		const monthMap = new Map<string, number>();
		const destCount = new Map<string, number>();
		const budgetTotals = { food: 0, lodging: 0, transport: 0, tickets: 0, total: 0 };

		for (const r of records) {
			const month = moment(r.createdAt).format('MM/YYYY');
			monthMap.set(month, (monthMap.get(month) ?? 0) + 1);

			for (const id of r.destinationIds) destCount.set(id, (destCount.get(id) ?? 0) + 1);

			budgetTotals.food += r.totals.budget.food;
			budgetTotals.lodging += r.totals.budget.lodging;
			budgetTotals.transport += r.totals.budget.transport;
			budgetTotals.tickets += r.totals.budget.tickets;
			budgetTotals.total += r.totals.budget.total;
		}

		const months = Array.from(monthMap.keys()).sort(
			(a, b) => moment(a, 'MM/YYYY').toDate().getTime() - moment(b, 'MM/YYYY').toDate().getTime(),
		);
		const monthCounts = months.map((m) => monthMap.get(m) ?? 0);

		const popular = Array.from(destCount.entries())
			.map(([id, count]) => ({
				id,
				count,
				name: destinationMap.get(id)?.name ?? id,
				location: destinationMap.get(id)?.location ?? '',
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		return { months, monthCounts, popular, budgetTotals };
	}, [travel.records, destinationMap]);

	return (
		<Row gutter={[12, 12]}>
			<Col xs={24}>
				<Card
					title='Quản trị điểm đến'
					extra={
						<Button type='primary' icon={<PlusOutlined />} onClick={openCreate}>
							Thêm điểm đến
						</Button>
					}
				>
					<Table
						rowKey='id'
						dataSource={travel.destinations}
						pagination={{ pageSize: 8 }}
						scroll={{ x: 900 }}
						columns={[
							{
								title: 'Ảnh',
								dataIndex: 'imageUrl',
								width: 90,
								render: (v: string) => (
									<img
										alt='img'
										src={v || '/logo.png'}
										style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 4 }}
										onError={(e) => {
											(e.currentTarget as HTMLImageElement).src = '/logo.png';
										}}
									/>
								),
							},
							{ title: 'Tên', dataIndex: 'name', width: 220 },
							{ title: 'Địa điểm', dataIndex: 'location', width: 140 },
							{
								title: 'Loại',
								dataIndex: 'type',
								width: 120,
								render: (v: Travel.DestinationType) => typeOptions.find((o) => o.value === v)?.label ?? v,
							},
							{
								title: 'Rating',
								dataIndex: 'rating',
								width: 120,
								render: (v: number) => <Rate disabled allowHalf value={v} />,
							},
							{
								title: 'Giá',
								dataIndex: 'price',
								width: 140,
								render: (v: number) => tienVietNam(v),
							},
							{
								title: 'Thời gian (h)',
								dataIndex: 'visitDurationHours',
								width: 120,
							},
							{
								title: 'Hành động',
								key: 'action',
								width: 160,
								render: (_, d: Travel.Destination) => (
									<Space>
										<Button icon={<EditOutlined />} onClick={() => openEdit(d)} />
										<Popconfirm title='Xoá điểm đến này?' onConfirm={() => travel.deleteDestination(d.id)}>
											<Button danger icon={<DeleteOutlined />} />
										</Popconfirm>
									</Space>
								),
							},
						]}
					/>
				</Card>
			</Col>

			<Col xs={24} lg={12}>
				<Card title='Thống kê: Lịch trình theo tháng'>
					<ColumnChart
						xAxis={stats.months.length ? stats.months : ['(Chưa có dữ liệu)']}
						yLabel={['Số lượt tạo']}
						yAxis={[stats.months.length ? stats.monthCounts : [0]]}
						height={320}
						formatY={(v) => String(v)}
					/>
				</Card>
			</Col>

			<Col xs={24} lg={12}>
				<Card title='Thống kê: Số tiền theo hạng mục'>
					<DonutChart
						xAxis={['Ăn uống', 'Lưu trú', 'Di chuyển', 'Vé/Khác']}
						yAxis={[
							[
								stats.budgetTotals.food,
								stats.budgetTotals.lodging,
								stats.budgetTotals.transport,
								stats.budgetTotals.tickets,
							],
						]}
						yLabel={['Tổng chi']}
						showTotal
						formatY={tienVietNam}
					/>
					<Space direction='vertical' style={{ width: '100%', marginTop: 8 }}>
						<Text strong>Tổng chi: {tienVietNam(stats.budgetTotals.total)}</Text>
						<Text type='secondary'>(Tạm coi là “số tiền thu về” theo dữ liệu frontend)</Text>
					</Space>
				</Card>
			</Col>

			<Col xs={24}>
				<Card title='Địa điểm phổ biến (Top 10)'>
					<Table
						rowKey='id'
						dataSource={stats.popular}
						pagination={false}
						columns={[
							{ title: 'Điểm đến', dataIndex: 'name' },
							{ title: 'Địa điểm', dataIndex: 'location', width: 160 },
							{ title: 'Số lượt', dataIndex: 'count', width: 120 },
						]}
					/>
				</Card>
			</Col>

			<Modal
				destroyOnClose
				visible={modalOpen}
				title={editing ? 'Cập nhật điểm đến' : 'Thêm điểm đến'}
				onCancel={() => {
					setModalOpen(false);
					setEditing(undefined);
				}}
				onOk={submit}
				okText='Lưu'
				cancelText='Huỷ'
				width={760}
			>
				<Form form={form} layout='vertical'>
					<Row gutter={[12, 12]}>
						<Col xs={24} md={12}>
							<Form.Item name='name' label='Tên điểm đến' rules={[{ required: true, message: 'Nhập tên' }]}>
								<Input placeholder='VD: Bãi biển Mỹ Khê' />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item name='location' label='Địa điểm' rules={[{ required: true, message: 'Nhập địa điểm' }]}>
								<Input placeholder='VD: Đà Nẵng' />
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item name='type' label='Loại hình' rules={[{ required: true, message: 'Chọn loại' }]}>
								<Select options={typeOptions} />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item name='rating' label='Rating'>
								<Rate allowHalf />
							</Form.Item>
						</Col>

						<Col xs={24}>
							<Form.Item name='description' label='Mô tả'>
								<Input.TextArea rows={3} />
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item name='visitDurationHours' label='Thời gian tham quan (giờ)'>
								<InputNumber min={0} step={0.5} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item name='price' label='Giá tham khảo (VND)'>
								<InputNumber min={0} step={50000} style={{ width: '100%' }} />
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item name='lat' label='Vĩ độ (lat)'>
								<InputNumber style={{ width: '100%' }} />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item name='lng' label='Kinh độ (lng)'>
								<InputNumber style={{ width: '100%' }} />
							</Form.Item>
						</Col>

						<Col xs={24}>
							<Form.Item label='Hình ảnh'>
								<Space direction='vertical' style={{ width: '100%' }}>
									<Form.Item name='imageUrl' style={{ marginBottom: 0 }}>
										<Input allowClear placeholder='Dán link ảnh (https://...) hoặc dùng nút Chọn ảnh' />
									</Form.Item>
									<Upload
										accept='image/*'
										showUploadList={false}
										beforeUpload={async (file) => {
											const base64 = await fileToBase64(file as File);
											form.setFieldsValue({ imageUrl: base64 } as any);
											return false;
										}}
									>
										<Button icon={<UploadOutlined />}>Chọn ảnh</Button>
									</Upload>
									<img
										alt='preview'
										src={previewImageUrl}
										style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 6 }}
										onError={(e) => {
											(e.currentTarget as HTMLImageElement).src = '/logo.png';
										}}
									/>
								</Space>
							</Form.Item>
						</Col>

						<Col xs={24}>
							<Card type='inner' title='Chi phí theo hạng mục'>
								<Row gutter={[12, 12]}>
									<Col xs={24} sm={12} md={6}>
										<Form.Item name={['costs', 'food']} label='Ăn uống'>
											<InputNumber min={0} step={50000} style={{ width: '100%' }} />
										</Form.Item>
									</Col>
									<Col xs={24} sm={12} md={6}>
										<Form.Item name={['costs', 'lodging']} label='Lưu trú'>
											<InputNumber min={0} step={50000} style={{ width: '100%' }} />
										</Form.Item>
									</Col>
									<Col xs={24} sm={12} md={6}>
										<Form.Item name={['costs', 'transport']} label='Di chuyển'>
											<InputNumber min={0} step={50000} style={{ width: '100%' }} />
										</Form.Item>
									</Col>
									<Col xs={24} sm={12} md={6}>
										<Form.Item name={['costs', 'tickets']} label='Vé/Khác'>
											<InputNumber min={0} step={50000} style={{ width: '100%' }} />
										</Form.Item>
									</Col>
								</Row>
							</Card>
						</Col>
					</Row>
				</Form>
			</Modal>
		</Row>
	);
};

export default AdminPage;
