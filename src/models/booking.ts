import { useCallback, useMemo, useState } from 'react';
import moment from 'moment';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type WorkingDay = {
	dayOfWeek: number; // 0 (CN) -> 6 (T7)
	start: string; // HH:mm
	end: string; // HH:mm
};

export type Employee = {
	id: string;
	name: string;
	dailyLimit: number;
	workingHours: WorkingDay[];
};

export type Service = {
	id: string;
	name: string;
	price: number;
	durationMinutes: number;
};

export type Appointment = {
	id: string;
	customerName: string;
	customerPhone?: string;
	serviceId: string;
	staffId: string;
	date: string; // YYYY-MM-DD
	startTime: string; // HH:mm
	endTime: string; // HH:mm
	status: BookingStatus;
	note?: string;
	createdAt: string; // ISO
};

export type Review = {
	id: string;
	appointmentId: string;
	serviceId: string;
	staffId: string;
	rating: number; // 1..5
	comment?: string;
	createdAt: string; // ISO
	staffReply?: string;
};

const LS_KEYS = {
	employees: 'booking:employees',
	services: 'booking:services',
	appointments: 'booking:appointments',
	reviews: 'booking:reviews',
} as const;

function safeJsonParse<T>(value: string | null, fallback: T): T {
	if (!value) return fallback;
	try {
		return JSON.parse(value) as T;
	} catch {
		return fallback;
	}
}

function uuid(prefix: string) {
	return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function hhmmToMinutes(hhmm: string) {
	const [hh, mm] = hhmm.split(':').map((x) => Number(x));
	return hh * 60 + mm;
}

function minutesToHHmm(totalMinutes: number) {
	const safe = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
	const hh = Math.floor(safe / 60);
	const mm = safe % 60;
	return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function addMinutes(hhmm: string, minutes: number) {
	return minutesToHHmm(hhmmToMinutes(hhmm) + minutes);
}

function intervalsOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
	const aS = hhmmToMinutes(aStart);
	const aE = hhmmToMinutes(aEnd);
	const bS = hhmmToMinutes(bStart);
	const bE = hhmmToMinutes(bEnd);
	return aS < bE && bS < aE;
}

function getDayOfWeek(date: string) {
	return moment(date, 'YYYY-MM-DD').day();
}

function seedEmployees(): Employee[] {
	return [
		{
			id: uuid('emp'),
			name: 'Nhân viên A',
			dailyLimit: 10,
			workingHours: [1, 2, 3, 4, 5].map((d) => ({ dayOfWeek: d, start: '09:00', end: '17:00' })),
		},
		{
			id: uuid('emp'),
			name: 'Nhân viên B',
			dailyLimit: 6,
			workingHours: [6, 0].map((d) => ({ dayOfWeek: d, start: '10:00', end: '18:00' })),
		},
	];
}

function seedServices(): Service[] {
	return [
		{ id: uuid('svc'), name: 'Cắt tóc', price: 80000, durationMinutes: 30 },
		{ id: uuid('svc'), name: 'Gội đầu', price: 50000, durationMinutes: 20 },
		{ id: uuid('svc'), name: 'Spa mặt', price: 250000, durationMinutes: 60 },
	];
}

export default function useBookingModel() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [services, setServices] = useState<Service[]>([]);
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [reviews, setReviews] = useState<Review[]>([]);

	const persist = useCallback(
		(next: { employees?: Employee[]; services?: Service[]; appointments?: Appointment[]; reviews?: Review[] }) => {
			if (next.employees) localStorage.setItem(LS_KEYS.employees, JSON.stringify(next.employees));
			if (next.services) localStorage.setItem(LS_KEYS.services, JSON.stringify(next.services));
			if (next.appointments) localStorage.setItem(LS_KEYS.appointments, JSON.stringify(next.appointments));
			if (next.reviews) localStorage.setItem(LS_KEYS.reviews, JSON.stringify(next.reviews));
		},
		[],
	);

	const init = useCallback(() => {
		const storedEmployees = safeJsonParse<Employee[]>(localStorage.getItem(LS_KEYS.employees), []);
		const storedServices = safeJsonParse<Service[]>(localStorage.getItem(LS_KEYS.services), []);
		const storedAppointments = safeJsonParse<Appointment[]>(localStorage.getItem(LS_KEYS.appointments), []);
		const storedReviews = safeJsonParse<Review[]>(localStorage.getItem(LS_KEYS.reviews), []);

		const nextEmployees = storedEmployees.length ? storedEmployees : seedEmployees();
		const nextServices = storedServices.length ? storedServices : seedServices();

		setEmployees(nextEmployees);
		setServices(nextServices);
		setAppointments(storedAppointments);
		setReviews(storedReviews);

		persist({
			employees: nextEmployees,
			services: nextServices,
			appointments: storedAppointments,
			reviews: storedReviews,
		});
	}, [persist]);

	const employeesById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);
	const servicesById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);
	const reviewsByAppointmentId = useMemo(() => new Map(reviews.map((r) => [r.appointmentId, r])), [reviews]);

	const upsertEmployee = useCallback(
		(payload: Omit<Employee, 'id'> & { id?: string }) => {
			if (!payload.name?.trim()) throw new Error('Tên nhân viên là bắt buộc');
			if (!Number.isFinite(payload.dailyLimit) || payload.dailyLimit <= 0) throw new Error('Giới hạn/ngày phải > 0');
			if (!payload.workingHours?.length) throw new Error('Vui lòng thiết lập lịch làm việc');
			payload.workingHours.forEach((w) => {
				if (w.dayOfWeek < 0 || w.dayOfWeek > 6) throw new Error('Ngày làm việc không hợp lệ');
				if (hhmmToMinutes(w.start) >= hhmmToMinutes(w.end)) throw new Error('Giờ làm việc không hợp lệ');
			});

			setEmployees((prev) => {
				const next = payload.id
					? prev.map((e) => (e.id === payload.id ? ({ ...payload, id: payload.id } as Employee) : e))
					: [{ ...payload, id: uuid('emp') } as Employee, ...prev];
				persist({ employees: next });
				return next;
			});
		},
		[persist],
	);

	const deleteEmployee = useCallback(
		(id: string) => {
			setEmployees((prev) => {
				const next = prev.filter((e) => e.id !== id);
				persist({ employees: next });
				return next;
			});
		},
		[persist],
	);

	const upsertService = useCallback(
		(payload: Omit<Service, 'id'> & { id?: string }) => {
			if (!payload.name?.trim()) throw new Error('Tên dịch vụ là bắt buộc');
			if (!Number.isFinite(payload.price) || payload.price < 0) throw new Error('Giá không hợp lệ');
			if (!Number.isFinite(payload.durationMinutes) || payload.durationMinutes <= 0)
				throw new Error('Thời gian phải > 0');

			setServices((prev) => {
				const next = payload.id
					? prev.map((s) => (s.id === payload.id ? ({ ...payload, id: payload.id } as Service) : s))
					: [{ ...payload, id: uuid('svc') } as Service, ...prev];
				persist({ services: next });
				return next;
			});
		},
		[persist],
	);

	const deleteService = useCallback(
		(id: string) => {
			setServices((prev) => {
				const next = prev.filter((s) => s.id !== id);
				persist({ services: next });
				return next;
			});
		},
		[persist],
	);

	const createAppointment = useCallback(
		(payload: {
			customerName: string;
			customerPhone?: string;
			serviceId: string;
			staffId: string;
			date: string; // YYYY-MM-DD
			startTime: string; // HH:mm
			note?: string;
		}) => {
			const customerName = payload.customerName?.trim();
			if (!customerName) throw new Error('Tên khách hàng là bắt buộc');

			const service = servicesById.get(payload.serviceId);
			if (!service) throw new Error('Dịch vụ không tồn tại');

			const staff = employeesById.get(payload.staffId);
			if (!staff) throw new Error('Nhân viên không tồn tại');

			const date = moment(payload.date, 'YYYY-MM-DD').format('YYYY-MM-DD');
			const startTime = payload.startTime;
			const endTime = addMinutes(startTime, service.durationMinutes);

			if (hhmmToMinutes(startTime) >= hhmmToMinutes(endTime)) throw new Error('Giờ bắt đầu không hợp lệ');

			const dow = getDayOfWeek(date);
			const work = staff.workingHours.find((w) => w.dayOfWeek === dow);
			if (!work) throw new Error('Nhân viên không làm việc vào ngày đã chọn');
			if (hhmmToMinutes(startTime) < hhmmToMinutes(work.start) || hhmmToMinutes(endTime) > hhmmToMinutes(work.end))
				throw new Error('Giờ hẹn nằm ngoài khung giờ làm việc');

			setAppointments((prev) => {
				const activeSameDay = prev.filter(
					(a) => a.staffId === payload.staffId && a.date === date && a.status !== 'cancelled',
				);

				if (activeSameDay.length >= staff.dailyLimit) throw new Error('Nhân viên đã đạt giới hạn khách/ngày');

				const conflict = activeSameDay.some((a) => intervalsOverlap(startTime, endTime, a.startTime, a.endTime));
				if (conflict) throw new Error('Trùng lịch: nhân viên đã có lịch trong khung giờ này');

				const next: Appointment[] = [
					{
						id: uuid('apt'),
						customerName,
						customerPhone: payload.customerPhone?.trim() || undefined,
						serviceId: payload.serviceId,
						staffId: payload.staffId,
						date,
						startTime,
						endTime,
						status: 'pending',
						note: payload.note?.trim() || undefined,
						createdAt: new Date().toISOString(),
					},
					...prev,
				];
				persist({ appointments: next });
				return next;
			});
		},
		[employeesById, persist, servicesById],
	);

	const updateAppointmentStatus = useCallback(
		(id: string, status: BookingStatus) => {
			setAppointments((prev) => {
				const next = prev.map((a) => (a.id === id ? { ...a, status } : a));
				persist({ appointments: next });
				return next;
			});
		},
		[persist],
	);

	const createReview = useCallback(
		(payload: { appointmentId: string; rating: number; comment?: string }) => {
			const rating = Number(payload.rating);
			if (!Number.isFinite(rating) || rating < 1 || rating > 5) throw new Error('Điểm đánh giá phải từ 1 đến 5');

			const appointment = appointments.find((a) => a.id === payload.appointmentId);
			if (!appointment) throw new Error('Lịch hẹn không tồn tại');
			if (appointment.status !== 'completed') throw new Error('Chỉ được đánh giá sau khi lịch hẹn hoàn thành');
			if (reviewsByAppointmentId.has(payload.appointmentId)) throw new Error('Lịch hẹn này đã được đánh giá');

			setReviews((prev) => {
				const next: Review[] = [
					{
						id: uuid('rvw'),
						appointmentId: appointment.id,
						serviceId: appointment.serviceId,
						staffId: appointment.staffId,
						rating,
						comment: payload.comment?.trim() || undefined,
						createdAt: new Date().toISOString(),
					},
					...prev,
				];
				persist({ reviews: next });
				return next;
			});
		},
		[appointments, persist, reviewsByAppointmentId],
	);

	const replyReview = useCallback(
		(reviewId: string, staffReply?: string) => {
			setReviews((prev) => {
				const next = prev.map((r) => (r.id === reviewId ? { ...r, staffReply: staffReply?.trim() || undefined } : r));
				persist({ reviews: next });
				return next;
			});
		},
		[persist],
	);

	const staffAverageRatings = useMemo(() => {
		const map = new Map<string, { total: number; count: number }>();
		for (const r of reviews) {
			const cur = map.get(r.staffId) ?? { total: 0, count: 0 };
			map.set(r.staffId, { total: cur.total + r.rating, count: cur.count + 1 });
		}
		return Array.from(map.entries()).map(([staffId, v]) => ({
			staffId,
			avg: v.count ? v.total / v.count : 0,
			count: v.count,
		}));
	}, [reviews]);

	const getEmployeeName = useCallback((id: string) => employeesById.get(id)?.name ?? '(Đã xóa)', [employeesById]);
	const getServiceName = useCallback((id: string) => servicesById.get(id)?.name ?? '(Đã xóa)', [servicesById]);
	const getServicePrice = useCallback((id: string) => servicesById.get(id)?.price ?? 0, [servicesById]);
	const getServiceDuration = useCallback((id: string) => servicesById.get(id)?.durationMinutes ?? 0, [servicesById]);

	return {
		init,

		employees,
		services,
		appointments,
		reviews,

		employeesById,
		servicesById,
		reviewsByAppointmentId,

		upsertEmployee,
		deleteEmployee,
		upsertService,
		deleteService,

		createAppointment,
		updateAppointmentStatus,

		createReview,
		replyReview,

		staffAverageRatings,
		getEmployeeName,
		getServiceName,
		getServicePrice,
		getServiceDuration,
	};
}
