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

	// SỨC KHỎE & THỂ DỤC
	{
		name: 'Thể dục & Sức khỏe',
		path: '/fitness',
		icon: 'HeartOutlined',
		routes: [
			{
				path: '/fitness/dashboard',
				name: 'Trang chủ',
				component: './Fitness/Dashboard',
			},
			{
				path: '/fitness/workout-diary',
				name: 'Nhật ký tập luyện',
				component: './Fitness/WorkoutDiary',
			},
			{
				path: '/fitness/health-metrics',
				name: 'Nhật ký chỉ số',
				component: './Fitness/HealthMetrics',
			},
			{
				path: '/fitness/goal-management',
				name: 'Quản lý mục tiêu',
				component: './Fitness/GoalManagement',
			},
			{
				path: '/fitness/exercise-library',
				name: 'Thư viện bài tập',
				component: './Fitness/ExerciseLibrary',
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
