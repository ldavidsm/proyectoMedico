'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle2, PlayCircle, Award, Calendar, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface OrderWithCourse {
  id: string;
  course_id: string;
  offer_id: string;
  price: number;
  status: string;
  created_at: string;
  course?: {
    id: string;
    title: string;
    category_id?: string;
    seller_id?: string;
    seller_name?: string;
  };
}

interface DisplayCourse {
  id: string;
  title: string;
  instructor: string;
  category: string;
  enrolledAt: string;
  status: 'in-progress' | 'completed';
}

interface FavoriteCourse {
  id: string;
  title: string;
  category?: string;
  offers?: Array<{ price_base: number }>;
}

type TabType = 'in-progress' | 'completed' | 'all' | 'favorites';

export function MyLearning() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [favorites, setFavorites] = useState<FavoriteCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavLoading, setIsFavLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/orders/my-orders`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Error al cargar tus cursos');
        }

        const orders: OrderWithCourse[] = await res.json();

        // Only show paid orders
        const paidOrders = orders.filter(o => o.status === 'paid');

        // Fetch course details for each order
        const coursesData: DisplayCourse[] = await Promise.all(
          paidOrders.map(async (order) => {
            try {
              const courseRes = await fetch(`${API_URL}/courses/${order.course_id}`);
              const course = courseRes.ok ? await courseRes.json() : null;
              return {
                id: order.course_id,
                title: course?.title || 'Curso',
                instructor: course?.seller_name || 'Instructor',
                category: course?.category_name || '',
                enrolledAt: new Date(order.created_at).toLocaleDateString('es-ES'),
                status: 'in-progress' as const,
              };
            } catch {
              return {
                id: order.course_id,
                title: 'Curso',
                instructor: 'Instructor',
                category: '',
                enrolledAt: new Date(order.created_at).toLocaleDateString('es-ES'),
                status: 'in-progress' as const,
              };
            }
          })
        );

        setCourses(coursesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // Fetch favorites when that tab is activated
  useEffect(() => {
    if (activeTab !== 'favorites') return;
    if (favorites.length > 0) return; // already loaded

    async function fetchFavorites() {
      try {
        setIsFavLoading(true);
        const res = await fetch(`${API_URL}/favorites/`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Error al cargar favoritos');
        const data = await res.json();
        setFavorites(data);
      } catch {
        // non-blocking
      } finally {
        setIsFavLoading(false);
      }
    }

    fetchFavorites();
  }, [activeTab, favorites.length]);

  const removeFavorite = async (courseId: string) => {
    const prev = favorites;
    setFavorites(f => f.filter(c => c.id !== courseId));
    try {
      const res = await fetch(`${API_URL}/favorites/${courseId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
    } catch {
      setFavorites(prev);
    }
  };

  const filteredCourses = courses.filter(course => {
    if (activeTab === 'in-progress') return course.status === 'in-progress';
    if (activeTab === 'completed') return course.status === 'completed';
    return true;
  });

  const stats = {
    inProgress: courses.filter(c => c.status === 'in-progress').length,
    completed: courses.filter(c => c.status === 'completed').length,
    total: courses.length,
  };

  const tabs = [
    { id: 'all' as TabType, label: 'Todos', count: stats.total },
    { id: 'in-progress' as TabType, label: 'En curso', count: stats.inProgress },
    { id: 'completed' as TabType, label: 'Completados', count: stats.completed },
    { id: 'favorites' as TabType, label: 'Favoritos', count: null },
  ];

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Mi aprendizaje</h1>
        <p className="text-sm text-gray-500">
          Gestiona tus cursos y sigue tu progreso de formación continua
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
              <p className="text-xs text-gray-500">En curso</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-500">Completados</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total cursos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.id === 'favorites' && <Heart className="w-3.5 h-3.5" />}
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Favorites Tab Content */}
      {activeTab === 'favorites' ? (
        <div className="space-y-4">
          {isFavLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                No tienes cursos guardados
              </h3>
              <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto">
                Marca cursos como favoritos desde el catálogo para encontrarlos rápidamente aquí
              </p>
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 h-9 px-4 text-xs font-medium"
                onClick={() => router.push('/')}
              >
                Explorar cursos
              </Button>
            </div>
          ) : (
            favorites.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-xs text-gray-500">
                      {course.category || 'General'}
                      {course.offers?.[0] && ` • $${course.offers[0].price_base.toLocaleString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFavorite(course.id)}
                    className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
                    aria-label="Quitar de favoritos"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-3">
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 h-8 px-3 text-xs font-medium"
                    onClick={() => router.push(`/course/${course.id}`)}
                  >
                    Ver curso
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Courses List (existing tabs) */
        <div className="space-y-4">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {courses.length === 0 ? 'Aún no tienes cursos' : 'No hay cursos en esta categoría'}
              </h3>
              <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto">
                {courses.length === 0
                  ? 'Comienza tu formación continua explorando nuestro catálogo de cursos especializados'
                  : 'Prueba con otra pestaña'}
              </p>
              {courses.length === 0 && (
                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 h-9 px-4 text-xs font-medium"
                  onClick={() => router.push('/')}
                >
                  Explorar cursos
                </Button>
              )}
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => router.push(`/course/${course.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-xs text-gray-500">
                      {course.instructor}
                      {course.category && ` • ${course.category}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Inscrito el {course.enrolledAt}</span>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-3">
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 h-8 px-3 text-xs font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/course/${course.id}`);
                    }}
                  >
                    <PlayCircle className="w-3.5 h-3.5 mr-1" />
                    Ver curso
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
