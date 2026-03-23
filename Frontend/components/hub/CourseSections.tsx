'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Clock, BookOpen, Library, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { CourseCard } from './CourseCard';
import { WebinarCard } from './WebinarCard';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { handleError } from '@/lib/handle-error';

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
  updated_at?: string;
  learning_goals?: string[];
  min_price?: number;
  total_blocks?: number;
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

interface UpcomingWebinar {
  id: string;
  title: string;
  seller_name?: string;
  scheduled_at: string;
  duration_minutes: number;
  meet_link?: string;
  recording_url?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  registration_count: number;
  is_registered: boolean;
  is_public: boolean;
}

interface AdvancedFiltersState {
  clinicalArea: string[];
  courseLevel: string[];
  modality: string[];
  format: string[];
  duration: [number, number];
  price: [number, number];
  certification: 'with' | 'without' | 'any';
  language: string[];
}

interface CourseSectionsProps {
  searchQuery?: string;
  selectedLevel?: string[];
  selectedModality?: string[];
  advancedFilters?: AdvancedFiltersState;
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
              image={course.banner_url || ''}
              level={course.level || 'Básico'}
              modality="Online"
              enrolled={0}
              category={course.category || 'General'}
              ratingAvg={course.rating_avg}
              ratingCount={course.rating_count}
              initialFavorited={favoritedIds.has(course.id)}
              learningGoals={course.learning_goals}
              badges={getCourseBadges(course, courses)}
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

// ── Webinar carousel ─────────────────────────────────────────────────────────

function WebinarCarousel({ webinars }: { webinars: UpcomingWebinar[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-teal-500" />
          <h2 className="text-xl font-semibold text-gray-900">Próximas sesiones en vivo</h2>
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
        {webinars.map(w => (
          <div
            key={w.id}
            className="flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[280px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <WebinarCard {...w} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Badge logic ─────────────────────────────────────────────────────────────

function getCourseBadges(
  course: BackendCourse,
  allCourses: BackendCourse[]
): ('nuevo' | 'popular' | 'actualizado')[] {
  const now = Date.now();

  // NUEVO: created in last 30 days
  const isNew = course.created_at
    && (now - new Date(course.created_at).getTime() < 30 * 24 * 60 * 60 * 1000);

  // POPULAR: top 20% by rating_count
  let isPopular = false;
  if (course.rating_count && course.rating_count > 0) {
    const sorted = [...allCourses]
      .filter(c => c.rating_count && c.rating_count > 0)
      .sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0));
    const top20 = Math.ceil(sorted.length * 0.2);
    const topIds = new Set(sorted.slice(0, top20).map(c => c.id));
    isPopular = topIds.has(course.id);
  }

  // ACTUALIZADO: updated in last 60 days and not new
  const isUpdated = !isNew
    && course.updated_at
    && (now - new Date(course.updated_at).getTime() < 60 * 24 * 60 * 60 * 1000);

  // Priority: popular > nuevo > actualizado (max 1 badge)
  if (isPopular) return ['popular'];
  if (isNew) return ['nuevo'];
  if (isUpdated) return ['actualizado'];
  return [];
}

// ── Main component ───────────────────────────────────────────────────────────

export function CourseSections({
  searchQuery = '',
  selectedLevel = [],
  selectedModality = [],
  advancedFilters,
}: CourseSectionsProps) {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [recommended, setRecommended] = useState<BackendCourse[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [publicCollections, setPublicCollections] = useState<BackendCollection[]>([]);
  const [upcomingWebinars, setUpcomingWebinars] = useState<UpcomingWebinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => setPage(1), [searchQuery, selectedLevel, selectedModality, advancedFilters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, collectionsRes, webinarsRes] = await Promise.all([
          fetch(`${API_URL}/courses/?status=publicado&limit=100`, { credentials: 'include' }),
          fetch(`${API_URL}/collections/?status=publicado`, { credentials: 'include' }),
          fetch(`${API_URL}/webinars/?status=scheduled`, { credentials: 'include' }),
        ]);

        if (!coursesRes.ok) throw new Error('Error al cargar cursos');
        const coursesJson = await coursesRes.json();
        // Support both paginated {data, pagination} and plain array responses
        const coursesData = Array.isArray(coursesJson) ? coursesJson : coursesJson.data ?? [];
        setCourses(coursesData);
        if (coursesJson.pagination) setTotalCourses(coursesJson.pagination.total);

        if (collectionsRes.ok) {
          const colData = await collectionsRes.json();
          if (Array.isArray(colData)) {
            setPublicCollections(colData.filter((c: any) => c.course_count > 0));
          }
        }

        if (webinarsRes.ok) {
          const webinarData = await webinarsRes.json();
          if (Array.isArray(webinarData)) setUpcomingWebinars(webinarData);
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

    // Advanced filter: price
    if (advancedFilters && (advancedFilters.price[0] > 0 || advancedFilters.price[1] < 500)) {
      result = result.filter(course => {
        const price = course.min_price ?? 0;
        return price >= advancedFilters.price[0] && price <= advancedFilters.price[1];
      });
    }

    // Advanced filter: duration (estimated from total_blocks, ~15min each)
    if (advancedFilters && (advancedFilters.duration[0] > 0 || advancedFilters.duration[1] < 100)) {
      result = result.filter(course => {
        const blocks = course.total_blocks ?? 0;
        const estimatedHours = (blocks * 15) / 60;
        return estimatedHours >= advancedFilters.duration[0]
          && estimatedHours <= advancedFilters.duration[1];
      });
    }

    return result;
  }, [availableCourses, recommendedIds, searchQuery, selectedLevel, selectedModality, advancedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / COURSES_PER_PAGE));
  const paginatedCourses = filteredCatalog.slice(
    (page - 1) * COURSES_PER_PAGE,
    page * COURSES_PER_PAGE
  );

  const hasAdvancedFilters = advancedFilters && (
    advancedFilters.price[0] > 0 || advancedFilters.price[1] < 500 ||
    advancedFilters.duration[0] > 0 || advancedFilters.duration[1] < 100
  );
  const hasActiveFilters = searchQuery.trim() !== '' || selectedLevel.length > 0 || hasAdvancedFilters;

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

          {/* Upcoming Webinars */}
          {upcomingWebinars.length > 0 && (
            <WebinarCarousel webinars={upcomingWebinars} />
          )}
        </>
      )}

      {/* ── Paginated catalog ── */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-teal-500" />
          <h2 className="text-xl font-semibold text-gray-900">Catálogo de cursos</h2>
          <span className="text-sm text-gray-500">
            Mostrando {Math.min(page * COURSES_PER_PAGE, filteredCatalog.length)} de {filteredCatalog.length} cursos
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
                  image={course.banner_url || ''}
                  level={course.level || 'Básico'}
                  modality="Online"
                  enrolled={0}
                  category={course.category || 'General'}
                  ratingAvg={course.rating_avg}
                  ratingCount={course.rating_count}
                  initialFavorited={favoritedIds.has(course.id)}
                  learningGoals={course.learning_goals}
                  badges={getCourseBadges(course, courses)}
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
