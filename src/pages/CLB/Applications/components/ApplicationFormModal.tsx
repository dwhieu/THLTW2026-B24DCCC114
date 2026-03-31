import rules from '@/utils/rules';
import { resetFieldsForm } from '@/utils/utils';
import { DatePicker, Form, Input, Modal, Select, Tag } from 'antd';
import moment from 'moment';
import { useEffect, useMemo } from 'react';

type Mode = 'create' | 'edit' | 'view';

type Props = {
	visible: boolean;
	mode: Mode;
	record?: CLB.IApplicationRecord;
	clubs: CLB.IClubRecord[];
	onCancel: () => void;
	onSubmit: (
		payload: Omit<CLB.IApplicationRecord, '_id' | 'createdAt' | 'updatedAt' | 'lichSu'> &
			Partial<Pick<CLB.IApplicationRecord, '_id'>>,
	) => void;
};

const ApplicationFormModal = (props: Props) => {
	const { visible, mode, record, clubs, onCancel, onSubmit } = props;
	const [form] = Form.useForm();
	const isView = mode === 'view';

	useEffect(() => {
		if (!visible) {
			resetFieldsForm(form);
			return;
		}
		if (record?._id) {
			form.setFieldsValue({
				hoTen: record.hoTen,
				email: record.email,
				sdt: record.sdt,
				gioiTinh: record.gioiTinh,
				diaChi: record.diaChi,
				soTruong: record.soTruong,
				clubId: record.clubId,
				lyDoDangKy: record.lyDoDangKy,
				trangThai: record.trangThai,
				ghiChu: record.ghiChu,
				createdAt: record.createdAt ? moment(record.createdAt) : null,
			});
		} else {
			form.setFieldsValue({ trangThai: 'Pending' });
		}
	}, [visible, record?._id, mode]);

	const title = useMemo(() => {
		if (mode === 'create') return 'Thêm mới đơn đăng ký';
		if (mode === 'edit') return 'Chỉnh sửa đơn đăng ký';
		return 'Chi tiết đơn đăng ký';
	}, [mode]);

	const handleOk = async () => {
		const values = await form.validateFields();
		onSubmit({
			_id: record?._id,
			hoTen: values.hoTen,
			email: values.email,
			sdt: values.sdt,
			gioiTinh: values.gioiTinh,
			diaChi: values.diaChi ?? null,
			soTruong: values.soTruong ?? null,
			clubId: values.clubId ?? null,
			lyDoDangKy: values.lyDoDangKy ?? null,
			trangThai: record?.trangThai ?? 'Pending',
			ghiChu: values.ghiChu ?? null,
		});
	};

	return (
		<Modal
			visible={visible}
			title={title}
			onCancel={onCancel}
			onOk={isView ? onCancel : handleOk}
			okText={isView ? 'Đóng' : mode === 'create' ? 'Thêm mới' : 'Lưu'}
			cancelButtonProps={{ style: { display: isView ? 'none' : undefined } }}
			destroyOnClose
			width={900}
		>
			<Form form={form} layout='vertical' disabled={isView}>
				<Form.Item name='hoTen' label='Họ tên' rules={[...rules.required, ...rules.text, ...rules.length(250)]}>
					<Input placeholder='Nhập họ tên' />
				</Form.Item>

				<Form.Item name='email' label='Email' rules={[...rules.required, ...rules.email, ...rules.length(250)]}>
					<Input placeholder='Nhập email' />
				</Form.Item>

				<Form.Item name='sdt' label='SĐT' rules={[...rules.required, ...rules.soDienThoai]}>
					<Input placeholder='Nhập số điện thoại' />
				</Form.Item>

				<Form.Item name='gioiTinh' label='Giới tính' rules={[...rules.required]}>
					<Select options={['Nam', 'Nữ', 'Khác'].map((x) => ({ value: x, label: x }))} placeholder='Chọn giới tính' />
				</Form.Item>

				<Form.Item name='diaChi' label='Địa chỉ' rules={[...rules.length(500)]}>
					<Input placeholder='Nhập địa chỉ' />
				</Form.Item>

				<Form.Item name='soTruong' label='Sở trường' rules={[...rules.length(500)]}>
					<Input placeholder='Nhập sở trường' />
				</Form.Item>

				<Form.Item name='clubId' label='Câu lạc bộ' rules={[...rules.required]}>
					<Select
						showSearch
						optionFilterProp='label'
						options={clubs.map((c) => ({ value: c._id, label: c.ten }))}
						placeholder='Chọn câu lạc bộ'
					/>
				</Form.Item>

				<Form.Item name='lyDoDangKy' label='Lý do đăng ký' rules={[...rules.length(2000)]}>
					<Input.TextArea rows={4} placeholder='Nhập lý do đăng ký' />
				</Form.Item>

				<Form.Item name='trangThai' label='Trạng thái' rules={[...rules.required]}>
					<Select
						disabled
						options={[
							{ value: 'Pending', label: <Tag>Pending</Tag> },
							{ value: 'Approved', label: <Tag color='green'>Approved</Tag> },
							{ value: 'Rejected', label: <Tag color='red'>Rejected</Tag> },
						]}
					/>
				</Form.Item>

				<Form.Item name='ghiChu' label='Ghi chú (lý do từ chối)'>
					<Input.TextArea rows={3} placeholder='(Tuỳ chọn) Ghi chú' />
				</Form.Item>

				{record?.createdAt ? (
					<Form.Item name='createdAt' label='Thời gian tạo'>
						<DatePicker showTime disabled style={{ width: '100%' }} />
					</Form.Item>
				) : null}
			</Form>
		</Modal>
	);
};

export default ApplicationFormModal;
