"use client";

import { CourseDetailPage } from '@/components/course-id/CourseDetailPage';
import { AuthProvider } from '@/context/AuthContext';


export default function Page({ params }: { params: { id: string } }) {
  return (
    <AuthProvider>
      {/* Pasamos el ID que viene de la URL a tu componente principal 
          donde reside toda la lógica que hemos construido.
      */}
      <CourseDetailPage params={params} />
    </AuthProvider>
  );
}