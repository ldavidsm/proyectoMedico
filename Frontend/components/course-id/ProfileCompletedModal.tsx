import { CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface ProfileCompletedModalProps {
  onClose: () => void;
  fromEnrollment?: boolean;
  onEnroll?: () => void;
}

export function ProfileCompletedModal({ onClose, fromEnrollment, onEnroll }: ProfileCompletedModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl mb-3 text-slate-900">
            ¡Perfil completado con éxito!
          </h2>
          <p className="text-slate-600 mb-4 leading-relaxed">
            Gracias por completar su perfil profesional. Esta información nos ayuda a mantener 
            la calidad de nuestra plataforma y ofrecerle una experiencia formativa personalizada.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Ahora puede acceder a todo el contenido del curso y proceder con su inscripción.
          </p>
          {fromEnrollment && onEnroll ? (
            <Button onClick={onEnroll} size="lg" className="w-full">
              Inscribirse ahora
            </Button>
          ) : (
            <Button onClick={onClose} size="lg" className="w-full">
              Continuar explorando
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}