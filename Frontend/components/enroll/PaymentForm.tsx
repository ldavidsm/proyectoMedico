import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { CreditCard } from "lucide-react";

interface PaymentFormProps {
  onSubmit: (data: any) => void;
  price: number;
  currency: string;
  isSubmitting?: boolean;
  courseTitle?: string;
  legalConsent: {
    conditionsReviewed: boolean;
    understandsNature: boolean;
    acceptsResponsibility: boolean;
  };
  onConsentChange: (consent: any) => void;
}

export function PaymentForm({
  onSubmit,
  price,
  currency,
  isSubmitting = false,
  courseTitle,
  legalConsent,
  onConsentChange,
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    saveCard: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(legalConsent).every(Boolean)) {
      onSubmit(formData);
    }
  };

  const handleCheckboxChange = (field: keyof typeof legalConsent) => {
    onConsentChange({
      ...legalConsent,
      [field]: !legalConsent[field],
    });
  };

  const enrolledCount = 1247;

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Pago</h1>
          <p className="text-sm text-slate-500">
            Todos los campos son obligatorios
          </p>
        </div>
        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
          {enrolledCount.toLocaleString("es-ES")} ya están inscritos
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800 flex items-start gap-2">
            <span className="text-amber-500">⚠️</span>
            <span>
              <strong>Modo desarrollo:</strong> El pago es simulado. Cualquier dato es válido. Stripe se integrará antes del lanzamiento.
            </span>
          </div>
        )}

        {/* Información de facturación */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Información de facturación</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Nombre
              </Label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Elizabeth Rodríguez"
                required
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="country" className="text-sm font-semibold text-slate-700 mb-1.5 block">
                País
              </Label>
              <Select
                value={formData.country}
                onValueChange={(value) =>
                  setFormData({ ...formData, country: value })
                }
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Selecciona tu país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">España</SelectItem>
                  <SelectItem value="mx">México</SelectItem>
                  <SelectItem value="ar">Argentina</SelectItem>
                  <SelectItem value="co">Colombia</SelectItem>
                  <SelectItem value="cl">Chile</SelectItem>
                  <SelectItem value="pe">Perú</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Métodos de pago</h2>

          <Accordion type="single" defaultValue="tarjeta" collapsible>
            <AccordionItem value="tarjeta" className="border border-slate-200 rounded-xl mb-3">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-600 font-semibold">Tarjeta</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="cardNumber" className="text-sm font-semibold text-slate-700 mb-1.5 block">
                      Número de tarjeta
                    </Label>
                    <div className="relative">
                      <input
                        id="cardNumber"
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, cardNumber: e.target.value })
                        }
                        placeholder="1234 1234 1234 1234"
                        maxLength={19}
                        required
                        className={inputClass}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                          alt="Visa"
                          className="h-6"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                          alt="Mastercard"
                          className="h-6"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate" className="text-sm font-semibold text-slate-700 mb-1.5 block">
                        Fecha de vencimiento
                      </Label>
                      <input
                        id="expiryDate"
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          setFormData({ ...formData, expiryDate: e.target.value })
                        }
                        placeholder="MM/AA"
                        maxLength={5}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cvv" className="text-sm font-semibold text-slate-700 mb-1.5 block">
                        Código de seguridad
                      </Label>
                      <input
                        id="cvv"
                        type="text"
                        value={formData.cvv}
                        onChange={(e) =>
                          setFormData({ ...formData, cvv: e.target.value })
                        }
                        placeholder="CVC"
                        maxLength={4}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Al suministrar tus datos de tarjeta, le permites a HealthLearn
                    efectuar futuros cargos en tu tarjeta conforme a
                    las condiciones estipuladas.
                  </p>

                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                      id="save-card"
                      checked={formData.saveCard}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, saveCard: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="save-card"
                      className="text-sm text-slate-600 cursor-pointer leading-relaxed"
                    >
                      Guarda esta tarjeta de manera segura para futuros usos.{" "}
                      <a href="#" className="text-purple-600 hover:underline">
                        Obtener más información.
                      </a>
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="klarna" className="border border-slate-200 rounded-xl mb-3">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-pink-100 rounded flex items-center justify-center">
                    <span className="text-pink-600 font-bold text-xs">K</span>
                  </div>
                  <span className="font-medium text-slate-700">Klarna</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3 pt-2">
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Después del envío, se te redirigirá para completar los siguientes pasos de forma segura.
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Al acceder a Klarna, permitirás que HealthLearn efectúe cargos
                    de futuros pagos en tu cuenta de Klarna conforme a sus condiciones y a las
                    condiciones de Klarna.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="paypal" className="border border-slate-200 rounded-xl">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#003087">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.653h7.346c2.926 0 4.96.613 6.047 1.823 1.088 1.21 1.382 2.9.875 5.03-.062.26-.13.52-.204.78-.721 2.516-2.018 4.21-3.862 5.042-1.732.786-3.906 1.184-6.464 1.184H7.538a.77.77 0 0 0-.76.653l-.702 3.758z" />
                  </svg>
                  <span className="text-blue-600 font-medium">PayPal</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="py-4 text-center space-y-4">
                  <p className="text-base font-bold text-slate-900">
                    Completa el pago con PayPal.
                  </p>
                  <p className="text-sm text-slate-600">
                    Se te pedirá el email de tu cuenta Paypal y tu contraseña a
                    través de una forma de acceso segura de PayPal.
                  </p>
                  <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200"
                  >
                    PayPal
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Confirmaciones legales */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Confirmación obligatoria</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="conditions-reviewed"
                checked={legalConsent.conditionsReviewed}
                onCheckedChange={() =>
                  handleCheckboxChange("conditionsReviewed")
                }
                className="mt-1"
              />
              <Label
                htmlFor="conditions-reviewed"
                className="text-sm text-slate-600 cursor-pointer leading-relaxed"
              >
                Confirmo que he revisado las condiciones del programa.
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="understands-nature"
                checked={legalConsent.understandsNature}
                onCheckedChange={() => handleCheckboxChange("understandsNature")}
                className="mt-1"
              />
              <Label
                htmlFor="understands-nature"
                className="text-sm text-slate-600 cursor-pointer leading-relaxed"
              >
                Entiendo que el curso tiene carácter formativo y no sustituye
                titulaciones oficiales.
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="accepts-responsibility"
                checked={legalConsent.acceptsResponsibility}
                onCheckedChange={() =>
                  handleCheckboxChange("acceptsResponsibility")
                }
                className="mt-1"
              />
              <Label
                htmlFor="accepts-responsibility"
                className="text-sm text-slate-600 cursor-pointer leading-relaxed"
              >
                Acepto que la aplicación práctica de los contenidos es
                responsabilidad de mi ejercicio profesional y conforme a la
                normativa vigente en mi país.
              </Label>
            </div>
          </div>
        </div>

        {/* Botón de pago */}
        <button
          type="submit"
          disabled={!Object.values(legalConsent).every(Boolean) || isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)] text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Procesando pago...
            </>
          ) : (
            'Proceder al pago seguro'
          )}
        </button>

        {/* Links legales */}
        <p className="text-xs text-slate-500">
          Acepto los{" "}
          <a href="#" className="text-purple-600 hover:underline">
            Términos de uso
          </a>
          , la{" "}
          <a href="#" className="text-purple-600 hover:underline">
            Política de Reembolso
          </a>{" "}
          y la{" "}
          <a href="#" className="text-purple-600 hover:underline">
            Política de Privacidad
          </a>
          .
        </p>
      </form>
    </div>
  );
}
