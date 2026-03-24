import { useState } from 'react';

export default function useQuanLyVanBangModel() {
	const [soVanBangList, setSoVanBangList] = useState<any[]>([]);
	const [quyetDinhList, setQuyetDinhList] = useState<any[]>([]);
	const [cauHinhList, setCauHinhList] = useState<any[]>([]);
	const [vanBangList, setVanBangList] = useState<any[]>([]);
	const [luotTraCuuTheoQuyetDinh, setLuotTraCuuTheoQuyetDinh] = useState<Record<string, number>>({});

	const normalizeFieldCode = (value: any) => String(value ?? '').trim();

	// Thêm Sổ văn bằng
	const themSoVanBang = (data: any): { ok: boolean; message?: string } => {
		const nam = String(data?.nam ?? '').trim();
		if (!nam) return { ok: false, message: 'Năm không hợp lệ.' };
		const existed = soVanBangList.some((so) => String(so?.nam ?? '').trim() === nam);
		if (existed) return { ok: false, message: `Năm ${nam} đã có sổ văn bằng. Mỗi năm chỉ được tạo 1 sổ.` };
		setSoVanBangList([...soVanBangList, { id: Date.now().toString(), ...data, nam }]);
		return { ok: true };
	};

	// Thêm Quyết định
	const themQuyetDinh = (data: any) => {
		setQuyetDinhList([...quyetDinhList, { id: Date.now().toString(), ...data }]);
	};

	// Thêm Cấu hình biểu mẫu
	const themCauHinh = (data: any): { ok: boolean; message?: string } => {
		const fieldCode = normalizeFieldCode(data?.fieldCode);
		if (!fieldCode) return { ok: false, message: 'Mã trường không hợp lệ.' };
		const existed = cauHinhList.some((x) => normalizeFieldCode(x?.fieldCode) === fieldCode);
		if (existed) return { ok: false, message: `Mã trường "${fieldCode}" đã tồn tại.` };
		setCauHinhList([...cauHinhList, { id: Date.now().toString(), ...data, fieldCode }]);
		return { ok: true };
	};
	const suaCauHinh = (id: string, patch: any): { ok: boolean; message?: string } => {
		const idx = cauHinhList.findIndex((x) => x.id === id);
		if (idx < 0) return { ok: false, message: 'Không tìm thấy cấu hình.' };
		// Không cho đổi fieldCode để tránh lệch dữ liệu văn bằng đã lưu
		const next = { ...cauHinhList[idx], ...patch, fieldCode: cauHinhList[idx].fieldCode };
		const cloned = [...cauHinhList];
		cloned[idx] = next;
		setCauHinhList(cloned);
		return { ok: true };
	};
	const xoaCauHinh = (id: string) => {
		setCauHinhList(cauHinhList.filter((item) => item.id !== id));
	};

	// Thêm Văn bằng và tự động tính Số vào sổ
	const themVanBang = (data: any) => {
		const payload = { ...data };
		// Không cho client tự set số vào sổ
		delete payload.soVaoSo;

		// 1. Tìm xem văn bằng này thuộc quyết định nào -> Sổ nào
		const quyetDinh = quyetDinhList.find((qd) => qd.id === payload.quyetDinhId);
		const soVanBangId = quyetDinh?.soVanBangId;

		// 2. Đếm số lượng văn bằng đã có trong Sổ này để tạo Số vào sổ mới
		const soLuongTrongSo = vanBangList.filter((vb) => {
			const qd = quyetDinhList.find((q) => q.id === vb.quyetDinhId);
			return qd?.soVanBangId === soVanBangId;
		}).length;

		const soVaoSoMoi = soLuongTrongSo + 1;

		// 3. Lưu dữ liệu
		setVanBangList([
			...vanBangList,
			{
				id: Date.now().toString(),
				soVaoSo: soVaoSoMoi,
				soVanBangId,
				...payload,
			},
		]);
	};

	const tangLuotTraCuu = (quyetDinhId?: string) => {
		if (!quyetDinhId) return;
		setLuotTraCuuTheoQuyetDinh((prev) => ({
			...prev,
			[quyetDinhId]: (prev[quyetDinhId] ?? 0) + 1,
		}));
	};

	return {
		soVanBangList,
		themSoVanBang,
		quyetDinhList,
		themQuyetDinh,
		cauHinhList,
		themCauHinh,
		suaCauHinh,
		xoaCauHinh,
		vanBangList,
		themVanBang,
		luotTraCuuTheoQuyetDinh,
		tangLuotTraCuu,
	};
}
