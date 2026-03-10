import { createId, loadFromStorage, saveToStorage } from '@/utils/bai2Storage';
import { useCallback, useState } from 'react';

export type MucDo = 'DE' | 'TRUNG_BINH' | 'KHO' | 'RAT_KHO';

export type CauHoi = {
	id: string;
	maCauHoi: string;
	monHocId: string;
	noiDung: string;
	mucDo: MucDo;
	khoiKienThucId: string;
};

const STORAGE_KEY = 'bai2_cauHoi';

export default () => {
	const [danhSach, setDanhSach] = useState<CauHoi[]>(() => loadFromStorage<CauHoi[]>(STORAGE_KEY, []));

	const persist = useCallback((updater: (prev: CauHoi[]) => CauHoi[]) => {
		setDanhSach((prev) => {
			const next = updater(prev);
			saveToStorage(STORAGE_KEY, next);
			return next;
		});
	}, []);

	const themMoi = async (payload: Omit<CauHoi, 'id'>) => {
		persist((prev) => [
			{ ...payload, id: createId('ch_'), maCauHoi: payload.maCauHoi.trim(), noiDung: payload.noiDung.trim() },
			...prev,
		]);
	};

	const capNhat = async (id: string, payload: Omit<CauHoi, 'id'>) => {
		persist((prev) =>
			prev.map((x) =>
				x.id === id ? { ...x, ...payload, maCauHoi: payload.maCauHoi.trim(), noiDung: payload.noiDung.trim() } : x,
			),
		);
	};

	const xoa = async (id: string) => {
		persist((prev) => prev.filter((x) => x.id !== id));
	};

	const reload = () => {
		setDanhSach(loadFromStorage<CauHoi[]>(STORAGE_KEY, []));
	};

	return {
		danhSach,
		themMoi,
		capNhat,
		xoa,
		reload,
	};
};
