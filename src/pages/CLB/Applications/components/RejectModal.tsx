import rules from '@/utils/rules';
import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';

type Props = {
	visible: boolean;
	onCancel: () => void;
	onSubmit: (reason: string) => void;
	title?: string;
};

const RejectModal = (props: Props) => {
	const { visible, onCancel, onSubmit, title } = props;
	const [form] = Form.useForm();

	useEffect(() => {
		if (!visible) form.resetFields();
	}, [visible]);

	const handleOk = async () => {
		const values = await form.validateFields();
		onSubmit(values.reason);
		form.resetFields();
	};

	return (
		<Modal
			visible={visible}
			title={title ?? 'Từ chối đơn đăng ký'}
			onCancel={onCancel}
			onOk={handleOk}
			okText='Từ chối'
			cancelText='Hủy'
			okButtonProps={{ danger: true }}
			destroyOnClose
		>
			<Form form={form} layout='vertical'>
				<Form.Item name='reason' label='Lý do từ chối' rules={[...rules.required, ...rules.length(1000)]}>
					<Input.TextArea rows={4} placeholder='Nhập lý do từ chối (bắt buộc)' />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default RejectModal;
