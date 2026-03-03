import React, { useEffect, useState } from 'react';
import { Button, Card, Col, InputNumber, Row, Typography, Alert } from 'antd';

const { Title, Paragraph, Text } = Typography;

const MAX_ATTEMPTS = 10;

const DoanSo: React.FC = () => {
	const [secretNumber, setSecretNumber] = useState<number | null>(null);
	const [attemptsLeft, setAttemptsLeft] = useState<number>(MAX_ATTEMPTS);
	const [currentGuess, setCurrentGuess] = useState<number | null>(null);
	const [message, setMessage] = useState<string>('');
	const [status, setStatus] = useState<'info' | 'success' | 'error' | 'warning'>('info');
	const [finished, setFinished] = useState<boolean>(false);

	const startGame = () => {
		const random = Math.floor(Math.random() * 100) + 1;
		setSecretNumber(random);
		setAttemptsLeft(MAX_ATTEMPTS);
		setCurrentGuess(null);
		setMessage('Hệ thống đã sinh ra một số trong khoảng 1 đến 100. Hãy bắt đầu đoán!');
		setStatus('info');
		setFinished(false);
	};

	useEffect(() => {
		startGame();
	}, []);

	const handleGuess = () => {
		if (finished) return;
		if (currentGuess === null || currentGuess < 1 || currentGuess > 100) {
			setMessage('Vui lòng nhập một số trong khoảng từ 1 đến 100.');
			setStatus('warning');
			return;
		}

		if (secretNumber === null) return;

		const nextAttempts = attemptsLeft - 1;
		setAttemptsLeft(nextAttempts);

		if (currentGuess === secretNumber) {
			setMessage('Chúc mừng! Bạn đã đoán đúng!');
			setStatus('success');
			setFinished(true);
			return;
		}

		if (nextAttempts <= 0) {
			setMessage(`Bạn đã hết lượt! Số đúng là ${secretNumber}.`);
			setStatus('error');
			setFinished(true);
			return;
		}

		if (currentGuess < secretNumber) {
			setMessage('Bạn đoán quá thấp!');
		} else {
			setMessage('Bạn đoán quá cao!');
		}
		setStatus('warning');
	};

	const handleReset = () => {
		startGame();
	};

	return (
		<Row justify='center'>
			<Col xs={24} sm={20} md={16} lg={12} xl={10}>
				<Card>
					<Title level={3} style={{ textAlign: 'center' }}>
						Trò chơi đoán số (1 - 100)
					</Title>
					<Paragraph>
						Hệ thống sẽ sinh ra một số ngẫu nhiên từ 1 đến 100. Bạn có <Text strong>{MAX_ATTEMPTS}</Text> lượt để đoán.
					</Paragraph>

					<Paragraph>
						Sau mỗi lần đoán, hệ thống sẽ cho bạn biết bạn đoán <Text strong>quá thấp</Text>,{' '}
						<Text strong>quá cao</Text> hoặc <Text strong>đúng số</Text>.
					</Paragraph>

					<Row gutter={[16, 16]} align='middle' style={{ marginTop: 16 }}>
						<Col span={16}>
							<Text>Nhập số bạn đoán:</Text>
							<InputNumber
								style={{ width: '100%', marginTop: 8 }}
								min={1}
								max={100}
								value={currentGuess ?? undefined}
								onChange={(value) => setCurrentGuess(value as number | null)}
								disabled={finished}
							/>
						</Col>
						<Col span={8} style={{ marginTop: 24, textAlign: 'right' }}>
							<Button type='primary' onClick={handleGuess} disabled={finished}>
								Đoán
							</Button>
							<Button style={{ marginLeft: 8 }} onClick={handleReset}>
								Chơi lại
							</Button>
						</Col>
					</Row>

					<div style={{ marginTop: 24 }}>
						{message && <Alert message={message} type={status} showIcon />}
						<Paragraph style={{ marginTop: 12 }}>
							Lượt còn lại: <Text strong>{attemptsLeft}</Text>
						</Paragraph>
					</div>
				</Card>
			</Col>
		</Row>
	);
};

export default DoanSo;
