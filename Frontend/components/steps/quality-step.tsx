import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2, CheckCircle2, Info, Lightbulb } from 'lucide-react';
import type { CourseFormData } from '../course-creation-wizard';

type Props = {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
};

const modalidadesDisponibles = [
  'Online asíncrono',
  'Online en vivo',
  'Híbrido (online + presencial)',
  'Autoaprendizaje',
];

const tiposBibliografia = [
  'Guía clínica',
  'Artículo científico',
  'Revisión sistemática / Metaanálisis',
  'Libro de texto',
  'Caso clínico publicado',
];

const ejemplosObjetivos = [
  'Identificar los criterios electrocardiográficos del SCACEST según las guías ESC 2023',
  'Aplicar el protocolo de estratificación de riesgo en síndrome coronario agudo',
  'Interpretar biomarcadores cardiacos en el contexto del diagnóstico diferencial',
];

export default function QualityStep({ formData, updateFormData }: Props) {
  const addObjetivo = () => {
    updateFormData({
      objetivosAprendizaje: [...formData.objetivosAprendizaje, ''],
    });
  };

  const updateObjetivo = (index: number, value: string) => {
    const updated = [...formData.objetivosAprendizaje];
    updated[index] = value;
    updateFormData({ objetivosAprendizaje: updated });
  };

  const removeObjetivo = (index: number) => {
    const updated = formData.objetivosAprendizaje.filter((_, i) => i !== index);
    updateFormData({ objetivosAprendizaje: updated });
  };

  const addBibliografia = () => {
    const newRef = {
      id: Date.now().toString(),
      tipo: '',
      referencia: '',
      enlaceDOI: '',
    };
    updateFormData({ bibliografia: [...formData.bibliografia, newRef] });
  };

  const updateBibliografia = (id: string, field: string, value: string) => {
    const updated = formData.bibliografia.map((ref) =>
      ref.id === id ? { ...ref, [field]: value } : ref
    );
    updateFormData({ bibliografia: updated });
  };

  const removeBibliografia = (id: string) => {
    const updated = formData.bibliografia.filter((ref) => ref.id !== id);
    updateFormData({ bibliografia: updated });
  };

  const toggleModalidad = (modalidad: string) => {
    const updated = formData.modalidades.includes(modalidad)
      ? formData.modalidades.filter((m) => m !== modalidad)
      : [...formData.modalidades, modalidad];
    updateFormData({ modalidades: updated });
  };

  const updateCriterio = (criterio: keyof CourseFormData['criteriosCalidad']) => {
    updateFormData({
      criteriosCalidad: {
        ...formData.criteriosCalidad,
        [criterio]: !formData.criteriosCalidad[criterio],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Objetivos y Estándares Académicos
        </h3>
        <p className="text-sm text-gray-600">
          Define los objetivos de aprendizaje y asegura la calidad del contenido
        </p>
      </div>

      {/* Objetivos de Aprendizaje */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-sm font-medium text-gray-900">
              Objetivos de aprendizaje *
            </Label>
            <p className="text-xs text-gray-600 mt-1">
              Define qué competencias específicas adquirirá el alumno
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addObjetivo}
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>

        {/* Ejemplos */}
        <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2">Ejemplos de buenos objetivos:</p>
          <ul className="space-y-1.5">
            {ejemplosObjetivos.map((ejemplo, index) => (
              <li key={index} className="text-xs text-blue-800 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{ejemplo}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-3">
          {formData.objetivosAprendizaje.map((objetivo, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={objetivo}
                  onChange={(e) => updateObjetivo(index, e.target.value)}
                  placeholder={`Objetivo ${index + 1}`}
                  className="text-sm"
                />
              </div>
              {formData.objetivosAprendizaje.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeObjetivo(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modalidades */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">
          Modalidad del curso *
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modalidadesDisponibles.map((modalidad) => (
            <div
              key={modalidad}
              className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                formData.modalidades.includes(modalidad)
                  ? 'bg-purple-50 border-purple-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleModalidad(modalidad)}
            >
              <Checkbox
                id={`modalidad-${modalidad}`}
                checked={formData.modalidades.includes(modalidad)}
                onCheckedChange={() => toggleModalidad(modalidad)}
              />
              <Label
                htmlFor={`modalidad-${modalidad}`}
                className="font-normal text-sm text-gray-900 cursor-pointer"
              >
                {modalidad}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Criterios de Calidad */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">
          Criterios de calidad *
        </Label>
        <Card className="p-4">
          <div className="space-y-3">
            <div
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => updateCriterio('audioClaro')}
            >
              <Checkbox
                id="audioClaro"
                checked={formData.criteriosCalidad.audioClaro}
                onCheckedChange={() => updateCriterio('audioClaro')}
              />
              <Label
                htmlFor="audioClaro"
                className="font-normal text-sm text-gray-900 cursor-pointer flex-1"
              >
                Audio claro y sin ruido de fondo
              </Label>
            </div>

            <div
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => updateCriterio('videoHD')}
            >
              <Checkbox
                id="videoHD"
                checked={formData.criteriosCalidad.videoHD}
                onCheckedChange={() => updateCriterio('videoHD')}
              />
              <Label
                htmlFor="videoHD"
                className="font-normal text-sm text-gray-900 cursor-pointer flex-1"
              >
                Video en calidad HD (1080p o superior)
              </Label>
            </div>

            <div
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => updateCriterio('contenidoOriginal')}
            >
              <Checkbox
                id="contenidoOriginal"
                checked={formData.criteriosCalidad.contenidoOriginal}
                onCheckedChange={() => updateCriterio('contenidoOriginal')}
              />
              <Label
                htmlFor="contenidoOriginal"
                className="font-normal text-sm text-gray-900 cursor-pointer flex-1"
              >
                Contenido original y basado en evidencia científica
              </Label>
            </div>

            <div
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => updateCriterio('casosPracticos')}
            >
              <Checkbox
                id="casosPracticos"
                checked={formData.criteriosCalidad.casosPracticos}
                onCheckedChange={() => updateCriterio('casosPracticos')}
              />
              <Label
                htmlFor="casosPracticos"
                className="font-normal text-sm text-gray-900 cursor-pointer flex-1"
              >
                Incluye casos prácticos o ejemplos clínicos
              </Label>
            </div>
          </div>
        </Card>
        <p className="text-xs text-gray-600 mt-2 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Estos criterios garantizan una mejor experiencia para los estudiantes</span>
        </p>
      </div>

      {/* Bibliografía */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-sm font-medium text-gray-900">
              Bibliografía y referencias *
            </Label>
            <p className="text-xs text-gray-600 mt-1">
              Incluye las fuentes que respaldan tu contenido (mínimo 1)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBibliografia}
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>

        {formData.bibliografia.length === 0 ? (
          <Card className="p-6 text-center border-dashed bg-gray-50">
            <p className="text-sm text-gray-600 mb-1">No has agregado referencias</p>
            <p className="text-xs text-gray-500">
              Agrega al menos una referencia para respaldar tu curso
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {formData.bibliografia.map((ref, index) => (
              <Card key={ref.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Referencia {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBibliografia(ref.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                      Tipo de referencia
                    </Label>
                    <Select
                      value={ref.tipo}
                      onValueChange={(value) => updateBibliografia(ref.id, 'tipo', value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposBibliografia.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                      Referencia completa
                    </Label>
                    <Input
                      value={ref.referencia}
                      onChange={(e) =>
                        updateBibliografia(ref.id, 'referencia', e.target.value)
                      }
                      placeholder="Ej: Ibanez B, et al. 2017 ESC Guidelines for STEMI. Eur Heart J. 2018;39(2):119-177"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                      DOI o enlace
                    </Label>
                    <Input
                      value={ref.enlaceDOI}
                      onChange={(e) =>
                        updateBibliografia(ref.id, 'enlaceDOI', e.target.value)
                      }
                      placeholder="Ej: https://doi.org/10.1093/eurheartj/ehx393"
                      className="text-sm"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Mensaje de estándares */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-green-900 mb-1">
              Estándares de calidad médica
            </h4>
            <p className="text-sm text-green-800">
              Estos requisitos aseguran que tu curso cumple con los estándares académicos y
              profesionales esperados en formación médica continuada.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
