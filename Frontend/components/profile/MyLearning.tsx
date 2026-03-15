'use client';

import { useState } from 'react';
import { BookOpen, Clock, CheckCircle2, PlayCircle, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Course {
  id: string;
  title: string;
  category: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  totalHours: number;
  lastAccessed: string;
  nextLesson: string;
  instructor: string;
  thumbnail: string;
  status: 'in-progress' | 'completed' | 'not-started';
  certificateAvailable?: boolean;
}

type TabType = 'in-progress' | 'completed' | 'all';

export function MyLearning() {
  const [activeTab, setActiveTab] = useState<TabType>('in-progress');

  const courses: Course[] = [
    {
      id: '1',
      title: 'Fundamentos de Cardiología Clínica',
      category: 'Cardiología',
      progress: 65,
      totalLessons: 24,
      completedLessons: 16,
      totalHours: 12,
      lastAccessed: 'Hace 2 días',
      nextLesson: 'Módulo 4: Arritmias cardíacas',
      instructor: 'Dr. Carlos Martínez',
      thumbnail: '',
      status: 'in-progress'
    },
    {
      id: '2',
      title: 'Actualización en Diabetes Mellitus Tipo 2',
      category: 'Endocrinología',
      progress: 30,
      totalLessons: 18,
      completedLessons: 5,
      totalHours: 8,
      lastAccessed: 'Hace 1 semana',
      nextLesson: 'Módulo 2: Tratamiento farmacológico',
      instructor: 'Dra. Ana López',
      thumbnail: '',
      status: 'in-progress'
    },
    {
      id: '3',
      title: 'Interpretación de ECG para Médicos Generales',
      category: 'Cardiología',
      progress: 100,
      totalLessons: 20,
      completedLessons: 20,
      totalHours: 10,
      lastAccessed: 'Hace 3 semanas',
      nextLesson: '',
      instructor: 'Dr. Roberto Silva',
      thumbnail: '',
      status: 'completed',
      certificateAvailable: true
    },
    {
      id: '4',
      title: 'Manejo de Urgencias Respiratorias',
      category: 'Medicina de Urgencias',
      progress: 45,
      totalLessons: 16,
      completedLessons: 7,
      totalHours: 6,
      lastAccessed: 'Hace 4 días',
      nextLesson: 'Módulo 3: Neumonía y bronconeumonía',
      instructor: 'Dr. Miguel Ángel Torres',
      thumbnail: '',
      status: 'in-progress'
    }
  ];

  const filteredCourses = courses.filter(course => {
    if (activeTab === 'in-progress') return course.status === 'in-progress';
    if (activeTab === 'completed') return course.status === 'completed';
    return true;
  });

  const stats = {
    inProgress: courses.filter(c => c.status === 'in-progress').length,
    completed: courses.filter(c => c.status === 'completed').length,
    totalHours: courses.reduce((acc, c) => acc + (c.totalHours * c.progress / 100), 0)
  };

  const tabs = [
    { id: 'in-progress' as TabType, label: 'En curso', count: stats.inProgress },
    { id: 'completed' as TabType, label: 'Completados', count: stats.completed },
    { id: 'all' as TabType, label: 'Todos', count: courses.length }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Mi aprendizaje</h1>
        <p className="text-sm text-gray-500">
          Gestiona tus cursos y sigue tu progreso de formación continua
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
              <p className="text-xs text-gray-500">En curso</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-500">Completados</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{Math.round(stats.totalHours)}</p>
              <p className="text-xs text-gray-500">Horas completadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <span className="text-sm font-medium">{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No hay cursos en esta categoría</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              {/* Course Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">{course.title}</h3>
                    {course.certificateAvailable && (
                      <Award className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{course.instructor} • {course.category}</p>

                  {course.status === 'completed' ? (
                    <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0">
                      Completado
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Último acceso: {course.lastAccessed}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              {course.status !== 'completed' && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Progreso del curso</span>
                    <span className="text-xs font-medium text-gray-900">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-2">
                    {course.completedLessons} de {course.totalLessons} lecciones completadas
                  </p>
                </div>
              )}

              {/* Next Lesson or Certificate */}
              {course.status === 'completed' && course.certificateAvailable ? (
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 px-3 text-xs bg-white border-gray-300 hover:bg-gray-50"
                  >
                    Descargar certificado
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs bg-white border-gray-300 hover:bg-gray-50"
                  >
                    Revisar curso
                  </Button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Siguiente lección:</p>
                      <p className="text-sm font-medium text-gray-900">{course.nextLesson}</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 h-8 px-3 text-xs font-medium flex-shrink-0"
                    >
                      <PlayCircle className="w-3.5 h-3.5 mr-1" />
                      Continuar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Empty State for New Users */}
      {courses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Aún no tienes cursos
          </h3>
          <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto">
            Comienza tu formación continua explorando nuestro catálogo de cursos especializados
          </p>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 h-9 px-4 text-xs font-medium"
          >
            Explorar cursos
          </Button>
        </div>
      )}
    </div>
  );
}
