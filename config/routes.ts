export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/todo-list',
		name: 'TodoList',
		icon: 'OrderedListOutlined',
		component: './TodoList',
	},

	// BLOG ROUTES
	{
		path: '/blog',
		name: 'Blog',
		icon: 'BookOutlined',
		routes: [
			{
				path: '/blog/home',
				name: 'Trang chủ',
				component: './Blog/Home',
				icon: 'HomeOutlined',
			},
			{
				path: '/blog/detail',
				name: 'Chi tiết bài viết',
				component: './Blog/Detail',
				icon: 'FileTextOutlined',
			},
			{
				path: '/blog/about',
				name: 'Giới thiệu',
				component: './Blog/About',
				icon: 'UserOutlined',
			},
			{
				path: '/blog/post-manage',
				name: 'Quản lý bài viết',
				component: './Blog/Management/PostManage',
				icon: 'SettingOutlined',
			},
			{
				path: '/blog/tag-manage',
				name: 'Quản lý thẻ',
				component: './Blog/Management/TagManage',
				icon: 'TagsOutlined',
			},
		],
	},

	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
