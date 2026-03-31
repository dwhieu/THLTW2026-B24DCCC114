import rules from '@/utils/rules';
import { blobToBase64, resetFieldsForm } from '@/utils/utils';
import { DatePicker, Form, Input, Modal, Switch } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import UploadFile from '@/components/Upload/UploadFile';

type Props = {
	visible: boolean;
	mode: 'create' | 'edit';
	record?: CLB.IClubRecord;
	onCancel: () => void;
	onSubmit: (
		payload: Omit<CLB.IClubRecord, '_id' | 'createdAt' | 'updatedAt'> & Partial<Pick<CLB.IClubRecord, '_id'>>,
	) => void;
};

const ClubFormModal = (props: Props) => {
	const { visible, onCancel, onSubmit, record, mode } = props;
	const [form] = Form.useForm();
	const [avatar, setAvatar] = useState<string | null | undefined>(record?.anhDaiDien ?? null);

	useEffect(() => {
		if (!visible) {
			resetFieldsForm(form);
			setAvatar(null);
			return;
		}
		if (record?._id) {
			form.setFieldsValue({
				ten: record.ten,
				ngayThanhLap: record.ngayThanhLap ? moment(record.ngayThanhLap) : null,
				moTaHtml: record.moTaHtml,
				chuNhiem: record.chuNhiem,
				hoatDong: record.hoatDong,
			});
			setAvatar(record.anhDaiDien ?? null);
		} else {
			form.setFieldsValue({ hoatDong: true });
			setAvatar(null);
		}
	}, [visible, record?._id]);

	const title = useMemo(() => (mode === 'create' ? 'Thêm mới câu lạc bộ' : 'Chỉnh sửa câu lạc bộ'), [mode]);

	const handleOk = async () => {
		const values = await form.validateFields();
		onSubmit({
			_id: record?._id,
			anhDaiDien: avatar ?? null,
			ten: values.ten,
			ngayThanhLap: values.ngayThanhLap ? (values.ngayThanhLap as moment.Moment).toISOString() : null,
			moTaHtml: values.moTaHtml ?? null,
			chuNhiem: values.chuNhiem ?? null,
			hoatDong: values.hoatDong ?? false,
		});
	};

	const onAvatarChange = async (val: any) => {
		const file = val?.fileList?.[0];
		if (!file) {
			setAvatar(null);
			return;
		}
		if (file?.remote === true && file?.url) {
			setAvatar(file.url);
			return;
		}
		const blob = (file.originFileObj ?? file) as RcFile;
		const b64 = await blobToBase64(blob);
		setAvatar(b64);
	};

	return (
		<Modal
			destroyOnClose
			visible={visible}
			title={title}
			onCancel={onCancel}
			onOk={handleOk}
			okText={mode === 'create' ? 'Thêm mới' : 'Lưu'}
			cancelText='Hủy'
			width={900}
		>
			<Form form={form} layout='vertical'>
				<Form.Item label='Ảnh đại diện'>
					<UploadFile
						isAvatar
						value={avatar}
						onChange={onAvatarChange}
						otherProps={{ accept: 'png,jpg,jpeg,webp' }}
						resize
					/>
				</Form.Item>

				<Form.Item name='ten' label='Tên câu lạc bộ' rules={[...rules.required, ...rules.text, ...rules.length(250)]}>
					<Input placeholder='Nhập tên câu lạc bộ' />
				</Form.Item>

				<Form.Item name='ngayThanhLap' label='Ngày thành lập'>
					<DatePicker format='DD/MM/YYYY' style={{ width: '100%' }} />
				</Form.Item>

				<Form.Item name='chuNhiem' label='Chủ nhiệm CLB' rules={[...rules.text, ...rules.length(250)]}>
					<Input placeholder='Nhập tên chủ nhiệm' />
				</Form.Item>

				<Form.Item name='moTaHtml' label='Mô tả' extra='Nhập mô tả CLB' rules={[...rules.length(5000)]}>
					<Input.TextArea placeholder='Nhập mô tả' rows={6} />
				</Form.Item>

				<Form.Item name='hoatDong' label='Hoạt động' valuePropName='checked'>
					<Switch checkedChildren='Có' unCheckedChildren='Không' />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default ClubFormModal;
