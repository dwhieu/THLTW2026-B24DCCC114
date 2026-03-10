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
	{
		path: '/oan-tu-ti',
		name: 'OanTuTi',
		icon: 'ScissorOutlined',
		component: './OanTuTi',
	},
	{
		name: 'Bai2',
		path: '/bai-2',
		icon: 'DatabaseOutlined',
		routes: [
			{
				name: 'KhoiKienThuc',
				path: 'khoi-kien-thuc',
				component: './Bai2/KhoiKienThuc',
			},
			{
				name: 'MonHoc',
				path: 'mon-hoc',
				component: './Bai2/MonHoc',
			},
			{
				name: 'CauHoi',
				path: 'cau-hoi',
				component: './Bai2/CauHoi',
			},
			{
				name: 'DeThi',
				path: 'de-thi',
				component: './Bai2/DeThi',
			},
			{
				path: '/bai-2',
				redirect: '/bai-2/khoi-kien-thuc',
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
