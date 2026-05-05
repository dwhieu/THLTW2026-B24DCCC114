import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, Tag, Typography, Space } from 'antd';
import { ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import { getTasks, saveTasks, Task, TaskStatus } from '@/utils/taskStorage';
import moment from 'moment';

const { Title, Text } = Typography;

const COLUMN_DATA: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'Cần làm', color: '#e6f7ff' },
  { id: 'IN_PROGRESS', title: 'Đang làm', color: '#fffbe6' },
  { id: 'DONE', title: 'Hoàn thành', color: '#f6ffed' },
];

const priorityColorMap: Record<string, string> = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
};

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newTasks = Array.from(tasks);
    const draggedTask = newTasks.find((t) => t.id === draggableId);
    if (!draggedTask) return;
    
    const newStatus = destination.droppableId as TaskStatus;
    
    const updatedTasks = newTasks.map(t => {
      if (t.id === draggableId) {
        return { ...t, status: newStatus };
      }
      return t;
    });

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((t) => t.status === status);
  };

  return (
    <div style={{ padding: '24px 24px 0' }}>
      <Title level={2} style={{ marginBottom: 24, fontWeight: 700 }}>Kanban Board</Title>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 16 }}>
          {COLUMN_DATA.map((col) => (
            <div key={col.id} style={{ minWidth: 320, flex: 1 }}>
              <div style={{
                background: col.color,
                padding: '16px',
                borderRadius: '8px',
                minHeight: '600px',
                border: '1px solid #f0f0f0'
              }}>
                <Title level={4} style={{ marginBottom: 16, color: '#333' }}>
                  {col.title} ({getTasksByStatus(col.id).length})
                </Title>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: 100,
                        background: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : 'transparent',
                        transition: 'background 0.2s ease',
                        borderRadius: 4,
                        padding: '4px'
                      }}
                    >
                      {getTasksByStatus(col.id).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                marginBottom: 16,
                                opacity: snapshot.isDragging ? 0.9 : 1,
                              }}
                            >
                              <Card 
                                hoverable 
                                size="small"
                                style={{ 
                                  borderRadius: 8, 
                                  boxShadow: snapshot.isDragging ? '0 8px 16px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
                                  borderLeft: `4px solid ${priorityColorMap[task.priority]}`
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                  <Tag color={priorityColorMap[task.priority] || 'default'}>
                                    {task.priority === 'High' && <FireOutlined />} {task.priority}
                                  </Tag>
                                  {moment(task.deadline).isBefore(moment()) && task.status !== 'DONE' && (
                                    <Tag color="error">Quá hạn</Tag>
                                  )}
                                </div>
                                <Title level={5} style={{ margin: '0 0 8px 0', fontSize: 16 }}>
                                  {task.name}
                                </Title>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                                  {moment(task.deadline).format('DD/MM/YYYY HH:mm')}
                                </Text>
                                {task.tags && task.tags.length > 0 && (
                                  <Space size={[0, 8]} wrap>
                                    {task.tags.map(tag => (
                                      <Tag key={tag} style={{ borderStyle: 'dashed' }}>{tag}</Tag>
                                    ))}
                                  </Space>
                                )}
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
