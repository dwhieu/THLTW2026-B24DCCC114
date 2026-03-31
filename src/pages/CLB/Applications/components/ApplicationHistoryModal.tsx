import { Modal, Timeline, Typography } from 'antd';
import moment from 'moment';

const { Text } = Typography;

type Props = {
	visible: boolean;
	onCancel: () => void;
	record?: CLB.IApplicationRecord;
	clubNameById: (id?: string | null) => string;
};

const actionLabel: Record<CLB.HistoryAction, string> = {
	Created: 'Tạo mới',
	Updated: 'Chỉnh sửa',
	Approved: 'Duyệt',
	Rejected: 'Từ chối',
	TransferredClub: 'Chuyển CLB',
};

const ApplicationHistoryModal = (props: Props) => {
	const { visible, onCancel, record, clubNameById } = props;

	return (
		<Modal visible={visible} onCancel={onCancel} footer={null} title='Lịch sử thao tác' width={800}>
			{record?.lichSu?.length ? (
				<Timeline>
					{record.lichSu.map((h) => (
						<Timeline.Item key={h.id}>
							<div>
								<b>{actionLabel[h.action] ?? h.action}</b> bởi <b>{h.by}</b>
								{' · '}
								<Text type='secondary'>{moment(h.at).format('HH:mm DD/MM/YYYY')}</Text>
							</div>
							{h.action === 'TransferredClub' ? (
								<div>
									<Text>
										Từ: <b>{clubNameById(h.fromClubId)}</b> → Đến: <b>{clubNameById(h.toClubId)}</b>
									</Text>
								</div>
							) : null}
							{h.note ? (
								<div>
									<Text>Ghi chú: {h.note}</Text>
								</div>
							) : null}
						</Timeline.Item>
					))}
				</Timeline>
			) : (
				<Text type='secondary'>Chưa có lịch sử.</Text>
			)}
		</Modal>
	);
};

export default ApplicationHistoryModal;
