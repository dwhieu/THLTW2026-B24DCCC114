declare module CLB {
	export type Gender = 'Nam' | 'Nữ' | 'Khác';

	export interface IClubRecord {
		_id: string;
		anhDaiDien?: string | null;
		ten: string;
		ngayThanhLap?: string | null;
		moTaHtml?: string | null;
		chuNhiem?: string | null;
		hoatDong: boolean;
		createdAt: string;
		updatedAt?: string;
	}

	export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

	export type HistoryAction = 'Created' | 'Updated' | 'Approved' | 'Rejected' | 'TransferredClub';

	export interface IHistoryEntry {
		id: string;
		action: HistoryAction;
		at: string;
		by: string;
		note?: string;
		fromClubId?: string;
		toClubId?: string;
	}

	export interface IApplicationRecord {
		_id: string;
		hoTen: string;
		email: string;
		sdt: string;
		gioiTinh: Gender;
		diaChi?: string | null;
		soTruong?: string | null;
		clubId?: string | null;
		lyDoDangKy?: string | null;
		trangThai: ApplicationStatus;
		ghiChu?: string | null;
		lichSu: IHistoryEntry[];
		createdAt: string;
		updatedAt?: string;
	}
}
