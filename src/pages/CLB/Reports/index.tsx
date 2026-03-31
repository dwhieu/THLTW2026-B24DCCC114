import ColumnChart from '@/components/Chart/ColumnChart';
import { clbDb } from '@/utils/clbLocalDb';
import { Card, Col, Row, Statistic } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const ReportsPage = () => {
	const [clubs, setClubs] = useState<CLB.IClubRecord[]>([]);
	const [apps, setApps] = useState<CLB.IApplicationRecord[]>([]);

	useEffect(() => {
		setClubs(clbDb.getClubs());
		setApps(clbDb.getApplications());
	}, []);

	const summary = useMemo(() => {
		const pending = apps.filter((a) => a.trangThai === 'Pending').length;
		const approved = apps.filter((a) => a.trangThai === 'Approved').length;
		const rejected = apps.filter((a) => a.trangThai === 'Rejected').length;
		return {
			clubCount: clubs.length,
			pending,
			approved,
			rejected,
		};
	}, [clubs, apps]);

	const chart = useMemo(() => {
		const xAxis = clubs.map((c) => c.ten);
		const pending: number[] = [];
		const approved: number[] = [];
		const rejected: number[] = [];

		clubs.forEach((c) => {
			const byClub = apps.filter((a) => a.clubId === c._id);
			pending.push(byClub.filter((a) => a.trangThai === 'Pending').length);
			approved.push(byClub.filter((a) => a.trangThai === 'Approved').length);
			rejected.push(byClub.filter((a) => a.trangThai === 'Rejected').length);
		});

		return { xAxis, yAxis: [pending, approved, rejected] };
	}, [clubs, apps]);

	return (
		<>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={6}>
					<Card>
						<Statistic title='Số CLB' value={summary.clubCount} />
					</Card>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<Card>
						<Statistic title='Đơn Pending' value={summary.pending} />
					</Card>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<Card>
						<Statistic title='Đơn Approved' value={summary.approved} />
					</Card>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<Card>
						<Statistic title='Đơn Rejected' value={summary.rejected} />
					</Card>
				</Col>
			</Row>

			<Card style={{ marginTop: 16 }}>
				<ColumnChart
					title='Số đơn đăng ký theo từng CLB'
					xAxis={chart.xAxis}
					yAxis={chart.yAxis}
					yLabel={['Pending', 'Approved', 'Rejected']}
					formatY={(v) => v.toString()}
					height={420}
				/>
			</Card>
		</>
	);
};

export default ReportsPage;
