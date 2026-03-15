'use client';

import { useEffect, useState } from 'react';
import { CourseCard } from './CourseCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Course {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  level?: string;
  banner_url?: string;
  status: string;
  modules?: any[];
  short_description?: string;
  seller?: {
    full_name: string;
  };
}

export function CourseSections() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Cargar solo cursos publicados
        const response = await fetch(
          `${API_URL}/courses/?status=publicado`,
          { credentials: 'include' }
        );
        if (!response.ok) throw new Error('Error al cargar cursos');
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error(err);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center text-gray-500">
        <p className="text-lg font-medium">No hay cursos disponibles aún</p>
        <p className="text-sm mt-2">Vuelve pronto para ver nuevo contenido</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.short_description || ''}
            instructor={{
              name: course.seller?.full_name || 'Instructor',
              title: 'Experto en Salud',
              avatar: '/avatars/default.png'
            }}
            image={course.banner_url || '/course-placeholder.jpg'}
            level={course.level || 'Básico'}
            modality="Online"
            enrolled={0}
            category={course.category || 'General'}
          />
        ))}
      </div>
    </div>
  );
}
