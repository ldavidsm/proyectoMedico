import { Button } from "../ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

interface ModuleCompleteProps {
  moduleNumber: number;
  moduleName: string;
  onContinue: () => void;
}

export function ModuleComplete({
  moduleNumber,
  moduleName,
  onContinue,
}: ModuleCompleteProps) {
  return (
    <div className="mx-auto max-w-2xl pb-24">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="mb-3 text-3xl font-medium text-gray-900">
          ¡Módulo {moduleNumber} completado!
        </h1>

        <p className="mb-8 text-lg text-gray-600">
          Has completado exitosamente <strong>{moduleName}</strong>
        </p>

        <div className="w-full rounded-lg border border-green-200 bg-green-50 p-6">
          <p className="text-sm text-green-800">
            Excelente progreso. Continúa con el siguiente módulo para seguir
            desarrollando tus competencias profesionales.
          </p>
        </div>
      </div>

      {/* Botón fijo en la parte inferior */}
      <div className="fixed bottom-0 right-0 left-72 bg-white border-t border-gray-200 p-4">
        <div className="mx-auto max-w-3xl flex justify-end">
          <Button onClick={onContinue} size="lg">
            Continuar al siguiente módulo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}