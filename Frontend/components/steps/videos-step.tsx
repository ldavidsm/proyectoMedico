import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Upload, 
  Video, 
  Play,
  CheckCircle2,
  Lightbulb,
  AlertCircle,
  Clock,
  FileVideo,
  Info
} from 'lucide-react';
import type { CourseFormData } from '../course-creation-wizard';

type Props = {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
};

type VideoData = {
  id: string;
  seccion: string;
  titulo: string;
  archivo: File | null;
  duracion: string;
  descripcion: string;
};

export default function VideosStep({ formData, updateFormData }: Props) {
  const modules = formData.estructuraPersonalizada || [];
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [videos, setVideos] = useState<VideoData[]>(formData.videos || []);

  const currentModule = modules[currentModuleIndex];
  const currentModuleVideos = videos.filter(v => v.seccion === currentModule);

  // Detectar duración automáticamente
  const detectVideoDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = Math.floor(video.duration / 60);
        resolve(duration > 0 ? duration.toString() : '1');
      };

      video.onerror = () => {
        resolve('5'); // Default fallback
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const agregarVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const duracion = await detectVideoDuration(file);

    const nuevoVideo: VideoData = {
      id: Date.now().toString(),
      seccion: currentModule,
      titulo: file.name.replace(/\.[^/.]+$/, ''), // Nombre sin extensión
      archivo: file,
      duracion,
      descripcion: '',
    };

    const updatedVideos = [...videos, nuevoVideo];
    setVideos(updatedVideos);
    updateFormData({ videos: updatedVideos });
  };

  const actualizarVideo = (id: string, campo: keyof VideoData, valor: any) => {
    const updatedVideos = videos.map(v => 
      v.id === id ? { ...v, [campo]: valor } : v
    );
    setVideos(updatedVideos);
    updateFormData({ videos: updatedVideos });
  };

  const eliminarVideo = (id: string) => {
    const updatedVideos = videos.filter(v => v.id !== id);
    setVideos(updatedVideos);
    updateFormData({ videos: updatedVideos });
  };

  const irSiguienteModulo = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  const irModuloAnterior = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  // Calcular progreso
  const modulosConVideos = modules.filter(m => 
    videos.some(v => v.seccion === m)
  ).length;
  const progresoModulos = modules.length > 0 ? (modulosConVideos / modules.length) * 100 : 0;
  
  const totalMinutos = videos.reduce((sum, v) => sum + (parseInt(v.duracion) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          Agrega los videos de tu curso
        </h3>
        <p className="text-lg text-gray-600 leading-relaxed">
          Vamos módulo por módulo. Sube los videos que corresponden a cada tema. 
          El sistema detectará automáticamente la duración de cada video.
        </p>
      </div>

      {/* Progreso general */}
      <Card className="p-5 bg-purple-50 border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-medium text-gray-900">
            Progreso: {modulosConVideos} de {modules.length} módulos con videos
          </span>
          <Badge className="bg-purple-600 text-base px-3 py-1">
            {videos.length} video{videos.length !== 1 ? 's' : ''} · {totalMinutos} min
          </Badge>
        </div>
        <Progress value={progresoModulos} className="h-3" />
      </Card>

      {/* Navegación entre módulos */}
      <div className="flex items-center gap-3">
        <Button
          onClick={irModuloAnterior}
          disabled={currentModuleIndex === 0}
          variant="outline"
          className="text-base px-6 py-5"
        >
          ← Módulo anterior
        </Button>
        <div className="flex-1 text-center">
          <div className="inline-flex items-center gap-3 bg-purple-100 px-6 py-3 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
              {currentModuleIndex + 1}
            </div>
            <div className="text-left">
              <p className="text-sm text-purple-700">Módulo {currentModuleIndex + 1} de {modules.length}</p>
              <p className="text-lg font-semibold text-gray-900">{currentModule}</p>
            </div>
          </div>
        </div>
        <Button
          onClick={irSiguienteModulo}
          disabled={currentModuleIndex === modules.length - 1}
          variant="outline"
          className="text-base px-6 py-5"
        >
          Módulo siguiente →
        </Button>
      </div>

      {/* Videos del módulo actual */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">
          Videos en este módulo:
        </h4>

        {currentModuleVideos.length === 0 ? (
          <Card className="p-8 border-2 border-dashed border-gray-300 text-center">
            <FileVideo className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg text-gray-600 mb-1">
              Aún no has agregado videos a este módulo
            </p>
            <p className="text-base text-gray-500">
              Haz clic en "Subir video" para comenzar
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentModuleVideos.map((video, idx) => (
              <Card key={video.id} className="p-5 border-2 border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Video className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-base font-medium text-gray-900 mb-2 block">
                        Título del video {idx + 1}
                      </Label>
                      <Input
                        value={video.titulo}
                        onChange={(e) => actualizarVideo(video.id, 'titulo', e.target.value)}
                        placeholder="Ej: Introducción al tema"
                        className="text-base"
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {video.archivo && (
                        <>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>{video.archivo.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{video.duracion} min</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => eliminarVideo(video.id)}
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Botón subir video */}
        <div>
          <input
            type="file"
            accept="video/*"
            onChange={agregarVideo}
            className="hidden"
            id="video-upload"
          />
          <label htmlFor="video-upload">
            <Button
              type="button"
              onClick={() => document.getElementById('video-upload')?.click()}
              className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6 w-full"
            >
              <Upload className="w-5 h-5 mr-2" />
              Subir video a este módulo
            </Button>
          </label>
        </div>
      </div>

      {/* Consejos de calidad */}
      <Card className="p-5 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-base text-blue-900 font-semibold">
              Consejos para videos de calidad:
            </p>
            <ul className="space-y-1 text-base text-blue-800 list-disc list-inside">
              <li>Graba en un lugar silencioso con buena iluminación</li>
              <li>Videos de 5-15 minutos mantienen mejor la atención</li>
              <li>Habla claro y a un ritmo tranquilo</li>
              <li>Si te equivocas, no te preocupes, puedes volver a grabar</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Indicador de formato */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            <strong>Formatos aceptados:</strong> MP4, AVI, MOV, MKV. Tamaño máximo: 2GB por video.
          </p>
        </div>
      </Card>

      {/* Mensaje de guardado */}
      {videos.length > 0 && (
        <Card className="p-5 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-base text-green-900">
                <strong>Todo guardado.</strong> Llevas {videos.length} video{videos.length !== 1 ? 's' : ''} subido{videos.length !== 1 ? 's' : ''} ({totalMinutos} minutos en total).
              </p>
              <p className="text-base text-green-700 mt-1">
                Cuando termines, haz clic en "Siguiente" para continuar.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
