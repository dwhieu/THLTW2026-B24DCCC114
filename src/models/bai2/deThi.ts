import { createId, loadFromStorage, saveToStorage } from '@/utils/bai2Storage';
import type { MucDo } from './cauHoi';
import { useCallback, useState } from 'react';

export type CauTrucItem = {
	khoiKienThucId: string;
	mucDo: MucDo;
	soLuong: number;
};

export type CauTrucDeThi = {
	id: string;
	tenCauTruc: string;
	monHocId: string;
	items: CauTrucItem[];
};

export type DeThi = {
	id: string;
	tenDeThi: string;
	monHocId: string;
	createdAt: string;
	structureId?: string;
	questionIds: string[];
};

const STORAGE_KEY_STRUCTURE = 'bai2_cauTrucDeThi';
const STORAGE_KEY_EXAM = 'bai2_deThi';

export default () => {
	const [danhSachCauTruc, setDanhSachCauTruc] = useState<CauTrucDeThi[]>(() =>
		loadFromStorage<CauTrucDeThi[]>(STORAGE_KEY_STRUCTURE, []),
	);
	const [danhSachDeThi, setDanhSachDeThi] = useState<DeThi[]>(() => loadFromStorage<DeThi[]>(STORAGE_KEY_EXAM, []));

	const persistStructure = useCallback((updater: (prev: CauTrucDeThi[]) => CauTrucDeThi[]) => {
		setDanhSachCauTruc((prev) => {
			const next = updater(prev);
			saveToStorage(STORAGE_KEY_STRUCTURE, next);
			return next;
		});
	}, []);

	const persistExam = useCallback((updater: (prev: DeThi[]) => DeThi[]) => {
		setDanhSachDeThi((prev) => {
			const next = updater(prev);
			saveToStorage(STORAGE_KEY_EXAM, next);
			return next;
		});
	}, []);

	const themCauTruc = async (payload: Omit<CauTrucDeThi, 'id'>) => {
		persistStructure((prev) => [{ ...payload, id: createId('ct_'), tenCauTruc: payload.tenCauTruc.trim() }, ...prev]);
	};

	const capNhatCauTruc = async (id: string, payload: Omit<CauTrucDeThi, 'id'>) => {
		persistStructure((prev) =>
			prev.map((x) => (x.id === id ? { ...x, ...payload, tenCauTruc: payload.tenCauTruc.trim() } : x)),
		);
	};

	const xoaCauTruc = async (id: string) => {
		persistStructure((prev) => prev.filter((x) => x.id !== id));
	};

	const themDeThi = async (payload: Omit<DeThi, 'id' | 'createdAt'>) => {
		persistExam((prev) => [{ ...payload, id: createId('dt_'), createdAt: new Date().toISOString() }, ...prev]);
	};

	const capNhatDeThi = async (id: string, payload: Omit<DeThi, 'id' | 'createdAt'>) => {
		persistExam((prev) => prev.map((x) => (x.id === id ? { ...x, ...payload } : x)));
	};

	const xoaDeThi = async (id: string) => {
		persistExam((prev) => prev.filter((x) => x.id !== id));
	};

	const reload = () => {
		setDanhSachCauTruc(loadFromStorage<CauTrucDeThi[]>(STORAGE_KEY_STRUCTURE, []));
		setDanhSachDeThi(loadFromStorage<DeThi[]>(STORAGE_KEY_EXAM, []));
	};

	return {
		danhSachCauTruc,
		danhSachDeThi,
		themCauTruc,
		capNhatCauTruc,
		xoaCauTruc,
		themDeThi,
		capNhatDeThi,
		xoaDeThi,
		reload,
	};
};
