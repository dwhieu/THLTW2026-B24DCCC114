import { Avatar, Divider, Space, Typography } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import React from 'react';
import ReactMarkdown from 'react-markdown';

const { Title, Text, Paragraph } = Typography;

interface PostViewProps {
	post: any;
}

const PostView: React.FC<PostViewProps> = ({ post }) => {
	const adminAvatar = 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';

	return (
		<div style={{ background: '#fff', padding: '16px 0' }}>
			{/* Header Section */}
			<div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
				<Avatar
					size={32}
					src={adminAvatar}
					style={{ marginRight: 12 }}
				/>
				<div>
					<Space size={4}>
						<Text style={{ fontWeight: 600, fontSize: '15px', color: '#1d1d1d' }}>
							{post.author || 'Admin'}
						</Text>
						<CheckCircleFilled style={{ color: '#52c41a', fontSize: '14px' }} />
					</Space>
					<Text style={{ fontSize: '12px', color: '#8c8c8c', display: 'block' }}>
						{post.date} 08:30
					</Text>
				</div>
			</div>

			{/* Title Section */}
			<Paragraph style={{ fontWeight: 600, fontSize: '19px', marginTop: '8px', marginBottom: '16px', color: '#1d1d1d' }}>
				{post.title}
			</Paragraph>

			{/* Post Featured Image Section */}
			{post.avatar && (
				<div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', textAlign: 'center' }}>
					<img 
						src={post.avatar} 
						alt={post.title} 
						style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} 
					/>
				</div>
			)}

			{/* Content Section */}
			<div className='markdown-content' style={{ fontSize: '15px', lineHeight: '1.6', color: '#333' }}>
				<ReactMarkdown>{post.content}</ReactMarkdown>
			</div>

			{/* Footer Section */}
			<div style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #f0f0f0', color: '#8c8c8c', fontSize: '13px' }}>
				<Space size='middle'>
					<span>{post.viewCount || 0} đã xem</span>
				</Space>
			</div>
		</div>
	);
};

export default PostView;
