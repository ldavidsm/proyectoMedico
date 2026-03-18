'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, PlayCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Colección no encontrada</h1>
          <Button variant="outline" onClick={() => router.back()}>Volver</Button>
        </div>
      </div>
    );
  }

  const purchasedInCollection = collection.courses.filter(c => purchasedCourseIds.has(c.id));
  const firstPurchasedCourse = purchasedInCollection[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-teal-500" />
            <h1 className="text-2xl font-bold text-gray-900">{collection.nombre}</h1>
          </div>
          {collection.descripcion && (
            <p className="text-gray-600 max-w-2xl">{collection.descripcion}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <p className="text-sm text-gray-500">
              {collection.course_count} cursos en esta colección
            </p>
            {isAuthenticated && purchasedInCollection.length > 0 && (
              <span className="text-sm text-teal-600 font-medium">
                {purchasedInCollection.length}/{collection.course_count} adquiridos
              </span>
            )}
          </div>

          {/* CTA button for collection */}
          {isAuthenticated && firstPurchasedCourse && (
            <Button
              className="mt-4 bg-green-600 hover:bg-green-700"
              onClick={() => router.push(`/course/${firstPurchasedCourse.id}/learn`)}
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Continuar aprendiendo
            </Button>
          )}
        </div>

        {collection.courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Esta colección aún no tiene cursos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                  {/* Purchased overlay CTA */}
                  {isPurchased && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white/95 to-transparent">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/course/${course.id}/learn`);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-green-600
                          hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
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
