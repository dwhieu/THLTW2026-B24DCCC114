import { useState } from 'react';
import { Card, Table, Button, Modal, Descriptions } from 'antd';
import { useModel } from 'umi';
import VanBangForm from './components/Form';

export default function ThongTinVanBang() {
	const { vanBangList, quyetDinhList, soVanBangList, cauHinhList } = useModel('quanLyVanBang');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [visibleDetail, setVisibleDetail] = useState(false);
	const [selected, setSelected] = useState<any>();

	const soVanBangById = new Map(soVanBangList.map((so: any) => [so.id, so]));
	const quyetDinhById = new Map(quyetDinhList.map((qd: any) => [qd.id, qd]));

	const openDetail = (record: any) => {
		setSelected(record);
		setVisibleDetail(true);
	};

	return (
		<Card title='Danh sách Văn bằng'>
			<Button type='primary' onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>
				Cấp văn bằng mới
			</Button>
			<Table
				dataSource={vanBangList}
				rowKey='id'
				columns={[
					{ title: 'Số vào sổ', dataIndex: 'soVaoSo', key: 'soVaoSo' },
					{ title: 'Số hiệu VB', dataIndex: 'soHieu', key: 'soHieu' },
					{ title: 'Mã SV', dataIndex: 'maSV', key: 'maSV' },
					{ title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
					{ title: 'Ngày sinh', dataIndex: 'ngaySinh', key: 'ngaySinh' },
					{
						title: 'Chi tiết',
						key: 'detail',
						render: (_, record: any) => (
							<Button type='link' onClick={() => openDetail(record)}>
								Xem
							</Button>
						),
					},
				]}
			/>
			<Modal
				title='Cấp mới Văn bằng'
				visible={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				footer={null}
				width={800}
				destroyOnClose
			>
				<VanBangForm onSuccess={() => setIsModalOpen(false)} />
			</Modal>

			<Modal
				title='Chi tiết văn bằng'
				visible={visibleDetail}
				onCancel={() => {
					setVisibleDetail(false);
					setSelected(undefined);
				}}
				footer={null}
				width={800}
				destroyOnClose
			>
				{(() => {
					const vb = selected;
					if (!vb) return null;
					const qd = quyetDinhById.get(vb.quyetDinhId);
					const so = soVanBangById.get(qd?.soVanBangId);
					return (
						<>
							<Descriptions column={1} size='small' bordered>
								<Descriptions.Item label='Số vào sổ'>{vb.soVaoSo}</Descriptions.Item>
								<Descriptions.Item label='Số hiệu văn bằng'>{vb.soHieu}</Descriptions.Item>
								<Descriptions.Item label='Mã sinh viên'>{vb.maSV}</Descriptions.Item>
								<Descriptions.Item label='Họ tên'>{vb.hoTen}</Descriptions.Item>
								<Descriptions.Item label='Ngày sinh'>{vb.ngaySinh || '—'}</Descriptions.Item>
								<Descriptions.Item label='Quyết định'>
									{qd ? `${qd.soQD} - ${qd.trichYeu} (${qd.ngayBanHanh})` : '—'}
								</Descriptions.Item>
								<Descriptions.Item label='Sổ văn bằng'>{so ? `${so.tenSo} (${so.nam})` : '—'}</Descriptions.Item>
							</Descriptions>
							{cauHinhList?.length ? (
								<Descriptions style={{ marginTop: 16 }} column={1} size='small' bordered>
									{cauHinhList.map((cfg: any) => (
										<Descriptions.Item key={cfg.fieldCode} label={cfg.fieldName}>
											{vb?.dynamic_fields?.[cfg.fieldCode] ?? '—'}
										</Descriptions.Item>
									))}
								</Descriptions>
							) : null}
						</>
					);
				})()}
			</Modal>
		</Card>
	);
}
