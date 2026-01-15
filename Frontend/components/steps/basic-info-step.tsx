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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Información Básica del Curso</h3>
        <p className="text-sm text-gray-600">
          Define claramente tu curso para que llegue al público correcto
        </p>
      </div>

      <div className="space-y-5">
        {/* Título */}
        <div>
          <Label htmlFor="titulo" className="text-sm font-medium text-gray-900 mb-1.5 block">
            Título del curso *
          </Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => updateFormData({ titulo: e.target.value })}
            placeholder="Ej: Manejo Avanzado del Infarto Agudo de Miocardio"
            className="text-base"
          />
          <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Claro, específico y profesional. Evita títulos genéricos.</span>
          </p>
        </div>

        {/* Subtítulo */}
        <div>
          <Label htmlFor="subtitulo" className="text-sm font-medium text-gray-900 mb-1.5 block">
            Subtítulo o claim
          </Label>
          <Input
            id="subtitulo"
            value={formData.subtitulo}
            onChange={(e) => updateFormData({ subtitulo: e.target.value })}
            placeholder="Ej: Del diagnóstico en urgencias al tratamiento intervencionista"
            className="text-base"
          />
          <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Resume el valor principal del curso en una frase</span>
          </p>
        </div>

        {/* Categoría y Tema */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoria" className="text-sm font-medium text-gray-900 mb-1.5 block">
              Categoría *
            </Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => updateFormData({ categoria: value })}
            >
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Selecciona una especialidad" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tema" className="text-sm font-medium text-gray-900 mb-1.5 block">
              Tema principal *
            </Label>
            <Select
              value={formData.tema}
              onValueChange={(value) => updateFormData({ tema: value })}
            >
              <SelectTrigger id="tema">
                <SelectValue placeholder="Selecciona un tema" />
              </SelectTrigger>
              <SelectContent>
                {temas.map((tema) => (
                  <SelectItem key={tema} value={tema}>
                    {tema}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subtema */}
        <div>
          <Label htmlFor="subtema" className="text-sm font-medium text-gray-900 mb-1.5 block">
            Subtema específico
          </Label>
          <Input
            id="subtema"
            value={formData.subtema}
            onChange={(e) => updateFormData({ subtema: e.target.value })}
            placeholder="Ej: SCACEST y estrategias de reperfusión"
            className="text-base"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Opcional: especifica un aspecto más concreto dentro del tema principal
          </p>
        </div>

        {/* Nivel del Curso */}
        <div>
          <Label htmlFor="nivelCurso" className="text-sm font-medium text-gray-900 mb-1.5 block">
            Nivel del curso *
          </Label>
          <Select
            value={formData.nivelCurso}
            onValueChange={(value) => updateFormData({ nivelCurso: value })}
          >
            <SelectTrigger id="nivelCurso">
              <SelectValue placeholder="Selecciona el nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basico">Básico — Introducción y fundamentos</SelectItem>
              <SelectItem value="intermedio">Intermedio — Profundización práctica</SelectItem>
              <SelectItem value="avanzado">Avanzado — Casos complejos y actualización</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Ayuda a los alumnos a saber si el curso es adecuado para ellos</span>
          </p>
        </div>

        {/* Público Objetivo */}
        <div>
          <Label className="text-sm font-medium text-gray-900 mb-2 block">
            Público objetivo *
          </Label>
          <div className="space-y-2">
            {publicosDisponibles.map((publico) => (
              <div
                key={publico}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  formData.publicoObjetivo.includes(publico)
                    ? 'bg-purple-50 border-purple-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => togglePublico(publico)}
              >
                <Checkbox
                  id={`publico-${publico}`}
                  checked={formData.publicoObjetivo.includes(publico)}
                  onCheckedChange={() => togglePublico(publico)}
                />
                <Label
                  htmlFor={`publico-${publico}`}
                  className="font-normal text-sm text-gray-900 cursor-pointer flex-1"
                >
                  {publico}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Descripción Corta */}
        <div>
          <Label htmlFor="descripcionCorta" className="text-sm font-medium text-gray-900 mb-1.5 block">
            Descripción corta *
          </Label>
          <Textarea
            id="descripcionCorta"
            value={formData.descripcionCorta}
            onChange={(e) => updateFormData({ descripcionCorta: e.target.value })}
            placeholder="Ej: Curso práctico sobre el manejo del paciente con síndrome coronario agudo, desde el diagnóstico en urgencias hasta las estrategias de revascularización."
            className="text-sm resize-none"
            rows={3}
            maxLength={200}
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-500 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Esta descripción aparecerá en la ficha pública del curso</span>
            </p>
            <span className="text-xs text-gray-500">
              {formData.descripcionCorta.length}/200
            </span>
          </div>
        </div>
      </div>

      {/* Consejo */}
      <Card className="p-4 bg-purple-50 border-purple-200">
        <p className="text-sm text-purple-900">
          <strong>Consejo:</strong> Un título claro y una buena categorización ayudan a que tu 
          curso sea más visible y llegue a los profesionales interesados.
        </p>
      </Card>
    </div>
  );
}