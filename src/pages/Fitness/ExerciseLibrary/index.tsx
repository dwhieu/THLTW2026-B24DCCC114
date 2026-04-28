import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Tag, Input, Select, Button, Modal, Form, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import styles from './index.less';

const { Search } = Input;
const { Option } = Select;

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  shortDesc: string;
  fullDesc: string;
  caloriesPerHour: number;
}

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
const DIFFICULTIES = ['Dễ', 'Trung bình', 'Khó'];

const defaultExercises: Exercise[] = [
  {
    id: '1',
    name: 'Push-up',
    muscleGroup: 'Chest',
    difficulty: 'Trung bình',
    shortDesc: 'Bài tập chống đẩy cơ bản',
    fullDesc: 'Nằm sấp, chống hai tay xuống sàn, nâng cơ thể lên xuống. Chú ý giữ lưng thẳng và gồng cơ cốt lõi (core).',
    caloriesPerHour: 300,
  },
  {
    id: '2',
    name: 'Squat',
    muscleGroup: 'Legs',
    difficulty: 'Dễ',
    shortDesc: 'Bài tập ngồi xổm phát triển thân dưới',
    fullDesc: 'Đứng hai chân rộng bằng vai, từ từ hạ thấp hông như đang ngồi xuống ghế. Giữ lưng thẳng và ngực mở rộng.',
    caloriesPerHour: 400,
  },
  {
    id: '3',
    name: 'Plank',
    muscleGroup: 'Core',
    difficulty: 'Trung bình',
    shortDesc: 'Bài tập tĩnh giữ vùng core',
    fullDesc: 'Tựa thân người trên hai cẳng tay và hai mũi chân. Giữ cơ thể thành một đường thẳng từ đầu đến gót chân.',
    caloriesPerHour: 220,
  },
];

const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<string | undefined>(undefined);
  const [filterDifficulty, setFilterDifficulty] = useState<string | undefined>(undefined);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const stored = localStorage.getItem('fitness_exercises');
    if (stored) {
      setExercises(JSON.parse(stored));
    } else {
      setExercises(defaultExercises);
      localStorage.setItem('fitness_exercises', JSON.stringify(defaultExercises));
    }
  }, []);

  const saveExercises = (newExercises: Exercise[]) => {
    setExercises(newExercises);
    localStorage.setItem('fitness_exercises', JSON.stringify(newExercises));
  };

  const handleAdd = () => {
    setEditingExercise(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    form.setFieldsValue(exercise);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newExercises = exercises.filter((ex) => ex.id !== id);
    saveExercises(newExercises);
    message.success('Đã xóa bài tập');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingExercise) {
        const newExercises = exercises.map((ex) =>
          ex.id === editingExercise.id ? { ...ex, ...values } : ex
        );
        saveExercises(newExercises);
        message.success('Cập nhật bài tập thành công');
      } else {
        const newExercise = {
          ...values,
          id: Date.now().toString(),
        };
        saveExercises([...exercises, newExercise]);
        message.success('Thêm bài tập mới thành công');
      }
      setIsModalVisible(false);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchName = ex.name.toLowerCase().includes(searchText.toLowerCase());
    const matchMuscle = filterMuscle ? ex.muscleGroup === filterMuscle : true;
    const matchDifficulty = filterDifficulty ? ex.difficulty === filterDifficulty : true;
    return matchName && matchMuscle && matchDifficulty;
  });

  const getDifficultyColor = (diff: string) => {
    if (diff === 'Dễ') return 'green';
    if (diff === 'Trung bình') return 'orange';
    if (diff === 'Khó') return 'red';
    return 'default';
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Tìm kiếm bài tập..."
            allowClear
            onSearch={(val) => setSearchText(val)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Lọc theo nhóm cơ"
            allowClear
            style={{ width: 180 }}
            onChange={(val) => setFilterMuscle(val)}
          >
            {MUSCLE_GROUPS.map((mg) => (
              <Option key={mg} value={mg}>{mg}</Option>
            ))}
          </Select>
          <Select
            placeholder="Lọc theo độ khó"
            allowClear
            style={{ width: 150 }}
            onChange={(val) => setFilterDifficulty(val)}
          >
            {DIFFICULTIES.map((diff) => (
              <Option key={diff} value={diff}>{diff}</Option>
            ))}
          </Select>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm bài tập mới
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {filteredExercises.map((ex) => (
          <Col xs={24} sm={12} md={8} key={ex.id}>
            <Card
              hoverable
              title={ex.name}
              extra={<Tag color={getDifficultyColor(ex.difficulty)}>{ex.difficulty}</Tag>}
              actions={[
                <EditOutlined key="edit" onClick={() => handleEdit(ex)} />,
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa bài tập này?"
                  onConfirm={() => handleDelete(ex.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <DeleteOutlined key="delete" style={{ color: 'red' }} />
                </Popconfirm>,
              ]}
              onClick={() => {
                setViewingExercise(ex);
                setIsDetailModalVisible(true);
              }}
            >
              <p><strong>Nhóm cơ:</strong> {ex.muscleGroup}</p>
              <p><strong>Mô tả ngắn:</strong> {ex.shortDesc}</p>
              <p><strong>Calo đốt:</strong> {ex.caloriesPerHour} kcal/h</p>
            </Card>
          </Col>
        ))}
        {filteredExercises.length === 0 && (
          <Col span={24} style={{ textAlign: 'center', padding: '40px 0' }}>
            Không tìm thấy bài tập nào phù hợp.
          </Col>
        )}
      </Row>


      <Modal
        title={editingExercise ? 'Sửa bài tập' : 'Thêm bài tập mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên bài tập" rules={[{ required: true, message: 'Vui lòng nhập tên bài tập' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="muscleGroup" label="Nhóm cơ tác động" rules={[{ required: true, message: 'Vui lòng chọn nhóm cơ' }]}>
            <Select>
              {MUSCLE_GROUPS.map((mg) => (
                <Option key={mg} value={mg}>{mg}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="difficulty" label="Mức độ khó" rules={[{ required: true, message: 'Vui lòng chọn mức độ khó' }]}>
            <Select>
              {DIFFICULTIES.map((diff) => (
                <Option key={diff} value={diff}>{diff}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="caloriesPerHour" label="Calo đốt trung bình/giờ" rules={[{ required: true, message: 'Vui lòng nhập số calo' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="shortDesc" label="Mô tả ngắn" rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fullDesc" label="Hướng dẫn thực hiện đầy đủ" rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>


      <Modal
        title={viewingExercise?.name}
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {viewingExercise && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag color={getDifficultyColor(viewingExercise.difficulty)}>{viewingExercise.difficulty}</Tag>
              <Tag color="blue">{viewingExercise.muscleGroup}</Tag>
            </div>
            <p><strong>Calo đốt:</strong> {viewingExercise.caloriesPerHour} kcal/h</p>
            <p><strong>Mô tả ngắn:</strong> {viewingExercise.shortDesc}</p>
            <div style={{ marginTop: 16 }}>
              <strong>Hướng dẫn thực hiện:</strong>
              <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{viewingExercise.fullDesc}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExerciseLibrary;
