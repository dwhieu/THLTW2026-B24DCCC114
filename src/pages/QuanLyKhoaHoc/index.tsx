import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { useLocation, history } from 'umi';
import CourseList from './components/CourseList';
import CourseForm from './components/CourseForm';

export interface Course {
  id: string;
  name: string;
  lecturer: string;
  students: number;
  status: 'Open' | 'Ended' | 'Paused';
  description: string;
}

const QuanLyKhoaHoc: React.FC = () => {
  const location = useLocation();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const savedCourses = localStorage.getItem('courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      const initialCourses: Course[] = [
        { id: '1', name: 'Lập trình React', lecturer: 'Nguyễn Văn A', students: 20, status: 'Open', description: '<p>Học React cơ bản</p>' },
        { id: '2', name: 'Thiết kế UI/UX', lecturer: 'Trần Thị B', students: 0, status: 'Paused', description: '<p>Học thiết kế</p>' },
      ];
      setCourses(initialCourses);
      localStorage.setItem('courses', JSON.stringify(initialCourses));
    }
  }, []);

  const saveCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    localStorage.setItem('courses', JSON.stringify(newCourses));
  };

  const handleAddCourse = (values: any) => {
    const maxId = courses.length > 0 ? Math.max(...courses.map((c) => parseInt(c.id, 10))) : 0;
    const newCourse: Course = {
      ...values,
      id: (maxId + 1).toString(),
    };
    const updated = [...courses, newCourse];
    saveCourses(updated);
    history.push('/quan-ly-khoa-hoc/danh-sach');
  };

  const handleUpdateCourse = (values: any) => {
    const updated = courses.map((c) => (c.id === values.id ? { ...c, ...values } : c));
    saveCourses(updated);
  };

  const handleDeleteCourse = (id: string) => {
    const updated = courses.filter((c) => c.id !== id);
    saveCourses(updated);
  };

  const isListView = location.pathname === '/quan-ly-khoa-hoc/danh-sach';

  return (
    <PageContainer header={{ title: '', breadcrumb: {} }}>
      {isListView ? (
        <CourseList
          courses={courses}
          onDelete={handleDeleteCourse}
          onUpdate={handleUpdateCourse}
        />
      ) : (
        <CourseForm
          onSubmit={handleAddCourse}
          courseNames={courses.map((c) => c.name)}
          onCancel={() => {
            history.push('/quan-ly-khoa-hoc/danh-sach');
          }}
        />
      )}
    </PageContainer>
  );
};

export default QuanLyKhoaHoc;
