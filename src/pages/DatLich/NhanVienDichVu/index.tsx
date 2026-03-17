import React, { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Form, Input, InputNumber, Modal, Space, Table, Tabs, TimePicker, message } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { useModel } from 'umi';
import type { Employee, Service, WorkingDay } from '@/models/booking';
import type bookingModel from '@/models/booking';

type BookingModel = ReturnType<typeof bookingModel>;

const dayOptions = [
	{ label: 'CN', value: 0 },
	{ label: 'T2', value: 1 },
	{ label: 'T3', value: 2 },
	{ label: 'T4', value: 3 },
	{ label: 'T5', value: 4 },
	{ label: 'T6', value: 5 },
	{ label: 'T7', value: 6 },
];

function formatWorkingHours(workingHours: WorkingDay[]) {
	if (!workingHours?.length) return '-';
	// assume same start/end for simplicity; group by start-end
	const groups = new Map<string, number[]>();
	workingHours.forEach((w) => {
		const key = `${w.start}-${w.end}`;
		const days = groups.get(key) ?? [];
		groups.set(key, [...days, w.dayOfWeek]);
	});

	return Array.from(groups.entries())
		.map(([key, days]) => {
			const [start, end] = key.split('-');
			const labelDays = days
				.sort((a, b) => a - b)
				.map((d) => dayOptions.find((x) => x.value === d)?.label)
				.filter(Boolean)
				.join(', ');
			return `${labelDays}: ${start}-${end}`;
		})
		.join(' | ');
}

const EmployeeServicePage: React.FC = () => {
	const { init, employees, services, upsertEmployee, deleteEmployee, upsertService, deleteService } = useModel(
		'booking' as any,
	) as BookingModel;

	useEffect(() => {
		init();
	}, [init]);

	const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
	const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
	const [serviceModalOpen, setServiceModalOpen] = useState(false);
	const [editingService, setEditingService] = useState<Service | undefined>();

	const [employeeForm] = Form.useForm();
	const [serviceForm] = Form.useForm();

	const employeeColumns: ColumnsType<Employee> = useMemo(
		() => [
			{ title: 'Tên nhân viên', dataIndex: 'name' },
			{ title: 'Giới hạn khách/ngày', dataIndex: 'dailyLimit', width: 180 },
			{
				title: 'Lịch làm việc',
				dataIndex: 'workingHours',
				render: (v) => formatWorkingHours(v as WorkingDay[]),
			},
			{
				title: 'Thao tác',
				width: 200,
				render: (_, record) => (
					<Space>
						<Button
							onClick={() => {
								setEditingEmployee(record);
								setEmployeeModalOpen(true);
								const days = record.workingHours.map((w) => w.dayOfWeek);
								const first = record.workingHours[0];
								employeeForm.setFieldsValue({
									name: record.name,
									dailyLimit: record.dailyLimit,
									workingDays: days,
									timeRange: first ? [moment(first.start, 'HH:mm'), moment(first.end, 'HH:mm')] : undefined,
								});
							}}
						>
							Sửa
						</Button>
						<Button
							danger
							onClick={() => {
								Modal.confirm({
									title: 'Xóa nhân viên?',
									content: 'Dữ liệu lịch hẹn/đánh giá sẽ được giữ lại như lịch sử.',
									onOk: () => deleteEmployee(record.id),
								});
							}}
						>
							Xóa
						</Button>
					</Space>
				),
			},
		],
		[deleteEmployee, employeeForm],
	);

	const serviceColumns: ColumnsType<Service> = useMemo(
		() => [
			{ title: 'Tên dịch vụ', dataIndex: 'name' },
			{
				title: 'Giá',
				dataIndex: 'price',
				width: 160,
				render: (v) => (Number(v) || 0).toLocaleString('vi-VN'),
			},
			{ title: 'Thời gian (phút)', dataIndex: 'durationMinutes', width: 160 },
			{
				title: 'Thao tác',
				width: 200,
				render: (_, record) => (
					<Space>
						<Button
							onClick={() => {
								setEditingService(record);
								setServiceModalOpen(true);
								serviceForm.setFieldsValue(record);
							}}
						>
							Sửa
						</Button>
						<Button
							danger
							onClick={() => {
								Modal.confirm({
									title: 'Xóa dịch vụ?',
									onOk: () => deleteService(record.id),
								});
							}}
						>
							Xóa
						</Button>
					</Space>
				),
			},
		],
		[deleteService, serviceForm],
	);

	return (
		<div>
			<Tabs defaultActiveKey='employees'>
				<Tabs.TabPane tab='Nhân viên' key='employees'>
					<Space style={{ marginBottom: 12 }}>
						<Button
							type='primary'
							onClick={() => {
								setEditingEmployee(undefined);
								setEmployeeModalOpen(true);
								employeeForm.resetFields();
							}}
						>
							Thêm nhân viên
						</Button>
					</Space>
					<Table rowKey='id' columns={employeeColumns} dataSource={employees} />
				</Tabs.TabPane>
				<Tabs.TabPane tab='Dịch vụ' key='services'>
					<Space style={{ marginBottom: 12 }}>
						<Button
							type='primary'
							onClick={() => {
								setEditingService(undefined);
								setServiceModalOpen(true);
								serviceForm.resetFields();
							}}
						>
							Thêm dịch vụ
						</Button>
					</Space>
					<Table rowKey='id' columns={serviceColumns} dataSource={services} />
				</Tabs.TabPane>
			</Tabs>

			<Modal
				destroyOnClose
				visible={employeeModalOpen}
				title={editingEmployee ? 'Sửa nhân viên' : 'Thêm nhân viên'}
				onCancel={() => {
					setEmployeeModalOpen(false);
					setEditingEmployee(undefined);
				}}
				onOk={async () => {
					try {
						const values = await employeeForm.validateFields();
						const [start, end] = values.timeRange as [moment.Moment, moment.Moment];
						const workingHours: WorkingDay[] = (values.workingDays as number[]).map((d) => ({
							dayOfWeek: d,
							start: start.format('HH:mm'),
							end: end.format('HH:mm'),
						}));
						upsertEmployee({
							id: editingEmployee?.id,
							name: values.name,
							dailyLimit: values.dailyLimit,
							workingHours,
						});
						setEmployeeModalOpen(false);
						setEditingEmployee(undefined);
						message.success('Đã lưu nhân viên');
					} catch (e: any) {
						message.error(e?.message || 'Không thể lưu nhân viên');
					}
				}}
			>
				<Form form={employeeForm} layout='vertical' initialValues={{ dailyLimit: 10, workingDays: [1, 2, 3, 4, 5] }}>
					<Form.Item name='name' label='Tên nhân viên' rules={[{ required: true, message: 'Nhập tên nhân viên' }]}>
						<Input placeholder='Ví dụ: Nguyễn Văn A' />
					</Form.Item>
					<Form.Item
						name='dailyLimit'
						label='Giới hạn khách/ngày'
						rules={[{ required: true, message: 'Nhập giới hạn' }]}
					>
						<InputNumber min={1} style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item
						name='workingDays'
						label='Ngày làm việc'
						rules={[{ required: true, message: 'Chọn ngày làm việc' }]}
					>
						<Checkbox.Group options={dayOptions} />
					</Form.Item>
					<Form.Item
						name='timeRange'
						label='Khung giờ làm việc'
						rules={[{ required: true, message: 'Chọn khung giờ làm việc' }]}
					>
						<TimePicker.RangePicker format='HH:mm' minuteStep={15} style={{ width: '100%' }} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				destroyOnClose
				visible={serviceModalOpen}
				title={editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
				onCancel={() => {
					setServiceModalOpen(false);
					setEditingService(undefined);
				}}
				onOk={async () => {
					try {
						const values = await serviceForm.validateFields();
						upsertService({
							id: editingService?.id,
							name: values.name,
							price: values.price,
							durationMinutes: values.durationMinutes,
						});
						setServiceModalOpen(false);
						setEditingService(undefined);
						message.success('Đã lưu dịch vụ');
					} catch (e: any) {
						message.error(e?.message || 'Không thể lưu dịch vụ');
					}
				}}
			>
				<Form form={serviceForm} layout='vertical'>
					<Form.Item name='name' label='Tên dịch vụ' rules={[{ required: true, message: 'Nhập tên dịch vụ' }]}>
						<Input placeholder='Ví dụ: Cắt tóc' />
					</Form.Item>
					<Form.Item name='price' label='Giá' rules={[{ required: true, message: 'Nhập giá' }]}>
						<InputNumber min={0} style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item
						name='durationMinutes'
						label='Thời gian thực hiện (phút)'
						rules={[{ required: true, message: 'Nhập thời gian' }]}
					>
						<InputNumber min={1} style={{ width: '100%' }} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default EmployeeServicePage;
