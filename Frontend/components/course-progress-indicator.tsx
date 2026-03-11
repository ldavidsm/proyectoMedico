import { Card } from './ui/card';
import { Video, Clock, Target, BookOpen, CheckCircle2, Lightbulb } from 'lucide-react';
import type { CourseFormData } from './course-creation-wizard';

type Props = {
  formData: CourseFormData;
};

export default function CourseProgressIndicator({ formData }: Props) {
  // Calcular métricas
  const totalMinutos = formData.videos.reduce((sum, video) => {
    const mins = parseInt(video.duracion) || 0;
    return sum + mins;
  }, 0);

  const totalVideos = formData.videos.length;
  const totalObjetivos = formData.objetivosAprendizaje.filter(obj => obj.trim()).length;
  const totalReferencias = formData.bibliografia.length;

  // Evaluar calidad
  const getDuracionStatus = () => {
    if (totalMinutos === 0) return { color: 'gray', text: 'Sin contenido aún', icon: '⏱️' };
    if (totalMinutos < 20) return { color: 'yellow', text: 'Muy corto', icon: '⚠️' };
    if (totalMinutos >= 30 && totalMinutos <= 60) return { color: 'green', text: 'Duración óptima', icon: '✅' };
    if (totalMinutos > 60 && totalMinutos <= 90) return { color: 'blue', text: 'Contenido extenso', icon: '📚' };
    return { color: 'purple', text: 'Curso completo', icon: '🎓' };
  };

  const duracionStatus = getDuracionStatus();

  // Hints contextuales
  const getHint = () => {
    if (totalVideos === 0) return { show: false, text: '' };
    if (totalMinutos < 30) return { 
      show: true, 
      text: 'Los cursos con 30-60 min de contenido tienen mejor tasa de finalización' 
    };
    if (totalObjetivos === 0 && totalVideos > 0) return {
      show: true,
      text: 'Agregar objetivos de aprendizaje aumenta un 40% la tasa de inscripción'
    };
    if (totalObjetivos > 0 && totalReferencias === 0) return {
      show: true,
      text: 'Las referencias bibliográficas dan credibilidad académica a tu curso'
    };
    if (totalVideos > 0 && formData.estructuraPersonalizada.length === 0) return {
      show: true,
      text: 'Una estructura clara ayuda a tus alumnos a seguir el aprendizaje'
    };
    return { show: false, text: '' };
  };

  const hint = getHint();

  // No mostrar nada si no hay contenido
  if (totalVideos === 0 && totalObjetivos === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-50 to-white border-purple-200 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-purple-900 mb-3">Tu curso hasta ahora:</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Videos */}
            {totalVideos > 0 && (
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-lg font-bold text-purple-600">{totalVideos}</p>
                  <p className="text-xs text-gray-600">video{totalVideos !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {/* Duración */}
            {totalMinutos > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-lg font-bold text-purple-600">{totalMinutos}</p>
                  <p className="text-xs text-gray-600">minutos</p>
                </div>
              </div>
            )}

            {/* Objetivos */}
            {totalObjetivos > 0 && (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-lg font-bold text-purple-600">{totalObjetivos}</p>
                  <p className="text-xs text-gray-600">objetivo{totalObjetivos !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {/* Referencias */}
            {totalReferencias > 0 && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-lg font-bold text-purple-600">{totalReferencias}</p>
                  <p className="text-xs text-gray-600">referencia{totalReferencias !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status badge */}
        {totalMinutos > 0 && (
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
            duracionStatus.color === 'green' ? 'bg-green-100 text-green-700' :
            duracionStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
            duracionStatus.color === 'blue' ? 'bg-blue-100 text-blue-700' :
            duracionStatus.color === 'purple' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {duracionStatus.icon} {duracionStatus.text}
          </div>
        )}
      </div>

      {/* Hint contextual */}
      {hint.show && (
        <div className="mt-3 flex items-start gap-2 text-xs text-purple-700 bg-purple-100 p-2 rounded">
          <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{hint.text}</span>
        </div>
      )}
    </Card>
  );
}
