import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  Video, 
  FileText, 
  ClipboardCheck, 
  BookOpen, 
  GripVertical,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  Lightbulb,
  Upload,
  AlertCircle
} from 'lucide-react';
import type { CourseFormData } from '../course-creation-wizard';

type Props = {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
};

type ModuleContent = {
  id: string;
  type: 'video' | 'lectura' | 'tarea' | 'examen';
  titulo: string;
  descripcion: string;
  duracion?: string;
  archivo?: File | null;
};

type Module = {
  id: string;
  nombre: string;
  descripcion: string;
  contenidos: ModuleContent[];
  collapsed: boolean;
};

const PLANTILLA_TEMPLATE: Module[] = [
  {
    id: '1',
    nombre: 'Introducción y Fundamentos',
    descripcion: 'Conceptos básicos y contexto del tema',
    contenidos: [],
    collapsed: false,
  },
  {
    id: '2',
    nombre: 'Desarrollo Teórico',
    descripcion: 'Contenido principal del curso',
    contenidos: [],
    collapsed: false,
  },
  {
    id: '3',
    nombre: 'Aplicación Práctica',
    descripcion: 'Casos clínicos y ejercicios',
    contenidos: [],
    collapsed: false,
  },
  {
    id: '4',
    nombre: 'Evaluación y Cierre',
    descripcion: 'Resumen y evaluación final',
    contenidos: [],
    collapsed: false,
  },
];

// Componente draggable para módulos
function DraggableModule({ 
  module, 
  index, 
  moveModule,
  editingModule,
  setEditingModule,
  actualizarModulo,
  toggleCollapse,
  eliminarModulo,
  modulesLength,
  agregarContenido,
  actualizarContenido,
  eliminarContenido,
  getContentIcon,
  getContentLabel,
  moveContent
}: any) {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'MODULE',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'MODULE',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveModule(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))}>
      <Card 
        className={`border-2 transition-all ${
          editingModule === module.id 
            ? 'border-purple-400 shadow-lg' 
            : 'border-gray-200'
        } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      >
        {/* Header del módulo */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-white border-b">
          <div className="flex items-start gap-3">
            {/* Drag handle */}
            <div className="mt-1 cursor-move" ref={preview}>
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>

            {/* Número del módulo */}
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              {index + 1}
            </div>

            {/* Contenido del módulo */}
            <div className="flex-1">
              {editingModule === module.id ? (
                <div className="space-y-2">
                  <Input
                    value={module.nombre}
                    onChange={(e) => actualizarModulo(module.id, 'nombre', e.target.value)}
                    placeholder="Nombre del módulo"
                    className="font-semibold"
                  />
                  <Input
                    value={module.descripcion}
                    onChange={(e) => actualizarModulo(module.id, 'descripcion', e.target.value)}
                    placeholder="Descripción breve (opcional)"
                    className="text-sm"
                  />
                </div>
              ) : (
                <>
                  <h4 className="font-semibold text-gray-900">{module.nombre}</h4>
                  {module.descripcion && (
                    <p className="text-sm text-gray-600 mt-1">{module.descripcion}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {module.contenidos.length} elemento{module.contenidos.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </>
              )}
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingModule(
                  editingModule === module.id ? null : module.id
                )}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCollapse(module.id)}
              >
                {module.collapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
              {modulesLength > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarModulo(module.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido del módulo */}
        {!module.collapsed && (
          <div className="p-4">
            {/* Botones para agregar contenido */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => agregarContenido(module.id, 'video')}
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => agregarContenido(module.id, 'lectura')}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Lectura
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => agregarContenido(module.id, 'tarea')}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                Tarea
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => agregarContenido(module.id, 'examen')}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Examen
              </Button>
            </div>

            {/* Lista de contenidos */}
            {module.contenidos.length > 0 ? (
              <div className="space-y-2">
                {module.contenidos.map((content, cIndex) => (
                  <DraggableContent
                    key={content.id}
                    content={content}
                    index={cIndex}
                    moduleId={module.id}
                    moveContent={moveContent}
                    actualizarContenido={actualizarContenido}
                    eliminarContenido={eliminarContenido}
                    getContentIcon={getContentIcon}
                    getContentLabel={getContentLabel}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Play className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Agrega videos, lecturas, tareas o exámenes
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

// Componente draggable para contenidos
function DraggableContent({
  content,
  index,
  moduleId,
  moveContent,
  actualizarContenido,
  eliminarContenido,
  getContentIcon,
  getContentLabel
}: any) {
  const [showUploadGuide, setShowUploadGuide] = useState(false);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'CONTENT',
    item: { index, moduleId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'CONTENT',
    hover: (item: { index: number; moduleId: string }) => {
      if (item.moduleId === moduleId && item.index !== index) {
        moveContent(moduleId, item.index, index);
        item.index = index;
      }
    },
  });

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Crear elemento de video temporal para obtener duración
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duracionMinutos = Math.ceil(video.duration / 60);
      
      actualizarContenido(moduleId, content.id, 'archivo', file);
      actualizarContenido(moduleId, content.id, 'duracion', String(duracionMinutos));
    };

    video.src = URL.createObjectURL(file);
  };

  return (
    <div ref={(node) => drag(drop(node))}>
      <Card className={`p-3 bg-gray-50 ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
        <div className="flex items-start gap-3">
          <div className="cursor-move mt-1">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
            content.type === 'video' ? 'bg-purple-100 text-purple-600' :
            content.type === 'lectura' ? 'bg-blue-100 text-blue-600' :
            content.type === 'tarea' ? 'bg-green-100 text-green-600' :
            'bg-orange-100 text-orange-600'
          }`}>
            {getContentIcon(content.type)}
          </div>
          
          <div className="flex-1 space-y-2">
            <Input
              value={content.titulo}
              onChange={(e) => actualizarContenido(moduleId, content.id, 'titulo', e.target.value)}
              placeholder={`Título del ${getContentLabel(content.type).toLowerCase()}`}
              className="text-sm font-medium"
            />
            
            {content.type === 'video' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <div className={`flex items-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      content.archivo 
                        ? 'border-purple-300 bg-purple-50' 
                        : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                    }`}>
                      <Upload className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-700">
                        {content.archivo ? content.archivo.name : 'Subir video'}
                      </span>
                      {content.duracion && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {content.duracion} min
                        </Badge>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoUpload}
                    />
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUploadGuide(!showUploadGuide)}
                    className="text-blue-600"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </Button>
                </div>
                
                {showUploadGuide && (
                  <Card className="p-3 bg-blue-50 border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-2">
                      📹 Requisitos de calidad del video
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• <strong>Formato:</strong> MP4, MOV o AVI</li>
                      <li>• <strong>Resolución:</strong> Mínimo 720p (1280x720)</li>
                      <li>• <strong>Audio:</strong> Claro, sin ruidos de fondo</li>
                      <li>• <strong>Iluminación:</strong> Buena visibilidad del presentador</li>
                      <li>• <strong>Tamaño:</strong> Máximo 2GB por video</li>
                    </ul>
                  </Card>
                )}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => eliminarContenido(moduleId, content.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function ModuleBuilderStep({ formData, updateFormData }: Props) {
  const [modules, setModules] = useState<Module[]>(
    formData.estructuraPersonalizada.length > 0 
      ? formData.estructuraPersonalizada.map((nombre, index) => ({
          id: String(index + 1),
          nombre,
          descripcion: '',
          contenidos: [],
          collapsed: false,
        }))
      : PLANTILLA_TEMPLATE
  );
  
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [showTemplateChoice, setShowTemplateChoice] = useState(
    formData.estructuraPersonalizada.length === 0
  );

  const usarPlantilla = () => {
    setModules(PLANTILLA_TEMPLATE);
    setShowTemplateChoice(false);
    updateFormData({ 
      estructuraPersonalizada: PLANTILLA_TEMPLATE.map(m => m.nombre) 
    });
  };

  const empezarDesdeBlanco = () => {
    setModules([{
      id: '1',
      nombre: 'Módulo 1',
      descripcion: '',
      contenidos: [],
      collapsed: false,
    }]);
    setShowTemplateChoice(false);
  };

  const agregarModulo = () => {
    const newModule: Module = {
      id: String(Date.now()),
      nombre: `Módulo ${modules.length + 1}`,
      descripcion: '',
      contenidos: [],
      collapsed: false,
    };
    const updatedModules = [...modules, newModule];
    setModules(updatedModules);
    updateFormData({ 
      estructuraPersonalizada: updatedModules.map(m => m.nombre) 
    });
  };

  const eliminarModulo = (id: string) => {
    const updatedModules = modules.filter(m => m.id !== id);
    setModules(updatedModules);
    updateFormData({ 
      estructuraPersonalizada: updatedModules.map(m => m.nombre) 
    });
  };

  const actualizarModulo = (id: string, field: 'nombre' | 'descripcion', value: string) => {
    const updatedModules = modules.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    );
    setModules(updatedModules);
    updateFormData({ 
      estructuraPersonalizada: updatedModules.map(m => m.nombre) 
    });
  };

  const toggleCollapse = (id: string) => {
    setModules(modules.map(m => 
      m.id === id ? { ...m, collapsed: !m.collapsed } : m
    ));
  };

  const moveModule = (fromIndex: number, toIndex: number) => {
    const newModules = [...modules];
    const [movedModule] = newModules.splice(fromIndex, 1);
    newModules.splice(toIndex, 0, movedModule);
    
    setModules(newModules);
    updateFormData({ 
      estructuraPersonalizada: newModules.map(m => m.nombre) 
    });
  };

  const agregarContenido = (moduleId: string, type: ModuleContent['type']) => {
    const updatedModules = modules.map(m => {
      if (m.id === moduleId) {
        const newContent: ModuleContent = {
          id: String(Date.now()),
          type,
          titulo: '',
          descripcion: '',
          duracion: type === 'video' ? '' : undefined,
        };
        return { ...m, contenidos: [...m.contenidos, newContent] };
      }
      return m;
    });
    setModules(updatedModules);
  };

  const actualizarContenido = (moduleId: string, contentId: string, field: string, value: any) => {
    const updatedModules = modules.map(m => {
      if (m.id === moduleId) {
        const updatedContenidos = m.contenidos.map(c =>
          c.id === contentId ? { ...c, [field]: value } : c
        );
        return { ...m, contenidos: updatedContenidos };
      }
      return m;
    });
    setModules(updatedModules);
  };

  const eliminarContenido = (moduleId: string, contentId: string) => {
    const updatedModules = modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, contenidos: m.contenidos.filter(c => c.id !== contentId) };
      }
      return m;
    });
    setModules(updatedModules);
  };

  const moveContent = (moduleId: string, fromIndex: number, toIndex: number) => {
    const updatedModules = modules.map(m => {
      if (m.id === moduleId) {
        const newContenidos = [...m.contenidos];
        const [movedContent] = newContenidos.splice(fromIndex, 1);
        newContenidos.splice(toIndex, 0, movedContent);
        return { ...m, contenidos: newContenidos };
      }
      return m;
    });
    setModules(updatedModules);
  };

  const getContentIcon = (type: ModuleContent['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'lectura': return <BookOpen className="w-4 h-4" />;
      case 'tarea': return <FileText className="w-4 h-4" />;
      case 'examen': return <ClipboardCheck className="w-4 h-4" />;
    }
  };

  const getContentLabel = (type: ModuleContent['type']) => {
    switch (type) {
      case 'video': return 'Video';
      case 'lectura': return 'Lectura';
      case 'tarea': return 'Tarea';
      case 'examen': return 'Examen';
    }
  };

  const totalContenidos = modules.reduce((sum, m) => sum + m.contenidos.length, 0);
  const totalVideos = modules.reduce((sum, m) => 
    sum + m.contenidos.filter(c => c.type === 'video').length, 0
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Construye tu curso por módulos</h3>
          <p className="text-sm text-gray-600">
            Organiza tu curso en módulos. Arrastra para reordenar.
          </p>
        </div>

        {/* Elección de plantilla inicial */}
        {showTemplateChoice && (
          <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <div className="text-center mb-6">
              <Lightbulb className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">¿Cómo quieres empezar?</h4>
              <p className="text-sm text-gray-600">
                Puedes usar nuestra estructura recomendada o crear la tuya desde cero
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card 
                className="p-5 border-2 border-purple-300 bg-white cursor-pointer hover:border-purple-400 hover:shadow-md transition-all"
                onClick={usarPlantilla}
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  <h5 className="font-semibold text-gray-900">Usar estructura recomendada</h5>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Te damos 4 módulos base que puedes editar, eliminar o ampliar
                </p>
                <div className="space-y-1.5 text-xs">
                  {PLANTILLA_TEMPLATE.map((mod, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-700">
                      <span className="font-semibold text-purple-600">{i + 1}.</span>
                      <span>{mod.nombre}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  Empezar con plantilla
                </Button>
              </Card>

              <Card 
                className="p-5 border-2 border-gray-200 bg-white cursor-pointer hover:border-gray-300 hover:shadow-md transition-all"
                onClick={empezarDesdeBlanco}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Plus className="w-5 h-5 text-gray-600" />
                  <h5 className="font-semibold text-gray-900">Empezar desde blanco</h5>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Crea tu propia estructura completamente personalizada
                </p>
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-500">Tu estructura aquí</p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Crear desde cero
                </Button>
              </Card>
            </div>
          </Card>
        )}

        {/* Resumen del curso */}
        {!showTemplateChoice && modules.length > 0 && (
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-purple-900">Tu curso:</p>
                  <p className="text-lg font-bold text-purple-600">
                    {modules.length} módulo{modules.length !== 1 ? 's' : ''} • {totalContenidos} elemento{totalContenidos !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button
                onClick={agregarModulo}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar módulo
              </Button>
            </div>
          </Card>
        )}

        {/* Constructor de módulos */}
        {!showTemplateChoice && (
          <div className="space-y-4">
            {modules.map((module, index) => (
              <DraggableModule
                key={module.id}
                module={module}
                index={index}
                moveModule={moveModule}
                editingModule={editingModule}
                setEditingModule={setEditingModule}
                actualizarModulo={actualizarModulo}
                toggleCollapse={toggleCollapse}
                eliminarModulo={eliminarModulo}
                modulesLength={modules.length}
                agregarContenido={agregarContenido}
                actualizarContenido={actualizarContenido}
                eliminarContenido={eliminarContenido}
                getContentIcon={getContentIcon}
                getContentLabel={getContentLabel}
                moveContent={moveContent}
              />
            ))}
          </div>
        )}

        {/* Hint final */}
        {!showTemplateChoice && modules.length > 0 && totalVideos === 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  💡 Empieza agregando videos
                </p>
                <p className="text-sm text-blue-800">
                  Los videos son el corazón del curso. Puedes agregarlos directamente aquí o en el siguiente paso.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DndProvider>
  );
}
