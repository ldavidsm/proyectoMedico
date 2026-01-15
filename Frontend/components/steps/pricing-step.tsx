import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Info, Euro, Eye, Lock } from 'lucide-react';
import type { CourseFormData } from '../course-creation-wizard';

type Props = {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
};

export default function PricingStep({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Precio y Publicación</h3>
        <p className="text-sm text-gray-600">
          Configura cómo se accederá a tu curso
        </p>
      </div>

      {/* Precio del Curso */}
      <div>
        <Label htmlFor="precio" className="text-sm font-medium text-gray-900 mb-1.5 block">
          Precio del curso *
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Euro className="w-5 h-5 text-gray-400" />
          </div>
          <Input
            id="precio"
            type="number"
            value={formData.precio}
            onChange={(e) => updateFormData({ precio: e.target.value })}
            placeholder="0.00"
            className="pl-10 text-base"
            min="0"
            step="0.01"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>El precio puede ajustarse más adelante desde tu panel de control</span>
        </p>
      </div>

      {/* Tipo de Acceso */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">
          Tipo de acceso *
        </Label>
        <RadioGroup
          value={formData.tipoAcceso}
          onValueChange={(value) => updateFormData({ tipoAcceso: value })}
        >
          <Card
            className={`p-4 cursor-pointer transition-colors ${
              formData.tipoAcceso === 'pago-unico'
                ? 'border-purple-300 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateFormData({ tipoAcceso: 'pago-unico' })}
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="pago-unico" id="pago-unico" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="pago-unico" className="font-medium text-sm text-gray-900 cursor-pointer block mb-1">
                  Pago único
                </Label>
                <p className="text-xs text-gray-600">
                  Los alumnos pagan una vez y tienen acceso ilimitado al curso
                </p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-colors ${
              formData.tipoAcceso === 'suscripcion'
                ? 'border-purple-300 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateFormData({ tipoAcceso: 'suscripcion' })}
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="suscripcion" id="suscripcion" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="suscripcion" className="font-medium text-sm text-gray-900 cursor-pointer block mb-1">
                  Incluido en suscripción
                </Label>
                <p className="text-xs text-gray-600">
                  Disponible para usuarios con suscripción activa de la plataforma
                </p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-colors ${
              formData.tipoAcceso === 'mixto'
                ? 'border-purple-300 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateFormData({ tipoAcceso: 'mixto' })}
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="mixto" id="mixto" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="mixto" className="font-medium text-sm text-gray-900 cursor-pointer block mb-1">
                  Mixto (pago único o suscripción)
                </Label>
                <p className="text-xs text-gray-600">
                  Accesible tanto por pago único como por suscripción
                </p>
              </div>
            </div>
          </Card>
        </RadioGroup>
      </div>

      {/* Visibilidad */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">
          Visibilidad del curso *
        </Label>
        <RadioGroup
          value={formData.visibilidad}
          onValueChange={(value) => updateFormData({ visibilidad: value })}
        >
          <Card
            className={`p-4 cursor-pointer transition-colors ${
              formData.visibilidad === 'publico'
                ? 'border-purple-300 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateFormData({ visibilidad: 'publico' })}
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="publico" id="publico" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <Label htmlFor="publico" className="font-medium text-sm text-gray-900 cursor-pointer">
                    Público
                  </Label>
                </div>
                <p className="text-xs text-gray-600">
                  Visible en el catálogo de cursos. Cualquier profesional puede inscribirse.
                </p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-colors ${
              formData.visibilidad === 'privado'
                ? 'border-purple-300 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateFormData({ visibilidad: 'privado' })}
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="privado" id="privado" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <Label htmlFor="privado" className="font-medium text-sm text-gray-900 cursor-pointer">
                    Privado / Por invitación
                  </Label>
                </div>
                <p className="text-xs text-gray-600">
                  Solo accesible mediante enlace directo o invitación. No aparece en el catálogo público.
                </p>
              </div>
            </div>
          </Card>
        </RadioGroup>
      </div>

      {/* Información adicional */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Información sobre precios
        </h4>
        <ul className="text-sm text-blue-800 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>La plataforma retiene un <strong>15% del precio</strong> por comisión de venta</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Los pagos se procesan mensualmente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Puedes modificar el precio en cualquier momento (afecta solo a nuevas inscripciones)</span>
          </li>
        </ul>
      </Card>

      {formData.precio && parseFloat(formData.precio) > 0 && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Precio del curso</p>
              <p className="text-2xl font-bold text-gray-900">{formData.precio} €</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Tu ganancia (85%)</p>
              <p className="text-2xl font-bold text-green-600">
                {(parseFloat(formData.precio) * 0.85).toFixed(2)} €
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
