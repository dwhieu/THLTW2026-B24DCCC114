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
	// Thêm vào config/routes.ts
	{
		path: '/quan-ly-van-bang',
		name: 'Quản lý văn bằng',
		icon: 'BookOutlined', // Cần import icon tương ứng nếu file routes yêu cầu
		routes: [
			{
				path: '/quan-ly-van-bang/so-van-bang',
				name: 'Sổ văn bằng',
				component: './QuanLyVanBang/SoVanBang',
			},
			{
				path: '/quan-ly-van-bang/quyet-dinh',
				name: 'Quyết định tốt nghiệp',
				component: './QuanLyVanBang/QuyetDinh',
			},
			{
				path: '/quan-ly-van-bang/cau-hinh-bieu-mau',
				name: 'Cấu hình biểu mẫu',
				component: './QuanLyVanBang/CauHinhBieuMau',
			},
			{
				path: '/quan-ly-van-bang/thong-tin',
				name: 'Thông tin văn bằng',
				component: './QuanLyVanBang/ThongTinVanBang',
			},
			{
				path: '/quan-ly-van-bang/tra-cuu',
				name: 'Tra cứu',
				component: './QuanLyVanBang/TraCuu',
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
