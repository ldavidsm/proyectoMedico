import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus,
  MoreVertical,
  Users,
  Star,
  DollarSign,
  Eye,
  BarChart3,
  Grid3x3,
  List,
  TrendingUp,
  Edit,
  Play,
  BookOpen,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { getDefaultBanner } from '@/lib/course-banners';
import { CohortsPanel } from './CohortsPanel';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CourseOffer {
  id: string;
  name_public: string;
  inscription_type: string;
}

interface Course {
  id: string;
  title: string;
  status: 'borrador' | 'revision' | 'publicado';
  visibility: 'publico' | 'privado';
  banner_url?: string;
  short_description?: string;
  category?: string;
  level?: string;
  rating_avg?: number;
  rating_count?: number;
  offers?: CourseOffer[];
  students?: number;
  revenue?: string;
  views?: number;
  completionRate?: number;
  lastUpdated?: string;
}


export function CoursesSection() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'publicado' | 'borrador' | 'revision'>('all');
  const [cohortsCourse, setCohortsCourse] = useState<Course | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_URL}/courses/?seller_id=${user.id}`,
          { credentials: 'include' }
        );
        if (!response.ok) throw new Error('Error al cargar cursos');
        const json = await response.json();
        setCourses(Array.isArray(json) ? json : (json.data || []));
      } catch (err) {
        setError('No se pudieron cargar los cursos');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id]);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleDelete = async (id: string) => {
    try {
      // Use Next.js API route as proxy to avoid cross-origin issues with DELETE
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok && res.status !== 204) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || `Error ${res.status}`);
      }

      setCourses(prev =>
        Array.isArray(prev)
          ? prev.filter(c => c.id !== id)
          : prev
      );
      toast.success('Curso eliminado correctamente');
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        toast.error('No se pudo conectar con el servidor');
      } else {
        const message = err instanceof Error
          ? err.message
          : 'Error al eliminar el curso';
        toast.error(message);
      }
      console.error('Delete error:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    await handleDelete(deleteConfirm);
    setDeleteConfirm(null);
  };

  const filteredCourses = courses.filter((course) => {
    if (filterStatus === 'all') return true;
    return course.status === filterStatus;
  });

  const publishedCourses = courses.filter((c) => c.status === 'publicado');
  const draftCourses = courses.filter((c) => c.status === 'borrador');

  const totalStudents = publishedCourses.reduce((sum, c) => sum + (c.students || 0), 0);
  const totalRevenue = publishedCourses.reduce((sum, c) => {
    const revenueVal = typeof c.revenue === 'string'
      ? parseFloat(c.revenue.replace(/[€$,]/g, ''))
      : (c.revenue || 0);
    return sum + (typeof revenueVal === 'number' ? revenueVal : 0);
  }, 0);
  const avgRating = publishedCourses.length > 0
    ? publishedCourses.reduce((sum, c) => sum + (c.rating_avg || 0), 0) / publishedCourses.length
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Cursos</h1>
          <p className="text-sm text-slate-400">Gestiona y crea cursos profesionales de salud</p>
        </div>
        <button
          onClick={() => router.push('/create')}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Crear nuevo curso
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3 mb-0.5">{courses.length}</p>
          <p className="text-xs text-slate-400 font-medium">Total cursos</p>
          <p className="text-xs text-slate-400 mt-1">
            {publishedCourses.length} publicados, {draftCourses.length} borradores
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3 mb-0.5">{totalStudents.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-medium">Estudiantes</p>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12% este mes</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3 mb-0.5">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-medium">Ingresos totales</p>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+15% este mes</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3 mb-0.5">{avgRating.toFixed(1)}</p>
          <p className="text-xs text-slate-400 font-medium">Valoración promedio</p>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${star <= avgRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-[180px] bg-white border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los cursos</SelectItem>
              <SelectItem value="publicado">Publicados</SelectItem>
              <SelectItem value="borrador">Borradores</SelectItem>
              <SelectItem value="revision">En revisión</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid'
              ? "p-2 rounded-lg bg-white shadow-sm text-slate-700"
              : "p-2 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            }
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={viewMode === 'list'
              ? "p-2 rounded-lg bg-white shadow-sm text-slate-700"
              : "p-2 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            }
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Courses Display */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Cargando tus cursos...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            className="mt-4 px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Crea tu primer curso
          </h3>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
            Comparte tu conocimiento con profesionales de la salud de todo el mundo.
          </p>
          <button
            onClick={() => router.push('/create')}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            Crear primer curso
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCardGrid key={course.id} course={course} router={router} onDelete={handleDeleteClick} onOpenCohorts={setCohortsCourse} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CourseCardList key={course.id} course={course} router={router} onDelete={handleDeleteClick} onOpenCohorts={setCohortsCourse} />
          ))}
        </div>
      )}

      {cohortsCourse && (
        <CohortsPanel
          courseId={cohortsCourse.id}
          courseTitle={cohortsCourse.title}
          offers={(cohortsCourse.offers || []).map(o => ({
            id: o.id,
            name_public: o.name_public,
            inscription_type: o.inscription_type,
          }))}
          onClose={() => setCohortsCourse(null)}
        />
      )}

      {/* Resources Section */}
      <InlineResourcesSection />

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
              ¿Eliminar curso?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Esta acción no se puede deshacer. El curso y todo su contenido serán eliminados.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CourseCardGrid({ course, router, onDelete, onOpenCohorts }: { course: Course; router: any; onDelete: (id: string) => void; onOpenCohorts: (c: Course) => void }) {
  const statusBadge = {
    borrador: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500",
    revision: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600",
    publicado: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600",
  };

  const statusLabel = {
    borrador: 'Borrador',
    revision: 'En revisión',
    publicado: 'Publicado',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
      {/* Course Image */}
      <div className="w-full aspect-video relative overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={course.banner_url || ''}
          alt={course.title}
          className="w-full aspect-video object-cover"
          fallbackType="course"
          courseTitle={course.title}
          defaultBannerUrl={getDefaultBanner(course.category, course.id)}
        />
        <div className="absolute top-3 right-3">
          <span className={statusBadge[course.status]}>
            {statusLabel[course.status]}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1 leading-snug">{course.title}</h3>
        {course.short_description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">{course.short_description}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-xs text-slate-700">{(course.rating_avg || 0).toFixed(1)}</span>
          </div>
          <span className="text-xs text-slate-400">({course.rating_count || 0})</span>
        </div>

        {/* Footer with stats */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 pt-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {(course.students || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {(course.views || 0).toLocaleString()}
            </span>
          </div>

          <CourseActions course={course} router={router} onDelete={onDelete} onOpenCohorts={onOpenCohorts} />
        </div>

        {course.status !== 'publicado' && (
          <button
            onClick={() => router.push(`/create?id=${course.id}`)}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            Editar
          </button>
        )}
      </div>
    </div>
  );
}

function CourseCardList({ course, router, onDelete, onOpenCohorts }: { course: Course; router: any; onDelete: (id: string) => void; onOpenCohorts: (c: Course) => void }) {
  const statusBadge = {
    borrador: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500",
    revision: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600",
    publicado: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600",
  };

  const statusLabel = {
    borrador: 'Borrador',
    revision: 'En revisión',
    publicado: 'Publicado',
  };

  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      {/* Course Thumbnail */}
      <div className="w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
        <ImageWithFallback
          src={course.banner_url || ''}
          alt={course.title}
          className="w-20 h-14 rounded-xl object-cover"
          fallbackType="course"
          courseTitle={course.title}
          defaultBannerUrl={getDefaultBanner(course.category, course.id)}
        />
      </div>

      {/* Course Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{course.title}</h3>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className={statusBadge[course.status]}>
              {statusLabel[course.status]}
            </span>
            <CourseActions course={course} router={router} onDelete={onDelete} onOpenCohorts={onOpenCohorts} />
          </div>
        </div>

        {course.status === 'publicado' ? (
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {(course.students || 0).toLocaleString()} estudiantes
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {(course.rating_avg || 0).toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {(course.views || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 font-medium">{course.revenue || '€0'}</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-slate-400">
              Curso en borrador
            </p>
            <button
              onClick={() => router.push(`/create?id=${course.id}`)}
              className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all"
            >
              <Edit className="w-3 h-3" />
              Continuar editando
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseActions({ course, router, onDelete, onOpenCohorts }: { course: Course; router: any; onDelete: (id: string) => void; onOpenCohorts: (c: Course) => void }) {
  const hasConvocatoria = (course.offers || []).some(
    o => o.inscription_type === 'convocatoria'
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/create?id=${course.id}`)}>
          <Edit className="w-4 h-4 mr-2" />
          Editar curso
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/course/${course.id}`)}>
          <Play className="w-4 h-4 mr-2" />
          Ver en vivo
        </DropdownMenuItem>
        {hasConvocatoria && (
          <DropdownMenuItem onClick={() => onOpenCohorts(course)}>
            <Users className="w-4 h-4 mr-2" />
            Gestionar cohorts
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push(`/?section=creator-analytics&course_id=${course.id}`)}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Ver estadísticas
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-500" onClick={() => onDelete(course.id)}>
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InlineResourcesSection() {
  const resources = [
    {
      title: 'Crea un curso atractivo',
      description:
        'No importa si llevas años dando clase o es la primera vez que lo haces, todo el mundo es capaz de crear un curso atractivo.',
      link: 'Comenzar ahora',
      icon: Edit,
      color: 'purple',
    },
    {
      title: 'Graba videos profesionales',
      description:
        'Unas clases en video de calidad pueden diferenciar tu curso del resto. Aprende los conceptos básicos.',
      link: 'Ver guía',
      icon: Play,
      color: 'sky',
    },
    {
      title: 'Construye tu audiencia',
      description:
        'Prepara tu curso para el éxito construyendo tu público desde el principio.',
      link: 'Descubre cómo',
      icon: Users,
      color: 'emerald',
    },
  ];

  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    sky: 'bg-sky-100 text-sky-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className="mt-16">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Recursos para creadores</h2>
        <p className="text-sm text-slate-400">
          Herramientas y guías para ayudarte a crear cursos exitosos
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colorClasses[resource.color as keyof typeof colorClasses]}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{resource.title}</h3>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2">{resource.description}</p>
              <span
                className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all w-fit cursor-default"
              >
                {resource.link}
                <span>→</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
