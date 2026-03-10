import { CourseCard } from './CourseCard';
import { Course } from './CourseGrid';
import { Star, TrendingUp, BookOpen } from 'lucide-react';

interface CourseSectionsProps {
  selectedCourses: Course[];
  popularCourses: Course[];
  allCourses: Course[];
}

export function CourseSections({ selectedCourses, popularCourses, allCourses }: CourseSectionsProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
      {/* Seleccionados para ti */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Seleccionados para ti</h2>
        </div>
        <p className="text-gray-600 mb-6">Cursos recomendados por expertos</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </section>

      {/* Cursos más populares */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Cursos más populares</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </section>

      {/* Catálogo completo */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Catálogo completo</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </section>
    </div>
  );
}
