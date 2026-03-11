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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          Información académica de tu curso
        </h3>
        <p className="text-lg text-gray-600 leading-relaxed">
          Ahora vamos a agregar la información que le da respaldo académico a tu curso: 
          objetivos de aprendizaje claros y bibliografía de referencia.
        </p>
      </div>

      {/* Feedback positivo */}
      {formData.objetivosAprendizaje.filter(obj => obj.trim()).length >= 3 && formData.bibliografia.length >= 1 && (
        <Card className="p-5 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <p className="text-base font-medium text-green-900">
              ¡Excelente! Tu curso tiene una base académica sólida
            </p>
          </div>
        </Card>
      )}

      {/* Objetivos de Aprendizaje */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-lg font-medium text-gray-900 block mb-1">
              Objetivos de aprendizaje *
            </Label>
            <p className="text-base text-gray-600">
              ¿Qué habilidades concretas ganarán tus alumnos?
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addObjetivo}
            className="text-purple-600 border-purple-600 hover:bg-purple-50 text-base px-5 py-5"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar
          </Button>
        </div>

        {/* Ejemplos */}
        <Card className="p-5 mb-4 bg-blue-50 border-blue-200">
          <p className="text-base font-semibold text-blue-900 mb-3">💡 Ejemplos de objetivos claros:</p>
          <ul className="space-y-2">
            {ejemplosObjetivos.map((ejemplo, index) => (
              <li key={index} className="text-base text-blue-800 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{ejemplo}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-3">
          {formData.objetivosAprendizaje.map((objetivo, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={objetivo}
                  onChange={(e) => updateObjetivo(index, e.target.value)}
                  placeholder={`Objetivo ${index + 1}: Usa verbos como "identificar", "aplicar", "interpretar"...`}
                  className="text-base py-5"
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
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Contador de objetivos */}
        {formData.objetivosAprendizaje.filter(obj => obj.trim()).length > 0 && (
          <p className="text-base text-gray-600 mt-2">
            {formData.objetivosAprendizaje.filter(obj => obj.trim()).length} objetivo{formData.objetivosAprendizaje.filter(obj => obj.trim()).length !== 1 ? 's' : ''} definido{formData.objetivosAprendizaje.filter(obj => obj.trim()).length !== 1 ? 's' : ''}
            {formData.objetivosAprendizaje.filter(obj => obj.trim()).length >= 3 && formData.objetivosAprendizaje.filter(obj => obj.trim()).length <= 5 && (
              <span className="text-green-600 ml-2 font-medium">✓ Cantidad ideal</span>
            )}
          </p>
        )}
      </div>

      {/* Bibliografía */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-lg font-medium text-gray-900 block mb-1">
              Bibliografía y referencias *
            </Label>
            <p className="text-base text-gray-600">
              Incluye las fuentes que respaldan tu contenido (mínimo 1)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBibliografia}
            className="text-purple-600 border-purple-600 hover:bg-purple-50 text-base px-5 py-5"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar
          </Button>
        </div>

        {formData.bibliografia.length === 0 ? (
          <Card className="p-8 text-center border-2 border-dashed bg-gray-50">
            <p className="text-base text-gray-600 mb-1">No has agregado referencias</p>
            <p className="text-base text-gray-500">
              Agrega al menos una referencia para respaldar tu curso
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {formData.bibliografia.map((ref, index) => (
              <Card key={ref.id} className="p-5 border-2 border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-gray-900">
                      Referencia {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBibliografia(ref.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  <div>
                    <Label className="text-base font-medium text-gray-700 mb-2 block">
                      Tipo de referencia
                    </Label>
                    <Select
                      value={ref.tipo}
                      onValueChange={(value) => updateBibliografia(ref.id, 'tipo', value)}
                    >
                      <SelectTrigger className="text-base py-5">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposBibliografia.map((tipo) => (
                          <SelectItem key={tipo} value={tipo} className="text-base">
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium text-gray-700 mb-2 block">
                      Referencia completa
                    </Label>
                    <Input
                      value={ref.referencia}
                      onChange={(e) =>
                        updateBibliografia(ref.id, 'referencia', e.target.value)
                      }
                      placeholder="Ej: Ibanez B, et al. 2017 ESC Guidelines for STEMI. Eur Heart J. 2018;39(2):119-177"
                      className="text-base py-5"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium text-gray-700 mb-2 block">
                      DOI o enlace (opcional)
                    </Label>
                    <Input
                      value={ref.enlaceDOI}
                      onChange={(e) =>
                        updateBibliografia(ref.id, 'enlaceDOI', e.target.value)
                      }
                      placeholder="Ej: https://doi.org/10.1093/eurheartj/ehx393"
                      className="text-base py-5"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Consejo */}
      <Card className="p-5 bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <div>
            <p className="text-base text-purple-900">
              <strong>Consejo:</strong> Una buena bibliografía incluye guías clínicas actualizadas y 
              artículos científicos de los últimos 5 años. Esto le da credibilidad a tu curso.
            </p>
          </div>
        </div>
      </Card>

      {/* Mensaje de confirmación */}
      {formData.bibliografia.length >= 1 && formData.objetivosAprendizaje.filter(obj => obj.trim()).length >= 3 && (
        <Card className="p-5 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-base text-green-900">
                <strong>¡Perfecto!</strong> Tu curso tiene una base académica sólida.
              </p>
              <p className="text-base text-green-700 mt-1">
                Esto ayudará a que los estudiantes confíen en la calidad de tu contenido.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}