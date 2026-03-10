"use client";
import { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle2, PlayCircle, Award, Calendar, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { authService } from '@/lib/auth-sevice';

interface Course {
  id: string;
  title: string;
  category: string;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
  total_hours: number;
  last_accessed: string;
  next_lesson: string;
  instructor_name: string;
  status: 'in-progress' | 'completed' | 'not-started';
  certificate_url?: string;
}

export function MyLearning() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'all'>('in-progress');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await authService.getUserCourses();
        setCourses(data);
      } catch (error) {
        console.error("Error cargando cursos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    if (activeTab === 'in-progress') return course.status === 'in-progress';
    if (activeTab === 'completed') return course.status === 'completed';
    return true;
  });

  const stats = {
    inProgress: courses.filter(c => c.status === 'in-progress').length,
    completed: courses.filter(c => c.status === 'completed').length,
    totalHours: courses.reduce((acc, c) => acc + (c.total_hours * (c.progress / 100)), 0)
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-2" />
        <p className="text-sm text-gray-500">Cargando tus cursos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mi Aprendizaje</h1>
        <p className="text-gray-500">Sigue tu formación médica continua</p>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<BookOpen />} label="En curso" value={stats.inProgress} color="teal" />
        <StatCard icon={<CheckCircle2 />} label="Completados" value={stats.completed} color="green" />
        <StatCard icon={<Clock />} label="Horas de estudio" value={Math.round(stats.totalHours)} color="blue" />
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {['in-progress', 'completed', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500'
            }`}
          >
            {tab === 'in-progress' ? 'En curso' : tab === 'completed' ? 'Completados' : 'Todos'}
          </button>
        ))}
      </div>

      {/* Course Cards */}
      <div className="grid gap-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <div key={course.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.instructor_name} • {course.category}</p>
                </div>
                {course.status === 'completed' && <Award className="text-amber-500 w-6 h-6" />}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span>Progreso: {course.progress}%</span>
                  <span>{course.completed_lessons}/{course.total_lessons} Lecciones</span>
                </div>
                <Progress value={course.progress} className="h-2" />
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-gray-400">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    {course.last_accessed}
                  </span>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                    {course.status === 'completed' ? 'Ver Certificado' : 'Continuar'}
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-gray-500">No se encontraron cursos en esta sección.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colors: any = { teal: 'bg-teal-50 text-teal-600', green: 'bg-green-50 text-green-600', blue: 'bg-blue-50 text-blue-600' };
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}