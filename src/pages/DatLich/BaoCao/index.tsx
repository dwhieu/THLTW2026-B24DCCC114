import React, { useEffect, useMemo, useState } from 'react';
import { DatePicker, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { useModel } from 'umi';
import type { Appointment } from '@/models/booking';
import type bookingModel from '@/models/booking';

type BookingModel = ReturnType<typeof bookingModel>;

type RangeValue = [moment.Moment, moment.Moment] | null;

function groupCount(items: Appointment[], keyFn: (a: Appointment) => string) {
	const map = new Map<string, number>();
	items.forEach((a) => {
		const key = keyFn(a);
		map.set(key, (map.get(key) ?? 0) + 1);
	});
	return Array.from(map.entries())
		.map(([key, count]) => ({ key, count }))
		.sort((a, b) => (a.key > b.key ? 1 : -1));
}

const ReportPage: React.FC = () => {
	const { init, appointments, getEmployeeName, getServiceName, getServicePrice } = useModel(
		'booking' as any,
	) as BookingModel;

	useEffect(() => {
		init();
	}, [init]);

	const [range, setRange] = useState<RangeValue>(() => {
		const start = moment().startOf('month');
		const end = moment().endOf('month');
		return [start, end];
	});

	const completedAppointmentsInRange = useMemo(() => {
		const completed = appointments.filter((a) => a.status === 'completed');
		if (!range) return completed;
		const [start, end] = range;
		return completed.filter((a) => {
			const d = moment(a.date, 'YYYY-MM-DD');
			return d.isSameOrAfter(start, 'day') && d.isSameOrBefore(end, 'day');
		});
	}, [appointments, range]);

	const countByDay = useMemo(
		() => groupCount(completedAppointmentsInRange, (a) => a.date),
		[completedAppointmentsInRange],
	);
	const countByMonth = useMemo(
		() => groupCount(completedAppointmentsInRange, (a) => moment(a.date, 'YYYY-MM-DD').format('YYYY-MM')),
		[completedAppointmentsInRange],
	);

	const revenueByService = useMemo(() => {
		const map = new Map<string, { serviceId: string; count: number; revenue: number }>();
		completedAppointmentsInRange.forEach((a) => {
			const cur = map.get(a.serviceId) ?? { serviceId: a.serviceId, count: 0, revenue: 0 };
			const price = getServicePrice(a.serviceId);
			map.set(a.serviceId, { serviceId: a.serviceId, count: cur.count + 1, revenue: cur.revenue + price });
		});
		return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
	}, [completedAppointmentsInRange, getServicePrice]);

	const revenueByStaff = useMemo(() => {
		const map = new Map<string, { staffId: string; count: number; revenue: number }>();
		completedAppointmentsInRange.forEach((a) => {
			const cur = map.get(a.staffId) ?? { staffId: a.staffId, count: 0, revenue: 0 };
			const price = getServicePrice(a.serviceId);
			map.set(a.staffId, { staffId: a.staffId, count: cur.count + 1, revenue: cur.revenue + price });
		});
		return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
	}, [completedAppointmentsInRange, getServicePrice]);

	const countColumns: ColumnsType<any> = [
		{ title: 'Mốc thời gian', dataIndex: 'key' },
		{ title: 'Số lịch hẹn', dataIndex: 'count', width: 120 },
	];

	const revenueServiceColumns: ColumnsType<any> = [
		{ title: 'Dịch vụ', dataIndex: 'serviceId', render: (v) => getServiceName(String(v)) },
		{ title: 'Số lượt', dataIndex: 'count', width: 120 },
		{ title: 'Doanh thu', dataIndex: 'revenue', width: 160, render: (v) => (Number(v) || 0).toLocaleString('vi-VN') },
	];

	const revenueStaffColumns: ColumnsType<any> = [
		{ title: 'Nhân viên', dataIndex: 'staffId', render: (v) => getEmployeeName(String(v)) },
		{ title: 'Số lượt', dataIndex: 'count', width: 120 },
		{ title: 'Doanh thu', dataIndex: 'revenue', width: 160, render: (v) => (Number(v) || 0).toLocaleString('vi-VN') },
	];

	return (
		<div>
			<Space style={{ marginBottom: 12 }}>
				<DatePicker.RangePicker
					value={range as any}
					format='YYYY-MM-DD'
					onChange={(v) => setRange(v as any)}
					allowClear
				/>
				<span style={{ color: '#666' }}>Chỉ tính lịch hẹn trạng thái “Hoàn thành”</span>
			</Space>

			<h3>Thống kê số lượng lịch hẹn theo ngày</h3>
			<Table
				rowKey='key'
				columns={countColumns}
				dataSource={countByDay}
				pagination={false}
				locale={{ emptyText: 'Không có dữ liệu' }}
			/>

			<h3 style={{ marginTop: 16 }}>Thống kê số lượng lịch hẹn theo tháng</h3>
			<Table
				rowKey='key'
				columns={countColumns}
				dataSource={countByMonth}
				pagination={false}
				locale={{ emptyText: 'Không có dữ liệu' }}
			/>

			<h3 style={{ marginTop: 16 }}>Doanh thu theo dịch vụ</h3>
			<Table
				rowKey='serviceId'
				columns={revenueServiceColumns}
				dataSource={revenueByService}
				pagination={false}
				locale={{ emptyText: 'Không có dữ liệu' }}
			/>

			<h3 style={{ marginTop: 16 }}>Doanh thu theo nhân viên</h3>
			<Table
				rowKey='staffId'
				columns={revenueStaffColumns}
				dataSource={revenueByStaff}
				pagination={false}
				locale={{ emptyText: 'Không có dữ liệu' }}
			/>
		</div>
	);
};

export default ReportPage;
