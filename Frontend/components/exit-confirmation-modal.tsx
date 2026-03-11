import { Card } from './ui/card';
import { Button } from './ui/button';
import { Save, X, ArrowLeft } from 'lucide-react';

type Props = {
  show: boolean;
  onSaveAndExit: () => void;
  onDiscardAndExit: () => void;
  onCancel: () => void;
  courseName?: string;
};

export default function ExitConfirmationModal({ 
  show, 
  onSaveAndExit, 
  onDiscardAndExit, 
  onCancel,
  courseName 
}: Props) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4 animate-fade-in">
      <Card className="max-w-lg w-full shadow-2xl">
        <div className="p-6">
          {/* Título */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Salir de la edición del curso
            </h2>
          </div>

          {/* Mensaje tranquilizador */}
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">
              Puedes guardar tu progreso y continuar más tarde desde el panel del curso.
            </p>
          </div>

          {/* Opciones */}
          <div className="space-y-3">
            {/* Opción principal: Guardar y volver al panel */}
            <Button
              onClick={onSaveAndExit}
              className="w-full justify-start gap-3 h-auto py-4 bg-purple-600 hover:bg-purple-700 overflow-hidden"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Save className="w-5 h-5" />
              </div>
              <div className="text-left flex-1 overflow-hidden">
                <div className="font-semibold text-base whitespace-normal">Guardar y volver al panel del curso</div>
                <div className="text-sm text-purple-100 mt-0.5 whitespace-normal">El curso se guardará como borrador. Podrás seguir editándolo cuando quieras.</div>
              </div>
            </Button>

            {/* Opción secundaria: Salir sin guardar */}
            <Button
              onClick={onDiscardAndExit}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-gray-300 hover:bg-gray-50 overflow-hidden"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <X className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left flex-1 overflow-hidden">
                <div className="font-semibold text-base text-gray-900 whitespace-normal">Salir sin guardar y volver al panel</div>
                <div className="text-sm text-gray-600 mt-0.5 whitespace-normal">Se perderán los cambios no guardados desde la última vez.</div>
              </div>
            </Button>

            {/* Opción tranquila: Seguir editando */}
            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-full h-auto py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Seguir editando
            </Button>
          </div>

          {/* Micro-texto tranquilizador */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 flex items-start gap-2">
              <span className="text-base">💡</span>
              <span>Este curso no será visible para alumnos hasta que lo publiques.</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}