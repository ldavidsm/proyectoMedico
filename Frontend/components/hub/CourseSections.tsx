'use client';

import { useEffect, useState, useMemo } from 'react';
import { CourseCard } from './CourseCard';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface BackendCourse {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  level?: string;
  banner_url?: string;
  status: string;
  modules?: any[];
  short_description?: string;
  long_description?: string;
  rating_avg?: number;
  rating_count?: number;
  seller?: {
    full_name: string;
  };
}

interface CourseSectionsProps {
  searchQuery?: string;
  selectedLevel?: string[];
  selectedModality?: string[];
}

export function CourseSections({
  searchQuery = '',
  selectedLevel = [],
  selectedModality = [],
}: CourseSectionsProps) {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesRes = await fetch(
          `${API_URL}/courses/?status=publicado`,
          { credentials: 'include' }
        );
        if (!coursesRes.ok) throw new Error('Error al cargar cursos');
        const coursesData = await coursesRes.json();
        setCourses(coursesData);

        // Fetch user's orders and favorites
        if (isAuthenticated) {
          const [ordersResult, favoritesResult] = await Promise.allSettled([
            fetch(`${API_URL}/orders/my-orders`, { credentials: 'include' }),
            fetch(`${API_URL}/favorites/`, { credentials: 'include' }),
          ]);

          if (ordersResult.status === 'fulfilled' && ordersResult.value.ok) {
            const orders = await ordersResult.value.json();
            const paidIds = new Set<string>(
              orders
                .filter((o: any) => o.status === 'paid')
                .map((o: any) => o.course_id)
            );
            setPurchasedIds(paidIds);
          }

          if (favoritesResult.status === 'fulfilled' && favoritesResult.value.ok) {
            const favCourses = await favoritesResult.value.json();
            setFavoritedIds(new Set<string>(favCourses.map((c: any) => c.id)));
          }
        }
      } catch (err) {
        console.error(err);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const filteredCourses = useMemo(() => {
    let result = courses;

    // Exclude purchased courses
    if (purchasedIds.size > 0) {
      result = result.filter(course => !purchasedIds.has(course.id));
    }

    // Search filter: match against title, description, instructor name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(course =>
        course.title?.toLowerCase().includes(query) ||
        course.short_description?.toLowerCase().includes(query) ||
        course.long_description?.toLowerCase().includes(query) ||
        course.seller?.full_name?.toLowerCase().includes(query) ||
        course.category?.toLowerCase().includes(query)
      );
    }

    // Level filter
    if (selectedLevel.length > 0) {
      result = result.filter(course =>
        course.level && selectedLevel.some(level =>
          course.level!.toLowerCase() === level.toLowerCase()
        )
      );
    }

    return result;
  }, [courses, purchasedIds, searchQuery, selectedLevel, selectedModality]);

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

  if (filteredCourses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center text-gray-500">
        <p className="text-lg font-medium">No se encontraron cursos</p>
        <p className="text-sm mt-2">Prueba con otros términos de búsqueda o filtros</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
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
            ratingAvg={course.rating_avg}
            ratingCount={course.rating_count}
            initialFavorited={favoritedIds.has(course.id)}
          />
        ))}
      </div>
    </div>
  );
}
