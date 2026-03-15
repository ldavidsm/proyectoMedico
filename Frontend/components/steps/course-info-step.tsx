import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Sparkles, Plus, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AlertModal } from '@/components/ui/alert-modal';

interface CourseInfoStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function CourseInfoStep({ formData, updateFormData }: CourseInfoStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [queAprendera, setQueAprendera] = useState<string[]>(
    formData.queAprendera?.length > 0 ? formData.queAprendera : ['']
  );

  // Información de los módulos del Paso 1
  const modulosCreados = formData.modulos || [];
  const tieneModulos = modulosCreados.length > 0;

  let totalBloques = 0;
  let bloquesCompletos = 0;
  let bloquesIncompletos = 0;

  modulosCreados.forEach((modulo: any) => {
    modulo.bloques?.forEach((bloque: any) => {
      totalBloques++;

      // Validar si el bloque está completo según su tipo
      let estaCompleto = false;

      if (bloque.tipo === 'video') {
        // Video completo: tiene título Y archivo subido
        estaCompleto = bloque.titulo && bloque.archivo;
      } else if (bloque.tipo === 'lectura') {
        // Lectura completa: tiene título Y archivo PDF subido
        estaCompleto = bloque.titulo && bloque.archivo;
      } else if (bloque.tipo === 'tarea') {
        // Tarea completa: tiene título E instrucciones
        estaCompleto = bloque.titulo && bloque.instrucciones && bloque.instrucciones.trim().length > 0;
      } else if (bloque.tipo === 'examen') {
        // Examen completo: tiene título Y al menos una pregunta con opciones
        estaCompleto = bloque.titulo && bloque.preguntas && bloque.preguntas.length > 0 &&
          bloque.preguntas[0].pregunta && bloque.preguntas[0].pregunta.trim().length > 0;
      }

      if (estaCompleto) {
        bloquesCompletos++;
      } else {
        bloquesIncompletos++;
      }
    });
  });

  // Determinar el estado general
  const todoCompleto = tieneModulos && totalBloques > 0 && bloquesIncompletos === 0;
  const algunoIncompleto = tieneModulos && bloquesIncompletos > 0;

  const generarConIA = () => {
    // Validar que hay módulos del Paso 1
    if (!tieneModulos) {
      setShowAlertModal(true);
      return;
    }

    setIsGenerating(true);

    // Simulación de procesamiento con IA basada en los módulos del Paso 1
    setTimeout(() => {
      // Analizar los bloques de contenido
      let totalVideos = 0;
      let totalExamenes = 0;
      let totalTareas = 0;
      let totalLecturas = 0;

      modulosCreados.forEach((modulo: any) => {
        modulo.bloques?.forEach((bloque: any) => {
          if (bloque.tipo === 'video') totalVideos++;
          if (bloque.tipo === 'examen') totalExamenes++;
          if (bloque.tipo === 'tarea') totalTareas++;
          if (bloque.tipo === 'lectura') totalLecturas++;
        });
      });

      // Generar título si no existe
      let tituloGenerado = formData.tituloCurso || '';
      if (!tituloGenerado) {
        const primerModulo = modulosCreados[0]?.nombre || '';
        if (primerModulo) {
          tituloGenerado = `Curso completo: ${primerModulo}`;
        } else {
          tituloGenerado = `Curso profesional de medicina`;
        }
      }

      // Generar descripción corta basada en el contenido real
      let partes = [];
      if (totalVideos > 0) partes.push(`${totalVideos} video${totalVideos > 1 ? 's' : ''}`);
      if (totalLecturas > 0) partes.push(`${totalLecturas} lectura${totalLecturas > 1 ? 's' : ''}`);
      if (totalTareas > 0) partes.push(`actividades prácticas`);
      if (totalExamenes > 0) partes.push(`evaluaciones`);

      const contenidoStr = partes.length > 0 ? partes.join(', ') : 'contenido estructurado';
      const descripcionCorta = `Domina este tema con ${modulosCreados.length} módulo${modulosCreados.length > 1 ? 's' : ''} y ${totalBloques} recursos: ${contenidoStr}. Aplicable desde el primer día en tu práctica clínica.`;

      // Generar descripción detallada
      const descripcionDetallada = `Este curso ha sido diseñado específicamente para profesionales de la salud que buscan actualizar sus conocimientos de manera práctica y eficiente.\n\nA través de ${modulosCreados.length} módulo${modulosCreados.length > 1 ? 's' : ''} cuidadosamente estructurados, desarrollarás las competencias necesarias para aplicar estos conocimientos inmediatamente en tu práctica clínica diaria.\n\n${totalVideos > 0 ? `📹 ${totalVideos} video${totalVideos > 1 ? 's' : ''} explicativo${totalVideos > 1 ? 's' : ''}\n` : ''}${totalLecturas > 0 ? `📚 ${totalLecturas} lectura${totalLecturas > 1 ? 's' : ''} complementaria${totalLecturas > 1 ? 's' : ''}\n` : ''}${totalTareas > 0 ? `✍️ Ejercicios prácticos para consolidar\n` : ''}${totalExamenes > 0 ? `✅ Evaluaciones para validar tu aprendizaje\n` : ''}\n\nCada módulo está diseñado para maximizar tu tiempo y asegurar que puedas aplicar lo aprendido de inmediato.`;

      // Generar lista "Qué aprenderás" basada en los nombres de módulos
      const queAprendera = modulosCreados.map((modulo: any, index: number) => {
        const nombre = modulo.nombre || `Módulo ${index + 1}`;
        const descripcion = modulo.descripcion;
        return descripcion ? `${nombre}: ${descripcion}` : nombre;
      }).slice(0, 6);

      // Si hay menos de 3 puntos, agregar genéricos
      if (queAprendera.length < 3) {
        queAprendera.push('Aplicar los conocimientos en casos clínicos reales');
        queAprendera.push('Tomar decisiones basadas en evidencia actualizada');
      }

      // Generar requisitos
      const requisitos = 'Título profesional en ciencias de la salud (médico, enfermero, o afín). No se requiere experiencia previa en el tema específico. Actitud proactiva para aplicar lo aprendido.';

      // Generar "A quién está dirigido"
      const dirigidoA = 'Médicos generales, médicos residentes, especialistas y profesionales de la salud que deseen actualizar sus conocimientos y mejorar su práctica clínica con información basada en evidencia.';

      updateFormData({
        tituloCurso: tituloGenerado,
        descripcionCorta: descripcionCorta.slice(0, 200), // Limitar a 200 caracteres
        descripcionDetallada,
        queAprendera,
        requisitos,
        dirigidoA
      });

      setQueAprendera(queAprendera);
      setIsGenerating(false);
    }, 2000);
  };

  const agregarPunto = () => {
    const nuevosItems = [...queAprendera, ''];
    setQueAprendera(nuevosItems);
    updateFormData({ queAprendera: nuevosItems });
  };

  const actualizarPunto = (index: number, valor: string) => {
    const nuevosItems = [...queAprendera];
    nuevosItems[index] = valor;
    setQueAprendera(nuevosItems);
    updateFormData({ queAprendera: nuevosItems });
  };

  const eliminarPunto = (index: number) => {
    if (queAprendera.length > 1) {
      const nuevosItems = queAprendera.filter((_, i) => i !== index);
      setQueAprendera(nuevosItems);
      updateFormData({ queAprendera: nuevosItems });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de IA */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Información del curso</h2>
          <p className="text-gray-600">
            Esta información aparecerá en la tarjeta de tu curso y ayudará a los estudiantes a decidir si inscribirse
          </p>
        </div>
        <Button
          onClick={generarConIA}
          disabled={isGenerating}
          className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 whitespace-nowrap"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generar con IA
            </>
          )}
        </Button>
      </div>

      {/* Banner de estado de módulos del Paso 1 */}
      {todoCompleto ? (
        // ESTADO VERDE: Todo está completo
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900 mb-1">
                ✅ {modulosCreados.length} módulo{modulosCreados.length > 1 ? 's' : ''} y {totalBloques} bloque{totalBloques !== 1 ? 's' : ''} completos
              </p>
              <p className="text-xs text-green-700">
                Todo el contenido está listo para procesar con IA
              </p>
            </div>
          </div>
        </div>
      ) : algunoIncompleto ? (
        // ESTADO AMARILLO: Hay bloques pero están incompletos
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 mb-1">
                ⚠️ Detectados {modulosCreados.length} módulo{modulosCreados.length > 1 ? 's' : ''}, pero les falta información
              </p>
              <p className="text-xs text-amber-700 mb-2">
                {bloquesCompletos} de {totalBloques} bloques completos • {bloquesIncompletos} necesitan más datos
              </p>
              <p className="text-xs text-amber-800 font-medium">
                Vuelve al Paso 1 y completa: videos (sube archivo), lecturas (sube PDF), tareas (instrucciones), exámenes (preguntas)
              </p>
            </div>
          </div>
        </div>
      ) : tieneModulos ? (
        // ESTADO AMARILLO: Hay módulos pero sin bloques
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 mb-1">
                ⚠️ {modulosCreados.length} módulo{modulosCreados.length > 1 ? 's' : ''} creado{modulosCreados.length > 1 ? 's' : ''}, pero sin contenido
              </p>
              <p className="text-xs text-amber-700">
                Vuelve al Paso 1 y agrega bloques de contenido (videos, lecturas, tareas o exámenes) a tus módulos
              </p>
            </div>
          </div>
        </div>
      ) : (
        // ESTADO NARANJA: No hay módulos
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-900 mb-1">
                No se detectaron módulos del Paso 1
              </p>
              <p className="text-xs text-orange-700">
                Para usar "Generar con IA", primero debes crear módulos en el Paso 1 (Construye tu curso)
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="p-6 space-y-6">
        {/* Título del curso */}
        <div>
          <Label htmlFor="tituloCurso">Título del curso *</Label>
          <Input
            id="tituloCurso"
            value={formData.tituloCurso || ''}
            onChange={(e) => updateFormData({ tituloCurso: e.target.value })}
            placeholder="Ej: Electrocardiografía Clínica Avanzada"
            className="text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">Un título claro y descriptivo que capte la atención</p>
        </div>

        {/* Descripción corta */}
        <div>
          <Label htmlFor="descripcionCorta">Descripción corta *</Label>
          <Textarea
            id="descripcionCorta"
            value={formData.descripcionCorta || ''}
            onChange={(e) => updateFormData({ descripcionCorta: e.target.value })}
            placeholder="Un resumen breve que aparecerá en la tarjeta del curso..."
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.descripcionCorta?.length || 0}/200 caracteres - Aparecerá en la vista de catálogo
          </p>
        </div>

        {/* Descripción detallada */}
        <div>
          <Label htmlFor="descripcionDetallada">Descripción detallada *</Label>
          <Textarea
            id="descripcionDetallada"
            value={formData.descripcionDetallada || ''}
            onChange={(e) => updateFormData({ descripcionDetallada: e.target.value })}
            placeholder="Explica en detalle de qué trata el curso, qué metodología usarás, por qué es valioso..."
            rows={6}
            className="resize-y"
          />
          <p className="text-xs text-gray-500 mt-1">
            Descripción completa que aparecerá en la página del curso. Sé específico y persuasivo.
          </p>
        </div>

        {/* Qué aprenderás */}
        <div>
          <Label className="mb-3 block">¿Qué aprenderás? *</Label>
          <p className="text-sm text-gray-600 mb-3">Lista los puntos clave que los estudiantes dominarán</p>

          <div className="space-y-3">
            {queAprendera.map((item, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mt-1.5">
                  {index + 1}
                </div>
                <Input
                  value={item}
                  onChange={(e) => actualizarPunto(index, e.target.value)}
                  placeholder="Ej: Interpretar electrocardiogramas complejos"
                  className="flex-1"
                />
                {queAprendera.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarPunto(index)}
                    className="text-red-600 hover:text-red-700 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={agregarPunto}
            variant="outline"
            size="sm"
            className="w-full mt-3"
          >
            <Plus className="w-3 h-3 mr-1" />
            Agregar punto
          </Button>
        </div>

        {/* Requisitos previos */}
        <div>
          <Label htmlFor="requisitos">Requisitos previos</Label>
          <Textarea
            id="requisitos"
            value={formData.requisitos || ''}
            onChange={(e) => updateFormData({ requisitos: e.target.value })}
            placeholder="Ej: Conocimientos básicos de anatomía cardiovascular, experiencia clínica no requerida"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            ¿Qué conocimientos o experiencia previa necesitan los estudiantes?
          </p>
        </div>

        {/* A quién está dirigido */}
        <div>
          <Label htmlFor="dirigidoA">¿A quién está dirigido? *</Label>
          <Textarea
            id="dirigidoA"
            value={formData.dirigidoA || ''}
            onChange={(e) => updateFormData({ dirigidoA: e.target.value })}
            placeholder="Ej: Médicos residentes, cardiólogos, médicos generales que deseen especializarse..."
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Define tu audiencia objetivo con claridad
          </p>
        </div>
      </Card>

      {/* Indicador de progreso */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-purple-900">
          <div className="w-2 h-2 rounded-full bg-purple-600"></div>
          <p>
            <strong>Consejo:</strong> Una descripción clara y atractiva aumenta las inscripciones.
            Si no estás seguro, usa el botón "Generar con IA" como punto de partida.
          </p>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Falta información del curso"
        message="Primero necesitas crear módulos en el Paso 1 para generar la información con IA."
        type="warning"
      />
    </div>
  );
}