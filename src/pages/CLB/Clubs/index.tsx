import { clbDb } from '@/utils/clbLocalDb';
import { DeleteOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Card, Image, Popconfirm, Space, Switch, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { history } from 'umi';
import ClubFormModal from './components/ClubFormModal';
import { useTableSearch } from '../utils/useTableSearch';

const ClubsPage = () => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<CLB.IClubRecord[]>([]);
	const [visibleForm, setVisibleForm] = useState(false);
	const [mode, setMode] = useState<'create' | 'edit'>('create');
	const [record, setRecord] = useState<CLB.IClubRecord | undefined>(undefined);

	const { getStringColumnSearchProps } = useTableSearch<CLB.IClubRecord>();

	const reload = () => {
		setLoading(true);
		try {
			setData(clbDb.getClubs());
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		reload();
	}, []);

	const handleCreate = () => {
		setMode('create');
		setRecord(undefined);
		setVisibleForm(true);
	};

	const handleEdit = (rec: CLB.IClubRecord) => {
		setMode('edit');
		setRecord(rec);
		setVisibleForm(true);
	};

	const handleDelete = (id: string) => {
		clbDb.deleteClub(id);
		reload();
	};

	const handleSubmit = (payload: any) => {
		clbDb.upsertClub(payload);
		setVisibleForm(false);
		reload();
	};

	const columns: ColumnsType<CLB.IClubRecord> = useMemo(
		() => [
			{
				title: 'Ảnh',
				dataIndex: 'anhDaiDien',
				width: 70,
				align: 'center',
				render: (val) => (val ? <Image width={40} height={40} src={val} preview /> : '-'),
			},
			{
				title: 'Tên câu lạc bộ',
				dataIndex: 'ten',
				width: 260,
				...getStringColumnSearchProps('ten', 'Tìm theo tên CLB'),
				sorter: (a, b) => (a.ten ?? '').localeCompare(b.ten ?? ''),
			},
			{
				title: 'Ngày thành lập',
				dataIndex: 'ngayThanhLap',
				align: 'center',
				width: 140,
				render: (val) => (val ? moment(val).format('DD/MM/YYYY') : '-'),
				sorter: (a, b) => {
					const da = a.ngayThanhLap ? new Date(a.ngayThanhLap).getTime() : 0;
					const db = b.ngayThanhLap ? new Date(b.ngayThanhLap).getTime() : 0;
					return da - db;
				},
			},
			{
				title: 'Mô tả',
				dataIndex: 'moTaHtml',
				width: 360,
				render: (val) => (
					<div style={{ maxHeight: 72, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: val ?? '' }} />
				),
			},
			{
				title: 'Chủ nhiệm CLB',
				dataIndex: 'chuNhiem',
				width: 220,
				...getStringColumnSearchProps('chuNhiem', 'Tìm theo chủ nhiệm'),
				sorter: (a, b) => (a.chuNhiem ?? '').localeCompare(b.chuNhiem ?? ''),
			},
			{
				title: 'Hoạt động',
				dataIndex: 'hoatDong',
				align: 'center',
				width: 120,
				filters: [
					{ text: 'Có', value: true },
					{ text: 'Không', value: false },
				],
				onFilter: (value, rec) => rec.hoatDong === value,
				render: (val) => <Switch checked={!!val} disabled checkedChildren='Có' unCheckedChildren='Không' />,
			},
			{
				title: 'Thao tác',
				key: 'action',
				align: 'center',
				fixed: 'right',
				width: 160,
				render: (_, rec) => (
					<Space>
						<Tooltip title='Chỉnh sửa'>
							<Button type='link' icon={<EditOutlined />} onClick={() => handleEdit(rec)} />
						</Tooltip>
						<Tooltip title='Xóa'>
							<Popconfirm
								title='Bạn có chắc chắn muốn xóa CLB này?'
								placement='topLeft'
								onConfirm={() => handleDelete(rec._id)}
							>
								<Button danger type='link' icon={<DeleteOutlined />} />
							</Popconfirm>
						</Tooltip>
						<Tooltip title='Xem thành viên'>
							<Button
								type='link'
								icon={<TeamOutlined />}
								onClick={() => history.push(`/clb-members?clubId=${rec._id}`)}
							/>
						</Tooltip>
					</Space>
				),
			},
		],
		[getStringColumnSearchProps],
	);

	return (
		<Card
			title='Danh sách câu lạc bộ'
			extra={
				<Button type='primary' onClick={handleCreate}>
					Thêm mới
				</Button>
			}
		>
			<Table
				rowKey='_id'
				loading={loading}
				columns={columns}
				dataSource={data}
				scroll={{ x: 1400 }}
				pagination={{ pageSize: 10, showSizeChanger: true }}
			/>

			<ClubFormModal
				visible={visibleForm}
				mode={mode}
				record={record}
				onCancel={() => setVisibleForm(false)}
				onSubmit={handleSubmit}
			/>
		</Card>
	);
};

export default ClubsPage;
