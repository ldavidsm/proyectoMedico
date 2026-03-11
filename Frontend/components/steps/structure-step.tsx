import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Plus, 
  GripVertical,
  Pencil,
  Trash2,
  BookOpen,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import type { CourseFormData } from '../course-creation-wizard';

type Props = {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
};

type Module = {
  id: string;
  nombre: string;
  descripcion: string;
};

const PLANTILLA_TEMPLATE: Module[] = [
  {
    id: '1',
    nombre: 'Introducción y Fundamentos',
    descripcion: 'Conceptos básicos y contexto del tema',
  },
  {
    id: '2',
    nombre: 'Desarrollo Teórico',
    descripcion: 'Contenido principal del curso',
  },
  {
    id: '3',
    nombre: 'Aplicación Práctica',
    descripcion: 'Casos clínicos y ejercicios',
  },
  {
    id: '4',
    nombre: 'Evaluación y Cierre',
    descripcion: 'Resumen y evaluación final',
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
  eliminarModulo,
  modulesLength
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
        className={`border-2 transition-all mb-3 ${
          editingModule === module.id 
            ? 'border-purple-400 shadow-lg' 
            : 'border-gray-200'
        } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      >
        <div className="p-5 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-start gap-4">
            {/* Drag handle */}
            <div className="mt-1 cursor-move" ref={preview}>
              <GripVertical className="w-6 h-6 text-gray-400" />
            </div>

            {/* Número del módulo */}
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {index + 1}
            </div>

            {/* Contenido del módulo */}
            <div className="flex-1">
              {editingModule === module.id ? (
                <div className="space-y-3">
                  <Input
                    value={module.nombre}
                    onChange={(e) => actualizarModulo(module.id, 'nombre', e.target.value)}
                    placeholder="¿Cómo se llama este módulo?"
                    className="font-semibold text-lg"
                  />
                  <Textarea
                    value={module.descripcion}
                    onChange={(e) => actualizarModulo(module.id, 'descripcion', e.target.value)}
                    placeholder="Describe brevemente qué aprenderán en este módulo (opcional)"
                    className="text-base resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={() => setEditingModule(null)}
                    className="bg-purple-600 hover:bg-purple-700 text-base px-6"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Listo
                  </Button>
                </div>
              ) : (
                <>
                  <h4 className="font-semibold text-gray-900 text-lg">{module.nombre || 'Sin nombre'}</h4>
                  {module.descripcion && (
                    <p className="text-base text-gray-600 mt-2">{module.descripcion}</p>
                  )}
                </>
              )}
            </div>

            {/* Acciones */}
            {editingModule !== module.id && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingModule(module.id)}
                  className="text-base px-4"
                >
                  <Pencil className="w-5 h-5" />
                </Button>
                {modulesLength > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarModulo(module.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 text-base px-4"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function StructureStep({ formData, updateFormData }: Props) {
  const [modules, setModules] = useState<Module[]>(() => {
    const savedModules = formData.estructuraPersonalizada;
    if (savedModules && savedModules.length > 0) {
      return savedModules.map((nombre, idx) => ({
        id: String(idx + 1),
        nombre,
        descripcion: '',
      }));
    }
    return [];
  });

  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [showTemplateOption, setShowTemplateOption] = useState(modules.length === 0);

  const usarPlantilla = () => {
    setModules(PLANTILLA_TEMPLATE);
    setShowTemplateOption(false);
    updateFormData({ 
      estructuraPersonalizada: PLANTILLA_TEMPLATE.map(m => m.nombre),
      usarPlantilla: true 
    });
  };

  const empezarDesdeBlanco = () => {
    const primerModulo: Module = {
      id: '1',
      nombre: '',
      descripcion: '',
    };
    setModules([primerModulo]);
    setEditingModule('1');
    setShowTemplateOption(false);
    updateFormData({ usarPlantilla: false });
  };

  const agregarModulo = () => {
    const nuevoModulo: Module = {
      id: Date.now().toString(),
      nombre: '',
      descripcion: '',
    };
    setModules([...modules, nuevoModulo]);
    setEditingModule(nuevoModulo.id);
  };

  const actualizarModulo = (id: string, campo: 'nombre' | 'descripcion', valor: string) => {
    const updatedModules = modules.map(m => 
      m.id === id ? { ...m, [campo]: valor } : m
    );
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

  const moveModule = (fromIndex: number, toIndex: number) => {
    const updatedModules = [...modules];
    const [movedModule] = updatedModules.splice(fromIndex, 1);
    updatedModules.splice(toIndex, 0, movedModule);
    setModules(updatedModules);
    updateFormData({ 
      estructuraPersonalizada: updatedModules.map(m => m.nombre)
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Organiza los módulos de tu curso
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            Piensa en tu curso como un libro. ¿Cuáles son los grandes temas o capítulos que vas a enseñar? 
            No te preocupes por el contenido todavía, solo piensa en cómo lo vas a organizar.
          </p>
        </div>

        {/* Opción de plantilla o desde blanco */}
        {showTemplateOption ? (
          <div className="space-y-4">
            <Card className="p-6 border-purple-300 bg-purple-50">
              <div className="flex items-start gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg mb-2">
                    ¿Necesitas ayuda para empezar?
                  </h4>
                  <p className="text-base text-gray-700">
                    Tenemos una estructura probada que funciona bien para la mayoría de cursos médicos. 
                    Puedes usarla como base y modificarla después.
                  </p>
                </div>
              </div>
              
              <div className="bg-white border border-purple-200 rounded-lg p-5 mb-5">
                <h5 className="font-medium text-gray-900 mb-3 text-base">Estructura recomendada:</h5>
                <ol className="space-y-2 text-base text-gray-700">
                  {PLANTILLA_TEMPLATE.map((modulo, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="font-semibold text-purple-600 flex-shrink-0">{index + 1}.</span>
                      <div>
                        <span className="font-medium">{modulo.nombre}</span>
                        <p className="text-sm text-gray-600">{modulo.descripcion}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={usarPlantilla}
                  className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6 flex-1"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Usar esta estructura
                </Button>
                <Button
                  onClick={empezarDesdeBlanco}
                  variant="outline"
                  className="text-lg px-8 py-6 flex-1"
                >
                  Empezar desde cero
                </Button>
              </div>
            </Card>

            <Card className="p-5 bg-blue-50 border-blue-200">
              <p className="text-base text-blue-900">
                <strong>Tranquilo:</strong> Cualquiera que elijas, podrás cambiar los nombres, agregar o quitar módulos cuando quieras.
              </p>
            </Card>
          </div>
        ) : (
          <>
            {/* Lista de módulos */}
            <div className="space-y-3">
              {modules.map((module, index) => (
                <DraggableModule
                  key={module.id}
                  module={module}
                  index={index}
                  moveModule={moveModule}
                  editingModule={editingModule}
                  setEditingModule={setEditingModule}
                  actualizarModulo={actualizarModulo}
                  eliminarModulo={eliminarModulo}
                  modulesLength={modules.length}
                />
              ))}
            </div>

            {/* Botón agregar módulo */}
            <Button
              onClick={agregarModulo}
              variant="outline"
              className="w-full border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 text-lg py-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar otro módulo
            </Button>

            {/* Resumen */}
            {modules.length > 0 && (
              <Card className="p-5 bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-base text-green-900">
                      <strong>¡Muy bien!</strong> Tu curso tiene {modules.length} módulo{modules.length !== 1 ? 's' : ''}.
                    </p>
                    <p className="text-base text-green-700 mt-1">
                      En el siguiente paso vamos a agregar los videos a cada módulo.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Consejo */}
            <Card className="p-5 bg-purple-50 border-purple-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-base text-purple-900">
                    <strong>Consejo:</strong> Los cursos funcionan mejor con 3 a 6 módulos. Cada módulo debería durar entre 15 y 30 minutos.
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </DndProvider>
  );
}
