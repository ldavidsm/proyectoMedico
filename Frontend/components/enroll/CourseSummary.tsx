import { Card } from "../ui/card";

interface CourseSummaryProps {
  course: {
    title: string;
    instructor: any; // Ajustado para recibir objeto o string
    modality: string;
    duration: string;
    accessType?: string;
    level?: string;
  } | null;
}

export function CourseSummary({ course }: CourseSummaryProps) {
  // Extraemos el nombre sea cual sea el formato que venga del backend
  const instructorName = typeof course?.instructor === 'object' 
    ? course?.instructor?.name 
    : course?.instructor;

  return (
    <Card className="p-8 bg-white border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl mb-2 text-gray-900 font-bold">{course?.title || "Cargando programa..."}</h2>
        <p className="text-sm text-gray-600">Este es un resumen del programa al que va a inscribirse.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
        {[
          { label: "Profesor/a:", value: instructorName },
          { label: "Modalidad:", value: course?.modality },
          { label: "Duración total:", value: course?.duration },
          { label: "Acceso:", value: course?.accessType || "Ilimitado" },
          { label: "Nivel:", value: course?.level || "Avanzado" },
        ].map((item, idx) => (
          <div key={idx} className="flex">
            <span className="text-gray-500 min-w-[140px]">{item.label}</span>
            <span className="text-gray-900">{item.value || "--"}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}