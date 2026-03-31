import { clbDb } from '@/utils/clbLocalDb';
import { SwapOutlined } from '@ant-design/icons';
import { Button, Card, message, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import TransferClubModal from './components/TransferClubModal';
import { useTableSearch } from '../utils/useTableSearch';
import type { Key } from 'react';

const MembersPage = () => {
	const [loading, setLoading] = useState(false);
	const [apps, setApps] = useState<CLB.IApplicationRecord[]>([]);
	const [clubs, setClubs] = useState<CLB.IClubRecord[]>([]);
	const [clubFilterId, setClubFilterId] = useState<string | 'ALL'>('ALL');
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

	const [visibleTransfer, setVisibleTransfer] = useState(false);
	const [transferIds, setTransferIds] = useState<string[]>([]);

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

		const params = new URLSearchParams(window.location.search);
		const clubId = params.get('clubId');
		if (clubId) setClubFilterId(clubId);
	}, []);

	const clubNameById = (id?: string | null) => clubs.find((c) => c._id === id)?.ten ?? '—';

	const members = useMemo(() => {
		const approved = apps.filter((a) => a.trangThai === 'Approved');
		if (clubFilterId === 'ALL') return approved;
		return approved.filter((a) => a.clubId === clubFilterId);
	}, [apps, clubFilterId]);

	const selectedIds = selectedRowKeys.map((x) => x.toString());

	const openTransfer = (ids: string[]) => {
		if (!clubs.length) {
			message.warning('Chưa có Câu lạc bộ nào để chuyển đến.');
			return;
		}
		setTransferIds(ids);
		setVisibleTransfer(true);
	};

	const handleTransfer = (toClubId: string) => {
		clbDb.transferMembers(transferIds, toClubId);
		setVisibleTransfer(false);
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
				render: (val) => <Tag>{val}</Tag>,
			},
			{
				title: 'Địa chỉ',
				dataIndex: 'diaChi',
				width: 220,
				render: (val) => val ?? '',
			},
			{
				title: 'Sở trường',
				dataIndex: 'soTruong',
				width: 220,
				render: (val) => val ?? '',
			},
			{
				title: 'Câu lạc bộ',
				dataIndex: 'clubId',
				width: 240,
				render: (val) => clubNameById(val),
				filters: clubs.map((c) => ({ text: c.ten, value: c._id })),
				onFilter: (value, rec) => rec.clubId === value,
			},
			{
				title: 'Approved lúc',
				dataIndex: 'updatedAt',
				align: 'center',
				width: 160,
				render: (val) => (val ? moment(val).format('HH:mm DD/MM/YYYY') : '-'),
			},
			{
				title: 'Thao tác',
				key: 'action',
				fixed: 'right',
				align: 'center',
				width: 120,
				render: (_, rec) => (
					<Button type='link' icon={<SwapOutlined />} onClick={() => openTransfer([rec._id])}>
						Đổi CLB
					</Button>
				),
			},
		],
		[getStringColumnSearchProps, clubs],
	);

	return (
		<Card
			title='Quản lý thành viên Câu lạc bộ'
			extra={
				<Space>
					<Select
						style={{ width: 320 }}
						value={clubFilterId}
						onChange={(v) => setClubFilterId(v)}
						options={[
							{ value: 'ALL', label: 'Tất cả câu lạc bộ' },
							...clubs.map((c) => ({ value: c._id, label: c.ten })),
						]}
					/>
					<Button disabled={!selectedIds.length} icon={<SwapOutlined />} onClick={() => openTransfer(selectedIds)}>
						Chuyển CLB ({selectedIds.length})
					</Button>
				</Space>
			}
		>
			<Table
				rowKey='_id'
				loading={loading}
				dataSource={members}
				columns={columns}
				scroll={{ x: 1600 }}
				rowSelection={{
					selectedRowKeys,
					onChange: (keys) => setSelectedRowKeys(keys),
					preserveSelectedRowKeys: true,
				}}
				pagination={{ pageSize: 10, showSizeChanger: true }}
			/>

			<TransferClubModal
				visible={visibleTransfer}
				onCancel={() => setVisibleTransfer(false)}
				onSubmit={handleTransfer}
				clubs={clubs}
				count={transferIds.length}
			/>
		</Card>
	);
};

export default MembersPage;
