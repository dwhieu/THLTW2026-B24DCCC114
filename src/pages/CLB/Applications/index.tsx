import { clbDb } from '@/utils/clbLocalDb';
import {
	CheckOutlined,
	ClockCircleOutlined,
	CloseOutlined,
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	HistoryOutlined,
} from '@ant-design/icons';
import { Button, Card, message, Modal, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { useTableSearch } from '../utils/useTableSearch';
import ApplicationFormModal from './components/ApplicationFormModal';
import ApplicationHistoryModal from './components/ApplicationHistoryModal';
import RejectModal from './components/RejectModal';
import type { Key } from 'react';

const statusTag = (status: CLB.ApplicationStatus) => {
	switch (status) {
		case 'Approved':
			return <Tag color='green'>Approved</Tag>;
		case 'Rejected':
			return <Tag color='red'>Rejected</Tag>;
		default:
			return <Tag>Pending</Tag>;
	}
};

const ApplicationsPage = () => {
	const [loading, setLoading] = useState(false);
	const [apps, setApps] = useState<CLB.IApplicationRecord[]>([]);
	const [clubs, setClubs] = useState<CLB.IClubRecord[]>([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

	const [visibleForm, setVisibleForm] = useState(false);
	const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
	const [record, setRecord] = useState<CLB.IApplicationRecord | undefined>();

	const [visibleReject, setVisibleReject] = useState(false);
	const [rejectIds, setRejectIds] = useState<string[]>([]);

	const [visibleHistory, setVisibleHistory] = useState(false);
	const [historyRecord, setHistoryRecord] = useState<CLB.IApplicationRecord | undefined>();

	const { getStringColumnSearchProps } = useTableSearch<CLB.IApplicationRecord>();

	const reload = () => {
		setLoading(true);
		try {
			setApps(clbDb.getApplications());
			setClubs(clbDb.getClubs());
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		reload();
	}, []);

	const clubNameById = (id?: string | null) => clubs.find((c) => c._id === id)?.ten ?? '—';

	const openCreate = () => {
		if (!clubs.length) {
			message.warning('Vui lòng tạo Câu lạc bộ trước.');
			return;
		}
		setFormMode('create');
		setRecord(undefined);
		setVisibleForm(true);
	};

	const openView = (rec: CLB.IApplicationRecord) => {
		setFormMode('view');
		setRecord(rec);
		setVisibleForm(true);
	};

	const openEdit = (rec: CLB.IApplicationRecord) => {
		setFormMode('edit');
		setRecord(rec);
		setVisibleForm(true);
	};

	const handleDelete = (id: string) => {
		clbDb.deleteApplication(id);
		reload();
	};

	const handleSubmit = (payload: any) => {
		clbDb.upsertApplication({
			...payload,
			trangThai: payload.trangThai ?? 'Pending',
			ghiChu: payload.trangThai === 'Rejected' ? payload.ghiChu ?? '' : payload.ghiChu ?? null,
		});
		setVisibleForm(false);
		reload();
	};

	const handleApprove = (ids: string[]) => {
		clbDb.approveApplications(ids);
		setSelectedRowKeys([]);
		reload();
	};

	const handleReject = (ids: string[], reason: string) => {
		clbDb.rejectApplications(ids, reason);
		setSelectedRowKeys([]);
		reload();
	};

	const columns: ColumnsType<CLB.IApplicationRecord> = useMemo(
		() => [
			{
				title: 'Họ tên',
				dataIndex: 'hoTen',
				width: 220,
				...getStringColumnSearchProps('hoTen', 'Tìm theo họ tên'),
				sorter: (a, b) => a.hoTen.localeCompare(b.hoTen),
			},
			{
				title: 'Email',
				dataIndex: 'email',
				width: 240,
				...getStringColumnSearchProps('email', 'Tìm theo email'),
				sorter: (a, b) => a.email.localeCompare(b.email),
			},
			{
				title: 'SĐT',
				dataIndex: 'sdt',
				width: 140,
				...getStringColumnSearchProps('sdt', 'Tìm theo SĐT'),
			},
			{
				title: 'Giới tính',
				dataIndex: 'gioiTinh',
				align: 'center',
				width: 110,
				filters: ['Nam', 'Nữ', 'Khác'].map((x) => ({ text: x, value: x })),
				onFilter: (value, rec) => rec.gioiTinh === value,
			},
			{
				title: 'Địa chỉ',
				dataIndex: 'diaChi',
				width: 220,
				...getStringColumnSearchProps('diaChi', 'Tìm theo địa chỉ'),
			},
			{
				title: 'Sở trường',
				dataIndex: 'soTruong',
				width: 220,
				...getStringColumnSearchProps('soTruong', 'Tìm theo sở trường'),
			},
			{
				title: 'Câu lạc bộ',
				dataIndex: 'clubId',
				width: 220,
				render: (val) => clubNameById(val),
				filters: clubs.map((c) => ({ text: c.ten, value: c._id })),
				onFilter: (value, rec) => rec.clubId === value,
			},
			{
				title: 'Lý do đăng ký',
				dataIndex: 'lyDoDangKy',
				width: 260,
				render: (val) => <div style={{ maxHeight: 72, overflow: 'hidden' }}>{val ?? ''}</div>,
			},
			{
				title: 'Trạng thái',
				dataIndex: 'trangThai',
				align: 'center',
				width: 120,
				render: (val) => statusTag(val),
				filters: [
					{ text: 'Pending', value: 'Pending' },
					{ text: 'Approved', value: 'Approved' },
					{ text: 'Rejected', value: 'Rejected' },
				],
				onFilter: (value, rec) => rec.trangThai === value,
			},
			{
				title: 'Ghi chú',
				dataIndex: 'ghiChu',
				width: 220,
				render: (val) => <div style={{ maxHeight: 72, overflow: 'hidden' }}>{val ?? ''}</div>,
			},
			{
				title: 'Tạo lúc',
				dataIndex: 'createdAt',
				align: 'center',
				width: 160,
				render: (val) => (val ? moment(val).format('HH:mm DD/MM/YYYY') : '-'),
				sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
			},
			{
				title: 'Thao tác',
				key: 'action',
				fixed: 'right',
				align: 'center',
				width: 220,
				render: (_, rec) => (
					<Space>
						<Tooltip title='Xem chi tiết'>
							<Button type='link' icon={<EyeOutlined />} onClick={() => openView(rec)} />
						</Tooltip>
						<Tooltip title='Chỉnh sửa'>
							<Button type='link' icon={<EditOutlined />} onClick={() => openEdit(rec)} />
						</Tooltip>
						<Tooltip title='Xóa'>
							<Popconfirm
								title='Bạn có chắc chắn muốn xóa đơn đăng ký này?'
								placement='topLeft'
								onConfirm={() => handleDelete(rec._id)}
							>
								<Button danger type='link' icon={<DeleteOutlined />} />
							</Popconfirm>
						</Tooltip>

						<Tooltip title='Duyệt'>
							<Button
								type='link'
								icon={<CheckOutlined />}
								onClick={() =>
									Modal.confirm({
										title: 'Xác nhận duyệt đơn đăng ký?',
										onOk: () => handleApprove([rec._id]),
										okText: 'Duyệt',
										cancelText: 'Hủy',
									})
								}
							/>
						</Tooltip>
						<Tooltip title='Từ chối'>
							<Button
								type='link'
								danger
								icon={<CloseOutlined />}
								onClick={() => {
									setRejectIds([rec._id]);
									setVisibleReject(true);
								}}
							/>
						</Tooltip>

						<Tooltip title='Xem lịch sử'>
							<Button
								type='link'
								icon={<HistoryOutlined />}
								onClick={() => {
									setHistoryRecord(rec);
									setVisibleHistory(true);
								}}
							/>
						</Tooltip>
					</Space>
				),
			},
		],
		[getStringColumnSearchProps, clubs],
	);

	const selectedIds = selectedRowKeys.map((x) => x.toString());

	return (
		<Card
			title='Quản lý đơn đăng ký thành viên'
			extra={
				<Space>
					<Button type='primary' onClick={openCreate}>
						Thêm mới
					</Button>
					<Button
						disabled={!selectedIds.length}
						onClick={() =>
							Modal.confirm({
								title: `Duyệt ${selectedIds.length} đơn đã chọn?`,
								onOk: () => handleApprove(selectedIds),
								okText: 'Duyệt',
								cancelText: 'Hủy',
							})
						}
						icon={<CheckOutlined />}
					>
						Duyệt ({selectedIds.length})
					</Button>
					<Button
						disabled={!selectedIds.length}
						danger
						onClick={() => {
							setRejectIds(selectedIds);
							setVisibleReject(true);
						}}
						icon={<CloseOutlined />}
					>
						Từ chối ({selectedIds.length})
					</Button>
					<Button disabled={!selectedIds.length} onClick={() => setSelectedRowKeys([])} icon={<ClockCircleOutlined />}>
						Bỏ chọn
					</Button>
				</Space>
			}
		>
			<Table
				rowKey='_id'
				loading={loading}
				dataSource={apps}
				columns={columns}
				scroll={{ x: 1850 }}
				rowSelection={{
					selectedRowKeys,
					onChange: (keys) => setSelectedRowKeys(keys),
					preserveSelectedRowKeys: true,
				}}
				pagination={{ pageSize: 10, showSizeChanger: true }}
			/>

			<ApplicationFormModal
				visible={visibleForm}
				mode={formMode}
				record={record}
				clubs={clubs}
				onCancel={() => setVisibleForm(false)}
				onSubmit={handleSubmit}
			/>

			<RejectModal
				visible={visibleReject}
				onCancel={() => setVisibleReject(false)}
				onSubmit={(reason) => {
					handleReject(rejectIds, reason);
					setVisibleReject(false);
				}}
				title={rejectIds.length > 1 ? `Từ chối ${rejectIds.length} đơn đã chọn` : 'Từ chối đơn đăng ký'}
			/>

			<ApplicationHistoryModal
				visible={visibleHistory}
				onCancel={() => setVisibleHistory(false)}
				record={historyRecord}
				clubNameById={clubNameById}
			/>
		</Card>
	);
};

export default ApplicationsPage;
