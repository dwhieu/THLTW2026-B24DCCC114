import React, { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input, Select, Space, Table, Tag, TimePicker, message } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import type { Moment } from 'moment';
import { useModel } from 'umi';
import type { Appointment, BookingStatus } from '@/models/booking';
import type bookingModel from '@/models/booking';

type BookingModel = ReturnType<typeof bookingModel>;

const statusLabel: Record<BookingStatus, string> = {
	pending: 'Chờ duyệt',
	confirmed: 'Xác nhận',
	completed: 'Hoàn thành',
	cancelled: 'Hủy',
};

const statusColor: Record<BookingStatus, string> = {
	pending: 'gold',
	confirmed: 'blue',
	completed: 'green',
	cancelled: 'red',
};

const AppointmentPage: React.FC = () => {
	const {
		init,
		employees,
		services,
		appointments,
		createAppointment,
		updateAppointmentStatus,
		getEmployeeName,
		getServiceName,
		getServiceDuration,
	} = useModel('booking' as any) as BookingModel;

	useEffect(() => {
		init();
	}, [init]);

	const [form] = Form.useForm();
	const [endTimePreview, setEndTimePreview] = useState<string>('');

	const serviceOptions = useMemo(
		() => services.map((s) => ({ label: `${s.name} (${s.durationMinutes}p)`, value: s.id })),
		[services],
	);

	const staffOptions = useMemo(() => employees.map((e) => ({ label: e.name, value: e.id })), [employees]);

	const columns: ColumnsType<Appointment> = useMemo(
		() => [
			{ title: 'Ngày', dataIndex: 'date', width: 120 },
			{ title: 'Giờ', render: (_, r) => `${r.startTime} - ${r.endTime}`, width: 120 },
			{ title: 'Dịch vụ', dataIndex: 'serviceId', render: (v) => getServiceName(String(v)) },
			{ title: 'Nhân viên', dataIndex: 'staffId', render: (v) => getEmployeeName(String(v)) },
			{ title: 'Khách hàng', dataIndex: 'customerName' },
			{
				title: 'Trạng thái',
				dataIndex: 'status',
				width: 140,
				render: (v) => <Tag color={statusColor[v as BookingStatus]}>{statusLabel[v as BookingStatus]}</Tag>,
			},
			{
				title: 'Cập nhật',
				width: 220,
				render: (_, record) => (
					<Select
						value={record.status}
						style={{ width: '100%' }}
						onChange={(next) => updateAppointmentStatus(record.id, next as BookingStatus)}
						options={Object.keys(statusLabel).map((k) => ({
							value: k,
							label: statusLabel[k as BookingStatus],
						}))}
					/>
				),
			},
		],
		[getEmployeeName, getServiceName, updateAppointmentStatus],
	);

	return (
		<div>
			<Form
				form={form}
				layout='inline'
				onValuesChange={(changed, all) => {
					const serviceId = all.serviceId as string | undefined;
					const startTime = all.startTime as Moment | undefined;
					if (serviceId && startTime) {
						const duration = getServiceDuration(serviceId);
						setEndTimePreview(startTime.clone().add(duration, 'minutes').format('HH:mm'));
					} else {
						setEndTimePreview('');
					}
				}}
				style={{ marginBottom: 12 }}
			>
				<Form.Item name='customerName' rules={[{ required: true, message: 'Nhập tên khách' }]}>
					<Input placeholder='Tên khách hàng' style={{ width: 180 }} />
				</Form.Item>
				<Form.Item name='customerPhone'>
					<Input placeholder='SĐT (tuỳ chọn)' style={{ width: 150 }} />
				</Form.Item>
				<Form.Item name='serviceId' rules={[{ required: true, message: 'Chọn dịch vụ' }]}>
					<Select placeholder='Dịch vụ' style={{ width: 220 }} options={serviceOptions} />
				</Form.Item>
				<Form.Item name='staffId' rules={[{ required: true, message: 'Chọn nhân viên' }]}>
					<Select placeholder='Nhân viên' style={{ width: 200 }} options={staffOptions} />
				</Form.Item>
				<Form.Item name='date' rules={[{ required: true, message: 'Chọn ngày' }]}>
					<DatePicker format='YYYY-MM-DD' />
				</Form.Item>
				<Form.Item name='startTime' rules={[{ required: true, message: 'Chọn giờ' }]}>
					<TimePicker format='HH:mm' minuteStep={15} />
				</Form.Item>
				<Form.Item name='note'>
					<Input placeholder='Ghi chú (tuỳ chọn)' style={{ width: 200 }} />
				</Form.Item>
				<Form.Item>
					<Button
						type='primary'
						onClick={async () => {
							try {
								const values = await form.validateFields();
								createAppointment({
									customerName: values.customerName,
									customerPhone: values.customerPhone,
									serviceId: values.serviceId,
									staffId: values.staffId,
									date: (values.date as Moment).format('YYYY-MM-DD'),
									startTime: (values.startTime as Moment).format('HH:mm'),
									note: values.note,
								});
								form.resetFields();
								setEndTimePreview('');
								message.success('Đã tạo lịch hẹn');
							} catch (e: any) {
								message.error(e?.message || 'Không thể tạo lịch hẹn');
							}
						}}
					>
						Đặt lịch
					</Button>
				</Form.Item>
				{endTimePreview ? (
					<Form.Item>
						<Space style={{ color: '#999' }}>Giờ kết thúc dự kiến: {endTimePreview}</Space>
					</Form.Item>
				) : null}
			</Form>

			<Table rowKey='id' columns={columns} dataSource={appointments} />
		</div>
	);
};

export default AppointmentPage;
