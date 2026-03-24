import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { CheckCircle2, AlertCircle, Video, Users, Clock, BookOpen, Star, Edit2, Play } from 'lucide-react';
import type { CourseFormData } from '../course-creation-wizard';

type Props = {
  formData: CourseFormData;
  onEdit: (step: number) => void;
};

export default function ReviewStep({ formData, onEdit }: Props) {
  // Calcular minutos totales
  const totalMinutos = formData.videos.reduce((sum, video) => {
    const mins = parseInt(video.duracion) || 0;
    return sum + mins;
  }, 0);

  // Validaciones
  const validaciones = {
    informacionBasica: formData.titulo && formData.categoria && formData.nivelCurso && formData.publicoObjetivo.length > 0,
    estructura: formData.estructuraPersonalizada.length > 0,
    contenido: formData.videos.length > 0,
    calidad: formData.objetivosAprendizaje.filter(obj => obj.trim()).length > 0 && formData.modalidades.length > 0,
    precio: formData.ofertas && formData.ofertas.length > 0 && formData.visibilidad,
  };

  const todasCompletas = Object.values(validaciones).every(v => v);

  return (
    <div data-testid="review-step-container" className="space-y-6">
      {/* Header inspirador */}
      <div className="text-center">
        {todasCompletas ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Tu curso está listo!</h3>
            <p className="text-gray-600">
              Así es como lo verán tus alumnos en la plataforma
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Casi listo</h3>
            <p className="text-gray-600">
              Completa las secciones pendientes para publicar tu curso
            </p>
          </>
        )}
      </div>

      {/* Validaciones pendientes */}
      {!todasCompletas && (
        <Card className="p-5 bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Secciones por completar
          </h4>
          <div className="space-y-2">
            {!validaciones.informacionBasica && (
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm text-yellow-900">• Información básica del curso</span>
                <Button variant="ghost" size="sm" onClick={() => onEdit(0)} className="text-purple-600 h-8">
                  Completar
                </Button>
              </div>
            )}
            {!validaciones.estructura && (
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm text-yellow-900">• Estructura del curso</span>
                <Button variant="ghost" size="sm" onClick={() => onEdit(1)} className="text-purple-600 h-8">
                  Completar
                </Button>
              </div>
            )}
            {!validaciones.contenido && (
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm text-yellow-900">• Videos y materiales</span>
                <Button variant="ghost" size="sm" onClick={() => onEdit(2)} className="text-purple-600 h-8">
                  Completar
                </Button>
              </div>
            )}
            {!validaciones.calidad && (
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm text-yellow-900">• Objetivos y modalidades</span>
                <Button variant="ghost" size="sm" onClick={() => onEdit(3)} className="text-purple-600 h-8">
                  Completar
                </Button>
              </div>
            )}
            {!validaciones.precio && (
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm text-yellow-900">• Precio y acceso</span>
                <Button variant="ghost" size="sm" onClick={() => onEdit(4)} className="text-purple-600 h-8">
                  Completar
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      <Separator />

      {/* PREVIEW DEL CURSO - Vista del alumno */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Vista previa del curso</h4>
          <Badge variant="outline" className="text-xs">Así lo verán tus alumnos</Badge>
        </div>

        {/* Card principal del curso */}
        <Card className="overflow-hidden border-2 border-purple-200">
          {/* Header del curso — usa banner de la modalidad recomendada */}
          {(() => {
            // Get banner from: recommended modality > shared image > first modality > fallback
            const recomendada = formData.ofertas?.find(o => o.recomendada);
            const firstOffer = formData.ofertas?.[0];
            const banner =
              recomendada?.bannerImage ||
              (formData.usarImagenCompartida ? formData.imagenCompartida : null) ||
              firstOffer?.bannerImage ||
              { imageUrl: '', imageWidth: 0, imageHeight: 0 };
            const hasImage = !!banner.imageUrl;

            return (
              <div
                className="relative p-6 text-white"
                style={!hasImage ? { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' } : {}}
              >
                {hasImage && (
                  <>
                    <img
                      src={banner.imageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </>
                )}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {formData.categoria && (
                        <Badge className="bg-white/20 text-white border-white/30 mb-3">
                          {formData.categoria}
                        </Badge>
                      )}
                      <h1 className="text-2xl font-bold mb-2">
                        {formData.titulo || 'Título del curso'}
                      </h1>
                      {formData.subtitulo && (
                        <p className="text-white/80 text-base">{formData.subtitulo}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(2)}
                      className="text-white hover:bg-white/20"
                      title="Editar banner"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Stats del curso */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {totalMinutos > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{totalMinutos} minutos de video</span>
                      </div>
                    )}
                    {formData.videos.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        <span>{formData.videos.length} video{formData.videos.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {formData.nivelCurso && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span>Nivel {formData.nivelCurso}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Cuerpo del curso */}
          <div className="p-6">
            {/* Precio — desde ofertas */}
            {formData.ofertas && formData.ofertas.length > 0 && (() => {
              const ofertaPrincipal = formData.ofertas.find(o => o.recomendada) || formData.ofertas[0];
              return (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {ofertaPrincipal.nombreInterno || 'Precio del curso'}
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {ofertaPrincipal.precioBase} {ofertaPrincipal.monedaOrigen || '€'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.ofertas.length > 1
                        ? `${formData.ofertas.length} modalidades disponibles`
                        : (ofertaPrincipal.accesoContenido === 'por_meses' || ofertaPrincipal.bloqueAcceso?.tipo === 'limitado')
                          ? `Acceso por ${ofertaPrincipal.accesoMeses || ofertaPrincipal.bloqueAcceso?.duracionMeses || 3} meses`
                          : 'Pago único · Acceso vitalicio'}
                    </p>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700" disabled>
                    <Play className="w-4 h-4 mr-2" />
                    Inscribirme
                  </Button>
                </div>
              );
            })()}

            {/* Descripción */}
            {formData.descripcionCorta && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Sobre este curso</h3>
                <p className="text-gray-700 text-sm">{formData.descripcionCorta}</p>
              </div>
            )}

            {/* Objetivos */}
            {formData.objetivosAprendizaje.filter(obj => obj.trim()).length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">¿Qué aprenderás?</h3>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(3)} className="text-purple-600 h-8">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {formData.objetivosAprendizaje
                    .filter(obj => obj.trim())
                    .map((objetivo, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{objetivo}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* Contenido del curso */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Contenido del curso
                </h3>
                <Button variant="ghost" size="sm" onClick={() => onEdit(2)} className="text-purple-600 h-8">
                  <Edit2 className="w-3 h-3" />
                </Button>
              </div>

              {formData.estructuraPersonalizada.length > 0 ? (
                <div className="space-y-3">
                  {formData.estructuraPersonalizada.map((seccion, index) => {
                    const videosDeSeccion = formData.videos.filter(v => v.seccion === seccion);
                    const minutosSeccion = videosDeSeccion.reduce((sum, v) => sum + (parseInt(v.duracion) || 0), 0);

                    return (
                      <Card key={index} className="p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{seccion}</h4>
                              {videosDeSeccion.length > 0 && (
                                <p className="text-xs text-gray-600">
                                  {videosDeSeccion.length} video{videosDeSeccion.length !== 1 ? 's' : ''}
                                  {minutosSeccion > 0 && ` • ${minutosSeccion} min`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Videos de la sección */}
                        {videosDeSeccion.length > 0 && (
                          <div className="mt-3 ml-11 space-y-2">
                            {videosDeSeccion.map((video, vIndex) => (
                              <div key={vIndex} className="flex items-center justify-between p-2 bg-white rounded">
                                <div className="flex items-center gap-2">
                                  <Play className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-700">{video.titulo || `Video ${vIndex + 1}`}</span>
                                </div>
                                {video.duracion && (
                                  <span className="text-xs text-gray-500">{video.duracion} min</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    );
                  })}

                  {/* Videos sin asignar */}
                  {formData.videos.filter(v => !formData.estructuraPersonalizada.includes(v.seccion)).length > 0 && (
                    <Card className="p-4 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-3">Contenido adicional</h4>
                      <div className="space-y-2">
                        {formData.videos
                          .filter(v => !formData.estructuraPersonalizada.includes(v.seccion))
                          .map((video, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                              <div className="flex items-center gap-2">
                                <Play className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{video.titulo || `Video ${index + 1}`}</span>
                              </div>
                              {video.duracion && (
                                <span className="text-xs text-gray-500">{video.duracion} min</span>
                              )}
                            </div>
                          ))}
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No hay estructura definida</p>
              )}
            </div>

            {/* Público objetivo */}
            {formData.publicoObjetivo.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    ¿Para quién es este curso?
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.publicoObjetivo.map((publico, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {publico}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Bibliografía */}
            {formData.bibliografia.length > 0 && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Bibliografía y referencias</h3>
                  <p className="text-sm text-gray-600">
                    Este curso incluye {formData.bibliografia.length} referencia{formData.bibliografia.length !== 1 ? 's' : ''} bibliográfica{formData.bibliografia.length !== 1 ? 's' : ''} actualizadas
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Mensaje final */}
      {todasCompletas ? (
        <Card className="p-5 bg-green-50 border-green-200">
          <div className="flex gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-1">
                ¡Listo para publicar!
              </h4>
              <p className="text-sm text-green-800">
                Tu curso cumple con todos los requisitos. Al hacer clic en "Publicar curso", será enviado para revisión de calidad.
                Te notificaremos en 24-48 horas cuando esté aprobado y disponible para tus alumnos.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-5 bg-purple-50 border-purple-200">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-1">
                Usa los botones de edición
              </h4>
              <p className="text-sm text-purple-800">
                Puedes hacer clic en cualquier sección para editarla. Los cambios se guardan automáticamente.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}