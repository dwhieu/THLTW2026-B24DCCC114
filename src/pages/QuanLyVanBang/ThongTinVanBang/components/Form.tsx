import { Form, Input, InputNumber, DatePicker, Select, Button, message, Row, Col } from 'antd';
import { useModel } from 'umi';

export default function VanBangForm({ onSuccess }: { onSuccess: () => void }) {
	const [form] = Form.useForm();
	const { cauHinhList, quyetDinhList, themVanBang } = useModel('quanLyVanBang');

	const onFinish = (values: any) => {
		// Xử lý dữ liệu Date trước khi lưu
		const formatData = { ...values };
		if (formatData.ngaySinh) formatData.ngaySinh = formatData.ngaySinh.format('DD/MM/YYYY');
		if (formatData.dynamic_fields) {
			Object.keys(formatData.dynamic_fields).forEach((key) => {
				const field = formatData.dynamic_fields[key];
				if (field && typeof field.format === 'function') {
					formatData.dynamic_fields[key] = field.format('DD/MM/YYYY');
				}
			});
		}

		themVanBang(formatData);
		message.success('Cấp văn bằng thành công! Số vào sổ đã tự động tăng.');
		onSuccess();
	};

	return (
		<Form form={form} layout='vertical' onFinish={onFinish}>
			<Form.Item name='quyetDinhId' label='Thuộc Quyết định tốt nghiệp' rules={[{ required: true }]}>
				<Select>
					{quyetDinhList.map((qd) => (
						<Select.Option key={qd.id} value={qd.id}>
							{qd.soQD} - {qd.trichYeu}
						</Select.Option>
					))}
				</Select>
			</Form.Item>

			<Row gutter={16}>
				<Col span={12}>
					<Form.Item name='soHieu' label='Số hiệu văn bằng' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item name='maSV' label='Mã sinh viên' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item name='hoTen' label='Họ tên' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item name='ngaySinh' label='Ngày sinh'>
						<DatePicker format='DD/MM/YYYY' style={{ width: '100%' }} />
					</Form.Item>
				</Col>
			</Row>

			{cauHinhList.length > 0 && <h3>Thông tin phụ lục</h3>}
			<Row gutter={16}>
				{cauHinhList.map((config: any) => {
					let Control = <Input />;
					if (config.dataType === 'Number') Control = <InputNumber style={{ width: '100%' }} />;
					if (config.dataType === 'Date') Control = <DatePicker format='DD/MM/YYYY' style={{ width: '100%' }} />;

					return (
						<Col span={12} key={config.fieldCode}>
							<Form.Item name={['dynamic_fields', config.fieldCode]} label={config.fieldName}>
								{Control}
							</Form.Item>
						</Col>
					);
				})}
			</Row>

			<Form.Item style={{ textAlign: 'right' }}>
				<Button type='primary' htmlType='submit'>
					Lưu văn bằng
				</Button>
			</Form.Item>
		</Form>
	);
}
