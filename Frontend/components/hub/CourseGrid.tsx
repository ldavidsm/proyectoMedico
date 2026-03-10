import { CourseCard } from './CourseCard';

export interface Course {
  id: string;
  title: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  description: string;
  image: string;
  level: string;
  modality: string;
  enrolled: number;
  category: string;
}

interface CourseGridProps {
  courses: Course[];
  title?: string;
}

export function CourseGrid({ courses, title }: CourseGridProps) {
  return (
    <section className="mb-12">
      {title && (
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
    </section>
  );
}
