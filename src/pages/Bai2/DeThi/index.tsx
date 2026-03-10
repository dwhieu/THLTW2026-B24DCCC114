import {
	Button,
	Card,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Select,
	Space,
	Table,
	Typography,
	message,
} from 'antd';
import { useMemo, useState } from 'react';
import { useModel } from 'umi';
import type { CauHoi, MucDo } from '@/models/bai2/cauHoi';
import type { MonHoc } from '@/models/bai2/monHoc';
import type { KhoiKienThuc } from '@/models/bai2/khoiKienThuc';
import type { CauTrucDeThi, DeThi } from '@/models/bai2/deThi';

const MUC_DO_OPTIONS: { value: MucDo; label: string }[] = [
	{ value: 'DE', label: 'Dễ' },
	{ value: 'TRUNG_BINH', label: 'Trung bình' },
	{ value: 'KHO', label: 'Khó' },
	{ value: 'RAT_KHO', label: 'Rất khó' },
];

const labelMucDo = (v: MucDo) => MUC_DO_OPTIONS.find((x) => x.value === v)?.label ?? v;

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

type CauTrucForm = {
	tenCauTruc: string;
	monHocId: string;
	items: { khoiKienThucId: string; mucDo: MucDo; soLuong: number }[];
};

type DeThiEditForm = {
	tenDeThi: string;
	questionIds: string[];
};

const DeThiPage: React.FC = () => {
	const { danhSach: danhSachCauHoi } = useModel('bai2.cauHoi');
	const { danhSach: danhSachMonHoc } = useModel('bai2.monHoc');
	const { danhSach: danhSachKhoi } = useModel('bai2.khoiKienThuc');
	const { danhSachCauTruc, danhSachDeThi, themCauTruc, capNhatCauTruc, xoaCauTruc, themDeThi, capNhatDeThi, xoaDeThi } =
		useModel('bai2.deThi');

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

	// ===== Cấu trúc đề =====
	const [visibleCauTruc, setVisibleCauTruc] = useState(false);
	const [editingCauTruc, setEditingCauTruc] = useState<CauTrucDeThi | null>(null);
	const [formCauTruc] = Form.useForm<CauTrucForm>();

	const openCreateCauTruc = () => {
		setEditingCauTruc(null);
		formCauTruc.setFieldsValue({
			tenCauTruc: '',
			monHocId: undefined as any,
			items: [{ khoiKienThucId: '', mucDo: 'DE', soLuong: 1 }],
		});
		setVisibleCauTruc(true);
	};

	const openEditCauTruc = (record: CauTrucDeThi) => {
		setEditingCauTruc(record);
		formCauTruc.setFieldsValue({
			tenCauTruc: record.tenCauTruc,
			monHocId: record.monHocId,
			items: record.items.map((x) => ({ ...x, soLuong: Number(x.soLuong) })),
		});
		setVisibleCauTruc(true);
	};

	const submitCauTruc = async () => {
		const values = await formCauTruc.validateFields();
		if (!values.items?.length) {
			message.error('Vui lòng thêm ít nhất 1 dòng cấu trúc');
			return;
		}
		const payload: Omit<CauTrucDeThi, 'id'> = {
			tenCauTruc: values.tenCauTruc,
			monHocId: values.monHocId,
			items: values.items.map((x) => ({ ...x, soLuong: Number(x.soLuong) })),
		};
		if (editingCauTruc) await capNhatCauTruc(editingCauTruc.id, payload);
		else await themCauTruc(payload);
		setVisibleCauTruc(false);
	};

	const taoDeThiTuCauTruc = async (structure: CauTrucDeThi) => {
		const questionsOfSubject = danhSachCauHoi.filter((q: CauHoi) => q.monHocId === structure.monHocId);
		const used = new Set<string>();
		let chosen: string[] = [];

		for (const item of structure.items) {
			const eligible = questionsOfSubject.filter(
				(q: CauHoi) => q.khoiKienThucId === item.khoiKienThucId && q.mucDo === item.mucDo && !used.has(q.id),
			);
			if (eligible.length < item.soLuong) {
				throw new Error(
					`Không đủ câu hỏi phù hợp: Khối "${khoiMap[item.khoiKienThucId]?.ten ?? '—'}" - Mức độ "${labelMucDo(
						item.mucDo,
					)}". Cần ${item.soLuong}, hiện có ${eligible.length}.`,
				);
			}
			const picked = shuffle(eligible)
				.slice(0, item.soLuong)
				.map((x) => x.id);
			picked.forEach((id) => used.add(id));
			chosen = [...chosen, ...picked];
		}

		const mon = monHocMap[structure.monHocId];
		const now = new Date();
		const tenDeThi = `Đề thi ${mon?.maMon ?? ''} ${now.toLocaleString()}`.trim();
		await themDeThi({ tenDeThi, monHocId: structure.monHocId, structureId: structure.id, questionIds: chosen });
		message.success('Tạo đề thi thành công');
	};

	// ===== Đề thi (lưu trữ + chỉnh sửa) =====
	const [visibleDeThi, setVisibleDeThi] = useState(false);
	const [editingDeThi, setEditingDeThi] = useState<DeThi | null>(null);
	const [formDeThi] = Form.useForm<DeThiEditForm>();

	const openEditDeThi = (record: DeThi) => {
		setEditingDeThi(record);
		formDeThi.setFieldsValue({ tenDeThi: record.tenDeThi, questionIds: record.questionIds });
		setVisibleDeThi(true);
	};

	const submitDeThi = async () => {
		if (!editingDeThi) return;
		const values = await formDeThi.validateFields();
		await capNhatDeThi(editingDeThi.id, {
			tenDeThi: values.tenDeThi,
			monHocId: editingDeThi.monHocId,
			structureId: editingDeThi.structureId,
			questionIds: values.questionIds,
		});
		setVisibleDeThi(false);
		message.success('Cập nhật đề thi thành công');
	};

	const columnsCauTruc = useMemo(
		() => [
			{ title: 'Tên cấu trúc', dataIndex: 'tenCauTruc' },
			{
				title: 'Môn học',
				dataIndex: 'monHocId',
				width: 260,
				render: (v: string) => monHocMap[v]?.tenMon ?? '—',
			},
			{
				title: 'Số dòng',
				width: 100,
				render: (_: any, record: CauTrucDeThi) => record.items?.length ?? 0,
			},
			{
				title: 'Thao tác',
				width: 320,
				render: (_: any, record: CauTrucDeThi) => (
					<Space>
						<Button
							type='primary'
							onClick={async () => {
								try {
									await taoDeThiTuCauTruc(record);
								} catch (e: any) {
									message.error(e?.message ?? 'Không tạo được đề thi');
								}
							}}
						>
							Tạo đề thi
						</Button>
						<Button onClick={() => openEditCauTruc(record)}>Sửa</Button>
						<Popconfirm title='Xóa cấu trúc đề thi này?' onConfirm={() => xoaCauTruc(record.id)}>
							<Button danger>Xóa</Button>
						</Popconfirm>
					</Space>
				),
			},
		],
		[monHocMap, khoiMap, danhSachCauHoi],
	);

	const columnsDeThi = useMemo(
		() => [
			{ title: 'Tên đề thi', dataIndex: 'tenDeThi' },
			{
				title: 'Môn học',
				dataIndex: 'monHocId',
				width: 260,
				render: (v: string) => monHocMap[v]?.tenMon ?? '—',
			},
			{
				title: 'Số câu',
				width: 100,
				render: (_: any, record: DeThi) => record.questionIds?.length ?? 0,
			},
			{
				title: 'Thao tác',
				width: 220,
				render: (_: any, record: DeThi) => (
					<Space>
						<Button onClick={() => openEditDeThi(record)}>Chỉnh sửa</Button>
						<Popconfirm title='Xóa đề thi này?' onConfirm={() => xoaDeThi(record.id)}>
							<Button danger>Xóa</Button>
						</Popconfirm>
					</Space>
				),
			},
		],
		[monHocMap],
	);

	const questionOptionsForEditing = useMemo(() => {
		if (!editingDeThi) return [];
		return danhSachCauHoi
			.filter((q: CauHoi) => q.monHocId === editingDeThi.monHocId)
			.map((q: CauHoi) => ({ value: q.id, label: `${q.maCauHoi}: ${q.noiDung}` }));
	}, [danhSachCauHoi, editingDeThi]);

	return (
		<div>
			<Typography.Title level={2}>Quản lý đề thi</Typography.Title>

			<Card
				title='Cấu trúc đề thi'
				extra={
					<Button type='primary' onClick={openCreateCauTruc}>
						Thêm cấu trúc
					</Button>
				}
			>
				<Table<CauTrucDeThi>
					rowKey='id'
					dataSource={danhSachCauTruc}
					columns={columnsCauTruc as any}
					pagination={false}
					locale={{ emptyText: 'Chưa có dữ liệu' }}
				/>
			</Card>

			<Card style={{ marginTop: 16 }} title='Đề thi đã lưu'>
				<Table<DeThi>
					rowKey='id'
					dataSource={danhSachDeThi}
					columns={columnsDeThi as any}
					pagination={{ pageSize: 10 }}
					locale={{ emptyText: 'Chưa có dữ liệu' }}
				/>
			</Card>

			<Modal
				destroyOnClose
				visible={visibleCauTruc}
				title={editingCauTruc ? 'Cập nhật cấu trúc đề' : 'Thêm cấu trúc đề'}
				onCancel={() => setVisibleCauTruc(false)}
				onOk={submitCauTruc}
				okText='Lưu'
				cancelText='Hủy'
				width={900}
			>
				<Form form={formCauTruc} layout='vertical'>
					<Form.Item
						name='tenCauTruc'
						label='Tên cấu trúc'
						rules={[{ required: true, message: 'Vui lòng nhập tên cấu trúc' }]}
					>
						<Input placeholder='VD: Đề giữa kỳ' />
					</Form.Item>
					<Form.Item name='monHocId' label='Môn học' rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}>
						<Select
							showSearch
							optionFilterProp='label'
							options={danhSachMonHoc.map((m: MonHoc) => ({ value: m.id, label: `${m.maMon} - ${m.tenMon}` }))}
						/>
					</Form.Item>

					<Form.List name='items'>
						{(fields, { add, remove }) => (
							<div>
								<Typography.Text strong>Chi tiết cấu trúc (khối kiến thức + mức độ + số lượng)</Typography.Text>
								{fields.map((field) => (
									<Card key={field.key} style={{ marginTop: 12 }}>
										<Space wrap align='start'>
											<Form.Item
												{...field}
												name={[field.name, 'khoiKienThucId']}
												fieldKey={[field.fieldKey as number, 'khoiKienThucId']}
												rules={[{ required: true, message: 'Chọn khối' }]}
												label='Khối kiến thức'
											>
												<Select
													style={{ width: 260 }}
													options={danhSachKhoi.map((k: KhoiKienThuc) => ({ value: k.id, label: k.ten }))}
												/>
											</Form.Item>
											<Form.Item
												{...field}
												name={[field.name, 'mucDo']}
												fieldKey={[field.fieldKey as number, 'mucDo']}
												rules={[{ required: true, message: 'Chọn mức độ' }]}
												label='Mức độ'
											>
												<Select style={{ width: 200 }} options={MUC_DO_OPTIONS} />
											</Form.Item>
											<Form.Item
												{...field}
												name={[field.name, 'soLuong']}
												fieldKey={[field.fieldKey as number, 'soLuong']}
												rules={[{ required: true, message: 'Nhập số lượng' }]}
												label='Số lượng'
											>
												<InputNumber min={1} max={200} style={{ width: 140 }} />
											</Form.Item>
											<Button danger onClick={() => remove(field.name)} style={{ marginTop: 30 }}>
												Xóa dòng
											</Button>
										</Space>
									</Card>
								))}
								<Button style={{ marginTop: 12 }} onClick={() => add({ khoiKienThucId: '', mucDo: 'DE', soLuong: 1 })}>
									Thêm dòng
								</Button>
							</div>
						)}
					</Form.List>
				</Form>
			</Modal>

			<Modal
				destroyOnClose
				visible={visibleDeThi}
				title='Chỉnh sửa đề thi'
				onCancel={() => setVisibleDeThi(false)}
				onOk={submitDeThi}
				okText='Lưu'
				cancelText='Hủy'
				width={900}
			>
				<Form form={formDeThi} layout='vertical'>
					<Form.Item
						name='tenDeThi'
						label='Tên đề thi'
						rules={[{ required: true, message: 'Vui lòng nhập tên đề thi' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name='questionIds'
						label='Danh sách câu hỏi'
						rules={[{ required: true, message: 'Vui lòng chọn câu hỏi' }]}
					>
						<Select mode='multiple' showSearch optionFilterProp='label' options={questionOptionsForEditing} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default DeThiPage;
