export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  name: string;
  description: string;
  deadline: string; // ISO date string
  priority: TaskPriority;
  tags: string[];
  status: TaskStatus;
}

const STORAGE_KEY = 'kanban_tasks';

export const getTasks = (): Task[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  
  // Return some default sample data if empty
  const defaultTasks: Task[] = [
    {
      id: '1',
      name: 'Thiết kế giao diện',
      description: 'Thiết kế giao diện UI/UX cho ứng dụng Task Tracker',
      deadline: new Date(Date.now() + 86400000 * 2).toISOString(), // +2 days
      priority: 'High',
      tags: ['Design', 'UI'],
      status: 'TODO',
    },
    {
      id: '2',
      name: 'Khởi tạo dự án React',
      description: 'Setup Ant Design và các thư viện cần thiết',
      deadline: new Date(Date.now() - 86400000).toISOString(), // -1 day (overdue)
      priority: 'High',
      tags: ['Setup', 'React'],
      status: 'IN_PROGRESS',
    },
    {
      id: '3',
      name: 'Nghiên cứu react-beautiful-dnd',
      description: 'Đọc document và làm ví dụ demo kéo thả',
      deadline: new Date(Date.now() + 86400000 * 5).toISOString(), // +5 days
      priority: 'Medium',
      tags: ['Research'],
      status: 'DONE',
    }
  ];
  saveTasks(defaultTasks);
  return defaultTasks;
};

export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const addTask = (task: Omit<Task, 'id'>): Task => {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: Date.now().toString(),
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
};

export const updateTask = (id: string, updatedFields: Partial<Task>): Task | null => {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updatedFields };
    saveTasks(tasks);
    return tasks[index];
  }
  return null;
};

export const deleteTask = (id: string): void => {
  const tasks = getTasks();
  const filteredTasks = tasks.filter((t) => t.id !== id);
  saveTasks(filteredTasks);
};
