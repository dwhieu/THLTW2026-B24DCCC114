import { Avatar, Card, Col, Divider, Row, Space, Tag, Typography } from 'antd';
import {
	FacebookOutlined,
	GithubOutlined,
	LinkedinOutlined,
	TwitterOutlined,
} from '@ant-design/icons';
import React from 'react';

const { Title, Paragraph, Text } = Typography;

const AboutPage: React.FC = () => {
	const skills = [
		'React.js',
		'TypeScript',
		'Ant Design',
		'UmiJS',
		'Node.js',
		'Java Spring Boot',
		'PostgreSQL',
		'Docker',
	];

	return (
		<div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
			<Card bordered={false} className='about-card' style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
				<Row gutter={[32, 32]} align='middle' justify='center'>
					<Col xs={24} md={8} style={{ textAlign: 'center' }}>
						<Avatar
							size={160}
							src='https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
							style={{ border: '4px solid #1890ff' }}
						/>
					</Col>
					<Col xs={24} md={16}>
						<Title level={2}>Đặng Trung Hiếu</Title>
						<Title level={4} type='secondary' style={{ marginTop: 0 }}>
							Fullstack Developer
						</Title>
						<Divider />
						<Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
							Chào mừng bạn đến với Blog của mình! Mình là một lập trình viên đam mê công nghệ, 
							thích khám phá những kiến thức mới về Web Development. Đây là nơi mình chia sẻ 
							những bài viết, kinh nghiệm và các dự án cá nhân.
						</Paragraph>
						<Space size='large'>
							<a href='#' target='_blank' rel='noopener noreferrer'>
								<GithubOutlined style={{ fontSize: '24px', color: '#000' }} />
							</a>
							<a href='#' target='_blank' rel='noopener noreferrer'>
								<LinkedinOutlined style={{ fontSize: '24px', color: '#0a66c2' }} />
							</a>
							<a href='#' target='_blank' rel='noopener noreferrer'>
								<FacebookOutlined style={{ fontSize: '24px', color: '#1877f2' }} />
							</a>
							<a href='#' target='_blank' rel='noopener noreferrer'>
								<TwitterOutlined style={{ fontSize: '24px', color: '#1da1f2' }} />
							</a>
						</Space>
					</Col>
				</Row>

				<Divider orientation='left'>Kỹ năng</Divider>
				<div style={{ padding: '0 16px' }}>
					{skills.map((skill) => (
						<Tag
							key={skill}
							color='blue'
							style={{
								marginBottom: '12px',
								padding: '4px 12px',
								fontSize: '14px',
								borderRadius: '16px',
							}}
						>
							{skill}
						</Tag>
					))}
				</div>

				<Divider orientation='left'>Kinh nghiệm</Divider>
				<div style={{ padding: '0 16px' }}>
					<Paragraph>
						<Text strong>Học viện Công nghệ Bưu chính Viễn thông</Text>
						<br />
						<Text type='secondary'>Sinh viên Công nghệ thông tin (2022 - Nay)</Text>
					</Paragraph>
					<Paragraph>
						<Text strong>Google Summer of Code</Text>
						<br />
						<Text type='secondary'>Contributor Intern (Hè 2024)</Text>
					</Paragraph>
				</div>
			</Card>
		</div>
	);
};

export default AboutPage;
