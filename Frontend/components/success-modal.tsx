import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

type Props = {
  show: boolean;
  onClose: () => void;
  courseName: string;
};

export default function SuccessModal({ show, onClose, courseName }: Props) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="max-w-lg w-full p-8 text-center shadow-2xl animate-slide-up">
        {/* Icono de éxito con animación */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <div className="absolute top-0 right-1/4 animate-bounce">
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="absolute bottom-2 left-1/4 animate-bounce delay-100">
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
        </div>

        {/* Mensaje principal */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          ¡Curso publicado con éxito!
        </h2>
        <p className="text-lg text-gray-700 mb-2">
          <strong>{courseName || 'Tu curso'}</strong>
        </p>
        <p className="text-gray-600 mb-6">
          Ha sido enviado para revisión de calidad. Te notificaremos en un plazo máximo de 72 horas cuando esté aprobado y disponible para tus alumnos.
        </p>

        {/* Estadísticas de celebración */}
        <div className="grid grid-cols-3 gap-4 mb-8 bg-purple-50 rounded-lg p-4">
          <div>
            <p className="text-2xl font-bold text-purple-600">✓</p>
            <p className="text-xs text-gray-600 mt-1">Enviado</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">72h</p>
            <p className="text-xs text-gray-600 mt-1">Revisión</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">∞</p>
            <p className="text-xs text-gray-600 mt-1">Alumnos</p>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-3 text-sm">Próximos pasos:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">1.</span>
              <span>Revisaremos la calidad técnica y académica de tu curso</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">2.</span>
              <span>Te enviaremos un correo con el resultado (o feedback si necesita ajustes)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">3.</span>
              <span>Una vez aprobado, estará visible en la plataforma para inscripciones</span>
            </li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
          >
            Volver al inicio
          </Button>
          <Button 
            onClick={onClose}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Crear otro curso
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}