'use client';

import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Calendar, Loader2, Heart, Play } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface ProgressSummary {
  course_id: string;
  course_title: string;
  percentage: number;
  completed_blocks: number;
  total_blocks: number;
  last_block_id: string | null;
  is_complete: boolean;
}

interface DisplayCourse {
  id: string;
  title: string;
  instructor: string;
  category: string;
  banner_url?: string | null;
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
  const [progressMap, setProgressMap] = useState<Record<string, ProgressSummary>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [isFavLoading, setIsFavLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders + progress in parallel (no N+1, no flash)
  useEffect(() => {
    async function fetchAll() {
      try {
        setIsLoading(true);
        setIsProgressLoading(true);

        const [ordersRes, progressRes] = await Promise.all([
          fetch(`${API_URL}/orders/my-orders`, { credentials: 'include' }),
          fetch(`${API_URL}/courses/_/progress/summary`, { credentials: 'include' }),
        ]);

        const orders = ordersRes.ok ? await ordersRes.json() : [];
        const progressData: ProgressSummary[] = progressRes.ok ? await progressRes.json() : [];

        // Build progress map
        const pMap: Record<string, ProgressSummary> = {};
        progressData.forEach(p => { pMap[p.course_id] = p; });
        setProgressMap(pMap);

        // Map courses with correct status from the start
        const paidOrders = orders.filter((o: any) => o.status === 'paid');
        const coursesData: DisplayCourse[] = paidOrders.map((order: any) => ({
          id: order.course_id,
          title: order.course?.title || 'Curso',
          instructor: order.course?.seller_name || 'Instructor',
          category: order.course?.category || '',
          banner_url: order.course?.banner_url || null,
          enrolledAt: new Date(order.created_at).toLocaleDateString('es-ES'),
          status: pMap[order.course_id]?.is_complete ? 'completed' as const : 'in-progress' as const,
        }));

        setCourses(coursesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsProgressLoading(false);
      }
    }

    fetchAll();
  }, []);

  // Fetch favorites when tab activated
  useEffect(() => {
    if (activeTab !== 'favorites') return;
    if (favorites.length > 0) return;

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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.inProgress}</p>
              <p className="text-xs text-slate-400">En curso</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
              <p className="text-xs text-slate-400">Completados</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-400">Total cursos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
              activeTab === tab.id
                ? 'font-semibold bg-purple-600 text-white shadow-sm'
                : 'font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.id === 'favorites' && <Heart className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' ? (
        <div className="space-y-4">
          {isFavLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-5">
                <Heart className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No tienes favoritos aún
              </h3>
              <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                Guarda cursos que te interesen para acceder rápido
              </p>
              <Link href="/"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-sm text-sm">
                Explorar cursos
              </Link>
            </div>
          ) : (
            favorites.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-base mb-1">{course.title}</h3>
                    <p className="text-sm text-slate-400">
                      {course.category || 'General'}
                      {course.offers?.[0] && (
                        <span className="ml-2 font-bold text-purple-600">
                          ${course.offers[0].price_base.toLocaleString()}
                        </span>
                      )}
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
                <div className="pt-3 border-t border-slate-100 mt-3">
                  <button
                    onClick={() => router.push(`/course/${course.id}`)}
                    className="w-full border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:border-purple-400 hover:text-purple-600 transition-all duration-200"
                  >
                    Ver curso
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Courses List */
        <div className="space-y-4">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-5">
                <BookOpen className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {courses.length === 0 ? 'Aún no tienes cursos' : 'No hay cursos en esta categoría'}
              </h3>
              <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                {courses.length === 0
                  ? 'Explora el catálogo y encuentra tu próximo curso'
                  : 'Prueba con otra pestaña'}
              </p>
              {courses.length === 0 && (
                <Link href="/"
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-sm text-sm">
                  Explorar cursos
                </Link>
              )}
            </div>
          ) : (
            filteredCourses.map((course) => {
              const progress = progressMap[course.id];
              const isComplete = progress?.percentage === 100;
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                >
                  {/* Course banner */}
                  {course.banner_url ? (
                    <img
                      src={course.banner_url}
                      alt={course.title}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-purple-300" />
                    </div>
                  )}

                  <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2 leading-snug">{course.title}</h3>
                      <p className="text-sm text-slate-400">
                        {course.instructor}
                        {course.category && ` · ${course.category}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                    <Calendar className="w-3 h-3" />
                    <span>Inscrito el {course.enrolledAt}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    {isProgressLoading ? (
                      <div className="h-1.5 bg-slate-100 rounded-full animate-pulse" />
                    ) : progress ? (
                      <>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">
                            {progress.completed_blocks} de {progress.total_blocks} lecciones
                          </span>
                          <span className={`font-semibold ${isComplete ? 'text-emerald-600' : 'text-purple-600'}`}>
                            {progress.percentage}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isComplete ? 'bg-emerald-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        {isComplete && (
                          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Curso completado
                          </p>
                        )}
                      </>
                    ) : null}
                  </div>

                  {/* Action button */}
                  <div>
                    {!progress || progress.percentage === 0 ? (
                      <Link href={`/course/${course.id}/learn`}>
                        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                          Empezar curso
                        </button>
                      </Link>
                    ) : isComplete ? (
                      <Link href={`/course/${course.id}/learn`}>
                        <button className="w-full border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:border-purple-400 hover:text-purple-600 transition-all duration-200">
                          Repasar curso
                        </button>
                      </Link>
                    ) : (
                      <Link href={`/course/${course.id}/learn${
                        progress.last_block_id
                          ? `?block=${progress.last_block_id}`
                          : ''
                      }`}>
                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm">
                          <Play className="w-3.5 h-3.5" />
                          Continuar
                        </button>
                      </Link>
                    )}
                  </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
