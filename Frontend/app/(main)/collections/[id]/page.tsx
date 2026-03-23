'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, PlayCircle } from 'lucide-react';
import { CourseCard } from '@/components/hub/CourseCard';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CollectionCourse {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  level?: string;
  banner_url?: string;
  short_description?: string;
  rating_avg: number;
  rating_count: number;
}

interface CollectionDetail {
  id: string;
  nombre: string;
  descripcion: string | null;
  course_count: number;
  courses: CollectionCourse[];
}

export default function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/collections/${id}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error();
        setCollection(await res.json());

        if (isAuthenticated) {
          const [favRes, ordersRes] = await Promise.all([
            fetch(`${API_URL}/favorites/`, { credentials: 'include' }),
            fetch(`${API_URL}/orders/my-orders`, { credentials: 'include' }),
          ]);

          if (favRes.ok) {
            const favs = await favRes.json();
            setFavoritedIds(new Set(favs.map((c: any) => c.id)));
          }

          if (ordersRes.ok) {
            const orders = await ordersRes.json();
            const paid = orders.filter((o: any) => o.status === 'paid');
            setPurchasedCourseIds(new Set(paid.map((o: any) => o.course_id)));
          }
        }
      } catch {
        setCollection(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Colección no encontrada</h1>
          <button
            onClick={() => router.back()}
            className="bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 px-6 rounded-xl hover:border-purple-400 hover:text-purple-600 transition-all duration-200"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const purchasedInCollection = collection.courses.filter(c => purchasedCourseIds.has(c.id));
  const firstPurchasedCourse = purchasedInCollection[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Header de la colección */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          {/* Decoración */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-purple-200 text-sm font-medium">Colección</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{collection.nombre}</h1>
            {collection.descripcion && (
              <p className="text-purple-200 max-w-xl">{collection.descripcion}</p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                {collection.course_count} cursos
              </span>
              {isAuthenticated && purchasedInCollection.length > 0 && (
                <span className="text-purple-200 text-sm font-medium">
                  {purchasedInCollection.length}/{collection.course_count} adquiridos
                </span>
              )}
            </div>

            {isAuthenticated && firstPurchasedCourse && (
              <button
                onClick={() => router.push(`/course/${firstPurchasedCourse.id}/learn`)}
                className="mt-6 inline-flex items-center gap-2 bg-white text-purple-700 font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 hover:bg-purple-50 shadow-sm text-sm"
              >
                <PlayCircle className="w-4 h-4" />
                Continuar aprendiendo
              </button>
            )}
          </div>
        </div>

        {collection.courses.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>Esta colección aún no tiene cursos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {collection.courses.map(course => {
              const isPurchased = purchasedCourseIds.has(course.id);

              return (
                <div key={course.id} className="relative">
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.short_description || ''}
                    instructor={{
                      name: 'Instructor',
                      title: 'Experto en Salud',
                      avatar: '/avatars/default.png',
                    }}
                    image={course.banner_url || ''}
                    level={course.level || 'Básico'}
                    modality="Online"
                    enrolled={0}
                    category={course.category || 'General'}
                    ratingAvg={course.rating_avg}
                    ratingCount={course.rating_count}
                    initialFavorited={favoritedIds.has(course.id)}
                  />

                  {isPurchased && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white/95 to-transparent rounded-b-2xl">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/course/${course.id}/learn`);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Continuar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
