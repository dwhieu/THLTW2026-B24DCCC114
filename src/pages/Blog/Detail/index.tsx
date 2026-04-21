import { Card, Typography } from 'antd';
import React, { useEffect } from 'react';
import { useModel } from 'umi';
import PostView from '../components/PostView';

const { Title } = Typography;

const BlogDetail: React.FC = () => {
	const { posts, getBlogData } = useModel('blog');

	useEffect(() => {
		getBlogData();
	}, [getBlogData]);

	const publishedPosts = posts.filter((p) => p.status === 'Published');

	return (
		<div style={{ padding: '24px', maxWidth: 850, margin: '0 auto' }}>
			<div style={{ textAlign: 'center', marginBottom: 48 }}>
				<Title level={1}>Tất cả bài viết</Title>
				<Typography.Paragraph type='secondary'>
					Đọc toàn bộ nội dung các bài viết đã chia sẻ.
				</Typography.Paragraph>
			</div>

			{publishedPosts.map((post) => (
				<Card 
					key={post.id}
					bordered={false} 
					style={{ 
						borderRadius: '12px', 
						boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
						marginBottom: '32px',
						padding: '0 12px'
					}}
				>
					<PostView post={post} />
				</Card>
			))}

			{publishedPosts.length === 0 && (
				<div style={{ textAlign: 'center', padding: '48px' }}>
					<Typography.Text type='secondary'>Chưa có bài viết nào được đăng.</Typography.Text>
				</div>
			)}
		</div>
	);
};

export default BlogDetail;
