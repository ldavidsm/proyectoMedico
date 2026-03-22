import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  Settings
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  // For UI compatibility with existing cards if needed, but we'll focus on what backend provides
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
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError('No se pudieron cargar los cursos');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) return;
    try {
      const res = await fetch(`${API_URL}/courses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al eliminar');
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cursos</h1>
          <p className="text-gray-600">Gestiona y crea cursos profesionales de salud</p>
        </div>
        <Button
          onClick={() => router.push('/create')}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear nuevo curso
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Total cursos</span>
          </div>
          <p className="text-3xl font-bold">{courses.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {publishedCourses.length} publicados, {draftCourses.length} borradores
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Estudiantes</span>
          </div>
          <p className="text-3xl font-bold">{totalStudents.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12% este mes</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Ingresos totales</span>
          </div>
          <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+15% este mes</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Valoración promedio</span>
          </div>
          <p className="text-3xl font-bold">{avgRating.toFixed(1)}</p>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${star <= avgRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Filters and View Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-[180px]">
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

        <div className="flex items-center gap-2 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Courses Display */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Cargando tus cursos...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 border border-red-100 rounded-xl">
          <p className="text-red-600">{error}</p>
          <Button
            variant="outline"
            className="mt-4 border-red-200 text-red-600 hover:bg-red-100"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-white">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aún no tienes cursos
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Crea tu primer curso y empieza a compartir tu conocimiento con profesionales de la salud
          </p>
          <Button
            onClick={() => router.push('/create')}
            className="px-6 py-6 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 shadow-lg shadow-teal-100 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear mi primer curso
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCardGrid key={course.id} course={course} router={router} onDelete={handleDelete} onOpenCohorts={setCohortsCourse} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CourseCardList key={course.id} course={course} router={router} onDelete={handleDelete} onOpenCohorts={setCohortsCourse} />
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
      <ResourcesSection />
    </div>
  );
}

function CourseCardGrid({ course, router, onDelete, onOpenCohorts }: { course: Course; router: any; onDelete: (id: string) => void; onOpenCohorts: (c: Course) => void }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Course Image */}
      <div className="w-full h-40 relative overflow-hidden bg-teal-500">
        <ImageWithFallback
          src={course.banner_url || ''}
          alt={course.title}
          className="w-full h-full object-cover"
          fallbackType="course"
          courseTitle={course.title}
          defaultBannerUrl={getDefaultBanner(course.category, course.id)}
        />
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={cn(
              "border-none text-white",
              course.status === 'publicado' ? 'bg-green-600' :
                course.status === 'revision' ? 'bg-yellow-600' : 'bg-gray-500'
            )}
          >
            {course.status === 'publicado' ? 'Publicado' :
              course.status === 'revision' ? 'En revisión' : 'Borrador'}
          </Badge>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-3 line-clamp-2">{course.title}</h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{(course.rating_avg || 0).toFixed(1)}</span>
          </div>
          <span className="text-xs text-gray-500">({course.rating_count || 0} reseñas)</span>
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{(course.students || 0).toLocaleString()} estudiantes</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Eye className="w-4 h-4" />
              <span>{(course.views || 0).toLocaleString()} vistas</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Finalización</span>
              <span className="font-semibold">{course.completionRate || 0}%</span>
            </div>
            <Progress value={course.completionRate || 0} className="h-2" />
          </div>
        </div>

        {/* Revenue */}
        {course.status === 'publicado' ? (
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-bold text-green-600">{course.revenue || '€0.00'}</span>
            </div>
            <CourseActions course={course} router={router} onDelete={onDelete} onOpenCohorts={onOpenCohorts} />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Completa tu curso y publícalo para empezar a recibir estudiantes.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-teal-600 hover:bg-teal-700"
                onClick={() => router.push(`/create?id=${course.id}`)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <CourseActions course={course} router={router} onDelete={onDelete} onOpenCohorts={onOpenCohorts} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function CourseCardList({ course, router, onDelete, onOpenCohorts }: { course: Course; router: any; onDelete: (id: string) => void; onOpenCohorts: (c: Course) => void }) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-6">
        {/* Course Thumbnail */}
        <div className="w-48 h-28 rounded overflow-hidden flex-shrink-0">
          <ImageWithFallback
            src={course.banner_url || ''}
            alt={course.title}
            className="w-full h-full object-cover"
            fallbackType="course"
            courseTitle={course.title}
            defaultBannerUrl={getDefaultBanner(course.category, course.id)}
          />
        </div>

        {/* Course Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-xl mb-1">{course.title}</h3>
              <p className="text-sm text-gray-500">Actualizado {course.lastUpdated}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "border-none text-white",
                  course.status === 'publicado' ? 'bg-green-600' :
                    course.status === 'revision' ? 'bg-yellow-600' : 'bg-gray-500'
                )}
              >
                {course.status === 'publicado' ? 'Publicado' :
                  course.status === 'revision' ? 'En revisión' : 'Borrador'}
              </Badge>
              <CourseActions course={course} router={router} onDelete={onDelete} onOpenCohorts={onOpenCohorts} />
            </div>
          </div>

          {course.status === 'publicado' ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Estudiantes</p>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{(course.students || 0).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Valoración</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{(course.rating_avg || 0).toFixed(1)}</span>
                  <span className="text-xs text-gray-500">({course.rating_count || 0})</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Vistas</p>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{(course.views || 0).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Finalización</p>
                <span className="font-semibold">{course.completionRate || 0}%</span>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Ingresos</p>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">{course.revenue}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600">
                Curso en borrador - Completa y publica para empezar
              </p>
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => router.push(`/create?id=${course.id}`)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Continuar editando
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function CourseActions({ course, router, onDelete, onOpenCohorts }: { course: Course; router: any; onDelete: (id: string) => void; onOpenCohorts: (c: Course) => void }) {
  const hasConvocatoria = (course.offers || []).some(
    o => o.inscription_type === 'convocatoria'
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
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
        <DropdownMenuItem>
          <BarChart3 className="w-4 h-4 mr-2" />
          Ver estadísticas
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="w-4 h-4 mr-2" />
          Configuración
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(course.id)}>Eliminar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyState() {
  return (
    <Card className="p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No hay cursos para mostrar</h3>
        <p className="text-gray-600 mb-6">
          Comienza creando tu primer curso profesional de salud
        </p>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Crear mi primer curso
        </Button>
      </div>
    </Card>
  );
}

function ResourcesSection() {
  const resources = [
    {
      title: 'Crea un curso atractivo',
      description:
        'No importa si llevas años dando clase o es la primera vez que lo haces, todo el mundo es capaz de crear un curso atractivo. Hemos recopilado recursos y las mejores prácticas para ayudarte.',
      link: 'Comenzar ahora',
      icon: Edit,
      color: 'purple',
    },
    {
      title: 'Graba videos profesionales',
      description:
        'Unas clases en video de calidad pueden diferenciar tu curso del resto. Aprende los conceptos básicos de grabación y edición.',
      link: 'Ver guía',
      icon: Play,
      color: 'blue',
    },
    {
      title: 'Construye tu audiencia',
      description:
        'Prepara tu curso para el éxito construyendo tu público desde el principio. Aprende estrategias de marketing efectivas.',
      link: 'Descubre cómo',
      icon: Users,
      color: 'green',
    },
  ];

  return (
    <div className="mt-16">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Recursos para creadores</h2>
        <p className="text-gray-600">
          Herramientas y guías para ayudarte a crear cursos exitosos
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((resource, index) => {
          const Icon = resource.icon;
          const colorClasses = {
            purple: 'bg-purple-100 text-purple-600',
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
          };
          return (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[resource.color as keyof typeof colorClasses]
                  }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
              <a
                href="#"
                className="text-purple-600 hover:text-purple-700 text-sm font-semibold inline-flex items-center gap-1"
              >
                {resource.link}
                <span>→</span>
              </a>
            </Card>
          );
        })}
      </div>
    </div>
  );
}