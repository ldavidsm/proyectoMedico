import { Button } from "@/components/ui/button";

interface CourseCompleteProps {
  courseName: string;
}

export function CourseComplete({ courseName }: CourseCompleteProps) {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600">
            <span className="text-5xl text-white">🎓</span>
          </div>
        </div>
        <h2 className="mb-3 text-3xl font-medium text-gray-900">
          ¡Felicitaciones!
        </h2>
        <h3 className="mb-6 text-xl text-gray-700">
          Has completado el curso
        </h3>
        <p className="mb-8 text-lg font-medium text-gray-900">{courseName}</p>
        <div className="mb-10 rounded-lg bg-gray-50 p-6">
          <p className="text-sm text-gray-700">
            Has finalizado todas las lecciones y evaluaciones de este curso. Tu
            dedicación y esfuerzo han dado sus frutos.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" className="px-8">
            Descargar certificado
          </Button>
          <Button variant="outline" size="lg" className="px-8">
            Volver al panel
          </Button>
        </div>
      </div>
    </div>
  );
}
