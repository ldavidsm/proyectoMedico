import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card } from '../ui/card';
import { Info } from 'lucide-react';
import type { CourseFormData } from '../course-creation-wizard';

type Props = {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
  categorias?: string[];
  temas?: string[];
  publicosDisponibles?: string[];
};

const categorias = [
  'Cardiología',
  'Neurología',
  'Pediatría',
  'Cirugía General',
  'Medicina Interna',
  'Oncología',
  'Psiquiatría',
  'Dermatología',
  'Oftalmología',
  'Ginecología y Obstetricia',
  'Medicina de Urgencias',
  'Radiología',
  'Anestesiología',
];

const temas = [
  'Diagnóstico clínico',
  'Tratamiento y terapéutica',
  'Prevención y salud pública',
  'Procedimientos y técnicas',
  'Farmacología clínica',
  'Interpretación de estudios',
  'Casos clínicos complejos',
];

const publicosDisponibles = [
  'Médicos generales',
  'Especialistas',
  'Residentes (MIR)',
  'Enfermería',
  'Otros profesionales sanitarios',
];

export default function BasicInfoStep({ formData, updateFormData }: Props) {
  const togglePublico = (publico: string) => {
    const currentPublicos = formData.publicoObjetivo || [];
    const updated = currentPublicos.includes(publico)
      ? currentPublicos.filter((p) => p !== publico)
      : [...currentPublicos, publico];
    updateFormData({ publicoObjetivo: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">Cuéntanos sobre tu curso</h3>
        <p className="text-lg text-gray-600 leading-relaxed">
          Vamos a armar tu curso juntos. Solo necesito saber el tema principal y a quién va dirigido.
          Esto es solo para empezar, podrás cambiar todo después.
        </p>
      </div>

      <div className="space-y-6">
        {/* Título */}
        <div>
          <Label htmlFor="titulo" className="text-base font-medium text-gray-900 mb-2 block">
            ¿Cómo se llama tu curso? *
          </Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => updateFormData({ titulo: e.target.value })}
            placeholder="Ej: Manejo Avanzado del Infarto Agudo de Miocardio"
            className="text-lg py-6"
          />
          <p className="text-base text-gray-500 mt-2 flex items-start gap-2">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>Piensa en cómo lo buscarían tus colegas</span>
          </p>
        </div>

        {/* Subtítulo */}
        <div>
          <Label htmlFor="subtitulo" className="text-base font-medium text-gray-900 mb-2 block">
            Una línea que resuma el valor del curso
          </Label>
          <Input
            id="subtitulo"
            value={formData.subtitulo}
            onChange={(e) => updateFormData({ subtitulo: e.target.value })}
            placeholder="Ej: Del diagnóstico en urgencias al tratamiento intervencionista"
            className="text-lg py-6"
          />
          <p className="text-base text-gray-500 mt-2 flex items-start gap-2">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>¿Qué problema resuelves o qué habilidad enseñas?</span>
          </p>
        </div>

        {/* Categoría y Tema */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="categoria" className="text-base font-medium text-gray-900 mb-2 block">
              ¿En qué especialidad encaja mejor? *
            </Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => updateFormData({ categoria: value })}
            >
              <SelectTrigger id="categoria" className="text-base py-6">
                <SelectValue placeholder="Selecciona una especialidad" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-base py-3">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tema" className="text-base font-medium text-gray-900 mb-2 block">
              Tema principal *
            </Label>
            <Select
              value={formData.tema}
              onValueChange={(value) => updateFormData({ tema: value })}
            >
              <SelectTrigger id="tema" className="text-base py-6">
                <SelectValue placeholder="Selecciona un tema" />
              </SelectTrigger>
              <SelectContent>
                {temas.map((tema) => (
                  <SelectItem key={tema} value={tema} className="text-base py-3">
                    {tema}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subtema */}
        <div>
          <Label htmlFor="subtema" className="text-base font-medium text-gray-900 mb-2 block">
            Subtema específico (opcional)
          </Label>
          <Input
            id="subtema"
            value={formData.subtema}
            onChange={(e) => updateFormData({ subtema: e.target.value })}
            placeholder="Ej: SCACEST y estrategias de reperfusión"
            className="text-lg py-6"
          />
          <p className="text-base text-gray-500 mt-2">
            Especifica un aspecto más concreto dentro del tema principal
          </p>
        </div>

        {/* Nivel del Curso */}
        <div>
          <Label htmlFor="nivelCurso" className="text-base font-medium text-gray-900 mb-2 block">
            Nivel del curso *
          </Label>
          <Select
            value={formData.nivelCurso}
            onValueChange={(value) => updateFormData({ nivelCurso: value })}
          >
            <SelectTrigger id="nivelCurso" className="text-base py-6">
              <SelectValue placeholder="Selecciona el nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basico" className="text-base py-3">Básico — Introducción y fundamentos</SelectItem>
              <SelectItem value="intermedio" className="text-base py-3">Intermedio — Profundización práctica</SelectItem>
              <SelectItem value="avanzado" className="text-base py-3">Avanzado — Casos complejos y actualización</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-base text-gray-500 mt-2 flex items-start gap-2">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>Ayuda a los alumnos a saber si el curso es adecuado para ellos</span>
          </p>
        </div>

        {/* Público Objetivo */}
        <div>
          <Label className="text-base font-medium text-gray-900 mb-2 block">
            ¿Para quién es este curso? *
          </Label>
          <p className="text-base text-gray-600 mb-3">Selecciona todos los que apliquen</p>
          <div className="space-y-3">
            {publicosDisponibles.map((publico) => (
              <div
                key={publico}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${formData.publicoObjetivo.includes(publico)
                    ? 'bg-purple-50 border-purple-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => togglePublico(publico)}
              >
                <Checkbox
                  id={`publico-${publico}`}
                  checked={formData.publicoObjetivo.includes(publico)}
                  onCheckedChange={() => togglePublico(publico)}
                  className="w-5 h-5"
                />
                <Label
                  htmlFor={`publico-${publico}`}
                  className="font-normal text-base text-gray-900 cursor-pointer flex-1"
                >
                  {publico}
                </Label>
              </div>
            ))}
          </div>
          {formData.publicoObjetivo.length > 0 && (
            <p className="text-base text-green-600 mt-3 font-medium">
              ✓ {formData.publicoObjetivo.length} tipo{formData.publicoObjetivo.length !== 1 ? 's' : ''} de público seleccionado{formData.publicoObjetivo.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Descripción Corta */}
        <div>
          <Label htmlFor="descripcionCorta" className="text-base font-medium text-gray-900 mb-2 block">
            Descripción corta *
          </Label>
          <Textarea
            id="descripcionCorta"
            value={formData.descripcionCorta}
            onChange={(e) => updateFormData({ descripcionCorta: e.target.value })}
            placeholder="Ej: Curso práctico sobre el manejo del paciente con síndrome coronario agudo, desde el diagnóstico en urgencias hasta las estrategias de revascularización."
            className="text-base resize-none"
            rows={4}
            maxLength={200}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-base text-gray-500 flex items-start gap-2">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Esta descripción aparecerá en la ficha pública del curso</span>
            </p>
            <span className="text-base text-gray-500">
              {formData.descripcionCorta.length}/200
            </span>
          </div>
        </div>
      </div>

      {/* Consejo */}
      <Card className="p-5 bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <p className="text-base text-purple-900">
            <strong>Consejo:</strong> Un título claro y una buena categorización ayudan a que tu
            curso sea más visible y llegue a los profesionales interesados.
          </p>
        </div>
      </Card>
    </div>
  );
}