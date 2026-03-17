'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Clock, BookOpen, Library, ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseCard } from './CourseCard';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const COURSES_PER_PAGE = 6;

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
  created_at?: string;
  seller?: {
    full_name: string;
  };
}

interface BackendCollection {
  id: string;
  nombre: string;
  descripcion?: string;
  course_count: number;
  courseIds: string[];
}

interface CourseSectionsProps {
  searchQuery?: string;
  selectedLevel?: string[];
  selectedModality?: string[];
}

// ── Reusable carousel ────────────────────────────────────────────────────────

function CourseCarousel({
  title,
  subtitle,
  icon: Icon,
  courses,
  favoritedIds,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  courses: BackendCourse[];
  favoritedIds: Set<string>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'right' ? 320 : -320,
        behavior: 'smooth',
      });
    }
  };

  if (courses.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-teal-500" />
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {courses.map(course => (
          <div
            key={course.id}
            className="flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[300px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <CourseCard
              id={course.id}
              title={course.title}
              description={course.short_description || ''}
              instructor={{
                name: course.seller?.full_name || 'Instructor',
                title: 'Experto en Salud',
                avatar: '/avatars/default.png',
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
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Collection carousel ──────────────────────────────────────────────────────

function CollectionCarousel({ collections }: { collections: BackendCollection[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'right' ? 320 : -320,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Library className="w-5 h-5 text-teal-500" />
          <h2 className="text-xl font-semibold text-gray-900">Colecciones</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {collections.map(col => (
          <Link
            key={col.id}
            href={`/collections/${col.id}`}
            className="flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[300px] block group"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow h-full p-5">
              <div className="flex items-center gap-2 mb-3">
                <Library className="w-5 h-5 text-teal-500" />
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {col.nombre}
                </h3>
              </div>
              {col.descripcion && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{col.descripcion}</p>
              )}
              <span className="text-xs text-gray-500">
                {col.course_count} cursos
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function CourseSections({
  searchQuery = '',
  selectedLevel = [],
  selectedModality = [],
}: CourseSectionsProps) {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [recommended, setRecommended] = useState<BackendCourse[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [publicCollections, setPublicCollections] = useState<BackendCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => setPage(1), [searchQuery, selectedLevel, selectedModality]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, collectionsRes] = await Promise.all([
          fetch(`${API_URL}/courses/?status=publicado`, { credentials: 'include' }),
          fetch(`${API_URL}/collections/?status=publicado`, { credentials: 'include' }),
        ]);

        if (!coursesRes.ok) throw new Error('Error al cargar cursos');
        const coursesData = await coursesRes.json();
        setCourses(coursesData);

        if (collectionsRes.ok) {
          const colData = await collectionsRes.json();
          if (Array.isArray(colData)) {
            setPublicCollections(colData.filter((c: any) => c.course_count > 0));
          }
        }

        if (isAuthenticated) {
          const [ordersResult, favoritesResult, recsResult] = await Promise.allSettled([
            fetch(`${API_URL}/orders/my-orders`, { credentials: 'include' }),
            fetch(`${API_URL}/favorites/`, { credentials: 'include' }),
            fetch(`${API_URL}/courses/recommendations`, { credentials: 'include' }),
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

          if (recsResult.status === 'fulfilled' && recsResult.value.ok) {
            const recsData = await recsResult.value.json();
            if (Array.isArray(recsData)) setRecommended(recsData);
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

  // Courses excluding purchased
  const availableCourses = useMemo(() => {
    if (purchasedIds.size === 0) return courses;
    return courses.filter(c => !purchasedIds.has(c.id));
  }, [courses, purchasedIds]);

  // Popular: sort by rating_count desc
  const popularCourses = useMemo(() => {
    return [...availableCourses]
      .sort((a, b) => (b.rating_count ?? 0) - (a.rating_count ?? 0))
      .filter(c => (c.rating_count ?? 0) > 0)
      .slice(0, 6);
  }, [availableCourses]);

  // New: last 60 days, sorted by created_at desc
  const newCourses = useMemo(() => {
    const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
    return [...availableCourses]
      .filter(c => c.created_at && new Date(c.created_at).getTime() > cutoff)
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
      .slice(0, 6);
  }, [availableCourses]);

  // Catalog: filtered + paginated, excluding recommended IDs
  const recommendedIds = useMemo(() => new Set(recommended.map(c => c.id)), [recommended]);

  const filteredCatalog = useMemo(() => {
    let result = availableCourses;
    const hasFilters = searchQuery.trim() || selectedLevel.length > 0;

    // Only exclude recommended from catalog when no filters active
    if (!hasFilters && recommendedIds.size > 0) {
      result = result.filter(c => !recommendedIds.has(c.id));
    }

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

    if (selectedLevel.length > 0) {
      result = result.filter(course =>
        course.level && selectedLevel.some(level =>
          course.level!.toLowerCase() === level.toLowerCase()
        )
      );
    }

    return result;
  }, [availableCourses, recommendedIds, searchQuery, selectedLevel, selectedModality]);

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / COURSES_PER_PAGE));
  const paginatedCourses = filteredCatalog.slice(
    (page - 1) * COURSES_PER_PAGE,
    page * COURSES_PER_PAGE
  );

  const hasActiveFilters = searchQuery.trim() !== '' || selectedLevel.length > 0;

  // ── Render ──

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
      {/* ── Carousel sections (hidden when search/filters active) ── */}
      {!hasActiveFilters && (
        <>
          {/* Recommendations (auth only) */}
          {isAuthenticated && (
            <CourseCarousel
              title="Recomendado para ti"
              subtitle="Basado en tus intereses"
              icon={Sparkles}
              courses={recommended}
              favoritedIds={favoritedIds}
            />
          )}

          {/* Popular */}
          <CourseCarousel
            title="Cursos más populares"
            icon={TrendingUp}
            courses={popularCourses}
            favoritedIds={favoritedIds}
          />

          {/* New */}
          <CourseCarousel
            title="Novedades"
            icon={Clock}
            courses={newCourses}
            favoritedIds={favoritedIds}
          />

          {/* Collections */}
          {publicCollections.length > 0 && (
            <CollectionCarousel collections={publicCollections} />
          )}
        </>
      )}

      {/* ── Paginated catalog ── */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-teal-500" />
          <h2 className="text-xl font-semibold text-gray-900">Catálogo de cursos</h2>
          <span className="text-sm text-gray-500">
            {filteredCatalog.length} cursos
          </span>
        </div>

        {paginatedCourses.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-lg font-medium">No se encontraron cursos</p>
            <p className="text-sm mt-2">Prueba con otros términos de búsqueda o filtros</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCourses.map(course => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.short_description || ''}
                  instructor={{
                    name: course.seller?.full_name || 'Instructor',
                    title: 'Experto en Salud',
                    avatar: '/avatars/default.png',
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  &larr; Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
