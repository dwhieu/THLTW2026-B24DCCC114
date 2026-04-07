import { Button, Card, Col, Divider, Input, List, Popconfirm, Row, Select, Space, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { tienVietNam } from '@/utils/utils';
import { haversineKm } from '@/services/Travel/calc';

const { Text } = Typography;

const ItineraryPage = () => {
	const travel = useModel('travel');
	useEffect(() => {
		travel.bootstrap();
	}, []);

	const itinerary = travel.itinerary;
	const [addSelection, setAddSelection] = useState<Record<string, string | undefined>>({});

	const destinationMap = useMemo(
		() => new Map(travel.destinations.map((d) => [d.id, d] as const)),
		[travel.destinations],
	);

	const totals = travel.getTotals();

	const daySummaries = useMemo(() => {
		if (!itinerary) return [];
		const avgSpeedKmh = 55;

		return itinerary.days.map((day) => {
			const dayDests = day.stops
				.map((s) => destinationMap.get(s.destinationId))
				.filter(Boolean) as Travel.Destination[];
			let dayKm = 0;
			let dayTravelHours = 0;
			let dayVisitHours = 0;
			const budget = { food: 0, lodging: 0, transport: 0, tickets: 0, total: 0 };

			for (const d of dayDests) {
				dayVisitHours += d.visitDurationHours;
				budget.food += d.costs.food;
				budget.lodging += d.costs.lodging;
				budget.transport += d.costs.transport;
				budget.tickets += d.costs.tickets;
			}
			for (let i = 0; i < dayDests.length - 1; i += 1) {
				const from = dayDests[i];
				const to = dayDests[i + 1];
				const km = haversineKm({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng });
				dayKm += km;
				dayTravelHours += km / avgSpeedKmh;
			}
			budget.total = budget.food + budget.lodging + budget.transport + budget.tickets;

			return { dayId: day.id, dayKm, dayTravelHours, dayVisitHours, budget };
		});
	}, [itinerary, destinationMap]);

	const addStop = (dayId: string) => {
		const destinationId = addSelection[dayId];
		if (!destinationId) return;
		travel.addDestinationToDay(dayId, destinationId);
		setAddSelection((prev) => ({ ...prev, [dayId]: undefined }));
	};

	if (!itinerary) return null;

	return (
		<Row gutter={[12, 12]}>
			<Col xs={24} lg={16}>
				<Card
					title='Tạo lịch trình du lịch'
					extra={
						<Space wrap>
							<Button icon={<PlusOutlined />} onClick={travel.addDay}>
								Thêm ngày
							</Button>
							<Button type='primary' icon={<SaveOutlined />} onClick={travel.saveItineraryRecord}>
								Lưu lịch trình
							</Button>
						</Space>
					}
				>
					<Space direction='vertical' style={{ width: '100%' }} size={12}>
						<Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
							<Space wrap>
								<Text strong>Tên lịch trình</Text>
								<Input
									style={{ minWidth: 260 }}
									value={itinerary.name}
									onChange={(e) => travel.renameItinerary(e.target.value)}
									placeholder='VD: Du lịch hè 2026'
								/>
							</Space>
						</Space>

						<Divider style={{ margin: '8px 0' }} />

						{itinerary.days.map((day) => {
							const summary = daySummaries.find((s) => s.dayId === day.id);
							return (
								<Card
									key={day.id}
									type='inner'
									title={day.label}
									extra={
										itinerary.days.length > 1 ? (
											<Popconfirm title='Xoá ngày này?' onConfirm={() => travel.removeDay(day.id)}>
												<Button danger type='link' icon={<DeleteOutlined />}>
													Xoá ngày
												</Button>
											</Popconfirm>
										) : null
									}
									style={{ marginBottom: 12 }}
								>
									<Space direction='vertical' style={{ width: '100%' }} size={10}>
										<Space wrap>
											<Select
												showSearch
												style={{ minWidth: 280 }}
												placeholder='Chọn điểm đến từ danh sách'
												optionFilterProp='label'
												value={addSelection[day.id]}
												onChange={(v) => setAddSelection((prev) => ({ ...prev, [day.id]: v }))}
												options={travel.destinations.map((d) => ({
													value: d.id,
													label: `${d.name} - ${d.location}`,
												}))}
											/>
											<Button
												type='primary'
												icon={<PlusOutlined />}
												disabled={!addSelection[day.id]}
												onClick={() => addStop(day.id)}
											>
												Thêm
											</Button>
										</Space>

										<List
											dataSource={day.stops}
											locale={{ emptyText: 'Chưa có điểm đến' }}
											renderItem={(stop, index) => {
												const d = destinationMap.get(stop.destinationId);
												if (!d) return null;
												return (
													<List.Item
														actions={[
															<Button
																key='up'
																type='link'
																disabled={index === 0}
																icon={<ArrowUpOutlined />}
																onClick={() => travel.moveStop(day.id, index, index - 1)}
															/>,
															<Button
																key='down'
																type='link'
																disabled={index === day.stops.length - 1}
																icon={<ArrowDownOutlined />}
																onClick={() => travel.moveStop(day.id, index, index + 1)}
															/>,
															<Popconfirm
																key='del'
																title='Xoá điểm đến này?'
																onConfirm={() => travel.removeStop(day.id, stop.id)}
															>
																<Button danger type='link' icon={<DeleteOutlined />} />
															</Popconfirm>,
														]}
													>
														<List.Item.Meta
															title={
																<Space wrap>
																	<Text strong>{d.name}</Text>
																	<Text type='secondary'>{d.location}</Text>
																</Space>
															}
															description={
																<Space wrap>
																	<Text type='secondary'>Tham quan: {d.visitDurationHours}h</Text>
																	<Text type='secondary'>
																		Chi:{' '}
																		{tienVietNam(d.costs.food + d.costs.lodging + d.costs.transport + d.costs.tickets)}
																	</Text>
																</Space>
															}
														/>
													</List.Item>
												);
											}}
										/>

										<Divider style={{ margin: '8px 0' }} />
										<Space wrap>
											<Text type='secondary'>
												Thời gian tham quan: {summary ? summary.dayVisitHours.toFixed(1) : '0'}h
											</Text>
											<Text type='secondary'>Di chuyển: {summary ? summary.dayTravelHours.toFixed(1) : '0'}h</Text>
											<Text type='secondary'>
												Ngân sách ngày: {summary ? tienVietNam(summary.budget.total) : tienVietNam(0)}
											</Text>
										</Space>
									</Space>
								</Card>
							);
						})}
					</Space>
				</Card>
			</Col>

			<Col xs={24} lg={8}>
				<Card title='Tổng quan'>
					<Space direction='vertical' style={{ width: '100%' }} size={10}>
						<Text>Ngân sách ước tính: {tienVietNam(totals?.budget.total ?? 0)}</Text>
						<Text type='secondary'>Ăn uống: {tienVietNam(totals?.budget.food ?? 0)}</Text>
						<Text type='secondary'>Lưu trú: {tienVietNam(totals?.budget.lodging ?? 0)}</Text>
						<Text type='secondary'>Di chuyển: {tienVietNam(totals?.budget.transport ?? 0)}</Text>
						<Text type='secondary'>Vé/Khác: {tienVietNam(totals?.budget.tickets ?? 0)}</Text>

						<Divider style={{ margin: '8px 0' }} />
						<Text>Thời gian tham quan: {(totals?.totalVisitHours ?? 0).toFixed(1)}h</Text>
						<Text>Quãng đường di chuyển: {(totals?.totalTravelKm ?? 0).toFixed(0)}km</Text>
						<Text>Thời gian di chuyển: {(totals?.totalTravelHours ?? 0).toFixed(1)}h</Text>
					</Space>
				</Card>
			</Col>
		</Row>
	);
};

export default ItineraryPage;
