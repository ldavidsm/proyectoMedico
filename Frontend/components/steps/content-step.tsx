import { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Upload, Video, FileText, Trash2, Plus, Lightbulb, Info, HelpCircle } from 'lucide-react';
import type { CourseFormData } from '../course-creation-wizard';

type Props = {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
};

export default function ContentStep({ formData, updateFormData }: Props) {
  const [showTechnicalHelp, setShowTechnicalHelp] = useState(false);

  const addVideo = () => {
    const newVideo = {
      id: Date.now().toString(),
      seccion: formData.estructuraPersonalizada[0] || '',
      titulo: '',
      archivo: null,
      duracion: '',
      descripcion: '',
    };
    updateFormData({ videos: [...formData.videos, newVideo] });
  };

  const updateVideo = (id: string, field: string, value: any) => {
    const updatedVideos = formData.videos.map((video) =>
      video.id === id ? { ...video, [field]: value } : video
    );
    updateFormData({ videos: updatedVideos });
  };

  const removeVideo = (id: string) => {
    const updatedVideos = formData.videos.filter((video) => video.id !== id);
    updateFormData({ videos: updatedVideos });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, videoId?: string) => {
    const file = e.target.files?.[0] || null;
    if (videoId) {
      updateVideo(videoId, 'archivo', file);
    } else {
      updateFormData({ presentacion: file });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Contenido y Estructura del Curso</h3>
        <p className="text-sm text-gray-600">
          Organiza tu curso para facilitar el aprendizaje
        </p>
      </div>

      {/* Opción de Plantilla */}
      {showTechnicalHelp && (
        <Card className="p-5 border-purple-300 bg-purple-50">
          <h4 className="font-semibold text-gray-900 mb-3">
            ¿Quieres usar una estructura recomendada?
          </h4>
          <p className="text-sm text-gray-700 mb-4">
            Te sugerimos una estructura pedagógica probada que puedes personalizar:
          </p>
          <div className="bg-white border border-purple-200 rounded-lg p-4 mb-4">
            <ol className="space-y-1.5 text-sm text-gray-700">
              {formData.estructuraPersonalizada.map((seccion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="font-semibold text-purple-600">{index + 1}.</span>
                  <span>{seccion}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowTechnicalHelp(false)}
              variant="outline"
            >
              Crear estructura propia
            </Button>
          </div>
        </Card>
      )}

      {/* Videos Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-sm font-medium text-gray-900">Videos del curso *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVideo}
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar video
          </Button>
        </div>

        {formData.videos.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-2">No has agregado videos aún</p>
            <p className="text-xs text-gray-500">
              Haz clic en "Agregar video" para comenzar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.videos.map((video, index) => (
              <Card key={video.id} className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Video {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVideo(video.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {formData.usarPlantilla && video.seccion && (
                    <div className="bg-purple-50 border border-purple-200 rounded px-3 py-2">
                      <p className="text-xs font-medium text-purple-900">
                        Sección: {video.seccion}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-900 mb-1.5 block">
                        Título del video
                      </Label>
                      <Input
                        value={video.titulo}
                        onChange={(e) => updateVideo(video.id, 'titulo', e.target.value)}
                        placeholder="Ej: Diagnóstico electrocardiográfico del SCACEST"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-900 mb-1.5 block">
                        Duración (minutos)
                      </Label>
                      <Input
                        value={video.duracion}
                        onChange={(e) => updateVideo(video.id, 'duracion', e.target.value)}
                        placeholder="15"
                        type="number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-1.5 block">
                      Archivo de video
                    </Label>
                    <label className="cursor-pointer block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                        <div className="flex items-center justify-center gap-3">
                          <Upload className="w-5 h-5 text-gray-400" />
                          <div className="text-center">
                            <p className="text-sm text-gray-600">
                              {video.archivo ? video.archivo.name : 'Seleccionar archivo de video'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI (máx. 2GB)</p>
                          </div>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange(e, video.id)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-1.5 block">
                      Descripción del video
                    </Label>
                    <Textarea
                      value={video.descripcion}
                      onChange={(e) => updateVideo(video.id, 'descripcion', e.target.value)}
                      placeholder="Describe brevemente el contenido de este video..."
                      rows={2}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Presentación */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-1.5 block">
          Presentación o material de apoyo
        </Label>
        <label className="cursor-pointer block">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-6 h-6 text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {formData.presentacion
                    ? formData.presentacion.name
                    : 'Subir presentación (PDF, PPT)'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Opcional — PDF o PowerPoint (máx. 50MB)</p>
              </div>
            </div>
          </div>
          <input
            type="file"
            accept=".pdf,.ppt,.pptx"
            onChange={(e) => handleFileChange(e)}
            className="hidden"
          />
        </label>
      </div>

      {/* Descripción Detallada Guiada */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">
          Descripción detallada del curso *
        </Label>
        <p className="text-xs text-gray-600 mb-4">
          Completa las siguientes secciones para crear una descripción completa y útil
        </p>

        <div className="space-y-4">
          <Card className="p-4">
            <Label htmlFor="queAprendera" className="text-sm font-semibold text-gray-900 mb-2 block">
              ¿Qué aprenderá el alumno?
            </Label>
            <Textarea
              id="queAprendera"
              value={formData.descripcionDetallada.queAprendera}
              onChange={(e) =>
                updateFormData({
                  descripcionDetallada: {
                    ...formData.descripcionDetallada,
                    queAprendera: e.target.value,
                  },
                })
              }
              placeholder="Ej: Aprenderá a identificar los diferentes tipos de SCACEST, interpretar el ECG en contexto agudo, y tomar decisiones sobre estrategias de reperfusión basadas en evidencia."
              rows={3}
              className="text-sm"
            />
          </Card>

          <Card className="p-4">
            <Label htmlFor="requisitos" className="text-sm font-semibold text-gray-900 mb-2 block">
              Requisitos previos
            </Label>
            <Textarea
              id="requisitos"
              value={formData.descripcionDetallada.requisitos}
              onChange={(e) =>
                updateFormData({
                  descripcionDetallada: {
                    ...formData.descripcionDetallada,
                    requisitos: e.target.value,
                  },
                })
              }
              placeholder="Ej: Conocimientos básicos de cardiología y electrocardiografía. Recomendable experiencia clínica en urgencias."
              rows={2}
              className="text-sm"
            />
          </Card>

          <Card className="p-4">
            <Label htmlFor="dirigidoA" className="text-sm font-semibold text-gray-900 mb-2 block">
              ¿A quién va dirigido?
            </Label>
            <Textarea
              id="dirigidoA"
              value={formData.descripcionDetallada.dirigidoA}
              onChange={(e) =>
                updateFormData({
                  descripcionDetallada: {
                    ...formData.descripcionDetallada,
                    dirigidoA: e.target.value,
                  },
                })
              }
              placeholder="Ej: Residentes de medicina interna y cardiología, médicos de urgencias, cardiólogos clínicos que quieran actualizar sus conocimientos."
              rows={2}
              className="text-sm"
            />
          </Card>

          <Card className="p-4">
            <Label htmlFor="metodologia" className="text-sm font-semibold text-gray-900 mb-2 block">
              Metodología o enfoque
            </Label>
            <Textarea
              id="metodologia"
              value={formData.descripcionDetallada.metodologia}
              onChange={(e) =>
                updateFormData({
                  descripcionDetallada: {
                    ...formData.descripcionDetallada,
                    metodologia: e.target.value,
                  },
                })
              }
              placeholder="Ej: Curso basado en casos reales con análisis paso a paso. Incluye ECGs reales, protocolos actualizados y discusión de decisiones terapéuticas."
              rows={2}
              className="text-sm"
            />
          </Card>
        </div>
      </div>

      {/* Recomendaciones */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Recomendaciones para videos de calidad
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Resolución mínima <strong>1080p (Full HD)</strong></li>
              <li>• Audio claro, sin ruido de fondo ni eco</li>
              <li>• Videos de <strong>10–20 minutos</strong> para mantener la atención</li>
              <li>• Incluye <strong>casos clínicos reales</strong> cuando sea posible</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}