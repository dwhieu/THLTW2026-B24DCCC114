import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Typography, message } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { useMemo, useState } from 'react';
import { useModel } from 'umi';
import type { CauHoi, MucDo } from '@/models/bai2/cauHoi';
import type { MonHoc } from '@/models/bai2/monHoc';
import type { KhoiKienThuc } from '@/models/bai2/khoiKienThuc';

type FormValues = {
	maCauHoi: string;
	monHocId: string;
	noiDung: string;
	mucDo: MucDo;
	khoiKienThucId: string;
};

const MUC_DO_OPTIONS: { value: MucDo; label: string }[] = [
	{ value: 'DE', label: 'Dễ' },
	{ value: 'TRUNG_BINH', label: 'Trung bình' },
	{ value: 'KHO', label: 'Khó' },
	{ value: 'RAT_KHO', label: 'Rất khó' },
];

const labelMucDo = (v: MucDo) => MUC_DO_OPTIONS.find((x) => x.value === v)?.label ?? v;

const CauHoiPage: React.FC = () => {
	const { danhSach, themMoi, capNhat, xoa } = useModel('bai2.cauHoi');
	const { danhSach: danhSachMonHoc } = useModel('bai2.monHoc');
	const { danhSach: danhSachKhoi } = useModel('bai2.khoiKienThuc');

	const [visible, setVisible] = useState(false);
	const [editing, setEditing] = useState<CauHoi | null>(null);
	const [form] = Form.useForm<FormValues>();

	const [filterMonHocId, setFilterMonHocId] = useState<string | undefined>();
	const [filterMucDo, setFilterMucDo] = useState<MucDo | undefined>();
	const [filterKhoiId, setFilterKhoiId] = useState<string | undefined>();

	const monHocMap = useMemo(() => {
		return danhSachMonHoc.reduce<Record<string, MonHoc>>((acc, cur) => {
			acc[cur.id] = cur;
			return acc;
		}, {});
	}, [danhSachMonHoc]);

	const khoiMap = useMemo(() => {
		return danhSachKhoi.reduce<Record<string, KhoiKienThuc>>((acc, cur) => {
			acc[cur.id] = cur;
			return acc;
		}, {});
	}, [danhSachKhoi]);

	const filtered = useMemo(() => {
		return danhSach.filter((q) => {
			if (filterMonHocId && q.monHocId !== filterMonHocId) return false;
			if (filterMucDo && q.mucDo !== filterMucDo) return false;
			if (filterKhoiId && q.khoiKienThucId !== filterKhoiId) return false;
			return true;
		});
	}, [danhSach, filterMonHocId, filterMucDo, filterKhoiId]);

	const openCreate = () => {
		setEditing(null);
		form.resetFields();
		setVisible(true);
	};

	const openEdit = (record: CauHoi) => {
		setEditing(record);
		form.setFieldsValue({
			maCauHoi: record.maCauHoi,
			monHocId: record.monHocId,
			noiDung: record.noiDung,
			mucDo: record.mucDo,
			khoiKienThucId: record.khoiKienThucId,
		});
		setVisible(true);
	};

	const onSubmit = async () => {
		const values = await form.validateFields();
		if (!values.maCauHoi?.trim() || !values.noiDung?.trim()) {
			message.error('Vui lòng nhập đầy đủ thông tin câu hỏi');
			return;
		}
		if (editing) await capNhat(editing.id, values);
		else await themMoi(values);
		setVisible(false);
	};

	const columns = useMemo(
		() => [
			{
				title: 'STT',
				width: 80,
				render: (_: any, __: CauHoi, index: number) => index + 1,
			},
			{ title: 'Mã câu hỏi', dataIndex: 'maCauHoi', width: 160 },
			{
				title: 'Môn học',
				dataIndex: 'monHocId',
				width: 220,
				render: (v: string) => monHocMap[v]?.tenMon ?? '—',
			},
			{
				title: 'Khối kiến thức',
				dataIndex: 'khoiKienThucId',
				width: 200,
				render: (v: string) => khoiMap[v]?.ten ?? '—',
			},
			{
				title: 'Mức độ',
				dataIndex: 'mucDo',
				width: 140,
				render: (v: MucDo) => labelMucDo(v),
			},
			{
				title: 'Nội dung',
				dataIndex: 'noiDung',
			},
			{
				title: 'Thao tác',
				width: 220,
				render: (_: any, record: CauHoi) => (
					<Space>
						<Button onClick={() => openEdit(record)}>Sửa</Button>
						<Popconfirm title='Xóa câu hỏi này?' onConfirm={() => xoa(record.id)}>
							<Button danger>Xóa</Button>
						</Popconfirm>
					</Space>
				),
			},
		],
		[danhSach, monHocMap, khoiMap],
	);

	return (
		<div>
			<Typography.Title level={2}>Quản lý câu hỏi tự luận</Typography.Title>

			<Card>
				<Space wrap>
					<Select
						allowClear
						placeholder='Lọc theo môn học'
						style={{ width: 260 }}
						value={filterMonHocId}
						onChange={(v) => setFilterMonHocId(v)}
						options={danhSachMonHoc.map((m: MonHoc) => ({ value: m.id, label: `${m.maMon} - ${m.tenMon}` }))}
					/>
					<Select
						allowClear
						placeholder='Lọc theo mức độ'
						style={{ width: 200 }}
						value={filterMucDo}
						onChange={(v) => setFilterMucDo(v)}
						options={MUC_DO_OPTIONS}
					/>
					<Select
						allowClear
						placeholder='Lọc theo khối kiến thức'
						style={{ width: 240 }}
						value={filterKhoiId}
						onChange={(v) => setFilterKhoiId(v)}
						options={danhSachKhoi.map((k: KhoiKienThuc) => ({ value: k.id, label: k.ten }))}
					/>
					<Button type='primary' onClick={openCreate}>
						Thêm câu hỏi
					</Button>
				</Space>
			</Card>

			<Table<CauHoi>
				style={{ marginTop: 16 }}
				rowKey='id'
				dataSource={filtered}
				columns={columns as any}
				pagination={{ pageSize: 10 }}
				locale={{ emptyText: 'Chưa có dữ liệu' }}
			/>

			<Modal
				destroyOnClose
				visible={visible}
				title={editing ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi'}
				onCancel={() => setVisible(false)}
				onOk={onSubmit}
				okText='Lưu'
				cancelText='Hủy'
			>
				<Form form={form} layout='vertical'>
					<Form.Item
						name='maCauHoi'
						label='Mã câu hỏi'
						rules={[{ required: true, message: 'Vui lòng nhập mã câu hỏi' }]}
					>
						<Input placeholder='VD: CH001' />
					</Form.Item>
					<Form.Item name='monHocId' label='Môn học' rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}>
						<Select
							showSearch
							optionFilterProp='label'
							options={danhSachMonHoc.map((m: MonHoc) => ({ value: m.id, label: `${m.maMon} - ${m.tenMon}` }))}
						/>
					</Form.Item>
					<Form.Item
						name='khoiKienThucId'
						label='Khối kiến thức'
						rules={[{ required: true, message: 'Vui lòng chọn khối kiến thức' }]}
					>
						<Select options={danhSachKhoi.map((k: KhoiKienThuc) => ({ value: k.id, label: k.ten }))} />
					</Form.Item>
					<Form.Item name='mucDo' label='Mức độ khó' rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}>
						<Select options={MUC_DO_OPTIONS} />
					</Form.Item>
					<Form.Item
						name='noiDung'
						label='Nội dung câu hỏi'
						rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
					>
						<TextArea rows={4} placeholder='Nhập nội dung câu hỏi tự luận...' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default CauHoiPage;
