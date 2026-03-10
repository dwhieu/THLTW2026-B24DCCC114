import { Button, Card, Space, Table, Typography } from 'antd';
import { useState } from 'react';

type Choice = 'KEO' | 'BUA' | 'BAO';
type RoundResult = 'THANG' | 'THUA' | 'HOA';

type HistoryItem = {
	id: number;
	player: Choice;
	computer: Choice;
	result: RoundResult;
};

function randomChoice(): Choice {
	const choices: Choice[] = ['KEO', 'BUA', 'BAO'];
	const randomIndex = Math.floor(Math.random() * 3);
	return choices[randomIndex];
}

function compare(player: Choice, computer: Choice): RoundResult {
	if (player === computer) {
		return 'HOA';
	}

	if (
		(player === 'KEO' && computer === 'BAO') ||
		(player === 'BUA' && computer === 'KEO') ||
		(player === 'BAO' && computer === 'BUA')
	) {
		return 'THANG';
	}

	return 'THUA';
}

function getChoiceName(choice: Choice): string {
	if (choice === 'KEO') return 'Kéo';
	if (choice === 'BUA') return 'Búa';
	if (choice === 'BAO') return 'Bao';
	return '';
}

function getResultName(result: RoundResult): string {
	if (result === 'THANG') return 'Thắng';
	if (result === 'THUA') return 'Thua';
	if (result === 'HOA') return 'Hòa';
	return '';
}

const OanTuTi: React.FC = () => {
	const [history, setHistory] = useState<HistoryItem[]>([]);

	const lastRound = history.length > 0 ? history[0] : null;

	const onPlay = (playerChoice: Choice) => {
		const computerChoice = randomChoice();
		const result = compare(playerChoice, computerChoice);

		const newRound: HistoryItem = {
			id: history.length + 1,
			player: playerChoice,
			computer: computerChoice,
			result: result,
		};

		setHistory([newRound, ...history]);
	};

	return (
		<div>
			<Typography.Title level={2} style={{ textAlign: 'center' }}>
				Trò chơi Oẳn Tù Tì
			</Typography.Title>

			<Card>
				<Typography.Paragraph>
					Bạn chọn <b>Kéo</b>, <b>Búa</b>, hoặc <b>Bao</b>. Máy tính sẽ chọn ngẫu nhiên.
				</Typography.Paragraph>

				<Space wrap>
					<Button type='primary' onClick={() => onPlay('KEO')}>
						Kéo
					</Button>
					<Button type='primary' onClick={() => onPlay('BUA')}>
						Búa
					</Button>
					<Button type='primary' onClick={() => onPlay('BAO')}>
						Bao
					</Button>
				</Space>

				<div style={{ marginTop: 16 }}>
					<Typography.Text strong>Kết quả ván gần nhất:</Typography.Text>
					<div>
						{lastRound ? (
							<Typography.Text>
								Bạn: <b>{getChoiceName(lastRound.player)}</b> — Máy: <b>{getChoiceName(lastRound.computer)}</b>
								{' → '} <b>{getResultName(lastRound.result)}</b>
							</Typography.Text>
						) : (
							<Typography.Text type='secondary'>Chưa có ván nào. Hãy chọn một nước để bắt đầu.</Typography.Text>
						)}
					</div>
				</div>
			</Card>

			<Card style={{ marginTop: 16 }} title='Lịch sử kết quả'>
				<Table<HistoryItem>
					rowKey='id'
					dataSource={history}
					pagination={false}
					size='middle'
					locale={{ emptyText: 'Chưa có dữ liệu' }}
					columns={[
						{
							title: '#',
							dataIndex: 'id',
							width: 70,
						},
						{
							title: 'Bạn',
							dataIndex: 'player',
							render: (v: Choice) => getChoiceName(v),
						},
						{
							title: 'Máy',
							dataIndex: 'computer',
							render: (v: Choice) => getChoiceName(v),
						},
						{
							title: 'Kết quả',
							dataIndex: 'result',
							render: (v: RoundResult) => getResultName(v),
						},
					]}
				/>
			</Card>
		</div>
	);
};

export default OanTuTi;
