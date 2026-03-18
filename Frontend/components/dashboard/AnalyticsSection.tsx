import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Star,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  Info,
  ExternalLink,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AnalyticsSummary {
  total_courses: number;
  total_students: number;
  total_revenue: number;
  avg_rating: number;
}

interface CourseStat {
  id: string;
  title: string;
  status: string;
  student_count: number;
  revenue: number;
  rating_avg: number;
  rating_count: number;
  completion_rate: number;
}

interface RevenuePoint {
  label: string;
  revenue: number;
  purchases: number;
}

interface StudentsPoint {
  label: string;
  students: number;
}

const periodOptions = [
  { id: '7', name: 'Últimos 7 días' },
  { id: '30', name: 'Últimos 30 días' },
  { id: '90', name: 'Últimos 90 días' },
];

export function AnalyticsSection() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStat[]>([]);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [studentsData, setStudentsData] = useState<StudentsPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [chartMode, setChartMode] = useState<'revenue' | 'students'>('revenue');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseStat | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [summaryRes, coursesRes, revenueRes, studentsRes] = await Promise.all([
          fetch(`${API_URL}/analytics/overview`, { credentials: 'include' }),
          fetch(`${API_URL}/analytics/courses`, { credentials: 'include' }),
          fetch(`${API_URL}/analytics/revenue-over-time?period=${selectedPeriod}`, { credentials: 'include' }),
          fetch(`${API_URL}/analytics/students-over-time?period=${selectedPeriod}`, { credentials: 'include' }),
        ]);
        if (summaryRes.ok) setSummary(await summaryRes.json());
        if (coursesRes.ok) setCourseStats(await coursesRes.json());
        if (revenueRes.ok) setRevenueData(await revenueRes.json());
        if (studentsRes.ok) setStudentsData(await studentsRes.json());
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [user?.id, selectedPeriod]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

  // Filtered course stats
  const displayedCourseStats = selectedCourseId === 'all'
    ? courseStats
    : courseStats.filter(c => c.id === selectedCourseId);

  // Summary values — if a specific course is selected, use its stats
  const displaySummary = selectedCourseId !== 'all'
    ? (() => {
        const c = courseStats.find(cs => cs.id === selectedCourseId);
        return c ? {
          total_courses: 1,
          total_students: c.student_count,
          total_revenue: c.revenue,
          avg_rating: c.rating_avg,
        } : summary;
      })()
    : summary;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Cargando analíticas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with filters */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Rendimiento</h1>
            <p className="text-gray-600">
              Resumen de tu actividad y resultados
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar periodo" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cursos</SelectItem>
                {courseStats.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* NIVEL 1 - RESUMEN RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <KeyMetricCard
          title="Ingresos totales"
          value={formatCurrency(displaySummary?.total_revenue || 0)}
          tooltip="Ingresos totales generados por ventas de cursos"
          icon={DollarSign}
          iconColor="green"
        />
        <KeyMetricCard
          title="Estudiantes totales"
          value={(displaySummary?.total_students || 0).toLocaleString()}
          denominator="de todos tus cursos"
          tooltip="Alumnos totales registrados en tus cursos"
          icon={Users}
          iconColor="blue"
        />
        <KeyMetricCard
          title="Total cursos"
          value={(displaySummary?.total_courses || 0).toString()}
          denominator="creados"
          tooltip="Número total de cursos creados en la plataforma"
          icon={TrendingUp}
          iconColor="purple"
        />
        <KeyMetricCard
          title="Valoración media"
          value={(displaySummary?.avg_rating || 0).toFixed(1)}
          denominator="promedio global"
          helpText={
            (displaySummary?.avg_rating || 0) >= 4.5
              ? 'Muy valorado por tus alumnos'
              : 'Considera mejorar según feedback'
          }
          tooltip="Promedio de todas las valoraciones recibidas"
          icon={Star}
          iconColor="yellow"
        />
      </div>

      {/* NIVEL 2 - DIAGNÓSTICO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Funnel placeholder */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Análisis de embudo</h3>
            <p className="text-sm text-gray-600">
              Analiza el recorrido de compra y aprendizaje
            </p>
          </div>
          <Tabs defaultValue="purchase">
            <TabsList className="mb-4">
              <TabsTrigger value="purchase">Embudo de compra</TabsTrigger>
              <TabsTrigger value="learning">Embudo de aprendizaje</TabsTrigger>
            </TabsList>
            <TabsContent value="purchase">
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">Análisis de embudo de compra</p>
                <p className="text-sm text-gray-500">Disponible próximamente. Requiere integración con sistema de pagos (Stripe).</p>
              </div>
            </TabsContent>
            <TabsContent value="learning">
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">Análisis de embudo de aprendizaje</p>
                <p className="text-sm text-gray-500">Disponible próximamente. Requiere integración con sistema de pagos (Stripe).</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Revenue/Students over time chart */}
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {chartMode === 'revenue' ? 'Ingresos' : 'Estudiantes'} en el tiempo
                </h3>
                <p className="text-sm text-gray-600">
                  {chartMode === 'revenue'
                    ? 'Evolución de tus ingresos'
                    : 'Nuevos estudiantes por periodo'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={chartMode === 'revenue' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartMode('revenue')}
                  className={chartMode === 'revenue' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  Ingresos
                </Button>
                <Button
                  variant={chartMode === 'students' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartMode('students')}
                  className={chartMode === 'students' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  Estudiantes
                </Button>
              </div>
            </div>
          </div>
          {chartMode === 'revenue' ? (
            revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-semibold">{formatCurrency(data.revenue)}</p>
                            <p className="text-xs text-gray-600">{data.purchases} compras</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#9333ea"
                    strokeWidth={3}
                    dot={{ fill: '#9333ea', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">Sin datos de ingresos para este período</p>
              </div>
            )
          ) : (
            studentsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={studentsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#9333ea" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">Sin datos de estudiantes para este período</p>
              </div>
            )
          )}
        </Card>
      </div>

      {/* Rendimiento por curso - Solo mostrar si "all" está seleccionado */}
      {selectedCourseId === 'all' && (
        <Card className="p-6 mb-12">
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Rendimiento de tus cursos</h3>
            <p className="text-sm text-gray-600">
              Tus cursos ordenados por ingresos generados
            </p>
          </div>
          <CoursePerformanceTable
            courses={courseStats}
            onViewDetail={setSelectedCourseDetail}
          />
        </Card>
      )}

      {/* Course Detail Panel */}
      <CourseDetailPanel
        course={selectedCourseDetail}
        isOpen={selectedCourseDetail !== null}
        onClose={() => setSelectedCourseDetail(null)}
      />

      {/* Traffic Sources */}
      <Card className="p-6 mb-12">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">Fuentes de tráfico</h3>
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
              Datos estimados
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Pendiente integración con analytics externo
          </p>
        </div>
        <TrafficSourcesSimplified />
      </Card>

      {/* Retention (advanced accordion) */}
      <Card className="p-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg mb-1">Análisis de retención (avanzado)</h3>
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                Datos estimados
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Muestra cuántos alumnos siguen activos con el paso de las semanas
            </p>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {showAdvanced && <CohortRetentionSimplified />}
      </Card>
    </div>
  );
}

// Key Metric Card Component
function KeyMetricCard({
  title,
  value,
  denominator,
  helpText,
  tooltip,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | React.ReactNode;
  denominator?: string;
  helpText?: string;
  tooltip: string;
  icon: any;
  iconColor: 'green' | 'blue' | 'purple' | 'yellow';
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[iconColor]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm text-gray-600">{title}</p>
        <TooltipProvider>
          <TooltipUI>
            <TooltipTrigger>
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </TooltipUI>
        </TooltipProvider>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {denominator && (
        <p className="text-xs text-gray-500 mb-2">{denominator}</p>
      )}
      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </Card>
  );
}

// Course Performance Table
function CoursePerformanceTable({
  courses,
  onViewDetail,
}: {
  courses: CourseStat[];
  onViewDetail: (course: CourseStat) => void;
}) {
  if (courses.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay cursos con datos de rendimiento aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => {
        const status: 'high' | 'medium' | 'low' =
          course.completion_rate >= 70 ? 'high' :
          course.completion_rate >= 50 ? 'medium' : 'low';

        const statusConfig = {
          high: {
            badge: 'Alto rendimiento',
            color: 'bg-green-100 text-green-700 border-green-200',
            icon: CheckCircle,
          },
          medium: {
            badge: 'Rendimiento medio',
            color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            icon: AlertCircle,
          },
          low: {
            badge: 'Necesita revisión',
            color: 'bg-red-100 text-red-700 border-red-200',
            icon: AlertCircle,
          },
        };

        const config = statusConfig[status];
        const StatusIcon = config.icon;

        return (
          <div
            key={course.id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">{course.title}</h4>
                <Badge className={`${config.color} border`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.badge}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetail(course)}
              >
                Ver detalle
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Estudiantes</p>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-bold text-lg">{course.student_count.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Ingresos</p>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-lg text-green-600">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(course.revenue)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Valoración</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg">{course.rating_avg.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">({course.rating_count})</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Finalización</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-lg">{course.completion_rate}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Course Detail Panel Component
function CourseDetailPanel({
  course,
  isOpen,
  onClose,
}: {
  course: CourseStat | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!course) return null;

  const status: 'high' | 'medium' | 'low' =
    course.completion_rate >= 70 ? 'high' :
    course.completion_rate >= 50 ? 'medium' : 'low';

  const statusConfig = {
    high: { badge: 'Alto rendimiento', color: 'bg-green-100 text-green-700 border-green-200' },
    medium: { badge: 'Rendimiento medio', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    low: { badge: 'Necesita revisión', color: 'bg-red-100 text-red-700 border-red-200' },
  };

  const config = statusConfig[status];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6 pb-20">
          <SheetHeader className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-2xl mb-3">{course.title}</SheetTitle>
                <Badge className={`${config.color} border`}>
                  {config.badge}
                </Badge>
              </div>
            </div>
          </SheetHeader>

          {/* Mini-KPIs */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Ingresos del curso</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(course.revenue)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Estudiantes</p>
              <p className="text-2xl font-bold text-blue-600">{course.student_count.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">Finalización</p>
              <p className="text-2xl font-bold text-purple-600">{course.completion_rate}%</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-gray-600 mb-1">Valoración</p>
              <p className="text-2xl font-bold text-yellow-600">{course.rating_avg.toFixed(1)}</p>
              <p className="text-xs text-gray-500">{course.rating_count} reseñas</p>
            </div>
          </div>

          {/* Module-level analysis placeholder */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4">Progreso por módulo</h3>
            <Card className="p-8 text-center bg-gray-50 border border-gray-200">
              <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">Análisis detallado por módulo</p>
              <p className="text-sm text-gray-500">Disponible próximamente</p>
            </Card>
          </div>

          {/* Retention placeholder */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4">Retención de alumnos</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 border rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Estudiantes activos</p>
                <p className="text-2xl font-bold">{course.student_count}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Tasa de finalización</p>
                <p className="text-2xl font-bold">{course.completion_rate}%</p>
              </div>
            </div>
          </div>

          {/* Feedback placeholder */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Feedback de alumnos</h3>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{course.rating_avg.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({course.rating_count} reseñas)</span>
              </div>
            </div>
            <Card className="p-6 text-center bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-500">Las reseñas detalladas estarán disponibles próximamente</p>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Cohort Retention Simplified (estimated data placeholder)
function CohortRetentionSimplified() {
  const cohortData = [
    { month: 'Enero', initialActive: 45, week4Active: 31, week4Percent: 69 },
    { month: 'Febrero', initialActive: 62, week4Active: 45, week4Percent: 73 },
    { month: 'Marzo', initialActive: 78, week4Active: 59, week4Percent: 76 },
    { month: 'Abril', initialActive: 54, week4Active: 38, week4Percent: 70 },
    { month: 'Mayo', initialActive: 89, week4Active: 68, week4Percent: 76 },
    { month: 'Junio', initialActive: 112, week4Active: null, week4Percent: null },
  ];

  return (
    <div className="pt-4">
      <div className="p-4 bg-yellow-50 rounded-lg mb-4 border border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Datos estimados</strong> — Pendiente integración con analytics para datos reales de retención.
        </p>
      </div>
      <div className="p-4 bg-blue-50 rounded-lg mb-4 border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>¿Qué significa esto?</strong> Muestra qué porcentaje de alumnos que empezaron el curso sigue activo después de 4 semanas.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">Mes de inscripción</th>
              <th className="text-center py-3 px-4 font-medium">Alumnos activos inicial</th>
              <th className="text-center py-3 px-4 font-medium">Activos semana 4</th>
              <th className="text-center py-3 px-4 font-medium">% Retención</th>
              <th className="text-left py-3 px-4 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cohortData.map((cohort, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{cohort.month}</td>
                <td className="text-center py-3 px-4">
                  <span className="text-gray-700 font-semibold">{cohort.initialActive}</span>
                </td>
                <td className="text-center py-3 px-4">
                  {cohort.week4Active !== null ? (
                    <span className="text-gray-700 font-semibold">{cohort.week4Active}</span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="text-center py-3 px-4">
                  {cohort.week4Percent !== null ? (
                    <span className={`inline-block px-3 py-1 rounded font-semibold ${
                      cohort.week4Percent >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {cohort.week4Percent}%
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Muy reciente</span>
                  )}
                </td>
                <td className="py-3 px-4 text-xs text-gray-600">
                  {cohort.week4Percent !== null
                    ? cohort.week4Percent >= 70 ? 'Buena retención' : 'Mejorable'
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Traffic Sources Simplified (estimated data placeholder)
function TrafficSourcesSimplified() {
  const sources = [
    { name: 'Búsqueda orgánica', percent: 45, description: 'Google, Bing y otros buscadores' },
    { name: 'Recomendaciones', percent: 30, description: 'Enlaces de otros sitios web' },
    { name: 'Redes sociales', percent: 15, description: 'Facebook, Instagram, LinkedIn' },
    { name: 'Tráfico directo', percent: 10, description: 'URL directa o favoritos' },
  ];

  return (
    <div>
      <div className="p-3 bg-yellow-50 rounded-lg mb-4 border border-yellow-200">
        <p className="text-xs text-yellow-800">
          <strong>Datos estimados</strong> — Pendiente integración con analytics externo. Si usas parámetros UTM en tus enlaces, podrás ver fuentes más específicas.
        </p>
      </div>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-sm">{source.name}</span>
                  <p className="text-xs text-gray-500">{source.description}</p>
                </div>
                <span className="font-bold text-lg">{source.percent}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${source.percent}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
