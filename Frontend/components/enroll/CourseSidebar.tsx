import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Clock, BookOpen, Award, Globe } from "lucide-react";

interface CourseSidebarProps {
  course: {
    title: string;
    instructor: string;
    modality: string;
    duration: string;
    accessType: string;
    level: string;
    price: number;
    currency: string;
  };
  onEnroll: () => void;
  disabled: boolean;
}

export function CourseSidebar({ course, onEnroll, disabled }: CourseSidebarProps) {
  return (
    <Card className="overflow-hidden bg-white border border-gray-200 shadow-lg">
      {/* Precio destacado */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6">
        <p className="text-sm opacity-90 mb-1">Inversión del programa</p>
        <p className="text-5xl mb-1">
          {course.price.toLocaleString("es-ES")} {course.currency}
        </p>
        <p className="text-xs opacity-75">IVA incluido</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Info del curso */}
        <div>
          <h3 className="text-lg mb-4 text-gray-900">{course.title}</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Instructor</p>
                <p className="text-gray-900">{course.instructor}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Duración</p>
                <p className="text-gray-900">{course.duration}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Award className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Nivel</p>
                <p className="text-gray-900">{course.level}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Modalidad</p>
                <p className="text-gray-900">{course.modality}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Mensaje de advertencia si falta confirmación */}
        {disabled && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800 leading-relaxed">
              Complete las confirmaciones obligatorias para continuar
            </p>
          </div>
        )}

        {/* Botón de acción */}
        <Button
          onClick={onEnroll}
          disabled={disabled}
          size="lg"
          className="w-full text-base py-6"
        >
          Proceder al pago
        </Button>

        {/* Microcopy tranquilizador */}
        <div className="text-xs text-gray-500 text-center leading-relaxed">
          <p>
            El pago se realizará de forma segura. En el siguiente paso podrá
            elegir el método de pago disponible.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Garantías */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-gray-600">Acceso {course.accessType.toLowerCase()}</p>
          </div>
          
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-gray-600">Certificado al completar</p>
          </div>

          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-gray-600">Garantía de satisfacción 30 días</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
