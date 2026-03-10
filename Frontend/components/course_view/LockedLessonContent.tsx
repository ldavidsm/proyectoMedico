import { Button } from "../ui/button";
import { Lock, CheckCircle, ArrowRight } from "lucide-react";

interface LockedLessonContentProps {
  lessonTitle: string;
  onGoBack?: () => void;
}

export function LockedLessonContent({
  lessonTitle,
  onGoBack,
}: LockedLessonContentProps) {
  return (
    <div className="mx-auto max-w-3xl pb-24">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
          <Lock className="h-10 w-10 text-blue-600" />
        </div>
        
        <h2 className="mb-3 text-2xl font-medium text-gray-900">
          ¡Continúa avanzando! Desbloquea acceso para continuar.
        </h2>
        
        <p className="mb-8 text-base text-gray-600 max-w-2xl">
          Este contenido está fuera de tu acceso de vista previa. Para continuar
          con tu formación médica, desbloquea todos los módulos y sigue
          desarrollando tus habilidades profesionales.
        </p>

        <div className="w-full max-w-xl space-y-4 mb-8 text-left">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <strong>Completa las evaluaciones previas</strong> para validar tu
              conocimiento y desbloquear nuevo contenido
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <strong>Continúa tu camino de aprendizaje</strong> con este curso y
              todos los demás en la plataforma MedLearn
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <strong>Desarrolla competencias clínicas eficazmente</strong> con
              contenido validado por expertos
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <strong>Obtén certificación profesional</strong> reconocida tras
              completar exitosamente el curso
            </p>
          </div>
        </div>
      </div>

      {/* Botón fijo en la parte inferior */}
      {onGoBack && (
        <div className="fixed bottom-0 right-0 left-72 bg-white border-t border-gray-200 p-4">
          <div className="mx-auto max-w-3xl flex justify-end">
            <Button onClick={onGoBack} variant="outline" size="lg">
              Volver al contenido disponible
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}