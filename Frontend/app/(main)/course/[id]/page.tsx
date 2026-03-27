import type { Metadata } from 'next';
import { CourseDetailPage } from "@/components/course-id/CourseDetailPage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/courses/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { title: 'Curso' };
    const course = await res.json();
    return {
      title: course.title || 'Curso',
      description: course.short_description || course.subtitle || 'Curso en HealthLearn',
      openGraph: {
        title: course.title,
        description: course.short_description || '',
        images: course.banner_url ? [{ url: course.banner_url }] : [],
      },
    };
  } catch {
    return { title: 'Curso' };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseDetailPage params={{ id }} />;
}
