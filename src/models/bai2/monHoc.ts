import { createId, loadFromStorage, saveToStorage } from '@/utils/bai2Storage';
import { useCallback, useState } from 'react';

export type MonHoc = {
	id: string;
	maMon: string;
	tenMon: string;
	soTinChi: number;
};

const STORAGE_KEY = 'bai2_monHoc';

export default () => {
	const [danhSach, setDanhSach] = useState<MonHoc[]>(() => loadFromStorage<MonHoc[]>(STORAGE_KEY, []));

	const persist = useCallback((updater: (prev: MonHoc[]) => MonHoc[]) => {
		setDanhSach((prev) => {
			const next = updater(prev);
			saveToStorage(STORAGE_KEY, next);
			return next;
		});
	}, []);

	const themMoi = async (payload: { maMon: string; tenMon: string; soTinChi: number }) => {
		persist((prev) => [
			{
				id: createId('mh_'),
				maMon: payload.maMon.trim(),
				tenMon: payload.tenMon.trim(),
				soTinChi: Number(payload.soTinChi),
			},
			...prev,
		]);
	};

	const capNhat = async (id: string, payload: { maMon: string; tenMon: string; soTinChi: number }) => {
		persist((prev) =>
			prev.map((x) =>
				x.id === id
					? { ...x, maMon: payload.maMon.trim(), tenMon: payload.tenMon.trim(), soTinChi: Number(payload.soTinChi) }
					: x,
			),
		);
	};

	const xoa = async (id: string) => {
		persist((prev) => prev.filter((x) => x.id !== id));
	};

	const reload = () => {
		setDanhSach(loadFromStorage<MonHoc[]>(STORAGE_KEY, []));
	};

	return {
		danhSach,
		themMoi,
		capNhat,
		xoa,
		reload,
	};
};
