import {
	Badge,
	Card,
	Col,
	Divider,
	Empty,
	Input,
	Modal,
	Pagination,
	Row,
	Space,
	Tag,
	Typography,
} from 'antd';
import {
	CalendarOutlined,
	EyeOutlined,
	SearchOutlined,
	UserOutlined,
} from '@ant-design/icons';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useModel } from 'umi';
import debounce from 'lodash/debounce';
import PostView from '../components/PostView';

const { Title, Paragraph, Text } = Typography;

const BlogHome: React.FC = () => {
	const { posts, tags, getBlogData, incrementViewCount } = useModel('blog');
	const [searchText, setSearchText] = useState('');
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [previewPost, setPreviewPost] = useState<any>(null);
	const pageSize = 9;

	useEffect(() => {
		getBlogData();
	}, [getBlogData]);

	// Debounced search handler
	const debouncedSearch = useMemo(
		() =>
			debounce((value: string) => {
				setSearchText(value);
				setCurrentPage(1);
			}, 300),
		[],
	);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		debouncedSearch(e.target.value);
	};

	const filteredPosts = useMemo(() => {
		return posts
			.filter((post) => post.status === 'Published')
			.filter((post) => {
				const matchesSearch =
					post.title.toLowerCase().includes(searchText.toLowerCase()) ||
					post.summary.toLowerCase().includes(searchText.toLowerCase());
				const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
				return matchesSearch && matchesTag;
			});
	}, [posts, searchText, selectedTag]);

	const pagedPosts = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return filteredPosts.slice(start, start + pageSize);
	}, [filteredPosts, currentPage]);

	const handleCardClick = (post: any) => {
		setPreviewPost(post);
		setIsModalVisible(true);
		incrementViewCount(post.id);
	};

	return (
		<div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
			<div style={{ textAlign: 'center', marginBottom: 48 }}>
				<Title level={1} style={{ marginBottom: 16 }}>My Personal Blog</Title>
				<Paragraph type='secondary' style={{ fontSize: '18px' }}>
					Chia sẻ kiến thức, kinh nghiệm và những câu chuyện về công nghệ.
				</Paragraph>
				
				<div style={{ maxWidth: 600, margin: '24px auto' }}>
					<Input
						size='large'
						placeholder='Tìm kiếm bài viết...'
						prefix={<SearchOutlined />}
						onChange={handleSearchChange}
						style={{ borderRadius: '24px', padding: '8px 24px' }}
					/>
				</div>

				<Space wrap size={[8, 16]} style={{ marginTop: 16 }}>
					<Tag
						color={selectedTag === null ? 'blue' : 'default'}
						style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: '16px' }}
						onClick={() => setSelectedTag(null)}
					>
						Tất cả
					</Tag>
					{tags.map((tag) => (
						<Tag
							key={tag.name}
							color={selectedTag === tag.name ? 'blue' : 'default'}
							style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: '16px' }}
							onClick={() => setSelectedTag(tag.name)}
						>
							{tag.name} ({tag.postCount})
						</Tag>
					))}
				</Space>
			</div>

			{pagedPosts.length > 0 ? (
				<>
					<Row gutter={[24, 24]}>
						{pagedPosts.map((post) => (
							<Col xs={24} sm={12} lg={8} key={post.id}>
								<Card
									hoverable
									cover={
										<div style={{ height: 200, overflow: 'hidden' }}>
											<img
												alt={post.title}
												src={post.avatar || 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'}
												style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
												onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
												onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
											/>
										</div>
									}
									style={{ borderRadius: '12px', overflow: 'hidden' }}
									onClick={() => handleCardClick(post)}
								>
									<Card.Meta
										title={<Title level={4} style={{ marginBottom: 12 }}>{post.title}</Title>}
										description={
											<>
												<Paragraph ellipsis={{ rows: 2 }} type='secondary'>
													{post.summary}
												</Paragraph>
												<Space size='middle' style={{ marginBottom: 12, fontSize: '13px' }}>
													<span><CalendarOutlined /> {post.date}</span>
													<span><EyeOutlined /> {post.viewCount}</span>
												</Space>
												<div>
													{post.tags.map((tag) => (
														<Tag key={tag} color='cyan' style={{ marginBottom: 4 }}>{tag}</Tag>
													))}
												</div>
											</>
										}
									/>
								</Card>
							</Col>
						))}
					</Row>
					<div style={{ textAlign: 'center', marginTop: 48 }}>
						<Pagination
							current={currentPage}
							total={filteredPosts.length}
							pageSize={pageSize}
							onChange={(page) => setCurrentPage(page)}
							showSizeChanger={false}
						/>
					</div>
				</>
			) : (
				<Empty description='Không tìm thấy bài viết nào' />
			)}

			<Modal
				visible={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				footer={null}
				width={800}
				style={{ top: 40 }}
				bodyStyle={{ padding: '24px 32px', maxHeight: '85vh', overflowY: 'auto' }}
				destroyOnClose
			>
				{previewPost && <PostView post={previewPost} />}
			</Modal>
		</div>
	);
};

export default BlogHome;
