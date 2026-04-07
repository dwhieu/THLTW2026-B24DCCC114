import { Card, Col, Form, InputNumber, Modal, Rate, Row, Select, Slider, Space, Tag, Typography, Button } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import { tienVietNam } from '@/utils/utils';

const { Text } = Typography;

const typeLabel: Record<Travel.DestinationType, string> = {
	beach: 'Biển',
	mountain: 'Núi',
	city: 'Thành phố',
};

type SortKey = 'rating_desc' | 'price_asc' | 'price_desc';

const Explore = () => {
	const travel = useModel('travel');
	useEffect(() => {
		travel.bootstrap();
	}, []);

	const [type, setType] = useState<Travel.DestinationType | 'all'>('all');
	const [maxPrice, setMaxPrice] = useState<number>(3000000);
	const [minRating, setMinRating] = useState<number>(0);
	const [sortKey, setSortKey] = useState<SortKey>('rating_desc');

	const [addModalOpen, setAddModalOpen] = useState(false);
	const [selectedDestination, setSelectedDestination] = useState<Travel.Destination | undefined>(undefined);
	const [form] = Form.useForm<{ dayId: string }>();

	const itinerary = travel.itinerary;

	const data = useMemo(() => {
		const filtered = travel.destinations
			.filter((d) => (type === 'all' ? true : d.type === type))
			.filter((d) => d.price <= maxPrice)
			.filter((d) => d.rating >= minRating);

		const sorted = [...filtered];
		sorted.sort((a, b) => {
			if (sortKey === 'rating_desc') return b.rating - a.rating;
			if (sortKey === 'price_asc') return a.price - b.price;
			return b.price - a.price;
		});

		return sorted;
	}, [travel.destinations, type, maxPrice, minRating, sortKey]);

	const openAdd = (destination: Travel.Destination) => {
		setSelectedDestination(destination);
		setAddModalOpen(true);
		const defaultDayId = itinerary?.days?.[0]?.id;
		form.setFieldsValue({ dayId: defaultDayId });
	};

	const submitAdd = async () => {
		const { dayId } = await form.validateFields();
		if (!selectedDestination) return;
		travel.addDestinationToDay(dayId, selectedDestination.id);
		setAddModalOpen(false);
		setSelectedDestination(undefined);
	};

	return (
		<div>
			<Card>
				<Space direction='vertical' style={{ width: '100%' }} size={12}>
					<Space wrap>
						<Text strong>Loại hình</Text>
						<Select
							style={{ minWidth: 160 }}
							value={type}
							onChange={(v) => setType(v)}
							options={[
								{ value: 'all', label: 'Tất cả' },
								{ value: 'beach', label: 'Biển' },
								{ value: 'mountain', label: 'Núi' },
								{ value: 'city', label: 'Thành phố' },
							]}
						/>

						<Text strong>Giá tối đa</Text>
						<Space>
							<Slider
								style={{ width: 220 }}
								min={0}
								max={5000000}
								step={50000}
								value={maxPrice}
								onChange={(v) => setMaxPrice(v as number)}
							/>
							<InputNumber
								min={0}
								max={5000000}
								step={50000}
								value={maxPrice}
								onChange={(v) => setMaxPrice(v ?? 0)}
								formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
							/>
						</Space>

						<Text strong>Đánh giá từ</Text>
						<Rate allowHalf value={minRating} onChange={setMinRating} />

						<Text strong>Sắp xếp</Text>
						<Select
							style={{ minWidth: 180 }}
							value={sortKey}
							onChange={(v) => setSortKey(v)}
							options={[
								{ value: 'rating_desc', label: 'Rating giảm dần' },
								{ value: 'price_asc', label: 'Giá tăng dần' },
								{ value: 'price_desc', label: 'Giá giảm dần' },
							]}
						/>
					</Space>

					<Text type='secondary'>Tìm thấy {data.length} điểm đến</Text>
				</Space>
			</Card>

			<Row gutter={[12, 12]} style={{ marginTop: 12 }}>
				{data.map((d) => (
					<Col key={d.id} xs={24} sm={12} md={8} lg={6} xxl={6}>
						<Card
							hoverable
							cover={
								<img
									alt={d.name}
									src={d.imageUrl || '/logo.png'}
									style={{ width: '100%', height: 160, objectFit: 'cover' }}
									onError={(e) => {
										(e.currentTarget as HTMLImageElement).src = '/logo.png';
									}}
								/>
							}
							actions={[
								<Button key='add' type='link' disabled={!itinerary?.days?.length} onClick={() => openAdd(d)}>
									Thêm vào lịch trình
								</Button>,
							]}
						>
							<Space direction='vertical' style={{ width: '100%' }} size={6}>
								<Space style={{ justifyContent: 'space-between', width: '100%' }}>
									<Text strong>{d.name}</Text>
									<Tag>{typeLabel[d.type]}</Tag>
								</Space>
								<Text type='secondary'>{d.location}</Text>
								<Space>
									<Rate allowHalf disabled value={d.rating} />
									<Text>({d.rating.toFixed(1)})</Text>
								</Space>
								<Text>Giá tham khảo: {tienVietNam(d.price)}</Text>
							</Space>
						</Card>
					</Col>
				))}
			</Row>

			<Modal
				destroyOnClose
				visible={addModalOpen}
				title='Thêm điểm đến vào lịch trình'
				onCancel={() => {
					setAddModalOpen(false);
					setSelectedDestination(undefined);
				}}
				onOk={submitAdd}
				okText='Thêm'
				cancelText='Huỷ'
			>
				<Space direction='vertical' style={{ width: '100%' }}>
					<Text>
						Điểm đến: <Text strong>{selectedDestination?.name}</Text>
					</Text>
					<Form form={form} layout='vertical'>
						<Form.Item name='dayId' label='Chọn ngày' rules={[{ required: true, message: 'Chọn ngày' }]}>
							<Select
								placeholder='Chọn ngày'
								options={(itinerary?.days ?? []).map((day) => ({
									value: day.id,
									label: day.label,
								}))}
							/>
						</Form.Item>
					</Form>
				</Space>
			</Modal>
		</div>
	);
};

export default Explore;
