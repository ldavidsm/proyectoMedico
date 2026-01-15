import { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Plus, Trash2, Lightbulb, CheckCircle2, ListOrdered } from 'lucide-react';
import type { CourseFormData } from '../course-creation-wizard';

type Props = {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
};

const plantillaSecciones = [
  {
    nombre: 'Introducción',
    descripcion: 'Presentación del tema y contextualización',
  },
  {
    nombre: 'Bases teóricas',
    descripcion: 'Fundamentos y conceptos clave',
  },
  {
    nombre: 'Desarrollo del contenido',
    descripcion: 'Explicación detallada del tema principal',
  },
  {
    nombre: 'Casos clínicos / Ejemplos prácticos',
    descripcion: 'Aplicación práctica del conocimiento',
  },
  {
    nombre: 'Errores frecuentes',
    descripcion: 'Qué evitar en la práctica clínica',
  },
  {
    nombre: 'Conclusiones prácticas',
    descripcion: 'Puntos clave y resumen aplicado',
  },
];

export default function StructureStep({ formData, updateFormData }: Props) {
  const [opcionElegida, setOpcionElegida] = useState<'plantilla' | 'propia' | null>(
    formData.usarPlantilla ? 'plantilla' : formData.estructuraPersonalizada.length > 0 ? 'propia' : null
  );

  const seleccionarPlantilla = () => {
    setOpcionElegida('plantilla');
    updateFormData({
      usarPlantilla: true,
      estructuraPersonalizada: plantillaSecciones.map((s) => s.nombre),
    });
  };

  const seleccionarPropia = () => {
    setOpcionElegida('propia');
    updateFormData({
      usarPlantilla: false,
      estructuraPersonalizada: [''],
    });
  };

  const agregarSeccion = () => {
    updateFormData({
      estructuraPersonalizada: [...formData.estructuraPersonalizada, ''],
    });
  };

  const actualizarSeccion = (index: number, valor: string) => {
    const nueva = [...formData.estructuraPersonalizada];
    nueva[index] = valor;
    updateFormData({ estructuraPersonalizada: nueva });
  };

  const eliminarSeccion = (index: number) => {
    const nueva = formData.estructuraPersonalizada.filter((_, i) => i !== index);
    updateFormData({ estructuraPersonalizada: nueva });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Enfoque y Estructura del Curso</h3>
        <p className="text-sm text-gray-600">
          Una buena estructura pedagógica facilita el aprendizaje y mejora la retención
        </p>
      </div>

      {/* Elección inicial */}
      {!opcionElegida && (
        <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-start gap-3 mb-4">
            <ListOrdered className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                ¿Quieres usar una estructura pedagógica recomendada?
              </h4>
              <p className="text-sm text-gray-600">
                Te sugerimos una estructura probada, diseñada específicamente para formación médica
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Card
              className="p-5 border-2 border-purple-300 bg-white cursor-pointer hover:border-purple-400 transition-colors"
              onClick={seleccionarPlantilla}
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <h5 className="font-semibold text-gray-900">Usar plantilla recomendada</h5>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Estructura pedagógica optimizada que puedes personalizar
              </p>
              <div className="space-y-2">
                {plantillaSecciones.map((seccion, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <span className="font-semibold text-purple-600 mt-0.5">{index + 1}.</span>
                    <div>
                      <p className="font-medium text-gray-900">{seccion.nombre}</p>
                      <p className="text-gray-500">{seccion.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                Usar esta plantilla
              </Button>
            </Card>

            <Card
              className="p-5 border-2 border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-colors"
              onClick={seleccionarPropia}
            >
              <div className="flex items-center gap-2 mb-3">
                <Plus className="w-5 h-5 text-gray-600" />
                <h5 className="font-semibold text-gray-900">Crear estructura propia</h5>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Define tu propia estructura si ya tienes una metodología específica
              </p>
              <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-gray-500">Define tus propias secciones</p>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Crear estructura personalizada
              </Button>
            </Card>
          </div>
        </Card>
      )}

      {/* Plantilla seleccionada */}
      {opcionElegida === 'plantilla' && (
        <div className="space-y-4">
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-900">
                  Plantilla recomendada seleccionada
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpcionElegida(null)}
                className="text-purple-700 hover:text-purple-800"
              >
                Cambiar
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            {plantillaSecciones.map((seccion, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-purple-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">{seccion.nombre}</h5>
                    <p className="text-sm text-gray-600">{seccion.descripcion}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Nota:</strong> En el siguiente paso podrás asignar tus videos a cada una de
              estas secciones. Esta estructura es editable y puedes modificarla más adelante.
            </p>
          </Card>
        </div>
      )}

      {/* Estructura propia */}
      {opcionElegida === 'propia' && (
        <div className="space-y-4">
          <Card className="p-4 bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-gray-600" />
                <p className="text-sm font-medium text-gray-900">Estructura personalizada</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpcionElegida(null)}
                className="text-gray-700 hover:text-gray-800"
              >
                Cambiar
              </Button>
            </div>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-gray-900">
                Secciones de tu curso
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarSeccion}
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar sección
              </Button>
            </div>

            <div className="space-y-3">
              {formData.estructuraPersonalizada.map((seccion, index) => (
                <div key={index} className="flex gap-2">
                  <div className="w-8 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <Input
                      value={seccion}
                      onChange={(e) => actualizarSeccion(index, e.target.value)}
                      placeholder={`Sección ${index + 1}: Ej: Introducción al diagnóstico`}
                    />
                  </div>
                  {formData.estructuraPersonalizada.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarSeccion(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Consejos */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Principios de buena estructura pedagógica
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  <strong>Progresión lógica:</strong> De lo simple a lo complejo
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  <strong>Casos prácticos:</strong> Consolidan el aprendizaje teórico
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  <strong>Errores frecuentes:</strong> Aprenden qué NO hacer
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  <strong>Conclusiones claras:</strong> Refuerzan los puntos clave
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
