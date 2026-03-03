import React, { useMemo, useState } from 'react';
import {
	Button,
	Card,
	Col,
	DatePicker,
	Divider,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Progress,
	Row,
	Select,
	Space,
	Table,
	Tag,
	Tabs,
	Typography,
	message,
} from 'antd';
import moment from 'moment';
import type { Moment } from 'moment';

const { Title, Text } = Typography;
const { TextArea } = Input;

type Subject = {
	id: string;
	name: string;
	createdAt: string;
	updatedAt?: string;
};

type StudySession = {
	id: string;
	subjectId: string;
	startTime: string;
	durationMinutes: number;
	content: string;
	notes?: string;
	createdAt: string;
	updatedAt?: string;
};

type MonthlyGoal = {
	id: string;
	month: string;
	subjectId: string | null;
	targetMinutes: number;
	createdAt: string;
	updatedAt?: string;
};

const STORAGE_PREFIX = 'studyTracker.v1';
const LS_SUBJECTS = `${STORAGE_PREFIX}.subjects`;
const LS_SESSIONS = `${STORAGE_PREFIX}.sessions`;
const LS_GOALS = `${STORAGE_PREFIX}.goals`;

const DEFAULT_SUBJECTS: Subject[] = [
	{ id: 'math', name: 'Toán', createdAt: new Date().toISOString() },
	{ id: 'literature', name: 'Văn', createdAt: new Date().toISOString() },
	{ id: 'english', name: 'Anh', createdAt: new Date().toISOString() },
	{ id: 'science', name: 'Khoa học', createdAt: new Date().toISOString() },
	{ id: 'technology', name: 'Công nghệ', createdAt: new Date().toISOString() },
];

function safeJsonParse<T>(raw: string | null, fallback: T): T {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

function newId(): string {
	const anyCrypto = (globalThis as any).crypto;
	if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toMonthKey(value: Moment): string {
	return value.format('YYYY-MM');
}

function minutesToHM(totalMinutes: number): string {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours <= 0) return `${minutes} phút`;
	if (minutes <= 0) return `${hours} giờ`;
	return `${hours} giờ ${minutes} phút`;
}

function useLocalStorageState<T>(key: string, initial: T) {
	const [state, setState] = useState<T>(() => {
		const raw = localStorage.getItem(key);
		return safeJsonParse<T>(raw, initial);
	});

	const setAndPersist = (next: T | ((prev: T) => T)) => {
		setState((prev) => {
			const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
			localStorage.setItem(key, JSON.stringify(resolved));
			return resolved;
		});
	};

	return [state, setAndPersist] as const;
}

const TienDoHocTap: React.FC = () => {
	const [subjects, setSubjects] = useLocalStorageState<Subject[]>(LS_SUBJECTS, DEFAULT_SUBJECTS);
	const [sessions, setSessions] = useLocalStorageState<StudySession[]>(LS_SESSIONS, []);
	const [goals, setGoals] = useLocalStorageState<MonthlyGoal[]>(LS_GOALS, []);

	const subjectById = useMemo(() => {
		return new Map(subjects.map((s) => [s.id, s] as const));
	}, [subjects]);

	const [activeMonth, setActiveMonth] = useState<Moment>(moment());
	const activeMonthKey = useMemo(() => toMonthKey(activeMonth), [activeMonth]);

	const sessionsInActiveMonth = useMemo(() => {
		return sessions.filter((s) => moment(s.startTime).format('YYYY-MM') === activeMonthKey);
	}, [sessions, activeMonthKey]);

	const totalMinutesInActiveMonth = useMemo(() => {
		return sessionsInActiveMonth.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);
	}, [sessionsInActiveMonth]);

	const minutesBySubjectInActiveMonth = useMemo(() => {
		const map = new Map<string, number>();
		for (const s of sessionsInActiveMonth) {
			map.set(s.subjectId, (map.get(s.subjectId) || 0) + (Number(s.durationMinutes) || 0));
		}
		return map;
	}, [sessionsInActiveMonth]);

	const [subjectModalOpen, setSubjectModalOpen] = useState(false);
	const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
	const [subjectForm] = Form.useForm<{ name: string }>();

	const openCreateSubject = () => {
		setEditingSubject(null);
		subjectForm.resetFields();
		setSubjectModalOpen(true);
	};

	const openEditSubject = (record: Subject) => {
		setEditingSubject(record);
		subjectForm.setFieldsValue({ name: record.name });
		setSubjectModalOpen(true);
	};

	const submitSubject = async () => {
		const values = await subjectForm.validateFields();
		const trimmedName = values.name.trim();
		if (!trimmedName) {
			message.warning('Tên môn học không được để trống');
			return;
		}

		const duplicated = subjects.some(
			(s) => s.name.trim().toLowerCase() === trimmedName.toLowerCase() && s.id !== editingSubject?.id,
		);
		if (duplicated) {
			message.warning('Môn học này đã tồn tại');
			return;
		}

		if (editingSubject) {
			setSubjects((prev) =>
				prev.map((s) =>
					s.id === editingSubject.id ? { ...s, name: trimmedName, updatedAt: new Date().toISOString() } : s,
				),
			);
			message.success('Đã cập nhật môn học');
		} else {
			const created: Subject = {
				id: newId(),
				name: trimmedName,
				createdAt: new Date().toISOString(),
			};
			setSubjects((prev) => [...prev, created]);
			message.success('Đã thêm môn học');
		}

		setSubjectModalOpen(false);
	};

	const deleteSubject = (subjectId: string) => {
		setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
		setSessions((prev) => prev.filter((s) => s.subjectId !== subjectId));
		setGoals((prev) => prev.filter((g) => g.subjectId !== subjectId));
		message.success('Đã xoá môn học (kèm lịch học/mục tiêu liên quan)');
	};

	const [sessionModalOpen, setSessionModalOpen] = useState(false);
	const [editingSession, setEditingSession] = useState<StudySession | null>(null);
	const [sessionForm] = Form.useForm<{
		subjectId: string;
		startTime: Moment;
		durationMinutes: number;
		content: string;
		notes?: string;
	}>();

	const [sessionFilterSubjectId, setSessionFilterSubjectId] = useState<string | 'all'>('all');
	const [sessionFilterMonth, setSessionFilterMonth] = useState<Moment>(moment());
	const sessionFilterMonthKey = useMemo(() => toMonthKey(sessionFilterMonth), [sessionFilterMonth]);

	const filteredSessions = useMemo(() => {
		return sessions
			.filter((s) => moment(s.startTime).format('YYYY-MM') === sessionFilterMonthKey)
			.filter((s) => (sessionFilterSubjectId === 'all' ? true : s.subjectId === sessionFilterSubjectId))
			.sort((a, b) => (a.startTime < b.startTime ? 1 : -1));
	}, [sessions, sessionFilterMonthKey, sessionFilterSubjectId]);

	const openCreateSession = () => {
		setEditingSession(null);
		sessionForm.resetFields();
		const defaultSubjectId = subjects[0]?.id;
		sessionForm.setFieldsValue({
			subjectId: defaultSubjectId,
			startTime: moment(),
			durationMinutes: 60,
			content: '',
			notes: '',
		});
		setSessionModalOpen(true);
	};

	const openEditSession = (record: StudySession) => {
		setEditingSession(record);
		sessionForm.setFieldsValue({
			subjectId: record.subjectId,
			startTime: moment(record.startTime),
			durationMinutes: record.durationMinutes,
			content: record.content,
			notes: record.notes,
		});
		setSessionModalOpen(true);
	};

	const submitSession = async () => {
		const values = await sessionForm.validateFields();
		const startTimeIso = values.startTime.toISOString();
		const duration = Number(values.durationMinutes || 0);
		if (duration <= 0) {
			message.warning('Thời lượng phải lớn hơn 0');
			return;
		}
		const content = values.content?.trim() || '';
		if (!content) {
			message.warning('Vui lòng nhập nội dung đã học');
			return;
		}

		if (editingSession) {
			setSessions((prev) =>
				prev.map((s) =>
					s.id === editingSession.id
						? {
								...s,
								subjectId: values.subjectId,
								startTime: startTimeIso,
								durationMinutes: duration,
								content,
								notes: values.notes,
								updatedAt: new Date().toISOString(),
						  }
						: s,
				),
			);
			message.success('Đã cập nhật lịch học');
		} else {
			const created: StudySession = {
				id: newId(),
				subjectId: values.subjectId,
				startTime: startTimeIso,
				durationMinutes: duration,
				content,
				notes: values.notes,
				createdAt: new Date().toISOString(),
			};
			setSessions((prev) => [...prev, created]);
			message.success('Đã thêm lịch học');
		}

		setSessionModalOpen(false);
	};

	const deleteSession = (sessionId: string) => {
		setSessions((prev) => prev.filter((s) => s.id !== sessionId));
		message.success('Đã xoá lịch học');
	};

	const [goalModalOpen, setGoalModalOpen] = useState(false);
	const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);
	const [goalForm] = Form.useForm<{ month: Moment; subjectId: string | 'total'; targetMinutes: number }>();

	const openCreateGoal = () => {
		setEditingGoal(null);
		goalForm.resetFields();
		goalForm.setFieldsValue({ month: moment(), subjectId: 'total', targetMinutes: 600 });
		setGoalModalOpen(true);
	};

	const openEditGoal = (record: MonthlyGoal) => {
		setEditingGoal(record);
		goalForm.setFieldsValue({
			month: moment(record.month, 'YYYY-MM'),
			subjectId: record.subjectId ? record.subjectId : 'total',
			targetMinutes: record.targetMinutes,
		});
		setGoalModalOpen(true);
	};

	const submitGoal = async () => {
		const values = await goalForm.validateFields();
		const monthKey = toMonthKey(values.month);
		const subjectId = values.subjectId === 'total' ? null : values.subjectId;
		const targetMinutes = Number(values.targetMinutes || 0);
		if (targetMinutes <= 0) {
			message.warning('Mục tiêu phải lớn hơn 0');
			return;
		}

		const duplicated = goals.some(
			(g) => g.month === monthKey && (g.subjectId || null) === (subjectId || null) && g.id !== editingGoal?.id,
		);
		if (duplicated) {
			message.warning('Mục tiêu cho tháng/môn này đã tồn tại');
			return;
		}

		if (editingGoal) {
			setGoals((prev) =>
				prev.map((g) =>
					g.id === editingGoal.id
						? { ...g, month: monthKey, subjectId, targetMinutes, updatedAt: new Date().toISOString() }
						: g,
				),
			);
			message.success('Đã cập nhật mục tiêu');
		} else {
			const created: MonthlyGoal = {
				id: newId(),
				month: monthKey,
				subjectId,
				targetMinutes,
				createdAt: new Date().toISOString(),
			};
			setGoals((prev) => [...prev, created]);
			message.success('Đã thêm mục tiêu');
		}

		setGoalModalOpen(false);
	};

	const deleteGoal = (goalId: string) => {
		setGoals((prev) => prev.filter((g) => g.id !== goalId));
		message.success('Đã xoá mục tiêu');
	};

	const goalsInActiveMonth = useMemo(() => goals.filter((g) => g.month === activeMonthKey), [goals, activeMonthKey]);

	const computeActualMinutesForGoal = (goal: MonthlyGoal): number => {
		if (!goal.subjectId) return totalMinutesInActiveMonth;
		return minutesBySubjectInActiveMonth.get(goal.subjectId) || 0;
	};

	return (
		<Row gutter={[16, 16]}>
			<Col span={24}>
				<Card>
					<Row gutter={[16, 16]} align='middle' justify='space-between'>
						<Col>
							<Title level={3} style={{ marginBottom: 0 }}>
								Theo dõi & Quản lý tiến độ học tập
							</Title>
						</Col>
						<Col>
							<Space>
								<DatePicker
									picker='month'
									value={activeMonth}
									onChange={(v) => v && setActiveMonth(v)}
									allowClear={false}
								/>
							</Space>
						</Col>
					</Row>

					<Divider />

					<Row gutter={[16, 16]}>
						<Col xs={24} md={8}>
							<Card size='small'>
								<Text type='secondary'>Tổng thời lượng tháng {activeMonthKey}</Text>
								<div>
									<Title level={4} style={{ margin: '6px 0 0' }}>
										{minutesToHM(totalMinutesInActiveMonth)}
									</Title>
								</div>
							</Card>
						</Col>
						<Col xs={24} md={8}>
							<Card size='small'>
								<Text type='secondary'>Số buổi học trong tháng</Text>
								<div>
									<Title level={4} style={{ margin: '6px 0 0' }}>
										{sessionsInActiveMonth.length}
									</Title>
								</div>
							</Card>
						</Col>
						<Col xs={24} md={8}>
							<Card size='small'>
								<Text type='secondary'>Số môn học</Text>
								<div>
									<Title level={4} style={{ margin: '6px 0 0' }}>
										{subjects.length}
									</Title>
								</div>
							</Card>
						</Col>
					</Row>
				</Card>
			</Col>

			<Col span={24}>
				<Card>
					<Tabs defaultActiveKey='subjects'>
						<Tabs.TabPane tab='Danh mục môn học' key='subjects'>
							<Row justify='space-between' align='middle' style={{ marginBottom: 12 }}>
								<Col>
									<Text type='secondary'>Thêm/sửa/xoá các môn học</Text>
								</Col>
								<Col>
									<Button type='primary' onClick={openCreateSubject}>
										Thêm môn học
									</Button>
								</Col>
							</Row>

							<Table<Subject>
								rowKey='id'
								dataSource={[...subjects].sort((a, b) => a.name.localeCompare(b.name))}
								pagination={{ pageSize: 8 }}
								columns={[
									{
										title: 'Tên môn',
										dataIndex: 'name',
									},
									{
										title: 'Hành động',
										width: 220,
										render: (_, record) => (
											<Space>
												<Button onClick={() => openEditSubject(record)}>Sửa</Button>
												<Popconfirm
													title='Xoá môn học này?'
													okText='Xoá'
													okType='danger'
													cancelText='Huỷ'
													onConfirm={() => deleteSubject(record.id)}
												>
													<Button danger>Xoá</Button>
												</Popconfirm>
											</Space>
										),
									},
								]}
							/>
						</Tabs.TabPane>

						<Tabs.TabPane tab='Tiến độ / Lịch học' key='sessions'>
							<Row gutter={[12, 12]} justify='space-between' align='middle' style={{ marginBottom: 12 }}>
								<Col>
									<Space>
										<Select
											style={{ minWidth: 200 }}
											value={sessionFilterSubjectId}
											onChange={(v) => setSessionFilterSubjectId(v)}
										>
											<Select.Option value='all'>Tất cả môn</Select.Option>
											{subjects
												.slice()
												.sort((a, b) => a.name.localeCompare(b.name))
												.map((s) => (
													<Select.Option value={s.id} key={s.id}>
														{s.name}
													</Select.Option>
												))}
										</Select>
										<DatePicker
											picker='month'
											value={sessionFilterMonth}
											onChange={(v) => v && setSessionFilterMonth(v)}
											allowClear={false}
										/>
									</Space>
								</Col>
								<Col>
									<Button type='primary' onClick={openCreateSession} disabled={subjects.length === 0}>
										Thêm buổi học
									</Button>
								</Col>
							</Row>

							<Table<StudySession>
								rowKey='id'
								dataSource={filteredSessions}
								pagination={{ pageSize: 8 }}
								columns={[
									{
										title: 'Môn',
										dataIndex: 'subjectId',
										render: (id: string) => subjectById.get(id)?.name || '—',
									},
									{
										title: 'Thời gian',
										dataIndex: 'startTime',
										render: (v: string) => moment(v).format('DD/MM/YYYY HH:mm'),
										width: 170,
									},
									{
										title: 'Thời lượng',
										dataIndex: 'durationMinutes',
										render: (v: number) => minutesToHM(Number(v) || 0),
										width: 140,
									},
									{
										title: 'Nội dung đã học',
										dataIndex: 'content',
									},
									{
										title: 'Ghi chú',
										dataIndex: 'notes',
									},
									{
										title: 'Hành động',
										width: 220,
										render: (_, record) => (
											<Space>
												<Button onClick={() => openEditSession(record)}>Sửa</Button>
												<Popconfirm
													title='Xoá buổi học này?'
													okText='Xoá'
													okType='danger'
													cancelText='Huỷ'
													onConfirm={() => deleteSession(record.id)}
												>
													<Button danger>Xoá</Button>
												</Popconfirm>
											</Space>
										),
									},
								]}
							/>
						</Tabs.TabPane>

						<Tabs.TabPane tab='Mục tiêu học tập tháng' key='goals'>
							<Row justify='space-between' align='middle' style={{ marginBottom: 12 }}>
								<Col>
									<Text type='secondary'>Đặt mục tiêu theo tháng cho từng môn hoặc tổng thời lượng</Text>
								</Col>
								<Col>
									<Button type='primary' onClick={openCreateGoal}>
										Thêm mục tiêu
									</Button>
								</Col>
							</Row>

							<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
								<Col xs={24} md={12}>
									<Card size='small' title={`Tóm tắt tháng ${activeMonthKey}`}>
										<Space direction='vertical' style={{ width: '100%' }}>
											<div>
												<Text type='secondary'>Tổng thời lượng</Text>
												<div>
													<Title level={5} style={{ margin: '4px 0 0' }}>
														{minutesToHM(totalMinutesInActiveMonth)}
													</Title>
												</div>
											</div>
											<Divider style={{ margin: '8px 0' }} />
											<div>
												<Text type='secondary'>Theo môn</Text>
												<div style={{ marginTop: 8 }}>
													{subjects
														.slice()
														.sort((a, b) => a.name.localeCompare(b.name))
														.map((s) => {
															const mins = minutesBySubjectInActiveMonth.get(s.id) || 0;
															if (mins <= 0) return null;
															return (
																<div key={s.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
																	<Text>{s.name}</Text>
																	<Text strong>{minutesToHM(mins)}</Text>
																</div>
															);
														})}
													{subjects.every((s) => (minutesBySubjectInActiveMonth.get(s.id) || 0) === 0) && (
														<Text type='secondary'>Chưa có dữ liệu học trong tháng này</Text>
													)}
												</div>
											</div>
										</Space>
									</Card>
								</Col>

								<Col xs={24} md={12}>
									<Card size='small' title='Trạng thái mục tiêu (tháng đang chọn)'>
										<Space direction='vertical' style={{ width: '100%' }}>
											{goalsInActiveMonth.length === 0 && <Text type='secondary'>Chưa có mục tiêu cho tháng này</Text>}
											{goalsInActiveMonth.map((g) => {
												const actual = computeActualMinutesForGoal(g);
												const percent =
													g.targetMinutes > 0 ? Math.min(100, Math.round((actual / g.targetMinutes) * 100)) : 0;
												const done = actual >= g.targetMinutes;
												const label = g.subjectId ? subjectById.get(g.subjectId)?.name || '—' : 'Tổng thời lượng';
												return (
													<div key={g.id} style={{ width: '100%' }}>
														<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
															<Text>{label}</Text>
															<Tag color={done ? 'green' : 'orange'}>{done ? 'Đạt' : 'Chưa đạt'}</Tag>
														</div>
														<Progress percent={percent} status={done ? 'success' : 'active'} />
														<div style={{ display: 'flex', justifyContent: 'space-between' }}>
															<Text type='secondary'>Thực tế: {minutesToHM(actual)}</Text>
															<Text type='secondary'>Mục tiêu: {minutesToHM(g.targetMinutes)}</Text>
														</div>
													</div>
												);
											})}
										</Space>
									</Card>
								</Col>
							</Row>

							<Table<MonthlyGoal>
								rowKey='id'
								dataSource={[...goals].sort((a, b) => (a.month < b.month ? 1 : -1))}
								pagination={{ pageSize: 8 }}
								columns={[
									{
										title: 'Tháng',
										dataIndex: 'month',
										width: 110,
										render: (v: string) => v,
									},
									{
										title: 'Phạm vi',
										dataIndex: 'subjectId',
										render: (v: string | null) => (v ? subjectById.get(v)?.name || '—' : 'Tổng thời lượng'),
									},
									{
										title: 'Mục tiêu',
										dataIndex: 'targetMinutes',
										width: 140,
										render: (v: number) => minutesToHM(Number(v) || 0),
									},
									{
										title: 'Trạng thái',
										width: 160,
										render: (_, record) => {
											const isActiveMonth = record.month === activeMonthKey;
											if (!isActiveMonth) return <Text type='secondary'>—</Text>;
											const actual = computeActualMinutesForGoal(record);
											return actual >= record.targetMinutes ? (
												<Tag color='green'>Đạt</Tag>
											) : (
												<Tag color='orange'>Chưa đạt</Tag>
											);
										},
									},
									{
										title: 'Hành động',
										width: 220,
										render: (_, record) => (
											<Space>
												<Button onClick={() => openEditGoal(record)}>Sửa</Button>
												<Popconfirm
													title='Xoá mục tiêu này?'
													okText='Xoá'
													okType='danger'
													cancelText='Huỷ'
													onConfirm={() => deleteGoal(record.id)}
												>
													<Button danger>Xoá</Button>
												</Popconfirm>
											</Space>
										),
									},
								]}
							/>
						</Tabs.TabPane>
					</Tabs>
				</Card>
			</Col>

			<Modal
				title={editingSubject ? 'Sửa môn học' : 'Thêm môn học'}
				visible={subjectModalOpen}
				onCancel={() => setSubjectModalOpen(false)}
				onOk={submitSubject}
				okText={editingSubject ? 'Cập nhật' : 'Thêm'}
				cancelText='Huỷ'
				destroyOnClose
			>
				<Form form={subjectForm} layout='vertical'>
					<Form.Item label='Tên môn học' name='name' rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}>
						<Input placeholder='Ví dụ: Lý, Hoá, Sinh...' />
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				title={editingSession ? 'Sửa buổi học' : 'Thêm buổi học'}
				visible={sessionModalOpen}
				onCancel={() => setSessionModalOpen(false)}
				onOk={submitSession}
				okText={editingSession ? 'Cập nhật' : 'Thêm'}
				cancelText='Huỷ'
				destroyOnClose
				width={720}
			>
				<Form form={sessionForm} layout='vertical'>
					<Row gutter={[12, 12]}>
						<Col xs={24} md={12}>
							<Form.Item
								label='Môn học'
								name='subjectId'
								rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
							>
								<Select placeholder='Chọn môn học' showSearch optionFilterProp='children'>
									{subjects
										.slice()
										.sort((a, b) => a.name.localeCompare(b.name))
										.map((s) => (
											<Select.Option value={s.id} key={s.id}>
												{s.name}
											</Select.Option>
										))}
								</Select>
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item
								label='Ngày giờ học'
								name='startTime'
								rules={[{ required: true, message: 'Vui lòng chọn ngày giờ' }]}
							>
								<DatePicker showTime style={{ width: '100%' }} format='DD/MM/YYYY HH:mm' />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item
								label='Thời lượng (phút)'
								name='durationMinutes'
								rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
							>
								<InputNumber min={1} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
						<Col xs={24} md={24}>
							<Form.Item
								label='Nội dung đã học'
								name='content'
								rules={[{ required: true, message: 'Vui lòng nhập nội dung đã học' }]}
							>
								<TextArea rows={3} placeholder='Ví dụ: Ôn tập chương 1, làm bài tập 1-10...' />
							</Form.Item>
						</Col>
						<Col xs={24} md={24}>
							<Form.Item label='Ghi chú' name='notes'>
								<TextArea rows={2} placeholder='Tuỳ chọn' />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>

			<Modal
				title={editingGoal ? 'Sửa mục tiêu' : 'Thêm mục tiêu'}
				visible={goalModalOpen}
				onCancel={() => setGoalModalOpen(false)}
				onOk={submitGoal}
				okText={editingGoal ? 'Cập nhật' : 'Thêm'}
				cancelText='Huỷ'
				destroyOnClose
				width={640}
			>
				<Form form={goalForm} layout='vertical'>
					<Row gutter={[12, 12]}>
						<Col xs={24} md={12}>
							<Form.Item label='Tháng' name='month' rules={[{ required: true, message: 'Vui lòng chọn tháng' }]}>
								<DatePicker picker='month' style={{ width: '100%' }} />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item
								label='Mục tiêu cho'
								name='subjectId'
								rules={[{ required: true, message: 'Vui lòng chọn phạm vi' }]}
							>
								<Select>
									<Select.Option value='total'>Tổng thời lượng</Select.Option>
									{subjects
										.slice()
										.sort((a, b) => a.name.localeCompare(b.name))
										.map((s) => (
											<Select.Option value={s.id} key={s.id}>
												{s.name}
											</Select.Option>
										))}
								</Select>
							</Form.Item>
						</Col>
						<Col xs={24} md={24}>
							<Form.Item
								label='Mục tiêu (phút)'
								name='targetMinutes'
								rules={[{ required: true, message: 'Vui lòng nhập mục tiêu' }]}
							>
								<InputNumber min={1} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</Row>
	);
};

export default TienDoHocTap;
