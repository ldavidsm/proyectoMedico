import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { CheckCircle2, AlertCircle, FileText, Video, Target, Euro, Edit } from 'lucide-react';
import type { CourseFormData } from '../course-creation-wizard';

type Props = {
  formData: CourseFormData;
  onEdit: (step: number) => void;
};

export default function ReviewStep({ formData, onEdit }: Props) {
  const isComplete = (field: any) => {
    if (Array.isArray(field)) return field.length > 0 && field.some(item => item && item.trim && item.trim().length > 0);
    if (typeof field === 'string') return field.trim().length > 0;
    if (typeof field === 'object' && field !== null) {
      if ('completed' in field) return field.completed;
      return Object.values(field).some((v) => v && v !== '' && v !== false);
    }
    return !!field;
  };

  // Checklist de campos obligatorios
  const checks = {
    basico: {
      nombre: 'Definición del curso',
      completo:
        isComplete(formData.titulo) &&
        isComplete(formData.categoria) &&
        isComplete(formData.tema) &&
        isComplete(formData.nivelCurso) &&
        formData.publicoObjetivo.length > 0,
      paso: 0,
    },
    estructura: {
      nombre: 'Estructura pedagógica',
      completo: formData.estructuraPersonalizada.length > 0,
      paso: 1,
    },
    contenido: {
      nombre: 'Contenido del curso',
      completo:
        formData.videos.length > 0 &&
        (isComplete(formData.descripcionDetallada.queAprendera) ||
          isComplete(formData.descripcionDetallada.requisitos) ||
          isComplete(formData.descripcionDetallada.dirigidoA) ||
          isComplete(formData.descripcionDetallada.metodologia)),
      paso: 2,
    },
    calidad: {
      nombre: 'Objetivos y calidad académica',
      completo:
        formData.objetivosAprendizaje.filter((obj) => obj.trim()).length > 0 &&
        formData.modalidades.length > 0 &&
        Object.values(formData.criteriosCalidad).some((v) => v === true),
      paso: 3,
    },
    precio: {
      nombre: 'Precio y publicación',
      completo:
        isComplete(formData.precio) &&
        isComplete(formData.tipoAcceso) &&
        isComplete(formData.visibilidad),
      paso: 4,
    },
  };

  const todasCompletas = Object.values(checks).every((check) => check.completo);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Revisión Final</h3>
        <p className="text-sm text-gray-600">
          Verifica que todo esté correcto antes de enviar a revisión
        </p>
      </div>

      {/* Checklist General */}
      <Card
        className={`p-5 ${
          todasCompletas
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}
      >
        <div className="flex items-start gap-3 mb-4">
          {todasCompletas ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4
              className={`font-semibold mb-2 ${
                todasCompletas ? 'text-green-900' : 'text-yellow-900'
              }`}
            >
              {todasCompletas
                ? '¡Todo listo para enviar a revisión!'
                : 'Completa las siguientes secciones'}
            </h4>
            <div className="space-y-2">
              {Object.values(checks).map((check, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {check.completo ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                    <span
                      className={`text-sm ${
                        check.completo
                          ? todasCompletas
                            ? 'text-green-800'
                            : 'text-gray-700'
                          : 'text-yellow-800 font-medium'
                      }`}
                    >
                      {check.nombre}
                    </span>
                  </div>
                  {!check.completo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(check.paso)}
                      className="text-purple-600 hover:text-purple-700 h-7"
                    >
                      Completar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Información Básica */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Información Básica</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(0)}
            className="text-purple-600 hover:text-purple-700"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Título</p>
            <p className="text-sm font-medium text-gray-900">
              {formData.titulo || <span className="text-gray-400">No especificado</span>}
            </p>
          </div>

          {formData.subtitulo && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-gray-500 mb-1">Subtítulo</p>
                <p className="text-sm text-gray-700">{formData.subtitulo}</p>
              </div>
            </>
          )}

          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Categoría</p>
              {formData.categoria ? (
                <Badge className="bg-purple-100 text-purple-800">
                  {formData.categoria}
                </Badge>
              ) : (
                <span className="text-sm text-gray-400">No especificada</span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Nivel</p>
              {formData.nivelCurso ? (
                <Badge variant="secondary">
                  {formData.nivelCurso.charAt(0).toUpperCase() +
                    formData.nivelCurso.slice(1)}
                </Badge>
              ) : (
                <span className="text-sm text-gray-400">No especificado</span>
              )}
            </div>
          </div>

          {formData.publicoObjetivo.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-gray-500 mb-2">Público objetivo</p>
                <div className="flex flex-wrap gap-2">
                  {formData.publicoObjetivo.map((publico) => (
                    <Badge key={publico} variant="outline" className="text-xs">
                      {publico}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Estructura Pedagógica */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Estructura Pedagógica</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
            className="text-purple-600 hover:text-purple-700"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-2">
              Estructura Personalizada ({formData.estructuraPersonalizada.length})
            </p>
            {formData.estructuraPersonalizada.length > 0 ? (
              <div className="space-y-2">
                {formData.estructuraPersonalizada.slice(0, 3).map((estructura, index) => (
                  <div
                    key={estructura.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <span className="text-gray-900">
                      {index + 1}. {estructura.titulo || estructura.seccion || 'Sin título'}
                    </span>
                    {estructura.duracion && (
                      <Badge variant="outline" className="text-xs">
                        {estructura.duracion} min
                      </Badge>
                    )}
                  </div>
                ))}
                {formData.estructuraPersonalizada.length > 3 && (
                  <p className="text-xs text-gray-500 text-center py-1">
                    y {formData.estructuraPersonalizada.length - 3} estructura(s) más
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No hay estructuras agregadas</p>
            )}
          </div>
        </div>
      </Card>

      {/* Contenido */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Contenido</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(2)}
            className="text-purple-600 hover:text-purple-700"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-2">
              Videos ({formData.videos.length})
            </p>
            {formData.videos.length > 0 ? (
              <div className="space-y-2">
                {formData.videos.slice(0, 3).map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <span className="text-gray-900">
                      {index + 1}. {video.titulo || video.seccion || 'Sin título'}
                    </span>
                    {video.duracion && (
                      <Badge variant="outline" className="text-xs">
                        {video.duracion} min
                      </Badge>
                    )}
                  </div>
                ))}
                {formData.videos.length > 3 && (
                  <p className="text-xs text-gray-500 text-center py-1">
                    y {formData.videos.length - 3} video(s) más
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No hay videos agregados</p>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-xs text-gray-500 mb-1">Presentación</p>
            <p className="text-sm text-gray-700">
              {formData.presentacion ? (
                formData.presentacion.name
              ) : (
                <span className="text-gray-400">No cargada</span>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Objetivos y Calidad */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Objetivos y Calidad</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(3)}
            className="text-purple-600 hover:text-purple-700"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-2">Objetivos de aprendizaje</p>
            {formData.objetivosAprendizaje.filter((obj) => obj.trim()).length > 0 ? (
              <ul className="space-y-1">
                {formData.objetivosAprendizaje
                  .filter((obj) => obj.trim())
                  .slice(0, 3)
                  .map((objetivo, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>{objetivo}</span>
                    </li>
                  ))}
                {formData.objetivosAprendizaje.filter((obj) => obj.trim()).length > 3 && (
                  <p className="text-xs text-gray-500 mt-1">
                    y {formData.objetivosAprendizaje.filter((obj) => obj.trim()).length - 3} más
                  </p>
                )}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No hay objetivos definidos</p>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-xs text-gray-500 mb-2">Modalidades</p>
            <div className="flex flex-wrap gap-2">
              {formData.modalidades.length > 0 ? (
                formData.modalidades.map((modalidad) => (
                  <Badge
                    key={modalidad}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 text-xs"
                  >
                    {modalidad}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-400">No seleccionadas</span>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs text-gray-500 mb-2">Bibliografía</p>
            <p className="text-sm text-gray-700">
              {formData.bibliografia.length > 0 ? (
                `${formData.bibliografia.length} referencia(s) agregada(s)`
              ) : (
                <span className="text-gray-400">No hay referencias</span>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Precio y Publicación */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Euro className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Precio y Publicación</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(4)}
            className="text-purple-600 hover:text-purple-700"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Precio</p>
              {formData.precio ? (
                <p className="text-lg font-bold text-gray-900">{formData.precio} €</p>
              ) : (
                <span className="text-sm text-gray-400">No especificado</span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tipo de acceso</p>
              {formData.tipoAcceso ? (
                <Badge variant="secondary" className="text-xs">
                  {formData.tipoAcceso === 'pago-unico' && 'Pago único'}
                  {formData.tipoAcceso === 'suscripcion' && 'Suscripción'}
                  {formData.tipoAcceso === 'mixto' && 'Mixto'}
                </Badge>
              ) : (
                <span className="text-sm text-gray-400">No especificado</span>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs text-gray-500 mb-1">Visibilidad</p>
            {formData.visibilidad ? (
              <Badge
                variant="outline"
                className={
                  formData.visibilidad === 'publico'
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : 'bg-gray-100 text-gray-700'
                }
              >
                {formData.visibilidad === 'publico' ? 'Público' : 'Privado'}
              </Badge>
            ) : (
              <span className="text-sm text-gray-400">No especificada</span>
            )}
          </div>
        </div>
      </Card>

      {!todasCompletas && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-900">
            <strong>Importante:</strong> Completa todas las secciones obligatorias para poder
            enviar tu curso a revisión. Usa los botones "Completar" o "Editar" para ir a cada
            sección.
          </p>
        </Card>
      )}
    </div>
  );
}