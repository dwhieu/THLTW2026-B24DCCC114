import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, Modal, Rate, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { useModel } from 'umi';
import type { Appointment, Review } from '@/models/booking';
import type bookingModel from '@/models/booking';

type BookingModel = ReturnType<typeof bookingModel>;

const ReviewPage: React.FC = () => {
	const {
		init,
		appointments,
		reviews,
		reviewsByAppointmentId,
		createReview,
		replyReview,
		staffAverageRatings,
		getEmployeeName,
		getServiceName,
	} = useModel('booking' as any) as BookingModel;

	useEffect(() => {
		init();
	}, [init]);

	const [reviewModalOpen, setReviewModalOpen] = useState(false);
	const [replyModalOpen, setReplyModalOpen] = useState(false);
	const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
	const [selectedReview, setSelectedReview] = useState<Review | undefined>();

	const [reviewForm] = Form.useForm();
	const [replyForm] = Form.useForm();

	const pendingReviewAppointments = useMemo(() => {
		return appointments.filter((a) => a.status === 'completed' && !reviewsByAppointmentId.has(a.id));
	}, [appointments, reviewsByAppointmentId]);

	const avgRows = useMemo(() => {
		return staffAverageRatings
			.map((x) => ({
				key: x.staffId,
				staffId: x.staffId,
				staffName: getEmployeeName(x.staffId),
				avg: x.avg,
				count: x.count,
			}))
			.sort((a, b) => b.avg - a.avg);
	}, [getEmployeeName, staffAverageRatings]);

	const averageColumns: ColumnsType<any> = [
		{ title: 'Nhân viên', dataIndex: 'staffName' },
		{ title: 'Điểm TB', dataIndex: 'avg', width: 120, render: (v) => Number(v).toFixed(2) },
		{ title: 'Số lượt', dataIndex: 'count', width: 120 },
	];

	const pendingColumns: ColumnsType<Appointment> = useMemo(
		() => [
			{ title: 'Ngày', dataIndex: 'date', width: 120 },
			{ title: 'Giờ', render: (_, r) => `${r.startTime}-${r.endTime}`, width: 120 },
			{ title: 'Dịch vụ', dataIndex: 'serviceId', render: (v) => getServiceName(String(v)) },
			{ title: 'Nhân viên', dataIndex: 'staffId', render: (v) => getEmployeeName(String(v)) },
			{ title: 'Khách hàng', dataIndex: 'customerName' },
			{
				title: 'Thao tác',
				width: 140,
				render: (_, record) => (
					<Button
						type='primary'
						onClick={() => {
							setSelectedAppointment(record);
							setReviewModalOpen(true);
							reviewForm.setFieldsValue({ rating: 5, comment: '' });
						}}
					>
						Đánh giá
					</Button>
				),
			},
		],
		[getEmployeeName, getServiceName, reviewForm],
	);

	const reviewColumns: ColumnsType<Review> = useMemo(
		() => [
			{
				title: 'Điểm',
				dataIndex: 'rating',
				width: 140,
				render: (v) => <Rate disabled value={Number(v)} />,
			},
			{ title: 'Nhân viên', dataIndex: 'staffId', render: (v) => getEmployeeName(String(v)) },
			{ title: 'Dịch vụ', dataIndex: 'serviceId', render: (v) => getServiceName(String(v)) },
			{
				title: 'Nhận xét',
				dataIndex: 'comment',
				render: (v) => (v ? String(v) : <Tag>Không có</Tag>),
			},
			{
				title: 'Phản hồi',
				dataIndex: 'staffReply',
				render: (v) => (v ? String(v) : <Tag>Chưa phản hồi</Tag>),
			},
			{
				title: 'Thao tác',
				width: 160,
				render: (_, record) => (
					<Button
						onClick={() => {
							setSelectedReview(record);
							setReplyModalOpen(true);
							replyForm.setFieldsValue({ staffReply: record.staffReply ?? '' });
						}}
					>
						Phản hồi
					</Button>
				),
			},
		],
		[getEmployeeName, getServiceName, replyForm],
	);

	return (
		<div>
			<Space direction='vertical' style={{ width: '100%' }} size={16}>
				<div>
					<h3>Đánh giá trung bình theo nhân viên</h3>
					<Table
						size='small'
						rowKey='key'
						columns={averageColumns}
						dataSource={avgRows}
						pagination={false}
						locale={{ emptyText: 'Chưa có đánh giá' }}
					/>
				</div>

				<div>
					<h3>Lịch hẹn đã hoàn thành (chưa đánh giá)</h3>
					<Table
						rowKey='id'
						columns={pendingColumns}
						dataSource={pendingReviewAppointments}
						locale={{ emptyText: 'Không có' }}
					/>
				</div>

				<div>
					<h3>Danh sách đánh giá</h3>
					<Table rowKey='id' columns={reviewColumns} dataSource={reviews} locale={{ emptyText: 'Chưa có đánh giá' }} />
				</div>
			</Space>

			<Modal
				destroyOnClose
				visible={reviewModalOpen}
				title='Đánh giá sau dịch vụ'
				onCancel={() => {
					setReviewModalOpen(false);
					setSelectedAppointment(undefined);
				}}
				onOk={async () => {
					try {
						const values = await reviewForm.validateFields();
						if (!selectedAppointment) throw new Error('Chưa chọn lịch hẹn');
						createReview({
							appointmentId: selectedAppointment.id,
							rating: values.rating,
							comment: values.comment,
						});
						setReviewModalOpen(false);
						setSelectedAppointment(undefined);
						message.success('Đã gửi đánh giá');
					} catch (e: any) {
						message.error(e?.message || 'Không thể đánh giá');
					}
				}}
			>
				<div style={{ marginBottom: 8, color: '#666' }}>
					{selectedAppointment
						? `${selectedAppointment.customerName} • ${getServiceName(
								selectedAppointment.serviceId,
						  )} • ${getEmployeeName(selectedAppointment.staffId)}`
						: ''}
				</div>
				<Form form={reviewForm} layout='vertical' initialValues={{ rating: 5 }}>
					<Form.Item name='rating' label='Điểm đánh giá' rules={[{ required: true, message: 'Chọn điểm' }]}>
						<Rate />
					</Form.Item>
					<Form.Item name='comment' label='Nhận xét'>
						<Input.TextArea rows={4} placeholder='Chia sẻ trải nghiệm của bạn' />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				destroyOnClose
				visible={replyModalOpen}
				title='Phản hồi đánh giá'
				onCancel={() => {
					setReplyModalOpen(false);
					setSelectedReview(undefined);
				}}
				onOk={async () => {
					try {
						const values = await replyForm.validateFields();
						if (!selectedReview) throw new Error('Chưa chọn đánh giá');
						replyReview(selectedReview.id, values.staffReply);
						setReplyModalOpen(false);
						setSelectedReview(undefined);
						message.success('Đã lưu phản hồi');
					} catch (e: any) {
						message.error(e?.message || 'Không thể lưu phản hồi');
					}
				}}
			>
				<Form form={replyForm} layout='vertical'>
					<Form.Item name='staffReply' label='Nội dung phản hồi'>
						<Input.TextArea rows={4} placeholder='Nhân viên phản hồi lại đánh giá' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ReviewPage;
