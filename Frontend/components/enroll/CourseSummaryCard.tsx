import { Card } from "../ui/card";
import { BookOpen, Users } from "lucide-react";

interface CourseSummaryCardProps {
  course: {
    title: string;
    instructor: { name: string };
    modality: string;
    duration: string;
    price: number;
    currency: string;
    enrolledCount: number;
  } | null; // Soportamos que sea null al inicio
  disabled: boolean;
}

export function CourseSummaryCard({ course, disabled }: CourseSummaryCardProps) {
  // Valores por defecto para evitar errores de undefined
  const price = course?.price ?? 0;
  const enrolled = course?.enrolledCount ?? 0;

  return (
    <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg mb-1 text-gray-900 font-bold">{course?.title || "Cargando..."}</h3>
            <p className="text-sm text-gray-600">por {course?.instructor?.name || "Instructor"}</p>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Modalidad</span>
            <span className="text-gray-900">{course?.modality || "Online"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duración</span>
            <span className="text-gray-900">{course?.duration || "--"}</span>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        <div className="flex justify-between items-baseline">
          <span className="text-base">Total de hoy:</span>
          <span className="text-2xl font-bold">
            {price.toLocaleString("es-ES")} {course?.currency || "€"}
          </span>
        </div>

        <div className="border-t border-gray-200"></div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-base text-gray-900">{enrolled.toLocaleString("es-ES")}+</p>
              <p className="text-xs text-gray-600">Estudiantes</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}