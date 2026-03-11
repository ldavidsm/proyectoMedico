import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  ClipboardCheck, 
  BookOpen,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Lightbulb,
  Info,
  FileQuestion
} from 'lucide-react';
import type { CourseFormData } from '../course-creation-wizard';

type Props = {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
};

type Material = {
  id: string;
  type: 'lectura' | 'tarea' | 'examen' | 'pdf';
  titulo: string;
  descripcion: string;
  modulo: string;
  archivo?: File | null;
};

export default function MaterialsStep({ formData, updateFormData }: Props) {
  const modules = formData.estructuraPersonalizada || [];
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showAddOptions, setShowAddOptions] = useState(false);

  const agregarMaterial = (type: Material['type']) => {
    const nuevoMaterial: Material = {
      id: Date.now().toString(),
      type,
      titulo: '',
      descripcion: '',
      modulo: modules[0] || '',
      archivo: null,
    };
    setMaterials([...materials, nuevoMaterial]);
    setShowAddOptions(false);
  };

  const actualizarMaterial = (id: string, campo: keyof Material, valor: any) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, [campo]: valor } : m
    ));
  };

  const eliminarMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleFileChange = (id: string, file: File | null) => {
    actualizarMaterial(id, 'archivo', file);
  };

  const getMaterialIcon = (type: Material['type']) => {
    switch (type) {
      case 'lectura':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'tarea':
        return <ClipboardCheck className="w-5 h-5 text-orange-600" />;
      case 'examen':
        return <FileQuestion className="w-5 h-5 text-purple-600" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
    }
  };

  const getMaterialLabel = (type: Material['type']) => {
    switch (type) {
      case 'lectura':
        return 'Lectura';
      case 'tarea':
        return 'Tarea';
      case 'examen':
        return 'Examen';
      case 'pdf':
        return 'Documento PDF';
    }
  };

  const getMaterialColor = (type: Material['type']) => {
    switch (type) {
      case 'lectura':
        return 'bg-blue-50 border-blue-200';
      case 'tarea':
        return 'bg-orange-50 border-orange-200';
      case 'examen':
        return 'bg-purple-50 border-purple-200';
      case 'pdf':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          Materiales y actividades (Opcional)
        </h3>
        <p className="text-lg text-gray-600 leading-relaxed">
          ¿Quieres que tus estudiantes lean algo, practiquen o hagan un examen? 
          Este paso es completamente opcional. Si solo quieres enseñar con videos, puedes continuar.
        </p>
      </div>

      {/* Mensaje de paso opcional */}
      <Card className="p-5 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-base text-blue-900">
              <strong>Este paso es opcional.</strong> Muchos cursos excelentes solo tienen videos. 
              Agrega materiales solo si sientes que enriquecerán la experiencia de aprendizaje.
            </p>
          </div>
        </div>
      </Card>

      {/* Lista de materiales */}
      {materials.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Materiales agregados:
          </h4>
          {materials.map((material) => (
            <Card key={material.id} className={`p-5 border-2 ${getMaterialColor(material.type)}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMaterialIcon(material.type)}
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {getMaterialLabel(material.type)}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => eliminarMaterial(material.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label className="text-base font-medium text-gray-900 mb-2 block">
                      ¿A qué módulo pertenece?
                    </Label>
                    <select
                      value={material.modulo}
                      onChange={(e) => actualizarMaterial(material.id, 'modulo', e.target.value)}
                      className="w-full p-3 text-base border border-gray-300 rounded-md"
                    >
                      {modules.map((modulo, idx) => (
                        <option key={idx} value={modulo}>
                          Módulo {idx + 1}: {modulo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-base font-medium text-gray-900 mb-2 block">
                      Título
                    </Label>
                    <Input
                      value={material.titulo}
                      onChange={(e) => actualizarMaterial(material.id, 'titulo', e.target.value)}
                      placeholder={`Ej: ${material.type === 'lectura' ? 'Artículo sobre...' : material.type === 'tarea' ? 'Ejercicio práctico' : 'Evaluación final'}`}
                      className="text-base"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium text-gray-900 mb-2 block">
                      Descripción (opcional)
                    </Label>
                    <Textarea
                      value={material.descripcion}
                      onChange={(e) => actualizarMaterial(material.id, 'descripcion', e.target.value)}
                      placeholder="Describe brevemente este material"
                      className="text-base resize-none"
                      rows={2}
                    />
                  </div>

                  {material.type === 'pdf' && (
                    <div>
                      <Label className="text-base font-medium text-gray-900 mb-2 block">
                        Archivo PDF
                      </Label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(material.id, e.target.files?.[0] || null)}
                        className="hidden"
                        id={`file-${material.id}`}
                      />
                      <label htmlFor={`file-${material.id}`}>
                        <Button
                          type="button"
                          onClick={() => document.getElementById(`file-${material.id}`)?.click()}
                          variant="outline"
                          className="w-full text-base py-5"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          {material.archivo ? material.archivo.name : 'Seleccionar archivo'}
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Botones para agregar materiales */}
      {!showAddOptions && (
        <Button
          onClick={() => setShowAddOptions(true)}
          variant="outline"
          className="w-full border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 text-lg py-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar material o actividad
        </Button>
      )}

      {showAddOptions && (
        <Card className="p-5 border-2 border-purple-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            ¿Qué quieres agregar?
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => agregarMaterial('lectura')}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-6 text-base"
            >
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span>Lectura</span>
              <span className="text-xs text-gray-500">Texto o artículo</span>
            </Button>
            <Button
              onClick={() => agregarMaterial('pdf')}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-6 text-base"
            >
              <FileText className="w-8 h-8 text-red-600" />
              <span>Documento PDF</span>
              <span className="text-xs text-gray-500">Presentación, guía</span>
            </Button>
            <Button
              onClick={() => agregarMaterial('tarea')}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-6 text-base"
            >
              <ClipboardCheck className="w-8 h-8 text-orange-600" />
              <span>Tarea</span>
              <span className="text-xs text-gray-500">Ejercicio práctico</span>
            </Button>
            <Button
              onClick={() => agregarMaterial('examen')}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-6 text-base"
            >
              <FileQuestion className="w-8 h-8 text-purple-600" />
              <span>Examen</span>
              <span className="text-xs text-gray-500">Evaluación</span>
            </Button>
          </div>
          <Button
            onClick={() => setShowAddOptions(false)}
            variant="ghost"
            className="w-full mt-3"
          >
            Cancelar
          </Button>
        </Card>
      )}

      {/* Consejos */}
      <Card className="p-5 bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-base text-purple-900 font-semibold">
              Ideas para enriquecer tu curso:
            </p>
            <ul className="space-y-1 text-base text-purple-800 list-disc list-inside">
              <li><strong>Lecturas:</strong> Artículos científicos o guías clínicas de referencia</li>
              <li><strong>PDFs:</strong> Presentaciones, infografías o resúmenes</li>
              <li><strong>Tareas:</strong> Casos clínicos para resolver</li>
              <li><strong>Exámenes:</strong> Preguntas para evaluar el aprendizaje</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Mensaje de confirmación si no agregaron nada */}
      {materials.length === 0 && !showAddOptions && (
        <Card className="p-5 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-base text-green-900">
                <strong>Sin problema.</strong> Tu curso con solo videos está perfectamente bien.
              </p>
              <p className="text-base text-green-700 mt-1">
                Siempre podrás agregar materiales después si cambias de opinión.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Confirmación si agregaron materiales */}
      {materials.length > 0 && (
        <Card className="p-5 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <p className="text-base text-green-900">
              <strong>¡Excelente!</strong> Agregaste {materials.length} material{materials.length !== 1 ? 'es' : ''} adicional{materials.length !== 1 ? 'es' : ''}. Esto enriquecerá la experiencia de tus estudiantes.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
