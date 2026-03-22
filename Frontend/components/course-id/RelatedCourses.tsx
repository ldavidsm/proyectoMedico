'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { getDefaultBanner } from '@/lib/course-banners';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RelatedCourse {
  id: string;
  title: string;
  short_description?: string;
  category?: string;
  level?: string;
  banner_url?: string;
  rating_avg?: number;
  rating_count?: number;
  seller?: { full_name: string };
}

interface RelatedCoursesProps {
  courseId: string;
  category?: string;
}

export function RelatedCourses({ courseId, category }: RelatedCoursesProps) {
  const [courses, setCourses] = useState<RelatedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch(
          `${API_URL}/courses/${courseId}/related?limit=4`,
          { credentials: 'include' }
        );
        if (!res.ok) return;
        const data = await res.json();
        setCourses(data);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelated();
  }, [courseId]);

  if (!isLoading && courses.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          También te puede interesar
        </h2>
        {category && (
          <Link
            href={`/?category=${encodeURIComponent(category)}`}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            Ver todos en {category}
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-36 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {courses.map(course => (
            <Link
              key={course.id}
              href={`/course/${course.id}`}
              className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-36 overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={course.banner_url || ''}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  fallbackType="course"
                  courseTitle={course.title}
                  defaultBannerUrl={getDefaultBanner(course.category, course.id)}
                />
              </div>

              <div className="p-4">
                {course.category && (
                  <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded mb-2 inline-block">
                    {course.category}
                  </span>
                )}

                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-teal-600 transition-colors">
                  {course.title}
                </h3>

                {course.seller?.full_name && (
                  <p className="text-xs text-gray-500 mb-2 truncate">
                    {course.seller.full_name}
                  </p>
                )}

                {course.rating_avg && course.rating_avg > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold text-gray-900">
                      {course.rating_avg.toFixed(1)}
                    </span>
                    {course.rating_count != null && (
                      <span className="text-xs text-gray-500">
                        ({course.rating_count})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Sin valoraciones</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
