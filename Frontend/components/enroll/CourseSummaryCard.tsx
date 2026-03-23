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
  } | null;
  disabled: boolean;
}

export function CourseSummaryCard({ course, disabled }: CourseSummaryCardProps) {
  const price = course?.price ?? 0;
  const enrolled = course?.enrolledCount ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 sticky top-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 leading-snug mb-1">{course?.title || "Cargando..."}</h3>
          <p className="text-sm text-slate-400">por {course?.instructor?.name || "Instructor"}</p>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Modalidad</span>
          <span className="text-slate-900 font-medium">{course?.modality || "Online"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Duración</span>
          <span className="text-slate-900 font-medium">{course?.duration || "--"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-slate-100 mt-4">
        <span className="text-sm text-slate-500">Total de hoy:</span>
        <span className="text-xl font-bold text-slate-900">
          {price.toLocaleString("es-ES")} {course?.currency || "€"}
        </span>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500">{enrolled.toLocaleString("es-ES")}+ estudiantes</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-4 space-y-2 pt-4 border-t border-slate-100">
        {[
          '✓ Acceso inmediato al completar el pago',
          '✓ Certificado al finalizar el curso',
          '✓ Soporte del instructor incluido',
        ].map(text => (
          <p key={text} className="text-xs text-slate-500 flex items-center gap-1.5">
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
