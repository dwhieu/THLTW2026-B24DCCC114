import { createId, loadFromStorage, saveToStorage } from '@/utils/bai2Storage';
import { useCallback, useState } from 'react';

export type KhoiKienThuc = {
	id: string;
	ten: string;
};

const STORAGE_KEY = 'bai2_khoiKienThuc';

export default () => {
	const [danhSach, setDanhSach] = useState<KhoiKienThuc[]>(() => loadFromStorage<KhoiKienThuc[]>(STORAGE_KEY, []));

	const persist = useCallback((updater: (prev: KhoiKienThuc[]) => KhoiKienThuc[]) => {
		setDanhSach((prev) => {
			const next = updater(prev);
			saveToStorage(STORAGE_KEY, next);
			return next;
		});
	}, []);

	const themMoi = async (payload: { ten: string }) => {
		persist((prev) => [{ id: createId('kkt_'), ten: payload.ten.trim() }, ...prev]);
	};

	const capNhat = async (id: string, payload: { ten: string }) => {
		persist((prev) => prev.map((x) => (x.id === id ? { ...x, ten: payload.ten.trim() } : x)));
	};

	const xoa = async (id: string) => {
		persist((prev) => prev.filter((x) => x.id !== id));
	};

	const reload = () => {
		setDanhSach(loadFromStorage<KhoiKienThuc[]>(STORAGE_KEY, []));
	};

	return {
		danhSach,
		themMoi,
		capNhat,
		xoa,
		reload,
	};
};
