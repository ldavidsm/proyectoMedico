import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { 
  Plus, 
  GripVertical,
  Pencil,
  Trash2,
  Video,
  FileText,
  CheckSquare,
  BookOpen,
  X,
  Upload,
  Play,
  ChevronDown,
  ChevronRight,
  Library,
  Lightbulb,
  Download,
  HelpCircle,
  Info
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
  bloques: Bloque[];
  expanded: boolean;
};

type Bloque = VideoBloque | LecturaBloque | TareaBloque | ExamenBloque;

type VideoBloque = {
  id: string;
  tipo: 'video';
  titulo: string;
  archivo: File | null;
  duracion: string;
  descripcion: string;
};

type LecturaBloque = {
  id: string;
  tipo: 'lectura';
  titulo: string;
  archivo: File | null;
  bibliografia: string[];
};

type TareaBloque = {
  id: string;
  tipo: 'tarea';
  titulo: string;
  instrucciones: string;
  archivosDescargables: string[];
  rubrica: string[];
  claseRevision: string;
};

type ExamenBloque = {
  id: string;
  tipo: 'examen';
  titulo: string;
  preguntas: Pregunta[];
  config: ExamenConfig;
};

type ExamenConfig = {
  preguntasPorIntento: number;
  notaMinima: number;
  mostrarRespuestas: boolean;
  esperaIntentos: number;
};

type Pregunta = {
  id: string;
  pregunta: string;
  tipo: 'unica' | 'multiple' | 'vf';
  opciones: string[];
  respuestaCorrecta: number | number[];
};

// Tipos de plantillas disponibles
type TipoPlantilla = 'masterclass' | 'especializacion' | 'taller' | 'avanzado';

type PlantillaInfo = {
  id: TipoPlantilla;
  nombre: string;
  descripcion: string;
  duracion: string;
  nivel: string;
  estructura: Module[];
};

// 🎓 MASTERCLASS MÉDICA
const PLANTILLA_MASTERCLASS: Module[] = [
  {
    id: '1',
    nombre: 'Contexto clínico y enfoque',
    descripcion: 'Por qué este problema importa y cómo lo abordas tú como médico. Habla desde tu experiencia clínica, no desde el libro.',
    expanded: true,
    bloques: [
      {
        id: 'b1',
        tipo: 'video',
        titulo: 'Introducción y contexto clínico',
        archivo: null,
        duracion: '',
        descripcion: 'Presenta el problema clínico y tu enfoque experto'
      },
      {
        id: 'b2',
        tipo: 'lectura',
        titulo: 'Límites, marco y a quién va dirigido',
        archivo: null,
        bibliografia: []
      }
    ]
  },
  {
    id: '2',
    nombre: 'La mirada del experto',
    descripcion: 'Cómo piensas este problema en la práctica real. Evita promesas absolutas.',
    expanded: false,
    bloques: [
      {
        id: 'b3',
        tipo: 'video',
        titulo: 'Desarrollo principal',
        archivo: null,
        duracion: '',
        descripcion: 'Tu enfoque clínico detallado'
      },
      {
        id: 'b4',
        tipo: 'video',
        titulo: 'Casos ilustrativos',
        archivo: null,
        duracion: '',
        descripcion: 'Ejemplos de casos reales'
      }
    ]
  },
  {
    id: '3',
    nombre: 'Conclusiones y siguientes pasos',
    descripcion: 'Qué debe llevarse el médico y cuándo NO aplicar lo visto. Aclara cuándo este enfoque NO es adecuado.',
    expanded: false,
    bloques: [
      {
        id: 'b5',
        tipo: 'video',
        titulo: 'Cierre clínico',
        archivo: null,
        duracion: '',
        descripcion: 'Conclusiones y límites del enfoque'
      }
    ]
  }
];

// 🩺 CURSO DE ESPECIALIZACIÓN
const PLANTILLA_ESPECIALIZACION: Module[] = [
  {
    id: '1',
    nombre: 'Reencuadre clínico',
    descripcion: 'Qué problema no se está resolviendo bien y por qué este curso existe.',
    expanded: true,
    bloques: [
      {
        id: 'b1',
        tipo: 'video',
        titulo: 'El problema actual',
        archivo: null,
        duracion: '',
        descripcion: 'Qué no funciona en la práctica habitual'
      },
      {
        id: 'b2',
        tipo: 'lectura',
        titulo: 'Propuesta de valor del curso',
        archivo: null,
        bibliografia: []
      }
    ]
  },
  {
    id: '2',
    nombre: 'Fundamentos fisiopatológicos',
    descripcion: 'Lo que necesitas entender para aplicar el enfoque con criterio.',
    expanded: false,
    bloques: [
      {
        id: 'b3',
        tipo: 'video',
        titulo: 'Base fisiopatológica',
        archivo: null,
        duracion: '',
        descripcion: ''
      },
      {
        id: 'b4',
        tipo: 'lectura',
        titulo: 'Evidencia científica actualizada',
        archivo: null,
        bibliografia: []
      }
    ]
  },
  {
    id: '3',
    nombre: 'Lectura integrativa del paciente',
    descripcion: 'Cómo interpretar síntomas, pruebas y contexto más allá del diagnóstico.',
    expanded: false,
    bloques: [
      {
        id: 'b5',
        tipo: 'video',
        titulo: 'Enfoque integrativo',
        archivo: null,
        duracion: '',
        descripcion: ''
      },
      {
        id: 'b6',
        tipo: 'lectura',
        titulo: 'Casos comentados',
        archivo: null,
        bibliografia: []
      }
    ]
  },
  {
    id: '4',
    nombre: 'Herramientas y decisiones clínicas',
    descripcion: 'Qué usar, cuándo, y qué evitar.',
    expanded: false,
    bloques: [
      {
        id: 'b7',
        tipo: 'video',
        titulo: 'Protocolo de decisión',
        archivo: null,
        duracion: '',
        descripcion: ''
      },
      {
        id: 'b8',
        tipo: 'lectura',
        titulo: 'Errores frecuentes',
        archivo: null,
        bibliografia: []
      }
    ]
  },
  {
    id: '5',
    nombre: 'Casos clínicos reales',
    descripcion: 'Pacientes reales, no ideales.',
    expanded: false,
    bloques: [
      {
        id: 'b9',
        tipo: 'video',
        titulo: 'Casos completos comentados',
        archivo: null,
        duracion: '',
        descripcion: ''
      },
      {
        id: 'b10',
        tipo: 'tarea',
        titulo: 'Análisis de caso',
        instrucciones: '',
        archivosDescargables: [],
        rubrica: ['', ''],
        claseRevision: ''
      }
    ]
  },
  {
    id: '6',
    nombre: 'Integración, límites y seguridad',
    descripcion: 'Cómo convivir con la medicina convencional y protegerte como médico.',
    expanded: false,
    bloques: [
      {
        id: 'b11',
        tipo: 'video',
        titulo: 'Integración y límites',
        archivo: null,
        duracion: '',
        descripcion: ''
      },
      {
        id: 'b12',
        tipo: 'lectura',
        titulo: 'Aspectos legales y éticos',
        archivo: null,
        bibliografia: []
      }
    ]
  },
  {
    id: '7',
    nombre: 'Evaluación clínica',
    descripcion: 'Aplicación práctica de lo aprendido.',
    expanded: false,
    bloques: [
      {
        id: 'b13',
        tipo: 'tarea',
        titulo: 'Caso clínico práctico',
        instrucciones: '',
        archivosDescargables: [],
        rubrica: ['', ''],
        claseRevision: ''
      },
      {
        id: 'b14',
        tipo: 'examen',
        titulo: 'Quiz razonado',
        preguntas: [],
        config: { preguntasPorIntento: 5, notaMinima: 70, mostrarRespuestas: true, esperaIntentos: 24 }
      }
    ]
  }
];

// 🔬 TALLER CLÍNICO
const PLANTILLA_TALLER: Module[] = [
  {
    id: '1',
    nombre: 'El problema clínico',
    descripcion: 'Situación concreta que genera dudas o errores frecuentes.',
    expanded: true,
    bloques: [
      {
        id: 'b1',
        tipo: 'video',
        titulo: 'Situación clínica común',
        archivo: null,
        duracion: '',
        descripcion: 'Qué suele hacerse mal'
      },
      {
        id: 'b2',
        tipo: 'lectura',
        titulo: 'Errores más comunes',
        archivo: null,
        bibliografia: []
      }
    ]
  },
  {
    id: '2',
    nombre: 'Cómo abordarlo correctamente',
    descripcion: 'Decisiones paso a paso.',
    expanded: false,
    bloques: [
      {
        id: 'b3',
        tipo: 'video',
        titulo: 'Protocolo paso a paso',
        archivo: null,
        duracion: '',
        descripcion: ''
      },
      {
        id: 'b4',
        tipo: 'lectura',
        titulo: 'Decisiones clave',
        archivo: null,
        bibliografia: []
      }
    ]
  },
  {
    id: '3',
    nombre: 'Aplicación práctica',
    descripcion: 'Casos guiados para aplicar el abordaje.',
    expanded: false,
    bloques: [
      {
        id: 'b5',
        tipo: 'video',
        titulo: 'Casos guiados',
        archivo: null,
        duracion: '',
        descripcion: ''
      },
      {
        id: 'b6',
        tipo: 'tarea',
        titulo: 'Ejercicio práctico',
        instrucciones: '',
        archivosDescargables: [],
        rubrica: ['', ''],
        claseRevision: ''
      }
    ]
  },
  {
    id: '4',
    nombre: 'Checklist final',
    descripcion: 'Qué hacer y qué no hacer.',
    expanded: false,
    bloques: [
      {
        id: 'b7',
        tipo: 'lectura',
        titulo: 'Checklist de acción',
        archivo: null,
        bibliografia: []
      },
      {
        id: 'b8',
        tipo: 'examen',
        titulo: 'Evaluación corta (opcional)',
        preguntas: [],
        config: { preguntasPorIntento: 5, notaMinima: 70, mostrarRespuestas: true, esperaIntentos: 24 }
      }
    ]
  }
];

// 🧠 PROGRAMA AVANZADO
const PLANTILLA_AVANZADO: Module[] = [
  {
    id: '1',
    nombre: 'Casos complejos y ambigüedad clínica',
    descripcion: 'Situaciones donde no hay respuesta única. Criterio experto.',
    expanded: true,
    bloques: [
      {
        id: 'b1',
        tipo: 'video',
        titulo: 'Casos complejos',
        archivo: null,
        duracion: '',
        descripcion: ''
      },
      {
        id: 'b2',
        tipo: 'lectura',
        titulo: 'Análisis de ambigüedad',
        archivo: null,
        bibliografia: []
      }
    ]
  },
  {
    id: '2',
    nombre: 'Decisiones difíciles',
    descripcion: 'Dilemas clínicos y toma de decisiones bajo incertidumbre.',
    expanded: false,
    bloques: [
      {
        id: 'b3',
        tipo: 'video',
        titulo: 'Criterio ante dilemas',
        archivo: null,
        duracion: '',
        descripcion: ''
      },
      {
        id: 'b4',
        tipo: 'tarea',
        titulo: 'Análisis de decisión',
        instrucciones: '',
        archivosDescargables: [],
        rubrica: ['', ''],
        claseRevision: ''
      }
    ]
  },
  {
    id: '3',
    nombre: 'Errores, fracasos y reajustes',
    descripcion: 'Qué hacer cuando el abordaje inicial no funciona.',
    expanded: false,
    bloques: [
      {
        id: 'b5',
        tipo: 'video',
        titulo: 'Fracasos terapéuticos',
        archivo: null,
        duracion: '',
        descripcion: ''
      },
      {
        id: 'b6',
        tipo: 'lectura',
        titulo: 'Estrategias de reajuste',
        archivo: null,
        bibliografia: []
      }
    ]
  },
  {
    id: '4',
    nombre: 'Criterio experto y sesgos médicos',
    descripcion: 'Cómo pensar más allá del protocolo.',
    expanded: false,
    bloques: [
      {
        id: 'b7',
        tipo: 'video',
        titulo: 'Desarrollo del criterio',
        archivo: null,
        duracion: '',
        descripcion: ''
      },
      {
        id: 'b8',
        tipo: 'lectura',
        titulo: 'Sesgos cognitivos en medicina',
        archivo: null,
        bibliografia: []
      }
    ]
  },
  {
    id: '5',
    nombre: 'Aspectos éticos y legales',
    descripcion: 'Discusión ética y marco legal.',
    expanded: false,
    bloques: [
      {
        id: 'b9',
        tipo: 'video',
        titulo: 'Ética clínica avanzada',
        archivo: null,
        duracion: '',
        descripcion: ''
      },
      {
        id: 'b10',
        tipo: 'lectura',
        titulo: 'Marco legal',
        archivo: null,
        bibliografia: []
      }
    ]
  },
  {
    id: '6',
    nombre: 'Evaluación avanzada',
    descripcion: 'Caso largo y reflexión clínica.',
    expanded: false,
    bloques: [
      {
        id: 'b11',
        tipo: 'tarea',
        titulo: 'Caso clínico complejo',
        instrucciones: '',
        archivosDescargables: [],
        rubrica: ['', ''],
        claseRevision: ''
      },
      {
        id: 'b12',
        tipo: 'examen',
        titulo: 'Evaluación de criterio',
        preguntas: [],
        config: { preguntasPorIntento: 5, notaMinima: 70, mostrarRespuestas: true, esperaIntentos: 24 }
      }
    ]
  }
];

// Información de las plantillas
const PLANTILLAS_INFO: PlantillaInfo[] = [
  {
    id: 'masterclass',
    nombre: 'Masterclass Médica',
    descripcion: 'Formato corto centrado en el enfoque experto. Ideal para compartir tu experiencia clínica.',
    duracion: '2-3 módulos',
    nivel: 'Todos los niveles',
    estructura: PLANTILLA_MASTERCLASS
  },
  {
    id: 'especializacion',
    nombre: 'Curso de Especialización',
    descripcion: 'Formación profunda y estructurada. Desde fundamentos hasta aplicación clínica.',
    duracion: '5-7 módulos',
    nivel: 'Profesional',
    estructura: PLANTILLA_ESPECIALIZACION
  },
  {
    id: 'taller',
    nombre: 'Taller Clínico',
    descripcion: 'Práctico y directo. Resuelve un problema clínico concreto paso a paso.',
    duracion: '3-4 módulos',
    nivel: 'Aplicación práctica',
    estructura: PLANTILLA_TALLER
  },
  {
    id: 'avanzado',
    nombre: 'Programa Avanzado',
    descripcion: 'Para médicos senior. Casos complejos, criterio experto y dilemas clínicos.',
    duracion: '6-8 módulos',
    nivel: 'Avanzado',
    estructura: PLANTILLA_AVANZADO
  }
];

// Componente de Selector de Plantillas (estilo Canva)
function PlantillaSelector({ onSelect, onEmpezarBlanco }: { onSelect: (tipo: TipoPlantilla) => void, onEmpezarBlanco: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Qué tipo de curso vas a crear?</h3>
        <p className="text-gray-600">Elige la estructura que mejor se adapte a tu contenido</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLANTILLAS_INFO.map((plantilla) => (
          <Card
            key={plantilla.id}
            className="p-5 cursor-pointer hover:border-purple-400 hover:shadow-lg transition-all group"
            onClick={() => onSelect(plantilla.id)}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                    {plantilla.nombre}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {plantilla.descripcion}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Library className="w-3.5 h-3.5" />
                  <span>{plantilla.duracion}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{plantilla.nivel}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center pt-4 border-t border-gray-200">
        <Button
          onClick={onEmpezarBlanco}
          variant="outline"
          className="text-gray-600 hover:text-gray-900"
        >
          <Plus className="w-4 h-4 mr-2" />
          Empezar con estructura personalizada
        </Button>
      </div>
    </div>
  );
}

// Componente para mostrar un bloque en la lista
function BloqueItem({ bloque, onEdit, onDelete, index }: any) {
  const getIcon = () => {
    switch (bloque.tipo) {
      case 'video': return <Video className="w-5 h-5 text-purple-600" />;
      case 'lectura': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'tarea': return <CheckSquare className="w-5 h-5 text-green-600" />;
      case 'examen': return <BookOpen className="w-5 h-5 text-orange-600" />;
    }
  };

  const getTipoLabel = () => {
    switch (bloque.tipo) {
      case 'video': return 'Video';
      case 'lectura': return 'Lectura';
      case 'tarea': return 'Tarea';
      case 'examen': return 'Examen';
    }
  };

  const getBgColor = () => {
    switch (bloque.tipo) {
      case 'video': return 'bg-purple-50';
      case 'lectura': return 'bg-blue-50';
      case 'tarea': return 'bg-green-50';
      case 'examen': return 'bg-orange-50';
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors ${getBgColor()}`}>
      <div className="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0 border border-gray-200">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase">{getTipoLabel()}</span>
        </div>
        <p className="font-medium text-gray-900 truncate text-sm">{bloque.titulo || 'Sin título'}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Componente de Módulo
function ModuleCard({ 
  module, 
  index, 
  onUpdate,
  onDelete,
  onAddBloque,
  onEditBloque,
  onDeleteBloque,
  canDelete
}: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <Card className="border-2 border-gray-200 hover:border-purple-300 transition-colors">
      <div className="p-4 bg-gradient-to-r from-purple-50 to-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate(module.id, { expanded: !module.expanded })}
            className="p-0 h-auto hover:bg-transparent"
          >
            {module.expanded ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </Button>

          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={module.nombre}
                  onChange={(e) => onUpdate(module.id, { nombre: e.target.value })}
                  placeholder="Nombre del módulo"
                  className="font-semibold"
                />
                <Textarea
                  value={module.descripcion}
                  onChange={(e) => onUpdate(module.id, { descripcion: e.target.value })}
                  placeholder="Descripción (opcional)"
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
            ) : (
              <>
                <h4 className="font-semibold text-gray-900">{module.nombre || 'Sin nombre'}</h4>
                {module.descripcion && (
                  <p className="text-sm text-gray-600 mt-1">{module.descripcion}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{module.bloques.length} bloque{module.bloques.length !== 1 ? 's' : ''}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Listo
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(module.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {module.expanded && (
        <div className="p-4 space-y-3">
          {/* Lista de bloques */}
          {module.bloques.length > 0 ? (
            <div className="space-y-2">
              {module.bloques.map((bloque: Bloque, idx: number) => (
                <BloqueItem
                  key={bloque.id}
                  bloque={bloque}
                  index={idx}
                  onEdit={() => onEditBloque(module.id, bloque.id)}
                  onDelete={() => onDeleteBloque(module.id, bloque.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic py-4 text-center">No hay contenido todavía. Agrega un bloque abajo.</p>
          )}

          {/* Botón agregar bloque */}
          <div className="relative">
            {showAddMenu ? (
              <div className="border-2 border-purple-300 rounded-lg p-3 bg-white">
                <p className="text-sm font-medium text-gray-700 mb-3">¿Qué tipo de contenido quieres agregar?</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onAddBloque(module.id, 'video');
                      setShowAddMenu(false);
                    }}
                    className="justify-start"
                  >
                    <Video className="w-4 h-4 mr-2 text-purple-600" />
                    Video
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onAddBloque(module.id, 'lectura');
                      setShowAddMenu(false);
                    }}
                    className="justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    Lectura
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onAddBloque(module.id, 'tarea');
                      setShowAddMenu(false);
                    }}
                    className="justify-start"
                  >
                    <CheckSquare className="w-4 h-4 mr-2 text-green-600" />
                    Tarea
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onAddBloque(module.id, 'examen');
                      setShowAddMenu(false);
                    }}
                    className="justify-start"
                  >
                    <BookOpen className="w-4 h-4 mr-2 text-orange-600" />
                    Examen
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddMenu(false)}
                  className="w-full mt-2"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowAddMenu(true)}
                variant="outline"
                className="w-full border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar contenido
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// Modal para Video
function VideoModal({ bloque, onSave, onClose }: any) {
  const [formData, setFormData] = useState(bloque || {
    titulo: '',
    archivo: null,
    duracion: '',
    descripcion: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({
    duracion: false,
    subtitulos: false,
    transcripcion: false
  });

  // Simular procesamiento de video al subir archivo
  const handleFileUpload = (file: File) => {
    setFormData({ ...formData, archivo: file });
    setIsProcessing(true);

    // Simular extracción de duración
    setTimeout(() => {
      setProcessingStatus(prev => ({ ...prev, duracion: true }));
      // Simular duración extraída (en producción vendría del backend)
      const duracionSimulada = '15:30';
      setFormData(prev => ({ ...prev, archivo: file, duracion: duracionSimulada }));
    }, 1000);

    // Simular generación de subtítulos
    setTimeout(() => {
      setProcessingStatus(prev => ({ ...prev, subtitulos: true }));
    }, 2000);

    // Simular generación de transcripción
    setTimeout(() => {
      setProcessingStatus(prev => ({ ...prev, transcripcion: true }));
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">{bloque ? 'Editar video' : 'Agregar video'}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Título del video *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Introducción al diagnóstico"
              />
            </div>

            <div>
              <Label>Archivo de video</Label>
              <label className="block">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.archivo ? formData.archivo.name : 'Haz clic o arrastra tu video aquí'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI (máx. 2GB)</p>
                </div>
              </label>

              {/* Estado de procesamiento */}
              {formData.archivo && (
                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {processingStatus.duracion ? (
                      <CheckSquare className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    <span className={processingStatus.duracion ? 'text-green-700' : 'text-purple-700'}>
                      {processingStatus.duracion ? 'Duración extraída' : 'Extrayendo duración...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {processingStatus.subtitulos ? (
                      <CheckSquare className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    <span className={processingStatus.subtitulos ? 'text-green-700' : 'text-purple-700'}>
                      {processingStatus.subtitulos ? 'Subtítulos generados' : 'Generando subtítulos...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {processingStatus.transcripcion ? (
                      <CheckSquare className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    <span className={processingStatus.transcripcion ? 'text-green-700' : 'text-purple-700'}>
                      {processingStatus.transcripcion ? 'Transcripción generada' : 'Generando transcripción...'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>Duración aproximada</Label>
              <Input
                value={formData.duracion}
                disabled
                placeholder="Se calculará automáticamente"
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Se extrae automáticamente del video</p>
            </div>

            <div>
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="¿Qué aprenderán en este video?"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button 
              onClick={() => onSave({ ...formData, tipo: 'video' })} 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!formData.titulo || isProcessing}
            >
              {bloque ? 'Guardar cambios' : 'Agregar video'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Modal para Lectura
function LecturaModal({ bloque, onSave, onClose }: any) {
  const [formData, setFormData] = useState(bloque || {
    titulo: '',
    archivo: null,
    bibliografia: []
  });

  const agregarReferencia = () => {
    setFormData({
      ...formData,
      bibliografia: [...formData.bibliografia, '']
    });
  };

  const actualizarReferencia = (index: number, valor: string) => {
    const nuevaBibliografia = [...formData.bibliografia];
    nuevaBibliografia[index] = valor;
    setFormData({ ...formData, bibliografia: nuevaBibliografia });
  };

  const eliminarReferencia = (index: number) => {
    setFormData({
      ...formData,
      bibliografia: formData.bibliografia.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">{bloque ? 'Editar lectura' : 'Agregar lectura'}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Título de la lectura *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Fundamentos de cardiología"
              />
            </div>

            <div>
              <Label>Archivo de lectura</Label>
              <label className="block">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFormData({ ...formData, archivo: file });
                  }}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.archivo ? formData.archivo.name : 'Haz clic o arrastra tu archivo aquí'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF (máx. 20MB)</p>
                </div>
              </label>
            </div>

            <div>
              <Label>Bibliografía (opcional)</Label>
              <p className="text-sm text-gray-600 mb-2">Referencias científicas para este tema</p>
              {formData.bibliografia.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.bibliografia.map((ref: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ref}
                        onChange={(e) => actualizarReferencia(index, e.target.value)}
                        placeholder="Referencia completa o DOI"
                        className="text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarReferencia(index)}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                onClick={agregarReferencia}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Plus className="w-3 h-3 mr-1" />
                Agregar referencia
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button 
              onClick={() => onSave({ ...formData, tipo: 'lectura' })} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!formData.titulo}
            >
              {bloque ? 'Guardar cambios' : 'Agregar lectura'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Modal para Tarea
function TareaModal({ bloque, onSave, onClose, modules }: any) {
  const [formData, setFormData] = useState(bloque || {
    titulo: '',
    instrucciones: '',
    archivosDescargables: [],
    rubrica: ['', ''],
    claseRevision: ''
  });

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setFormData({
        ...formData,
        archivosDescargables: [...formData.archivosDescargables, ...fileArray]
      });
    }
  };

  const eliminarArchivo = (index: number) => {
    setFormData({
      ...formData,
      archivosDescargables: formData.archivosDescargables.filter((_: any, i: number) => i !== index)
    });
  };

  // Rubrica helpers
  const rubrica: string[] = formData.rubrica || ['', ''];
  const MAX_RUBRICA = 8;

  const actualizarCriterio = (index: number, valor: string) => {
    const nueva = [...rubrica];
    nueva[index] = valor;
    setFormData({ ...formData, rubrica: nueva });
  };

  const agregarCriterio = () => {
    if (rubrica.length < MAX_RUBRICA) {
      setFormData({ ...formData, rubrica: [...rubrica, ''] });
    }
  };

  const eliminarCriterio = (index: number) => {
    if (rubrica.length > 1) {
      setFormData({ ...formData, rubrica: rubrica.filter((_: any, i: number) => i !== index) });
    }
  };

  // Collect all video/lectura lessons from modules for the "Clase de revisión" dropdown
  const leccionesDisponibles: { id: string; label: string }[] = [];
  if (modules) {
    (modules as Module[]).forEach((mod) => {
      mod.bloques.forEach((b) => {
        if (b.tipo === 'video' || b.tipo === 'lectura') {
          leccionesDisponibles.push({
            id: b.id,
            label: `${mod.nombre} → ${b.titulo || (b.tipo === 'video' ? 'Video sin título' : 'Lectura sin título')}`
          });
        }
      });
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">{bloque ? 'Editar tarea' : 'Agregar tarea'}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Título */}
            <div>
              <Label>Título de la tarea *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Análisis de caso clínico"
              />
            </div>

            {/* Instrucciones */}
            <div>
              <Label>Instrucciones *</Label>
              <Textarea
                value={formData.instrucciones}
                onChange={(e) => setFormData({ ...formData, instrucciones: e.target.value })}
                placeholder="Explica qué deben hacer los alumnos...&#10;&#10;Puedes usar múltiples líneas para dar instrucciones claras y detalladas."
                rows={8}
                className="resize-y"
              />
              <p className="text-xs text-gray-500 mt-1">Escribe las instrucciones completas. Los saltos de línea se respetarán.</p>
            </div>

            {/* Archivos descargables */}
            <div>
              <Label>Archivos descargables (opcional)</Label>
              <p className="text-sm text-gray-600 mb-2">Plantillas, casos de estudio, documentos de apoyo, etc.</p>
              
              <label className="block">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Haz clic o arrastra archivos aquí
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Puedes subir múltiples archivos</p>
                </div>
              </label>

              {formData.archivosDescargables.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.archivosDescargables.map((archivo: File, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Download className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{archivo.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarArchivo(index)}
                        className="text-red-600 hover:text-red-700 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BLOQUE 1 — Rúbrica de autoevaluación */}
            <div>
              <Label className="font-semibold">Rúbrica de autoevaluación *</Label>
              <p className="text-xs text-gray-500 mt-1 mb-3">El alumno marcará estos criterios al completar la tarea antes de ver la solución.</p>
              
              <div className="space-y-2">
                {rubrica.map((criterio: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-gray-400 cursor-grab select-none text-lg leading-none" title="Arrastrar para reordenar">⠿</span>
                    <Input
                      value={criterio}
                      onChange={(e) => actualizarCriterio(index, e.target.value)}
                      placeholder="Ej: Identifiqué el problema principal del caso"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarCriterio(index)}
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
                      disabled={rubrica.length <= 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {rubrica.length < MAX_RUBRICA && (
                <button
                  type="button"
                  onClick={agregarCriterio}
                  className="w-full mt-3 border-2 border-dashed border-gray-300 rounded-lg py-2.5 text-sm text-green-600 hover:border-green-400 hover:bg-green-50 transition-colors"
                >
                  + Agregar criterio ({rubrica.length}/{MAX_RUBRICA})
                </button>
              )}

              {rubrica.length >= MAX_RUBRICA && (
                <p className="text-xs text-gray-500 italic text-center mt-2">Máximo de {MAX_RUBRICA} criterios alcanzado</p>
              )}
            </div>

            {/* BLOQUE 2 — Clase de revisión */}
            <div>
              <Label className="font-semibold">Clase de revisión *</Label>
              <p className="text-xs text-gray-500 mt-1 mb-3">Esta lección se desbloqueará automáticamente cuando el alumno complete la autoevaluación.</p>
              
              <Select
                value={formData.claseRevision || ''}
                onChange={(e) => setFormData({ ...formData, claseRevision: e.target.value })}
              >
                <option value="" disabled>Selecciona una lección del curso</option>
                {leccionesDisponibles.map((leccion) => (
                  <option key={leccion.id} value={leccion.id}>{leccion.label}</option>
                ))}
              </Select>

              <div className="flex items-center gap-2 mt-2 text-xs text-green-700">
                <span className="text-green-600">🔒</span>
                <span>El alumno no puede ver esta lección hasta completar la autoevaluación.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button 
              onClick={() => onSave({ ...formData, tipo: 'tarea' })} 
              className="bg-green-600 hover:bg-green-700"
              disabled={!formData.titulo || !formData.instrucciones}
            >
              {bloque ? 'Guardar cambios' : 'Agregar tarea'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Modal para Examen
function ExamenModal({ bloque, onSave, onClose }: any) {
  const [formData, setFormData] = useState(bloque || {
    titulo: '',
    preguntas: [
      {
        id: Date.now().toString(),
        pregunta: '',
        tipo: 'unica',
        opciones: ['', '', '', ''],
        respuestaCorrecta: 0
      }
    ],
    config: {
      preguntasPorIntento: 5,
      notaMinima: 70,
      mostrarRespuestas: true,
      esperaIntentos: 24
    }
  });

  const config: ExamenConfig = formData.config || {
    preguntasPorIntento: 5,
    notaMinima: 70,
    mostrarRespuestas: true,
    esperaIntentos: 24
  };

  const updateConfig = (partial: Partial<ExamenConfig>) => {
    setFormData({ ...formData, config: { ...config, ...partial } });
  };

  const totalPreguntasBanco = formData.preguntas.length;
  const bancoSuficiente = totalPreguntasBanco >= config.preguntasPorIntento * 3;

  const agregarPregunta = () => {
    setFormData({
      ...formData,
      preguntas: [
        ...formData.preguntas,
        {
          id: Date.now().toString(),
          pregunta: '',
          tipo: 'unica',
          opciones: ['', '', '', ''],
          respuestaCorrecta: 0
        }
      ]
    });
  };

  const actualizarPregunta = (index: number, campo: string, valor: any) => {
    const nuevasPreguntas = [...formData.preguntas];
    
    // Si cambian el tipo de pregunta, resetear respuesta correcta y opciones
    if (campo === 'tipo') {
      if (valor === 'vf') {
        nuevasPreguntas[index] = { 
          ...nuevasPreguntas[index], 
          tipo: 'vf',
          opciones: ['Verdadero', 'Falso'],
          respuestaCorrecta: 0
        };
      } else {
        const needsNewOpciones = nuevasPreguntas[index].tipo === 'vf';
        nuevasPreguntas[index] = { 
          ...nuevasPreguntas[index], 
          tipo: valor,
          opciones: needsNewOpciones ? ['', '', '', ''] : nuevasPreguntas[index].opciones,
          respuestaCorrecta: valor === 'unica' ? 0 : []
        };
      }
    } else {
      nuevasPreguntas[index] = { ...nuevasPreguntas[index], [campo]: valor };
    }
    
    setFormData({ ...formData, preguntas: nuevasPreguntas });
  };

  const actualizarOpcion = (preguntaIndex: number, opcionIndex: number, valor: string) => {
    const nuevasPreguntas = [...formData.preguntas];
    nuevasPreguntas[preguntaIndex].opciones[opcionIndex] = valor;
    setFormData({ ...formData, preguntas: nuevasPreguntas });
  };

  const toggleRespuestaMultiple = (preguntaIndex: number, opcionIndex: number) => {
    const nuevasPreguntas = [...formData.preguntas];
    const pregunta = nuevasPreguntas[preguntaIndex];
    const respuestas = Array.isArray(pregunta.respuestaCorrecta) ? [...pregunta.respuestaCorrecta] : [];
    
    if (respuestas.includes(opcionIndex)) {
      pregunta.respuestaCorrecta = respuestas.filter(r => r !== opcionIndex);
    } else {
      pregunta.respuestaCorrecta = [...respuestas, opcionIndex].sort();
    }
    
    setFormData({ ...formData, preguntas: nuevasPreguntas });
  };

  const agregarOpcion = (preguntaIndex: number) => {
    const nuevasPreguntas = [...formData.preguntas];
    const pregunta = nuevasPreguntas[preguntaIndex];
    
    if (pregunta.opciones.length < 6) {
      pregunta.opciones.push('');
      setFormData({ ...formData, preguntas: nuevasPreguntas });
    }
  };

  const eliminarOpcion = (preguntaIndex: number, opcionIndex: number) => {
    const nuevasPreguntas = [...formData.preguntas];
    const pregunta = nuevasPreguntas[preguntaIndex];
    
    if (pregunta.opciones.length > 2) {
      pregunta.opciones.splice(opcionIndex, 1);
      
      // Ajustar respuesta correcta si es necesario
      if (pregunta.tipo === 'unica') {
        if (pregunta.respuestaCorrecta === opcionIndex) {
          pregunta.respuestaCorrecta = 0; // Resetear a la primera opción
        } else if (pregunta.respuestaCorrecta > opcionIndex) {
          pregunta.respuestaCorrecta = (pregunta.respuestaCorrecta as number) - 1;
        }
      } else {
        // Para selección múltiple
        const respuestas = Array.isArray(pregunta.respuestaCorrecta) ? pregunta.respuestaCorrecta : [];
        pregunta.respuestaCorrecta = respuestas
          .filter(r => r !== opcionIndex)
          .map(r => r > opcionIndex ? r - 1 : r);
      }
      
      setFormData({ ...formData, preguntas: nuevasPreguntas });
    }
  };

  const eliminarPregunta = (index: number) => {
    setFormData({
      ...formData,
      preguntas: formData.preguntas.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold">{bloque ? 'Editar examen' : 'Agregar examen'}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Título del examen *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Evaluación módulo 1"
              />
            </div>

            {/* ── Configuración del examen ─────────────────── */}
            <div className="space-y-4 bg-gray-50/60 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900">Configuración del examen</h4>

              {/* Fila 1 — Preguntas por intento */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-sm">Preguntas por intento</Label>
                    <p className="text-xs text-gray-500 mt-0.5">El sistema selecciona este número aleatoriamente del banco. Cada intento es diferente.</p>
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden ml-4">
                    <button
                      type="button"
                      onClick={() => updateConfig({ preguntasPorIntento: Math.max(1, config.preguntasPorIntento - 1) })}
                      className="px-2 py-1.5 text-gray-600 hover:bg-gray-100 border-r border-gray-300"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium min-w-[2.5rem] text-center">{config.preguntasPorIntento}</span>
                    <button
                      type="button"
                      onClick={() => updateConfig({ preguntasPorIntento: config.preguntasPorIntento + 1 })}
                      className="px-2 py-1.5 text-gray-600 hover:bg-gray-100 border-l border-gray-300"
                    >
                      <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
                <p className={`text-xs mt-1.5 ${bancoSuficiente ? 'text-gray-500' : 'text-orange-600'}`}>
                  Tienes {totalPreguntasBanco} pregunta{totalPreguntasBanco !== 1 ? 's' : ''} en el banco. Recomendamos al menos el triple ({config.preguntasPorIntento * 3}) para buena variedad.
                </p>
              </div>

              {/* Fila 2 — Nota mínima para aprobar */}
              <div className="flex items-center justify-between">
                <Label className="text-sm">Nota mínima para aprobar</Label>
                <div className="flex gap-1.5">
                  {[50, 60, 70, 80].map((nota) => (
                    <button
                      key={nota}
                      type="button"
                      onClick={() => updateConfig({ notaMinima: nota })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        config.notaMinima === nota
                          ? 'bg-orange-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {nota}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Fila 3 — Mostrar respuestas al terminar */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-sm">Mostrar respuestas correctas al terminar</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Si lo desactiva, el alumno ve su nota pero no qué falló — le obliga a repasar antes del siguiente bloque de intentos.</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfig({ mostrarRespuestas: !config.mostrarRespuestas })}
                  className={`relative ml-4 w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    config.mostrarRespuestas ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    config.mostrarRespuestas ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Fila 4 — Espera entre intentos */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-sm">Espera tras 3 intentos fallidos</Label>
                    <p className="text-xs text-gray-500 mt-0.5">Tras 3 intentos fallidos consecutivos el examen se bloquea. El alumno debe esperar antes de volver a intentarlo. Los intentos totales son ilimitados.</p>
                  </div>
                  <div className="flex gap-1.5 ml-4">
                    {[24, 48].map((horas) => (
                      <button
                        key={horas}
                        type="button"
                        onClick={() => updateConfig({ esperaIntentos: horas })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          config.esperaIntentos === horas
                            ? 'bg-orange-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {horas} horas
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-px" />
                  <p className="text-xs text-gray-600">El alumno verá un contador con el tiempo restante y recibirá una notificación cuando pueda volver a intentarlo.</p>
                </div>
              </div>
            </div>

            {/* Separador */}
            <hr className="border-gray-200" />

            <div>
              <Label className="mb-3 block">Preguntas</Label>

              {formData.preguntas.length > 0 ? (
                <div className="space-y-4">
                  {formData.preguntas.map((pregunta: Pregunta, pIndex: number) => (
                    <Card key={pregunta.id} className="p-4 bg-gray-50">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {pIndex + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <Input
                            value={pregunta.pregunta}
                            onChange={(e) => actualizarPregunta(pIndex, 'pregunta', e.target.value)}
                            placeholder="Escribe la pregunta"
                          />
                          
                          {/* Selector de tipo de pregunta */}
                          <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-3">
                            <span className="text-sm font-medium text-gray-700">Tipo de pregunta:</span>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`tipo-${pIndex}`}
                                  checked={pregunta.tipo === 'unica'}
                                  onChange={() => actualizarPregunta(pIndex, 'tipo', 'unica')}
                                  className="w-4 h-4 text-orange-600"
                                />
                                <span className="text-sm text-gray-700">Respuesta única</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`tipo-${pIndex}`}
                                  checked={pregunta.tipo === 'multiple'}
                                  onChange={() => actualizarPregunta(pIndex, 'tipo', 'multiple')}
                                  className="w-4 h-4 text-orange-600"
                                />
                                <span className="text-sm text-gray-700">Selección múltiple</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`tipo-${pIndex}`}
                                  checked={pregunta.tipo === 'vf'}
                                  onChange={() => actualizarPregunta(pIndex, 'tipo', 'vf')}
                                  className="w-4 h-4 text-orange-600"
                                />
                                <span className="text-sm text-gray-700">Verdadero / Falso</span>
                              </label>
                            </div>
                          </div>

                          {/* Opciones */}
                          <div className="space-y-2">
                            {pregunta.tipo === 'vf' ? (
                              /* Verdadero / Falso — opciones fijas no editables */
                              <>
                                {['Verdadero', 'Falso'].map((label, oIndex) => (
                                  <div key={oIndex} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`respuesta-${pIndex}`}
                                      checked={pregunta.respuestaCorrecta === oIndex}
                                      onChange={() => actualizarPregunta(pIndex, 'respuestaCorrecta', oIndex)}
                                      className="w-4 h-4 text-orange-600"
                                    />
                                    <span className={`text-sm py-2 px-3 rounded-lg border flex-1 ${
                                      pregunta.respuestaCorrecta === oIndex
                                        ? 'bg-orange-50 border-orange-300 text-orange-800 font-medium'
                                        : 'bg-gray-50 border-gray-200 text-gray-700'
                                    }`}>
                                      {label}
                                    </span>
                                  </div>
                                ))}
                              </>
                            ) : (
                              /* Respuesta única o múltiple — opciones editables */
                              <>
                                {pregunta.opciones.map((opcion: string, oIndex: number) => (
                                  <div key={oIndex} className="flex items-center gap-2">
                                    {pregunta.tipo === 'unica' ? (
                                      <input
                                        type="radio"
                                        name={`respuesta-${pIndex}`}
                                        checked={pregunta.respuestaCorrecta === oIndex}
                                        onChange={() => actualizarPregunta(pIndex, 'respuestaCorrecta', oIndex)}
                                        className="w-4 h-4 text-orange-600"
                                      />
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={Array.isArray(pregunta.respuestaCorrecta) && pregunta.respuestaCorrecta.includes(oIndex)}
                                        onChange={() => toggleRespuestaMultiple(pIndex, oIndex)}
                                        className="w-4 h-4 text-orange-600 rounded"
                                      />
                                    )}
                                    <Input
                                      value={opcion}
                                      onChange={(e) => actualizarOpcion(pIndex, oIndex, e.target.value)}
                                      placeholder={`Opción ${oIndex + 1}`}
                                      className="text-sm"
                                    />
                                    {pregunta.opciones.length > 2 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => eliminarOpcion(pIndex, oIndex)}
                                        className="text-red-600 hover:text-red-700 flex-shrink-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                
                                {/* Botón agregar opción */}
                                {pregunta.opciones.length < 6 && (
                                  <Button
                                    onClick={() => agregarOpcion(pIndex)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2 text-xs"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Agregar opción ({pregunta.opciones.length}/6)
                                  </Button>
                                )}
                                
                                {pregunta.opciones.length >= 6 && (
                                  <p className="text-xs text-gray-500 italic text-center mt-2">
                                    Máximo de 6 opciones alcanzado
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            <HelpCircle className="w-3 h-3 inline mr-1" />
                            {pregunta.tipo === 'vf'
                              ? 'Seleccione cuál es la respuesta correcta'
                              : pregunta.tipo === 'unica' 
                                ? 'Marca la opción correcta con el círculo'
                                : 'Marca todas las opciones correctas con las casillas'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarPregunta(pIndex)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic py-4 text-center">
                  No hay preguntas todavía. Agrega una abajo.
                </p>
              )}

              {/* Botón de agregar pregunta al final */}
              <Button
                onClick={agregarPregunta}
                variant="outline"
                className="w-full mt-4 border-2 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar pregunta
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button 
              onClick={() => onSave({ ...formData, tipo: 'examen' })} 
              className="bg-orange-600 hover:bg-orange-700"
              disabled={!formData.titulo}
            >
              {bloque ? 'Guardar cambios' : 'Agregar examen'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function CourseBuilderStep({ formData, updateFormData }: Props) {
  const [modules, setModules] = useState<Module[]>(formData.modulos || []);
  // Mostrar la opción de plantilla solo si NO hay módulos creados
  const [showPlantillaOption, setShowPlantillaOption] = useState(formData.modulos.length === 0);
  const [bloqueModal, setBloqueModal] = useState<{ moduleId: string, bloque: Bloque | null, tipo: string } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Sincronizar módulos con formData
  useEffect(() => {
    updateFormData({ modulos: modules });
  }, [modules]);

  // Funciones para módulos
  const usarPlantilla = (tipo: TipoPlantilla) => {
    const plantilla = PLANTILLAS_INFO.find(p => p.id === tipo);
    if (plantilla) {
      setModules(plantilla.estructura);
      setShowPlantillaOption(false);
    }
  };

  const empezarDesdeBlanco = () => {
    setModules([
      {
        id: '1',
        nombre: 'Módulo 1',
        descripcion: '',
        bloques: [],
        expanded: true
      }
    ]);
    setShowPlantillaOption(false);
  };

  const agregarModulo = () => {
    const nuevoModulo: Module = {
      id: Date.now().toString(),
      nombre: `Módulo ${modules.length + 1}`,
      descripcion: '',
      bloques: [],
      expanded: true
    };
    setModules([...modules, nuevoModulo]);
  };

  const actualizarModulo = (id: string, updates: Partial<Module>) => {
    setModules(modules.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const eliminarModulo = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  // Funciones para bloques
  const agregarBloque = (moduleId: string, tipo: string) => {
    setBloqueModal({ moduleId, bloque: null, tipo });
  };

  const editarBloque = (moduleId: string, bloqueId: string) => {
    const module = modules.find(m => m.id === moduleId);
    const bloque = module?.bloques.find(b => b.id === bloqueId);
    if (bloque) {
      setBloqueModal({ moduleId, bloque, tipo: bloque.tipo });
    }
  };

  const guardarBloque = (moduleId: string, bloqueData: any) => {
    const bloque = bloqueModal?.bloque;
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        if (bloque) {
          // Editar
          return {
            ...m,
            bloques: m.bloques.map(b => b.id === bloque.id ? { ...b, ...bloqueData } : b)
          };
        } else {
          // Agregar
          return {
            ...m,
            bloques: [...m.bloques, { ...bloqueData, id: Date.now().toString() }]
          };
        }
      }
      return m;
    }));
    setBloqueModal(null);
  };

  const eliminarBloque = (moduleId: string, bloqueId: string) => {
    setModules(modules.map(m => 
      m.id === moduleId 
        ? { ...m, bloques: m.bloques.filter(b => b.id !== bloqueId) }
        : m
    ));
  };

  // Contadores
  const totalBloques = modules.reduce((acc, m) => acc + m.bloques.length, 0);
  const totalVideos = modules.reduce((acc, m) => acc + m.bloques.filter(b => b.tipo === 'video').length, 0);
  const totalLecturas = modules.reduce((acc, m) => acc + m.bloques.filter(b => b.tipo === 'lectura').length, 0);
  const totalTareas = modules.reduce((acc, m) => acc + m.bloques.filter(b => b.tipo === 'tarea').length, 0);
  const totalExamenes = modules.reduce((acc, m) => acc + m.bloques.filter(b => b.tipo === 'examen').length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Construye tu curso
        </h3>
        <p className="text-gray-600">
          Crea los módulos y agrega bloques de contenido: videos, lecturas, tareas y exámenes
        </p>
      </div>

      {/* Selector de plantilla profesional */}
      {showPlantillaOption ? (
        <PlantillaSelector onSelect={usarPlantilla} onEmpezarBlanco={empezarDesdeBlanco} />
      ) : (
        <div className="space-y-4">
          {/* Banner informativo con opción de cambiar */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  <strong>Aquí es donde se construye el contenido que verán tus alumnos.</strong> Agrega módulos, videos, lecturas, tareas y exámenes. Puedes reorganizar todo cuando quieras.
                </p>
              </div>
              <Button
                onClick={() => setShowConfirmReset(true)}
                variant="outline"
                size="sm"
                className="flex-shrink-0 text-xs"
              >
                <ChevronRight className="w-3 h-3 mr-1 rotate-180" />
                Cambiar estructura
              </Button>
            </div>
          </Card>

          {/* Resumen compacto horizontal */}
          <div className="flex items-center gap-3 flex-wrap bg-purple-50 border border-purple-200 rounded-lg px-4 py-2.5">
            <span className="text-sm font-medium text-gray-900 mr-1">Contenido:</span>
            <span className="text-xs text-gray-600">{modules.length} módulos</span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <Video className="w-3 h-3 text-purple-600" />{totalVideos}
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <FileText className="w-3 h-3 text-blue-600" />{totalLecturas}
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <CheckSquare className="w-3 h-3 text-green-600" />{totalTareas}
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <BookOpen className="w-3 h-3 text-orange-600" />{totalExamenes}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs font-semibold text-purple-600">{totalBloques} bloques</span>
          </div>

          {/* Módulos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Módulos del curso</h4>
              <span className="text-sm text-gray-500">{modules.length} módulo{modules.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="space-y-3">
              {modules.map((module, index) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  index={index}
                  onUpdate={actualizarModulo}
                  onDelete={eliminarModulo}
                  onAddBloque={agregarBloque}
                  onEditBloque={editarBloque}
                  onDeleteBloque={eliminarBloque}
                  canDelete={modules.length > 1}
                />
              ))}
            </div>

            <Button
              onClick={agregarModulo}
              variant="outline"
              className="w-full border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar módulo
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {bloqueModal && bloqueModal.tipo === 'video' && (
        <VideoModal
          bloque={bloqueModal.bloque}
          onSave={(data: any) => guardarBloque(bloqueModal.moduleId, data)}
          onClose={() => setBloqueModal(null)}
        />
      )}

      {bloqueModal && bloqueModal.tipo === 'lectura' && (
        <LecturaModal
          bloque={bloqueModal.bloque}
          onSave={(data: any) => guardarBloque(bloqueModal.moduleId, data)}
          onClose={() => setBloqueModal(null)}
        />
      )}

      {bloqueModal && bloqueModal.tipo === 'tarea' && (
        <TareaModal
          bloque={bloqueModal.bloque}
          onSave={(data: any) => guardarBloque(bloqueModal.moduleId, data)}
          onClose={() => setBloqueModal(null)}
          modules={modules}
        />
      )}

      {bloqueModal && bloqueModal.tipo === 'examen' && (
        <ExamenModal
          bloque={bloqueModal.bloque}
          onSave={(data: any) => guardarBloque(bloqueModal.moduleId, data)}
          onClose={() => setBloqueModal(null)}
        />
      )}

      {/* Confirmación para resetear */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">¿Quieres volver a elegir entre usar la plantilla o crear tu propia estructura?</h3>
                  <p className="text-sm text-gray-600">
                    Se perderán los cambios no guardados.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowConfirmReset(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setModules([]);
                    setShowPlantillaOption(true);
                    setShowConfirmReset(false);
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Aceptar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}