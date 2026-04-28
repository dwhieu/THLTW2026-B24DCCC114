import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Timeline, Typography, Tag } from 'antd';
import { FireOutlined, TrophyOutlined, CalendarOutlined, AimOutlined } from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    const w = JSON.parse(localStorage.getItem('fitness_workouts') || '[]');
    const m = JSON.parse(localStorage.getItem('fitness_health_metrics') || '[]');
    const g = JSON.parse(localStorage.getItem('fitness_goals') || '[]');
    
    setWorkouts(w);
    setMetrics(m);
    setGoals(g);
  }, []);


  const thisMonth = moment().startOf('month');
  const workoutsThisMonth = workouts.filter(w => moment(w.date).isSameOrAfter(thisMonth) && w.status === 'Hoàn thành');
  
  const totalWorkouts = workoutsThisMonth.length;
  const totalCalories = workoutsThisMonth.reduce((sum, w) => sum + (Number(w.calories) || 0), 0);
  

  let streak = 0;
  const completedDates = Array.from(new Set(workouts
    .filter(w => w.status === 'Hoàn thành')
    .map(w => moment(w.date).startOf('day').format('YYYY-MM-DD'))
  )).sort((a, b) => moment(b).valueOf() - moment(a).valueOf());

  if (completedDates.length > 0) {
    let today = moment().startOf('day');
    let lastWorkoutDay = moment(completedDates[0]);
    

    if (today.diff(lastWorkoutDay, 'days') <= 1) {
      streak = 1;
      let checkDate = lastWorkoutDay.clone().subtract(1, 'days');
      for (let i = 1; i < completedDates.length; i++) {
        if (moment(completedDates[i]).isSame(checkDate, 'day')) {
          streak++;
          checkDate.subtract(1, 'days');
        } else {
          break;
        }
      }
    }
  }


  const completedGoals = goals.filter(g => g.status === 'Đã đạt').length;
  const goalCompletionPercent = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;


  const weeksInMonth = [0, 0, 0, 0, 0];
  workoutsThisMonth.forEach(w => {
    const week = moment(w.date).week() - moment().startOf('month').week();
    if (week >= 0 && week < 5) {
      weeksInMonth[week]++;
    }
  });

  const columnChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', height: 350 },
    xaxis: { categories: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5'] },
    colors: ['#1890ff'],
    title: { text: 'Số buổi tập trong tháng' }
  };
  const columnChartSeries = [{ name: 'Buổi tập', data: weeksInMonth }];


  const sortedMetrics = [...metrics].sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());
  const weightDates = sortedMetrics.map(m => moment(m.date).format('DD/MM'));
  const weights = sortedMetrics.map(m => m.weight);

  const lineChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'line', height: 350 },
    xaxis: { categories: weightDates },
    stroke: { curve: 'smooth' },
    colors: ['#52c41a'],
    title: { text: 'Biến động cân nặng (kg)' },
    markers: { size: 4 }
  };
  const lineChartSeries = [{ name: 'Cân nặng', data: weights }];


  const recentWorkouts = [...workouts]
    .sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf())
    .slice(0, 5);

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: 24 }}>Tổng quan cá nhân</Title>
      

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Tổng buổi tập (Tháng)"
              value={totalWorkouts}
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
              suffix="buổi"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Tổng Calo đã đốt (Tháng)"
              value={totalCalories}
              prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
              suffix="kcal"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Streak (Liên tiếp)"
              value={streak}
              prefix={<TrophyOutlined style={{ color: '#fadb14' }} />}
              suffix="ngày"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Mục tiêu hoàn thành"
              value={goalCompletionPercent}
              prefix={<AimOutlined style={{ color: '#52c41a' }} />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>

        <Col xs={24} lg={12}>
          <Card bordered={false} style={{ height: '100%' }}>
            <ReactApexChart options={columnChartOptions} series={columnChartSeries} type="bar" height={350} />
          </Card>
        </Col>
        

        <Col xs={24} lg={12}>
          <Card bordered={false} style={{ height: '100%' }}>
            {weights.length > 0 ? (
              <ReactApexChart options={lineChartOptions} series={lineChartSeries} type="line" height={350} />
            ) : (
              <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                Chưa có dữ liệu chỉ số sức khỏe
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="5 Buổi tập gần nhất" bordered={false}>
            {recentWorkouts.length > 0 ? (
              <Timeline mode="left">
                {recentWorkouts.map(w => (
                  <Timeline.Item 
                    key={w.id} 
                    color={w.status === 'Hoàn thành' ? 'green' : 'red'}
                    label={moment(w.date).format('DD/MM/YYYY HH:mm')}
                  >
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{w.name}</p>
                    <p style={{ margin: 0, color: '#666' }}>
                      <Tag color="blue">{w.type}</Tag> | {w.duration} phút | <FireOutlined style={{ color: '#fa8c16' }}/> {w.calories} kcal
                    </p>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                Chưa có buổi tập nào
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
