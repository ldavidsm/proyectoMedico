'use client';
import { useRouter } from 'next/navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, Sparkles, ArrowRight, Home } from 'lucide-react';

type Props = {
  show: boolean;
  onClose: () => void;
  courseName: string;
  onCreateAnother?: () => void;
};

export default function SuccessModal({ show, onClose, courseName, onCreateAnother }: Props) {
  const router = useRouter();

  if (!show) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="max-w-sm w-full p-5 text-center shadow-2xl animate-slide-up">
        {/* Icono de éxito con animación */}
        <div className="relative mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div className="absolute top-0 right-1/4 animate-bounce">
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="absolute bottom-1 left-1/4 animate-bounce delay-100">
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
        </div>

        {/* Mensaje principal */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          ¡Curso publicado con éxito!
        </h2>
        <p className="text-base text-gray-700 mb-1">
          <strong>{courseName || 'Tu curso'}</strong>
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Ha sido enviado para revisión de calidad. Te notificaremos en un plazo máximo de 72 horas cuando esté aprobado y disponible.
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
          {onCreateAnother && (
            <Button
              onClick={onCreateAnother}
              variant="outline"
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              Crear otro curso
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
