import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Info, Euro, Eye, Lock, Plus, X, TrendingUp } from 'lucide-react';
import type { CourseFormData } from '../course-creation-wizard';
import { useState } from 'react';
import { Button } from '../ui/button';

type CountryPricing = {
  id: string;
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  localPrice: string;
  flag: string;
};

const AVAILABLE_COUNTRIES = [
  { code: 'ES', name: 'España', currency: 'EUR', symbol: '€', flag: '🇪🇸' },
  { code: 'MX', name: 'México', currency: 'MXN', symbol: '$', flag: '🇲🇽' },
  { code: 'CO', name: 'Colombia', currency: 'COP', symbol: '$', flag: '🇨🇴' },
  { code: 'AR', name: 'Argentina', currency: 'ARS', symbol: '$', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', currency: 'CLP', symbol: '$', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', currency: 'PEN', symbol: 'S/', flag: '🇵🇪' },
  { code: 'US', name: 'Estados Unidos', currency: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'BR', name: 'Brasil', currency: 'BRL', symbol: 'R$', flag: '🇧🇷' },
];

const PLATFORM_COMMISSION = 0.15; // 15%

type Props = {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
};

export default function PricingStep({ formData, updateFormData }: Props) {
  const [countryPricing, setCountryPricing] = useState<CountryPricing[]>([]);
  const [showCountrySelector, setShowCountrySelector] = useState(false);

  const addCountry = (country: typeof AVAILABLE_COUNTRIES[0]) => {
    const newCountry: CountryPricing = {
      id: Math.random().toString(36).substring(7),
      countryCode: country.code,
      countryName: country.name,
      currency: country.currency,
      currencySymbol: country.symbol,
      localPrice: '',
      flag: country.flag,
    };
    setCountryPricing([...countryPricing, newCountry]);
    setShowCountrySelector(false);
  };

  const removeCountry = (id: string) => {
    setCountryPricing(countryPricing.filter(c => c.id !== id));
  };

  const updateCountryPrice = (id: string, price: string) => {
    setCountryPricing(countryPricing.map(c => 
      c.id === id ? { ...c, localPrice: price } : c
    ));
  };

  const calculateCommission = (price: string) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? 0 : numPrice * PLATFORM_COMMISSION;
  };

  const calculateNet = (price: string) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? 0 : numPrice * (1 - PLATFORM_COMMISSION);
  };

  const getAveragePriceInEuros = () => {
    // Simplified: assuming all prices are comparable (in reality you'd need exchange rates)
    const prices = countryPricing
      .filter(c => c.localPrice && parseFloat(c.localPrice) > 0)
      .map(c => parseFloat(c.localPrice));
    
    if (prices.length === 0) return 0;
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  };

  const availableCountriesToAdd = AVAILABLE_COUNTRIES.filter(
    country => !countryPricing.some(cp => cp.countryCode === country.code)
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">¿Quién puede tomarlo y cómo?</h3>
        <p className="text-sm text-gray-600">
          Define el precio y el tipo de acceso. Puedes modificarlo más adelante.
        </p>
      </div>

      {/* Precio del Curso */}
      <div>
        <Label htmlFor="precio" className="text-sm font-medium text-gray-900 mb-1.5 block">
          ¿Cuánto vale tu curso? *
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
            placeholder="49.00"
            className="pl-10 text-base"
            min="0"
            step="0.01"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Cursos similares en la plataforma suelen costar entre 29€ y 99€</span>
        </p>
      </div>

      {/* Multi-Country Pricing Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-1">
            Precios internacionales
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Configura precios específicos por país y visualiza cuánto recibirás en cada mercado.
          </p>

          {/* Summary Box - shown when there are countries */}
          {countryPricing.length > 0 && (
            <Card className="p-5 bg-gradient-to-br from-purple-50 to-white border-purple-200 mb-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900">Resumen estimado</h5>
                  <p className="text-xs text-gray-600">Proyección basada en precios configurados</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Mercados activos</p>
                  <p className="text-xl font-semibold text-gray-900">{countryPricing.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Comisión plataforma</p>
                  <p className="text-xl font-semibold text-gray-700">{(PLATFORM_COMMISSION * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Neto promedio</p>
                  <p className="text-xl font-semibold text-purple-600">
                    {(getAveragePriceInEuros() * (1 - PLATFORM_COMMISSION)).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Country Pricing List */}
          {countryPricing.length > 0 && (
            <div className="space-y-3 mb-4">
              {countryPricing.map((country) => (
                <Card key={country.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Country */}
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{country.countryName}</p>
                        <p className="text-xs text-gray-500">{country.currency}</p>
                      </div>
                    </div>

                    {/* Price Input */}
                    <div className="col-span-3">
                      <Label className="text-xs text-gray-600 mb-1 block">Precio local</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          {country.currencySymbol}
                        </span>
                        <Input
                          type="number"
                          value={country.localPrice}
                          onChange={(e) => updateCountryPrice(country.id, e.target.value)}
                          placeholder="0.00"
                          className="pl-8 text-sm h-9"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Commission */}
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600 mb-1 block">Comisión</Label>
                      <p className="text-sm text-gray-500">
                        {country.currencySymbol} {calculateCommission(country.localPrice).toFixed(2)}
                      </p>
                    </div>

                    {/* Net Earnings */}
                    <div className="col-span-3">
                      <Label className="text-xs text-gray-600 mb-1 block">Neto estimado</Label>
                      <p className="text-sm font-semibold text-gray-900">
                        {country.currencySymbol} {calculateNet(country.localPrice).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeCountry(country.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        aria-label="Eliminar país"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Add Country Button */}
          {!showCountrySelector && availableCountriesToAdd.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCountrySelector(true)}
              className="w-full border-dashed border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir país
            </Button>
          )}

          {/* Country Selector */}
          {showCountrySelector && (
            <Card className="p-4 border-purple-200 bg-purple-50/50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-900">Selecciona un país</p>
                <button
                  onClick={() => setShowCountrySelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableCountriesToAdd.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => addCountry(country)}
                    className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{country.name}</p>
                      <p className="text-xs text-gray-500">{country.currency}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
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