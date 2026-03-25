import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Loader2,
  BarChart3,
  BookOpen
} from 'lucide-react';
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
  Cell,
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
  const searchParams = useSearchParams();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [chartMode, setChartMode] = useState<'revenue' | 'students'>('revenue');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseStat | null>(null);
  const [retentionData, setRetentionData] = useState<{
    month: string;
    month_key: string;
    initial_active: number;
    week4_active: number | null;
    retention_percent: number | null;
    status: string;
  }[]>([]);
  const [retentionLoading, setRetentionLoading] = useState(false);
  const [dropoffData, setDropoffData] = useState<{
    course_title: string;
    total_enrolled: number;
    avg_completion: number;
    blocks: {
      block_id: string;
      block_title: string;
      block_type: string;
      module_title: string;
      order: number;
      completed: number;
      completion_rate: number;
      drop_from_prev: number;
      is_dropoff: boolean;
    }[];
  } | null>(null);
  const [studentsRanking, setStudentsRanking] = useState<{
    user_id: string;
    name: string;
    email: string;
    completed_blocks: number;
    total_blocks: number;
    progress_pct: number;
    last_activity: string | null;
    status: string;
  }[]>([]);
  const [dropoffLoading, setDropoffLoading] = useState(false);

  // Pre-select course from URL params (?course_id=...)
  useEffect(() => {
    const courseIdFromUrl = searchParams.get('course_id');
    if (courseIdFromUrl) {
      setSelectedCourseId(courseIdFromUrl);
    }
  }, [searchParams]);

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

  // Fetch retention data
  useEffect(() => {
    const fetchRetention = async () => {
      setRetentionLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCourseId && selectedCourseId !== 'all') {
          params.append('course_id', selectedCourseId);
        }
        const res = await fetch(
          `${API_URL}/analytics/retention?${params}`,
          { credentials: 'include' }
        );
        if (res.ok) {
          setRetentionData(await res.json());
        }
      } catch (err) {
        console.error('Error fetching retention:', err);
      } finally {
        setRetentionLoading(false);
      }
    };
    fetchRetention();
  }, [selectedCourseId]);

  // Fetch drop-off & students ranking when a specific course is selected
  useEffect(() => {
    if (!selectedCourseId || selectedCourseId === 'all') {
      setDropoffData(null);
      setStudentsRanking([]);
      return;
    }

    const fetchCourseAnalytics = async () => {
      setDropoffLoading(true);
      try {
        const [dropoffRes, rankingRes] = await Promise.all([
          fetch(
            `${API_URL}/analytics/dropoff?course_id=${selectedCourseId}`,
            { credentials: 'include' }
          ),
          fetch(
            `${API_URL}/analytics/students-ranking?course_id=${selectedCourseId}`,
            { credentials: 'include' }
          ),
        ]);

        if (dropoffRes.ok) {
          setDropoffData(await dropoffRes.json());
        }
        if (rankingRes.ok) {
          setStudentsRanking(await rankingRes.json());
        }
      } catch (err) {
        console.error('Error fetching course analytics:', err);
      } finally {
        setDropoffLoading(false);
      }
    };

    fetchCourseAnalytics();
  }, [selectedCourseId]);

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
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Cargando analíticas...</p>
      </div>
    );
  }

  if (!summary && courseStats.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Sin datos todavía
          </h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Las métricas aparecerán cuando tengas cursos publicados y estudiantes inscritos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with filters */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Rendimiento</h1>
            <p className="text-sm text-slate-400">
              Resumen de tu actividad y resultados
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px] bg-white border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400">
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
            <Filter className="w-4 h-4 text-slate-400" />
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-[280px] bg-white border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400">
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
          title="Estudiantes totales"
          value={(displaySummary?.total_students || 0).toLocaleString()}
          denominator="de todos tus cursos"
          tooltip="Alumnos totales registrados en tus cursos"
          icon={Users}
          iconColor="purple"
        />
        <KeyMetricCard
          title="Ingresos totales"
          value={formatCurrency(displaySummary?.total_revenue || 0)}
          tooltip="Ingresos totales generados por ventas de cursos"
          icon={DollarSign}
          iconColor="emerald"
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
          iconColor="amber"
        />
        <KeyMetricCard
          title="Total cursos"
          value={(displaySummary?.total_courses || 0).toString()}
          denominator="creados"
          tooltip="Número total de cursos creados en la plataforma"
          icon={BookOpen}
          iconColor="sky"
        />
      </div>

      {/* NIVEL 2 - DIAGNÓSTICO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Funnel placeholder */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Análisis de embudo</h3>
            <p className="text-sm text-slate-400">
              Analiza el recorrido de compra y aprendizaje
            </p>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
            <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-slate-900 shadow-sm">
              Embudo de compra
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 transition-all">
              Embudo de aprendizaje
            </button>
          </div>
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
            <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-medium mb-1">Análisis de embudo de compra</p>
            <p className="text-sm text-slate-400">Disponible próximamente. Requiere integración con sistema de pagos (Stripe).</p>
          </div>
        </div>

        {/* Revenue/Students over time chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {chartMode === 'revenue' ? 'Ingresos' : 'Estudiantes'} en el tiempo
                </h3>
                <p className="text-sm text-slate-400">
                  {chartMode === 'revenue'
                    ? 'Evolución de tus ingresos'
                    : 'Nuevos estudiantes por periodo'}
                </p>
              </div>
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setChartMode('revenue')}
                  className={chartMode === 'revenue'
                    ? "px-4 py-2 rounded-lg text-sm font-semibold bg-white text-slate-900 shadow-sm"
                    : "px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 transition-all"
                  }
                >
                  Ingresos
                </button>
                <button
                  onClick={() => setChartMode('students')}
                  className={chartMode === 'students'
                    ? "px-4 py-2 rounded-lg text-sm font-semibold bg-white text-slate-900 shadow-sm"
                    : "px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 transition-all"
                  }
                >
                  Estudiantes
                </button>
              </div>
            </div>
          </div>
          {chartMode === 'revenue' ? (
            revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-slate-100 p-3 rounded-xl shadow-lg text-sm">
                            <p className="font-semibold">{formatCurrency(data.revenue)}</p>
                            <p className="text-xs text-slate-400">{data.purchases} compras</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7C3AED"
                    strokeWidth={3}
                    dot={{ fill: '#7C3AED', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-400 text-sm">Sin datos de ingresos para este período</p>
              </div>
            )
          ) : (
            studentsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={studentsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-slate-100 p-3 rounded-xl shadow-lg text-sm">
                            <p className="font-semibold">{payload[0].value} estudiantes</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="students" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-400 text-sm">Sin datos de estudiantes para este período</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Rendimiento por curso - Solo mostrar si "all" está seleccionado */}
      {selectedCourseId === 'all' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 mb-12">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Rendimiento de tus cursos</h3>
            <p className="text-sm text-slate-400">
              Tus cursos ordenados por ingresos generados
            </p>
          </div>
          <CoursePerformanceTable
            courses={courseStats}
            onViewDetail={setSelectedCourseDetail}
          />
        </div>
      )}

      {/* Course Detail Panel */}
      <CourseDetailPanel
        course={selectedCourseDetail}
        isOpen={selectedCourseDetail !== null}
        onClose={() => setSelectedCourseDetail(null)}
      />

      {/* Traffic Sources */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 mb-12">
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-7 h-7 text-sky-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Fuentes de tráfico</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto mb-4">
            Próximamente podrás ver de dónde vienen tus estudiantes. Por ahora añade parámetros UTM a tus enlaces para rastrearlos.
          </p>
          <a
            href="https://ga.dev/utm-campaign-url-builder/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all"
          >
            Crear enlace con UTM
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Retention (advanced accordion) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="text-left">
            <h3 className="text-base font-bold text-slate-900 mb-1">Retención de alumnos</h3>
            <p className="text-sm text-slate-400">
              Porcentaje de alumnos activos en la semana 4 tras inscripción
            </p>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        {showAdvanced && (
          <div className="pt-2">
            <div className="p-3 bg-sky-50 rounded-xl mb-4 border border-sky-100">
              <p className="text-sm text-sky-700">
                <strong>¿Qué significa?</strong> Muestra qué porcentaje de alumnos que se inscribieron cada mes sigue activo después de 4 semanas.
              </p>
            </div>
            {retentionLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : retentionData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Sin datos de retención aún</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  Aparecerá cuando tengas estudiantes con al menos 4 semanas desde su inscripción.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Mes</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Inscritos</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Activos sem. 4</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Retención</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retentionData.map((row) => (
                      <tr key={row.month_key} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-sm font-medium text-slate-900">{row.month}</td>
                        <td className="py-3.5 px-4 text-sm text-slate-600 text-right">{row.initial_active}</td>
                        <td className="py-3.5 px-4 text-sm text-slate-600 text-right">{row.week4_active ?? '—'}</td>
                        <td className="py-3.5 px-4 text-right">
                          {row.retention_percent === null ? (
                            <span className="text-xs text-slate-400">Muy reciente</span>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              row.retention_percent >= 80
                                ? 'bg-emerald-100 text-emerald-700'
                                : row.retention_percent >= 60
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-600'
                            }`}>
                              {row.retention_percent}%
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-slate-400 text-right">
                          {row.status === 'too_recent'
                            ? 'Muy reciente'
                            : row.status === 'excellent'
                              ? 'Excelente'
                              : row.status === 'good'
                                ? 'Buena'
                                : 'Mejorable'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Análisis por curso (solo cuando hay un curso seleccionado) ── */}
      {selectedCourseId !== 'all' && (
        <div className="space-y-6 mt-6">

          {/* Curva de completitud por lección */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Curva de completitud por lección
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  % de estudiantes que completaron cada lección
                </p>
              </div>
              {dropoffData && (
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-xl font-bold text-purple-600">
                      {dropoffData.avg_completion}%
                    </p>
                    <p className="text-xs text-slate-400">Completitud media</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">
                      {dropoffData.total_enrolled}
                    </p>
                    <p className="text-xs text-slate-400">Inscritos</p>
                  </div>
                </div>
              )}
            </div>

            {dropoffLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !dropoffData || dropoffData.blocks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">
                  Sin datos de progreso aún. Los datos aparecerán cuando los estudiantes completen lecciones.
                </p>
              </div>
            ) : (
              <>
                {/* Gráfico de barras */}
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={dropoffData.blocks}
                      margin={{ top: 5, right: 10, left: -20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis
                        dataKey="block_title"
                        tick={{ fontSize: 10, fill: '#94A3B8' }}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#94A3B8' }}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#F1F5F9',
                        }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={((value: any) => [`${value}%`, 'Completitud']) as any}
                        labelFormatter={(label) => label}
                      />
                      <Bar dataKey="completion_rate" radius={[4, 4, 0, 0]}>
                        {dropoffData.blocks.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.is_dropoff
                                ? '#EF4444'
                                : entry.completion_rate >= 70
                                  ? '#7C3AED'
                                  : '#A78BFA'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Leyenda */}
                <div className="px-5 pb-4 flex items-center gap-6 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-purple-600" />
                    Buena retención
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-purple-300" />
                    Retención media
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-red-500" />
                    Punto de abandono
                  </div>
                </div>

                {/* Tabla detallada */}
                <div className="border-t border-slate-100">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Lección</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Módulo</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Completados</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">% Completitud</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Caída</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dropoffData.blocks.map((block, i) => (
                        <tr
                          key={block.block_id}
                          className={`border-t border-slate-50 transition-colors ${
                            block.is_dropoff
                              ? 'bg-red-50/50 hover:bg-red-50'
                              : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              {block.is_dropoff && (
                                <span className="text-red-500 text-xs font-bold bg-red-100 px-1.5 py-0.5 rounded">
                                  Abandono
                                </span>
                              )}
                              <span className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                                {i + 1}. {block.block_title}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-400 max-w-[120px] truncate">
                            {block.module_title}
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-600 text-right">
                            {block.completed}/{dropoffData.total_enrolled}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className={`text-sm font-bold ${
                              block.completion_rate >= 70
                                ? 'text-purple-600'
                                : block.completion_rate >= 50
                                  ? 'text-amber-600'
                                  : 'text-red-500'
                            }`}>
                              {block.completion_rate}%
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            {i === 0 ? (
                              <span className="text-xs text-slate-300">&mdash;</span>
                            ) : (
                              <span className={`text-xs font-medium ${
                                block.drop_from_prev > 15
                                  ? 'text-red-500'
                                  : block.drop_from_prev > 5
                                    ? 'text-amber-500'
                                    : 'text-emerald-500'
                              }`}>
                                {block.drop_from_prev > 0 ? '-' : '+'}
                                {Math.abs(block.drop_from_prev)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Ranking de estudiantes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Ranking de estudiantes
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Progreso individual en este curso
              </p>
            </div>

            {studentsRanking.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">Sin estudiantes inscritos aún.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estudiante</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Progreso</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Última actividad</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsRanking.map((student, i) => (
                    <tr key={student.user_id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                            <p className="text-xs text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                student.progress_pct >= 70
                                  ? 'bg-purple-500'
                                  : student.progress_pct >= 40
                                    ? 'bg-amber-400'
                                    : 'bg-red-400'
                              }`}
                              style={{ width: `${student.progress_pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700 w-10 text-right">
                            {student.progress_pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          student.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : student.status === 'at_risk'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            student.status === 'active'
                              ? 'bg-emerald-500'
                              : student.status === 'at_risk'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                          }`} />
                          {student.status === 'active'
                            ? 'Activo'
                            : student.status === 'at_risk'
                              ? 'En riesgo'
                              : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-slate-400">
                        {student.last_activity
                          ? (() => {
                              const days = Math.floor(
                                (Date.now() - new Date(student.last_activity!).getTime()) / 86400000
                              );
                              return days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `hace ${days} días`;
                            })()
                          : 'Sin actividad'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
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
  iconColor: 'purple' | 'emerald' | 'amber' | 'sky';
}) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    sky: 'bg-sky-100 text-sky-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className={`w-10 h-10 rounded-xl ${colorClasses[iconColor]} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-3 mb-0.5">{value}</p>
      <p className="text-xs text-slate-400 font-medium">{title}</p>
      {denominator && (
        <p className="text-xs text-slate-400 mt-1">{denominator}</p>
      )}
      {helpText && (
        <p className="text-xs text-slate-400 mt-1">{helpText}</p>
      )}
    </div>
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
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Sin datos de rendimiento</h3>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          No hay cursos con datos de rendimiento aún.
        </p>
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
            color: 'bg-emerald-100 text-emerald-600',
            icon: CheckCircle,
          },
          medium: {
            badge: 'Rendimiento medio',
            color: 'bg-amber-100 text-amber-600',
            icon: AlertCircle,
          },
          low: {
            badge: 'Necesita revisión',
            color: 'bg-red-100 text-red-500',
            icon: AlertCircle,
          },
        };

        const config = statusConfig[status];
        const StatusIcon = config.icon;

        return (
          <div
            key={course.id}
            className="p-4 border border-slate-100 rounded-2xl hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm mb-2">{course.title}</h4>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.color} inline-flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {config.badge}
                </span>
              </div>
              <button
                onClick={() => onViewDetail(course)}
                className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all"
              >
                Ver detalle
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Estudiantes</p>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-900">{course.student_count.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Ingresos</p>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-emerald-600">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(course.revenue)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Valoración</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-900">{course.rating_avg.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">({course.rating_count})</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Finalización</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="font-bold text-slate-900">{course.completion_rate}%</span>
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
    high: { badge: 'Alto rendimiento', color: 'bg-emerald-100 text-emerald-600' },
    medium: { badge: 'Rendimiento medio', color: 'bg-amber-100 text-amber-600' },
    low: { badge: 'Necesita revisión', color: 'bg-red-100 text-red-500' },
  };

  const config = statusConfig[status];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6 pb-20">
          <SheetHeader className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-2xl font-bold text-slate-900 mb-3">{course.title}</SheetTitle>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
                  {config.badge}
                </span>
              </div>
            </div>
          </SheetHeader>

          {/* Mini-KPIs */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-xs text-slate-400 font-medium mb-1">Ingresos del curso</p>
              <p className="text-2xl font-bold text-emerald-600">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(course.revenue)}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-xs text-slate-400 font-medium mb-1">Estudiantes</p>
              <p className="text-2xl font-bold text-purple-600">{course.student_count.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-xs text-slate-400 font-medium mb-1">Finalización</p>
              <p className="text-2xl font-bold text-sky-600">{course.completion_rate}%</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-xs text-slate-400 font-medium mb-1">Valoración</p>
              <p className="text-2xl font-bold text-amber-600">{course.rating_avg.toFixed(1)}</p>
              <p className="text-xs text-slate-400">{course.rating_count} reseñas</p>
            </div>
          </div>

          {/* Module-level analysis placeholder */}
          <div className="mb-8">
            <h3 className="text-base font-bold text-slate-900 mb-4">Progreso por módulo</h3>
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-medium mb-1">Análisis detallado por módulo</p>
              <p className="text-sm text-slate-400">Disponible próximamente</p>
            </div>
          </div>

          {/* Retention placeholder */}
          <div className="mb-8">
            <h3 className="text-base font-bold text-slate-900 mb-4">Retención de alumnos</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <p className="text-xs text-slate-400 font-medium mb-1">Estudiantes activos</p>
                <p className="text-2xl font-bold text-slate-900">{course.student_count}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <p className="text-xs text-slate-400 font-medium mb-1">Tasa de finalización</p>
                <p className="text-2xl font-bold text-slate-900">{course.completion_rate}%</p>
              </div>
            </div>
          </div>

          {/* Feedback placeholder */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Feedback de alumnos</h3>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-900">{course.rating_avg.toFixed(1)}</span>
                <span className="text-sm text-slate-400">({course.rating_count} reseñas)</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-sm text-slate-400">Las reseñas detalladas estarán disponibles próximamente</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


// Traffic Sources Simplified (estimated data placeholder)
