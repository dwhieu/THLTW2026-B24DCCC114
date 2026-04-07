import { Alert, Card, Col, InputNumber, Row, Space, Statistic, Typography } from 'antd';
import { useEffect, useMemo } from 'react';
import { useModel } from 'umi';
import DonutChart from '@/components/Chart/DonutChart';
import ColumnChart from '@/components/Chart/ColumnChart';
import { tienVietNam } from '@/utils/utils';

const { Text } = Typography;

const BudgetPage = () => {
	const travel = useModel('travel');
	useEffect(() => {
		travel.bootstrap();
	}, []);

	const totals = travel.getTotals();
	const overBudget = (totals?.budget.total ?? 0) > travel.totalBudget;

	const donutData = useMemo(() => {
		const b = totals?.budget;
		return {
			xAxis: ['Ăn uống', 'Lưu trú', 'Di chuyển', 'Vé/Khác'],
			yAxis: [[b?.food ?? 0, b?.lodging ?? 0, b?.transport ?? 0, b?.tickets ?? 0]],
			yLabel: ['Chi tiêu'],
			showTotal: true,
			formatY: tienVietNam,
		};
	}, [totals?.budget]);

	return (
		<Row gutter={[12, 12]}>
			<Col xs={24} lg={10}>
				<Card title='Thiết lập ngân sách'>
					<Space direction='vertical' style={{ width: '100%' }} size={12}>
						<Space wrap>
							<Text strong>Tổng ngân sách</Text>
							<InputNumber
								style={{ minWidth: 220 }}
								min={0}
								step={50000}
								value={travel.totalBudget}
								onChange={(v) => travel.updateTotalBudget(v ?? 0)}
								formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
							/>
						</Space>

						<Row gutter={[12, 12]}>
							<Col xs={24} sm={12}>
								<Statistic
									title='Chi tiêu ước tính'
									value={totals?.budget.total ?? 0}
									formatter={(v) => tienVietNam(Number(v))}
								/>
							</Col>
							<Col xs={24} sm={12}>
								<Statistic
									title={overBudget ? 'Vượt ngân sách' : 'Còn lại'}
									value={Math.abs(travel.totalBudget - (totals?.budget.total ?? 0))}
									valueStyle={overBudget ? { color: '#cf1322' } : undefined}
									formatter={(v) => tienVietNam(Number(v))}
								/>
							</Col>
						</Row>

						{overBudget ? (
							<Alert
								showIcon
								type='error'
								message='Cảnh báo vượt ngân sách'
								description='Hãy giảm số điểm đến hoặc điều chỉnh chi phí từng hạng mục.'
							/>
						) : (
							<Alert
								showIcon
								type='success'
								message='Ngân sách hợp lệ'
								description='Chi tiêu ước tính đang trong ngân sách.'
							/>
						)}
					</Space>
				</Card>
			</Col>

			<Col xs={24} lg={14}>
				<Card title='Phân bổ ngân sách theo hạng mục'>
					<DonutChart {...donutData} />
				</Card>
			</Col>

			<Col xs={24}>
				<Card title='So sánh tổng ngân sách'>
					<ColumnChart
						xAxis={['Tổng']}
						yLabel={['Ngân sách', 'Chi tiêu ước tính']}
						yAxis={[[travel.totalBudget], [totals?.budget.total ?? 0]]}
						formatY={tienVietNam}
						height={280}
					/>
				</Card>
			</Col>
		</Row>
	);
};

export default BudgetPage;
