const KEY_CLUBS = 'clb.clubs';
const KEY_APPLICATIONS = 'clb.applications';

const nowIso = () => new Date().toISOString();

const genId = () => {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as any).randomUUID();
	return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const safeJsonParse = <T>(raw: string | null, fallback: T): T => {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
};

export const clbDb = {
	getClubs(): CLB.IClubRecord[] {
		return safeJsonParse<CLB.IClubRecord[]>(localStorage.getItem(KEY_CLUBS), []);
	},
	setClubs(list: CLB.IClubRecord[]) {
		localStorage.setItem(KEY_CLUBS, JSON.stringify(list));
	},
	upsertClub(
		payload: Omit<CLB.IClubRecord, '_id' | 'createdAt'> & Partial<Pick<CLB.IClubRecord, '_id'>>,
	): CLB.IClubRecord {
		const list = this.getClubs();
		const foundIndex = payload._id ? list.findIndex((x) => x._id === payload._id) : -1;
		if (foundIndex >= 0) {
			const updated: CLB.IClubRecord = {
				...list[foundIndex],
				...payload,
				updatedAt: nowIso(),
			};
			list.splice(foundIndex, 1, updated);
			this.setClubs(list);
			return updated;
		}

		const created: CLB.IClubRecord = {
			_id: payload._id ?? genId(),
			anhDaiDien: payload.anhDaiDien ?? null,
			ten: payload.ten,
			ngayThanhLap: payload.ngayThanhLap ?? null,
			moTaHtml: payload.moTaHtml ?? null,
			chuNhiem: payload.chuNhiem ?? null,
			hoatDong: payload.hoatDong ?? true,
			createdAt: nowIso(),
		};
		this.setClubs([created, ...list]);
		return created;
	},
	deleteClub(id: string) {
		const list = this.getClubs().filter((x) => x._id !== id);
		this.setClubs(list);
	},

	getApplications(): CLB.IApplicationRecord[] {
		return safeJsonParse<CLB.IApplicationRecord[]>(localStorage.getItem(KEY_APPLICATIONS), []);
	},
	setApplications(list: CLB.IApplicationRecord[]) {
		localStorage.setItem(KEY_APPLICATIONS, JSON.stringify(list));
	},
	upsertApplication(
		payload: Omit<CLB.IApplicationRecord, '_id' | 'createdAt' | 'lichSu'> &
			Partial<Pick<CLB.IApplicationRecord, '_id' | 'lichSu' | 'createdAt'>>,
		options?: { by?: string; addHistory?: boolean },
	): CLB.IApplicationRecord {
		const by = options?.by ?? 'Admin';
		const addHistory = options?.addHistory !== false;

		const list = this.getApplications();
		const foundIndex = payload._id ? list.findIndex((x) => x._id === payload._id) : -1;
		if (foundIndex >= 0) {
			const prev = list[foundIndex];
			const updated: CLB.IApplicationRecord = {
				...prev,
				...payload,
				updatedAt: nowIso(),
				lichSu: payload.lichSu ?? prev.lichSu,
			};
			if (addHistory) {
				updated.lichSu = [
					{
						id: genId(),
						action: 'Updated',
						at: nowIso(),
						by,
					},
					...(updated.lichSu ?? []),
				];
			}
			list.splice(foundIndex, 1, updated);
			this.setApplications(list);
			return updated;
		}

		const createdAt = payload.createdAt ?? nowIso();
		const created: CLB.IApplicationRecord = {
			_id: payload._id ?? genId(),
			hoTen: payload.hoTen,
			email: payload.email,
			sdt: payload.sdt,
			gioiTinh: payload.gioiTinh,
			diaChi: payload.diaChi ?? null,
			soTruong: payload.soTruong ?? null,
			clubId: payload.clubId ?? null,
			lyDoDangKy: payload.lyDoDangKy ?? null,
			trangThai: payload.trangThai ?? 'Pending',
			ghiChu: payload.ghiChu ?? null,
			lichSu:
				payload.lichSu ??
				(addHistory
					? [
							{
								id: genId(),
								action: 'Created',
								at: createdAt,
								by,
							},
					  ]
					: []),
			createdAt,
		};

		this.setApplications([created, ...list]);
		return created;
	},
	deleteApplication(id: string) {
		const list = this.getApplications().filter((x) => x._id !== id);
		this.setApplications(list);
	},
	getApplicationById(id: string) {
		return this.getApplications().find((x) => x._id === id);
	},
	appendHistory(
		id: string,
		entry: Omit<CLB.IHistoryEntry, 'id' | 'at'> & Partial<Pick<CLB.IHistoryEntry, 'id' | 'at'>>,
	) {
		const list = this.getApplications();
		const idx = list.findIndex((x) => x._id === id);
		if (idx < 0) return;
		const rec = list[idx];
		const next: CLB.IApplicationRecord = {
			...rec,
			updatedAt: nowIso(),
			lichSu: [
				{
					id: entry.id ?? genId(),
					action: entry.action,
					at: entry.at ?? nowIso(),
					by: entry.by,
					note: entry.note,
					fromClubId: entry.fromClubId,
					toClubId: entry.toClubId,
				},
				...(rec.lichSu ?? []),
			],
		};
		list.splice(idx, 1, next);
		this.setApplications(list);
	},
	approveApplications(ids: string[], options?: { by?: string }) {
		const by = options?.by ?? 'Admin';
		const list = this.getApplications();
		const now = nowIso();
		const next = list.map((x) => {
			if (!ids.includes(x._id)) return x;
			return {
				...x,
				trangThai: 'Approved' as const,
				ghiChu: null,
				updatedAt: now,
				lichSu: [
					{
						id: genId(),
						action: 'Approved' as const,
						at: now,
						by,
					},
					...(x.lichSu ?? []),
				],
			};
		});
		this.setApplications(next);
	},
	rejectApplications(ids: string[], reason: string, options?: { by?: string }) {
		const by = options?.by ?? 'Admin';
		const list = this.getApplications();
		const now = nowIso();
		const next = list.map((x) => {
			if (!ids.includes(x._id)) return x;
			return {
				...x,
				trangThai: 'Rejected' as const,
				ghiChu: reason,
				updatedAt: now,
				lichSu: [
					{
						id: genId(),
						action: 'Rejected' as const,
						at: now,
						by,
						note: reason,
					},
					...(x.lichSu ?? []),
				],
			};
		});
		this.setApplications(next);
	},
	transferMembers(ids: string[], toClubId: string, options?: { by?: string }) {
		const by = options?.by ?? 'Admin';
		const list = this.getApplications();
		const now = nowIso();
		const next = list.map((x) => {
			if (!ids.includes(x._id)) return x;
			const fromClubId = x.clubId ?? undefined;
			return {
				...x,
				clubId: toClubId,
				updatedAt: now,
				lichSu: [
					{
						id: genId(),
						action: 'TransferredClub' as const,
						at: now,
						by,
						fromClubId,
						toClubId,
					},
					...(x.lichSu ?? []),
				],
			};
		});
		this.setApplications(next);
	},
};

export const clbHelpers = {
	genId,
	nowIso,
};
