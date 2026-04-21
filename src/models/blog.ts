import { useState, useCallback } from 'react';

export interface BlogPost {
	id: string;
	title: string;
	slug: string;
	summary: string;
	content: string;
	author: string;
	date: string;
	tags: string[];
	status: 'Draft' | 'Published';
	viewCount: number;
	avatar: string;
}

export interface BlogTag {
	id: string;
	name: string;
	postCount: number;
}

const INITIAL_TAGS: BlogTag[] = [
	{ id: '1', name: 'React', postCount: 2 },
	{ id: '2', name: 'UmiJS', postCount: 1 },
	{ id: '3', name: 'Ant Design', postCount: 1 },
	{ id: '4', name: 'TypeScript', postCount: 2 },
];

const INITIAL_POSTS: BlogPost[] = [
	{
		id: '1',
		title: 'Khởi đầu với React và TypeScript',
		slug: 'khoi-dau-voi-react-va-typescript',
		summary: 'Hướng dẫn cơ bản cách thiết lập dự án React sử dụng TypeScript để tăng cường độ ổn định của code.',
		content: '# Khởi đầu với React và TypeScript\n\nReact và TypeScript là sự kết hợp tuyệt vời...\n\n## Tại sao nên dùng TypeScript?\n- Static typing\n- Better IDE support\n- Catch bugs early',
		author: 'Admin',
		date: '2026-04-20',
		tags: ['React', 'TypeScript'],
		status: 'Published',
		viewCount: 120,
		avatar: 'https://itbeesolutions.vn/wp-content/uploads/2023/04/react-js-itbee-solutions-1170x700.png',
	},
	{
		id: '2',
		title: 'Làm chủ Ant Design cơ bản',
		slug: 'lam-chu-ant-design-co-ban',
		summary: 'Sử dụng Ant Design để xây dựng giao diện người dùng chuyên nghiệp một cách nhanh chóng.',
		content: '# Làm chủ Ant Design\n\nAnt Design cung cấp một hệ thống component mạnh mẽ...\n\n### Layout\nSử dụng Row và Col để phân chia bố cục.',
		author: 'Admin',
		date: '2026-04-21',
		tags: ['Ant Design', 'React'],
		status: 'Published',
		viewCount: 85,
		avatar: 'https://s3-ap-south-1.amazonaws.com/trt-blog-ghost/2023/01/Ant-Design-2.png',
	},
];

export default () => {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [tags, setTags] = useState<BlogTag[]>([]);

	const getBlogData = useCallback(() => {
		const storedPosts = localStorage.getItem('blog_posts');
		const storedTags = localStorage.getItem('blog_tags');

		// Force sync if initial content changes (for development convenience)
		const postsData = storedPosts ? JSON.parse(storedPosts) : INITIAL_POSTS;
		const tagsData = storedTags ? JSON.parse(storedTags) : INITIAL_TAGS;

		setPosts(postsData);
		setTags(tagsData);

		if (!storedPosts) localStorage.setItem('blog_posts', JSON.stringify(INITIAL_POSTS));
		if (!storedTags) localStorage.setItem('blog_tags', JSON.stringify(INITIAL_TAGS));
	}, []);

	const savePosts = (newPosts: BlogPost[]) => {
		setPosts(newPosts);
		localStorage.setItem('blog_posts', JSON.stringify(newPosts));
	};

	const saveTags = (newTags: BlogTag[]) => {
		setTags(newTags);
		localStorage.setItem('blog_tags', JSON.stringify(newTags));
	};

	const addPost = (post: Omit<BlogPost, 'id' | 'viewCount' | 'date'>) => {
		const newPost: BlogPost = {
			...post,
			id: Date.now().toString(),
			date: new Date().toISOString().split('T')[0],
			viewCount: 0,
		};
		const newPosts = [newPost, ...posts];
		savePosts(newPosts);
		updateTagCounts(newPosts);
	};

	const updatePost = (id: string, updatedFields: Partial<BlogPost>) => {
		const newPosts = posts.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
		savePosts(newPosts);
		updateTagCounts(newPosts);
	};

	const deletePost = (id: string) => {
		const newPosts = posts.filter((p) => p.id !== id);
		savePosts(newPosts);
		updateTagCounts(newPosts);
	};

	const incrementViewCount = (id: string) => {
		const newPosts = posts.map((p) => (p.id === id ? { ...p, viewCount: p.viewCount + 1 } : p));
		setPosts(newPosts);
		localStorage.setItem('blog_posts', JSON.stringify(newPosts));
	};

	const addTag = (name: string) => {
		if (tags.some((t) => t.name === name)) return;
		const newTag: BlogTag = { id: Date.now().toString(), name, postCount: 0 };
		saveTags([...tags, newTag]);
	};

	const updateTag = (id: string, name: string) => {
		const oldName = tags.find((t) => t.id === id)?.name;
		const newTags = tags.map((t) => (t.id === id ? { ...t, name } : t));
		saveTags(newTags);

		// Also update tag names within posts
		if (oldName) {
			const newPosts = posts.map((p) => ({
				...p,
				tags: p.tags.map((tag) => (tag === oldName ? name : tag)),
			}));
			savePosts(newPosts);
		}
	};

	const deleteTag = (id: string) => {
		const tagName = tags.find((t) => t.id === id)?.name;
		saveTags(tags.filter((t) => t.id !== id));

		// Remove tag from posts
		if (tagName) {
			const newPosts = posts.map((p) => ({
				...p,
				tags: p.tags.filter((tag) => tag !== tagName),
			}));
			savePosts(newPosts);
		}
	};

	const updateTagCounts = (currentPosts: BlogPost[]) => {
		const counts: Record<string, number> = {};
		currentPosts.forEach((post) => {
			post.tags.forEach((tag) => {
				counts[tag] = (counts[tag] || 0) + 1;
			});
		});

		const newTags = tags.map((t) => ({
			...t,
			postCount: counts[t.name] || 0,
		}));
		saveTags(newTags);
	};

	return {
		posts,
		tags,
		getBlogData,
		addPost,
		updatePost,
		deletePost,
		incrementViewCount,
		addTag,
		updateTag,
		deleteTag,
	};
};
