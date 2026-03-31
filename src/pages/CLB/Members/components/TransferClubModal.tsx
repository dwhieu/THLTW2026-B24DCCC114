import rules from '@/utils/rules';
import { Form, Modal, Select, Typography } from 'antd';
import { useEffect } from 'react';

const { Text } = Typography;

type Props = {
	visible: boolean;
	onCancel: () => void;
	onSubmit: (toClubId: string) => void;
	clubs: CLB.IClubRecord[];
	count: number;
};

const TransferClubModal = (props: Props) => {
	const { visible, onCancel, onSubmit, clubs, count } = props;
	const [form] = Form.useForm();

	useEffect(() => {
		if (!visible) form.resetFields();
	}, [visible]);

	const handleOk = async () => {
		const values = await form.validateFields();
		onSubmit(values.toClubId);
		form.resetFields();
	};

	return (
		<Modal
			visible={visible}
			title='Chuyển câu lạc bộ'
			onCancel={onCancel}
			onOk={handleOk}
			okText='Chuyển'
			cancelText='Hủy'
			destroyOnClose
		>
			<Text>
				Số thành viên sẽ chuyển: <b>{count}</b>
			</Text>
			<Form form={form} layout='vertical' style={{ marginTop: 12 }}>
				<Form.Item name='toClubId' label='Chọn CLB muốn chuyển đến' rules={[...rules.required]}>
					<Select
						showSearch
						optionFilterProp='label'
						options={clubs.map((c) => ({ value: c._id, label: c.ten }))}
						placeholder='Chọn CLB'
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default TransferClubModal;
