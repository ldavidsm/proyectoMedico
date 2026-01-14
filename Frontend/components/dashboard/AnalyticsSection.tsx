import { useState } from 'react';
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
  Lightbulb
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
import { Checkbox } from '@/components/ui/checkbox';

// Course data structure
const coursesList = [
  { id: 'all', name: 'Todos los cursos' },
  { id: 'nutricion', name: 'Nutrición Deportiva Avanzada' },
  { id: 'anatomia', name: 'Anatomía para Fisioterapeutas' },
  { id: 'psicologia', name: 'Psicología Clínica Básica' },
];

const periodOptions = [
  { id: '30', name: 'Últimos 30 días' },
  { id: '90', name: 'Últimos 90 días' },
  { id: 'custom', name: 'Personalizado' },
];

// Data by course
const courseData = {
  all: {
    revenue: [
      { month: 'Ene', revenue: 3200 },
      { month: 'Feb', revenue: 3800 },
      { month: 'Mar', revenue: 4200 },
      { month: 'Abr', revenue: 3900 },
      { month: 'May', revenue: 5100 },
      { month: 'Jun', revenue: 6200 },
    ],
    revenueWeekly: [
      { period: 'Sem 1', revenue: 1000, purchases: 20 },
      { period: 'Sem 2', revenue: 1200, purchases: 25 },
      { period: 'Sem 3', revenue: 1500, purchases: 30 },
      { period: 'Sem 4', revenue: 1800, purchases: 35 },
      { period: 'Sem 5', revenue: 2000, purchases: 40 },
      { period: 'Sem 6', revenue: 2500, purchases: 50 },
    ],
    enrollment: [
      { month: 'Ene', students: 45 },
      { month: 'Feb', students: 62 },
      { month: 'Mar', students: 78 },
      { month: 'Abr', students: 54 },
      { month: 'May', students: 89 },
      { month: 'Jun', students: 112 },
    ],
    metrics: {
      totalRevenue: 26500,
      activeStudents: 2340,
      completionRate: 68,
      avgRating: 4.8,
      revenueChange: 15.3,
      studentsChange: 8.5,
      completionChange: -2.4,
      ratingChange: 0.2,
      totalEnrolled: 3000,
      totalReviews: 500,
    },
  },
  nutricion: {
    revenue: [
      { month: 'Ene', revenue: 1500 },
      { month: 'Feb', revenue: 1800 },
      { month: 'Mar', revenue: 2100 },
      { month: 'Abr', revenue: 1900 },
      { month: 'May', revenue: 2400 },
      { month: 'Jun', revenue: 2900 },
    ],
    revenueWeekly: [
      { period: 'Sem 1', revenue: 500, purchases: 10 },
      { period: 'Sem 2', revenue: 600, purchases: 12 },
      { period: 'Sem 3', revenue: 700, purchases: 15 },
      { period: 'Sem 4', revenue: 800, purchases: 18 },
      { period: 'Sem 5', revenue: 900, purchases: 20 },
      { period: 'Sem 6', revenue: 1000, purchases: 25 },
    ],
    enrollment: [
      { month: 'Ene', students: 25 },
      { month: 'Feb', students: 32 },
      { month: 'Mar', students: 40 },
      { month: 'Abr', students: 28 },
      { month: 'May', students: 45 },
      { month: 'Jun', students: 58 },
    ],
    metrics: {
      totalRevenue: 12600,
      activeStudents: 1048,
      completionRate: 72,
      avgRating: 4.8,
      revenueChange: 18.5,
      studentsChange: 12.3,
      completionChange: 3.2,
      ratingChange: 0.1,
      totalEnrolled: 1500,
      totalReviews: 300,
    },
  },
  anatomia: {
    revenue: [
      { month: 'Ene', revenue: 1200 },
      { month: 'Feb', revenue: 1400 },
      { month: 'Mar', revenue: 1500 },
      { month: 'Abr', revenue: 1300 },
      { month: 'May', revenue: 1800 },
      { month: 'Jun', revenue: 2200 },
    ],
    revenueWeekly: [
      { period: 'Sem 1', revenue: 400, purchases: 8 },
      { period: 'Sem 2', revenue: 500, purchases: 10 },
      { period: 'Sem 3', revenue: 600, purchases: 12 },
      { period: 'Sem 4', revenue: 700, purchases: 15 },
      { period: 'Sem 5', revenue: 800, purchases: 18 },
      { period: 'Sem 6', revenue: 900, purchases: 20 },
    ],
    enrollment: [
      { month: 'Ene', students: 15 },
      { month: 'Feb', students: 20 },
      { month: 'Mar', students: 25 },
      { month: 'Abr', students: 18 },
      { month: 'May', students: 30 },
      { month: 'Jun', students: 38 },
    ],
    metrics: {
      totalRevenue: 9400,
      activeStudents: 758,
      completionRate: 75,
      avgRating: 4.9,
      revenueChange: 22.1,
      studentsChange: 15.8,
      completionChange: 5.8,
      ratingChange: 0.3,
      totalEnrolled: 1000,
      totalReviews: 200,
    },
  },
  psicologia: {
    revenue: [
      { month: 'Ene', revenue: 500 },
      { month: 'Feb', revenue: 600 },
      { month: 'Mar', revenue: 600 },
      { month: 'Abr', revenue: 700 },
      { month: 'May', revenue: 900 },
      { month: 'Jun', revenue: 1100 },
    ],
    revenueWeekly: [
      { period: 'Sem 1', revenue: 150, purchases: 3 },
      { period: 'Sem 2', revenue: 180, purchases: 4 },
      { period: 'Sem 3', revenue: 210, purchases: 5 },
      { period: 'Sem 4', revenue: 240, purchases: 6 },
      { period: 'Sem 5', revenue: 270, purchases: 7 },
      { period: 'Sem 6', revenue: 300, purchases: 8 },
    ],
    enrollment: [
      { month: 'Ene', students: 5 },
      { month: 'Feb', students: 10 },
      { month: 'Mar', students: 13 },
      { month: 'Abr', students: 8 },
      { month: 'May', students: 14 },
      { month: 'Jun', students: 16 },
    ],
    metrics: {
      totalRevenue: 4500,
      activeStudents: 534,
      completionRate: 58,
      avgRating: 4.7,
      revenueChange: 12.5,
      studentsChange: 5.2,
      completionChange: -8.2,
      ratingChange: -0.1,
      totalEnrolled: 500,
      totalReviews: 100,
    },
  },
};

const coursePerformance = [
  { 
    name: 'Nutrición Deportiva Avanzada', 
    students: 1234, 
    revenue: 12600, 
    rating: 4.8,
    completionRate: 72,
    status: 'high' as const
  },
  { 
    name: 'Anatomía para Fisioterapeutas', 
    students: 892, 
    revenue: 9400, 
    rating: 4.9,
    completionRate: 75,
    status: 'high' as const
  },
  { 
    name: 'Psicología Clínica Básica', 
    students: 654, 
    revenue: 4500, 
    rating: 4.7,
    completionRate: 58,
    status: 'medium' as const
  },
];

export function AnalyticsSection() {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chartMode, setChartMode] = useState<'revenue' | 'students'>('revenue');
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<typeof coursePerformance[0] | null>(null);

  const currentData = courseData[selectedCourse as keyof typeof courseData];

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
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                {coursesList.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
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
          title="Ingresos del periodo"
          value={`€${currentData.metrics.totalRevenue.toLocaleString()}`}
          change={currentData.metrics.revenueChange}
          helpText={
            currentData.metrics.revenueChange > 0
              ? 'Mejor que el periodo anterior'
              : 'Ligera bajada respecto al periodo anterior'
          }
          tooltip="Ingresos totales generados por ventas de cursos en el periodo seleccionado"
          icon={DollarSign}
          iconColor="green"
        />
        <KeyMetricCard
          title="Estudiantes activos"
          value={currentData.metrics.activeStudents.toLocaleString()}
          denominator={`de ${currentData.metrics.totalEnrolled.toLocaleString()} inscritos`}
          change={currentData.metrics.studentsChange}
          helpText={
            currentData.metrics.studentsChange > 5
              ? 'Crecimiento saludable'
              : 'Crecimiento moderado'
          }
          tooltip="Alumnos que han accedido al curso en los últimos 30 días"
          icon={Users}
          iconColor="blue"
        />
        <KeyMetricCard
          title="Finalización del curso"
          value={`${currentData.metrics.completionRate}%`}
          denominator="de compradores"
          change={currentData.metrics.completionChange}
          helpText={
            currentData.metrics.completionRate > 70
              ? 'Excelente finalización'
              : currentData.metrics.completionRate > 50
              ? 'Finalización aceptable'
              : 'Necesita mejorar contenido'
          }
          tooltip="Porcentaje de alumnos que han completado el curso respecto a los que lo compraron"
          icon={TrendingUp}
          iconColor="purple"
        />
        <KeyMetricCard
          title="Valoración media"
          value={currentData.metrics.avgRating.toFixed(1)}
          denominator={`sobre ${currentData.metrics.totalReviews} reseñas`}
          change={currentData.metrics.ratingChange}
          helpText={
            currentData.metrics.avgRating >= 4.5
              ? 'Muy valorado por tus alumnos'
              : 'Considera mejorar según feedback'
          }
          tooltip="Promedio de todas las valoraciones de 1 a 5 estrellas recibidas"
          icon={Star}
          iconColor="yellow"
        />
      </div>

      {/* NIVEL 2 - DIAGNÓSTICO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Embudo de conversión con tabs */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">¿Dónde se caen los usuarios?</h3>
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
              <PurchaseFunnel />
            </TabsContent>
            <TabsContent value="learning">
              <LearningFunnel completionRate={currentData.metrics.completionRate} />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Ingresos/Estudiantes en el tiempo */}
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {chartMode === 'revenue' ? 'Ingresos' : 'Estudiantes'} en el tiempo
                </h3>
                <p className="text-sm text-gray-600">
                  {chartMode === 'revenue' 
                    ? selectedPeriod === '30' 
                      ? 'Evolución semanal de tus ingresos'
                      : 'Evolución mensual de tus ingresos'
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
          <ResponsiveContainer width="100%" height={280}>
            {chartMode === 'revenue' ? (
              <LineChart data={selectedPeriod === '30' ? currentData.revenueWeekly : currentData.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey={selectedPeriod === '30' ? 'period' : 'month'} />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold">€{data.revenue?.toLocaleString()}</p>
                          {data.purchases && (
                            <p className="text-xs text-gray-600">{data.purchases} compras</p>
                          )}
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
            ) : (
              <BarChart data={currentData.enrollment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#9333ea" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Rendimiento por curso - Solo mostrar si "all" está seleccionado */}
      {selectedCourse === 'all' && (
        <Card className="p-6 mb-12">
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Rendimiento de tus cursos</h3>
            <p className="text-sm text-gray-600">
              Tus cursos ordenados por ingresos generados
            </p>
          </div>
          <CoursePerformanceTable 
            courses={coursePerformance} 
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

      {/* Fuentes de tráfico */}
      <Card className="p-6 mb-12">
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">¿De dónde vienen tus alumnos?</h3>
          <p className="text-sm text-gray-600">
            Más del 75% de tus ventas llegan sin anuncios de pago
          </p>
        </div>
        <TrafficSourcesSimplified />
      </Card>

      {/* Métricas avanzadas (acordeón) */}
      <Card className="p-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="text-left">
            <h3 className="font-semibold text-lg mb-1">Análisis de retención (avanzado)</h3>
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

// NIVEL 1 - Key Metric Card Component
function KeyMetricCard({
  title,
  value,
  denominator,
  change,
  helpText,
  tooltip,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string;
  denominator?: string;
  change: number;
  helpText: string;
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

  const isPositive = change > 0;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[iconColor]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{Math.abs(change)}%</span>
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
      <p className="text-xs text-gray-500">{helpText}</p>
    </Card>
  );
}

// Purchase Funnel Component
function PurchaseFunnel() {
  const funnelData = [
    { stage: 'Visitas a la página', count: 5420, percent: 100, status: 'normal' },
    { stage: 'Iniciaron proceso de compra', count: 2168, percent: 40, status: 'normal' },
    { stage: 'Completaron el pago', count: 1084, percent: 20, status: 'alert' },
  ];

  return (
    <div className="space-y-3">
      {funnelData.map((stage, index) => {
        const isAlert = stage.status === 'alert';
        return (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stage.stage}</span>
                {isAlert && (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
              </div>
              <div className="text-right">
                <span className="text-lg font-bold mr-2">{stage.count.toLocaleString()}</span>
                <span className="text-sm text-gray-500">{stage.percent}%</span>
              </div>
            </div>
            <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 flex items-center justify-center transition-all ${
                  isAlert 
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500' 
                    : 'bg-gradient-to-r from-purple-500 to-purple-600'
                }`}
                style={{ width: `${stage.percent}%` }}
              >
                <span className="text-white font-semibold text-sm">{stage.percent}%</span>
              </div>
            </div>
            {isAlert && (
              <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-orange-900 font-medium mb-1">
                      ⚠️ Aquí se pierde la mayoría de los usuarios
                    </p>
                    <p className="text-xs text-orange-700">
                      <strong>Recomendación:</strong> Simplifica el proceso de pago, ofrece más métodos de pago o considera añadir garantía de devolución.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Learning Funnel Component
function LearningFunnel({ completionRate }: { completionRate: number }) {
  const totalBuyers = 1084;
  const started = Math.round(totalBuyers * 0.85);
  const completed = Math.round(totalBuyers * (completionRate / 100));

  const funnelData = [
    { stage: 'Compraron el curso', count: totalBuyers, percent: 100, status: 'normal' },
    { stage: 'Empezaron el curso', count: started, percent: 85, status: started / totalBuyers < 0.7 ? 'alert' : 'normal' },
    { stage: 'Finalizaron el curso', count: completed, percent: completionRate, status: completionRate < 50 ? 'alert' : 'normal' },
  ];

  return (
    <div className="space-y-3">
      {funnelData.map((stage, index) => {
        const isAlert = stage.status === 'alert';
        return (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stage.stage}</span>
                {isAlert && (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
              </div>
              <div className="text-right">
                <span className="text-lg font-bold mr-2">{stage.count.toLocaleString()}</span>
                <span className="text-sm text-gray-500">{stage.percent}%</span>
              </div>
            </div>
            <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 flex items-center justify-center transition-all ${
                  isAlert 
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500' 
                    : 'bg-gradient-to-r from-purple-500 to-purple-600'
                }`}
                style={{ width: `${stage.percent}%` }}
              >
                <span className="text-white font-semibold text-sm">{stage.percent}%</span>
              </div>
            </div>
            {isAlert && index === 1 && (
              <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-orange-900 font-medium mb-1">
                      ⚠️ Muchos compradores no empiezan el curso
                    </p>
                    <p className="text-xs text-orange-700">
                      <strong>Recomendación:</strong> Envía un email de bienvenida inmediato con primeros pasos claros, o crea un onboarding inicial más atractivo.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {isAlert && index === 2 && (
              <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-orange-900 font-medium mb-1">
                      ⚠️ Baja tasa de finalización
                    </p>
                    <p className="text-xs text-orange-700">
                      <strong>Recomendación:</strong> Añade recordatorios automáticos por email, gamificación o certificados de progreso para motivar a continuar.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!isAlert && index === funnelData.length - 1 && stage.percent > 60 && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 font-medium">
                  ✓ Excelente tasa de finalización - tus alumnos completan el curso
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Course Performance Table
function CoursePerformanceTable({ 
  courses,
  onViewDetail 
}: { 
  courses: typeof coursePerformance;
  onViewDetail: (course: typeof coursePerformance[0]) => void;
}) {
  return (
    <div className="space-y-4">
      {courses.map((course, index) => {
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

        const config = statusConfig[course.status];
        const StatusIcon = config.icon;

        return (
          <div
            key={index}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">{course.name}</h4>
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
                  <span className="font-bold text-lg">{course.students.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Ingresos</p>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-lg text-green-600">
                    €{course.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Valoración</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg">{course.rating}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Finalización</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-lg">{course.completionRate}%</span>
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
  onClose 
}: { 
  course: typeof coursePerformance[0] | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!course) return null;

  const statusConfig = {
    high: {
      badge: 'Alto rendimiento',
      color: 'bg-green-100 text-green-700 border-green-200',
    },
    medium: {
      badge: 'Rendimiento medio',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
    low: {
      badge: 'Necesita revisión',
      color: 'bg-red-100 text-red-700 border-red-200',
    },
  };

  const config = statusConfig[course.status];

  // Mock data específico del curso
  const courseModules = [
    { name: 'Módulo 1: Introducción', completion: 95, avgTime: '45 min', status: 'good' },
    { name: 'Módulo 2: Fundamentos', completion: 82, avgTime: '1h 20min', status: 'good' },
    { name: 'Módulo 3: Práctica avanzada', completion: 41, avgTime: '2h 10min', status: 'alert' },
    { name: 'Módulo 4: Casos reales', completion: 38, avgTime: '1h 5min', status: 'alert' },
    { name: 'Módulo 5: Conclusiones', completion: 35, avgTime: '30 min', status: 'alert' },
  ];

  const recommendations = [
    { 
      id: 1, 
      text: 'Revisar precio (conversión baja vs media)', 
      priority: 'high',
      checked: false 
    },
    { 
      id: 2, 
      text: 'Añadir recordatorio automático en módulo 3', 
      priority: 'high',
      checked: false 
    },
    { 
      id: 3, 
      text: 'Añadir testimonios en la página de venta', 
      priority: 'medium',
      checked: false 
    },
    { 
      id: 4, 
      text: 'Dividir módulo 3 en secciones más cortas', 
      priority: 'medium',
      checked: false 
    },
  ];

  const reviews = [
    { author: 'María G.', rating: 5, text: 'Excelente curso, muy completo y bien estructurado. Los ejemplos prácticos son muy útiles.' },
    { author: 'Carlos R.', rating: 4, text: 'Buen contenido aunque el módulo 3 es algo denso. Recomendaría dividirlo.' },
    { author: 'Ana T.', rating: 5, text: 'Justo lo que necesitaba para mi práctica profesional. Totalmente recomendable.' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6 pb-20">
          <SheetHeader className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-2xl mb-3">{course.name}</SheetTitle>
                <Badge className={`${config.color} border`}>
                  {config.badge}
                </Badge>
              </div>
            </div>
          </SheetHeader>

          {/* Mini-KPIs del curso */}
          <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Ingresos del curso</p>
            <p className="text-2xl font-bold text-green-600">€{course.revenue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 mb-1">Estudiantes</p>
            <p className="text-2xl font-bold text-blue-600">{course.students.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-gray-600 mb-1">Finalización</p>
            <p className="text-2xl font-bold text-purple-600">{course.completionRate}%</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-gray-600 mb-1">Valoración</p>
            <p className="text-2xl font-bold text-yellow-600">{course.rating} ⭐</p>
          </div>
        </div>

        {/* BLOQUE 1 - Embudo del curso */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">Embudo de este curso</h3>
          <Tabs defaultValue="purchase">
            <TabsList className="mb-4">
              <TabsTrigger value="purchase">Compra</TabsTrigger>
              <TabsTrigger value="learning">Aprendizaje</TabsTrigger>
            </TabsList>
            <TabsContent value="purchase">
              <CoursePurchaseFunnel courseName={course.name} />
            </TabsContent>
            <TabsContent value="learning">
              <CourseLearningFunnel completionRate={course.completionRate} />
            </TabsContent>
          </Tabs>
        </div>

        {/* BLOQUE 2 - Progreso dentro del curso */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">Progreso por módulo</h3>
          <div className="space-y-3">
            {courseModules.map((module, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{module.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{module.avgTime}</span>
                    <span className={`font-semibold ${
                      module.status === 'alert' ? 'text-orange-600' : 'text-gray-700'
                    }`}>
                      {module.completion}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      module.status === 'alert' 
                        ? 'bg-orange-500' 
                        : 'bg-purple-600'
                    }`}
                    style={{ width: `${module.completion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-orange-900 font-medium">
                  La mayoría de los alumnos abandona en el módulo 3
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Solo el 41% de los alumnos llega a este módulo. Considera dividirlo en secciones más cortas o añadir más ejemplos prácticos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 3 - Retención del curso */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">Retención de alumnos</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Retención semana 1</p>
              <p className="text-2xl font-bold">89%</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Retención semana 4</p>
              <p className="text-2xl font-bold">{course.completionRate}%</p>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Comparativa:</strong> Este curso retiene mejor que el <strong>65%</strong> de los cursos similares en la plataforma.
            </p>
          </div>
        </div>

        {/* BLOQUE 4 - Feedback de alumnos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Feedback de alumnos</h3>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{course.rating}</span>
              <span className="text-sm text-gray-500">(156 reseñas)</span>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            {reviews.map((review, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm">{review.author}</span>
                  <div className="flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{review.text}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Ver todas las reseñas
          </Button>
        </div>

        {/* BLOQUE 5 - Acciones recomendadas */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">Recomendaciones para mejorar</h3>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div 
                key={rec.id} 
                className={`flex items-start gap-3 p-3 border rounded-lg ${
                  rec.priority === 'high' ? 'border-orange-200 bg-orange-50' : 'bg-gray-50'
                }`}
              >
                <Checkbox id={`rec-${rec.id}`} className="mt-1" />
                <label 
                  htmlFor={`rec-${rec.id}`} 
                  className="flex-1 text-sm cursor-pointer"
                >
                  {rec.text}
                  {rec.priority === 'high' && (
                    <span className="ml-2 text-xs text-orange-600 font-medium">
                      (Prioridad alta)
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Course-specific Purchase Funnel
function CoursePurchaseFunnel({ courseName }: { courseName: string }) {
  const funnelData = [
    { stage: 'Visitas a la página del curso', count: 2180, percent: 100 },
    { stage: 'Inician compra', count: 654, percent: 30 },
    { stage: 'Completan pago', count: 280, percent: 13 },
  ];

  const avgConversion = 20; // Promedio de otros cursos

  return (
    <div>
      <div className="space-y-3 mb-4">
        {funnelData.map((stage, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{stage.stage}</span>
              <div className="text-right">
                <span className="text-lg font-bold mr-2">{stage.count.toLocaleString()}</span>
                <span className="text-sm text-gray-500">{stage.percent}%</span>
              </div>
            </div>
            <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center"
                style={{ width: `${stage.percent}%` }}
              >
                <span className="text-white font-semibold text-sm">{stage.percent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-orange-900 font-medium mb-1">
              La mayor caída ocurre antes del pago
            </p>
            <p className="text-xs text-orange-700">
              Este curso convierte al 13% vs {avgConversion}% de media en tus otros cursos. Considera revisar el precio o añadir garantía de devolución.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Course-specific Learning Funnel
function CourseLearningFunnel({ completionRate }: { completionRate: number }) {
  const totalBuyers = 280;
  const started = Math.round(totalBuyers * 0.92);
  const completed = Math.round(totalBuyers * (completionRate / 100));

  const funnelData = [
    { stage: 'Compraron el curso', count: totalBuyers, percent: 100 },
    { stage: 'Empezaron el curso', count: started, percent: 92 },
    { stage: 'Finalizaron el curso', count: completed, percent: completionRate },
  ];

  return (
    <div>
      <div className="space-y-3 mb-4">
        {funnelData.map((stage, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{stage.stage}</span>
              <div className="text-right">
                <span className="text-lg font-bold mr-2">{stage.count.toLocaleString()}</span>
                <span className="text-sm text-gray-500">{stage.percent}%</span>
              </div>
            </div>
            <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center"
                style={{ width: `${stage.percent}%` }}
              >
                <span className="text-white font-semibold text-sm">{stage.percent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {completionRate >= 70 ? (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 font-medium">
            ✓ Excelente tasa de finalización - tus alumnos completan el curso
          </p>
        </div>
      ) : (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            El {completionRate}% finaliza el curso. Considera añadir recordatorios automáticos y motivación adicional en los módulos intermedios.
          </p>
        </div>
      )}
    </div>
  );
}

// Cohort Retention Simplified
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
                  <span className="text-gray-700 font-semibold">
                    {cohort.initialActive}
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  {cohort.week4Active !== null ? (
                    <span className="text-gray-700 font-semibold">
                      {cohort.week4Active}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="text-center py-3 px-4">
                  {cohort.week4Percent !== null ? (
                    <span className={`inline-block px-3 py-1 rounded font-semibold ${
                      cohort.week4Percent >= 70 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {cohort.week4Percent}%
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Muy reciente</span>
                  )}
                </td>
                <td className="py-3 px-4 text-xs text-gray-600">
                  {cohort.week4Percent !== null
                    ? cohort.week4Percent >= 70 
                      ? '✓ Buena retención' 
                      : 'Mejorable'
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

// Traffic Sources Simplified
function TrafficSourcesSimplified() {
  const sources = [
    { name: 'Búsqueda orgánica', percent: 45, description: 'Google, Bing y otros buscadores' },
    { name: 'Recomendaciones', percent: 30, description: 'Enlaces de otros sitios web' },
    { name: 'Redes sociales', percent: 15, description: 'Facebook, Instagram, LinkedIn' },
    { name: 'Tráfico directo', percent: 10, description: 'URL directa o favoritos' },
  ];

  return (
    <div>
      <div className="p-3 bg-blue-50 rounded-lg mb-4 border border-blue-200">
        <p className="text-xs text-blue-900">
          <strong>Nota:</strong> Si usas parámetros UTM en tus enlaces, podrás ver fuentes más específicas. El tráfico sin UTM se clasifica como "directo".
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