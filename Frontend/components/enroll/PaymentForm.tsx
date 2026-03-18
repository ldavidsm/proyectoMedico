import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2">Pago</h1>
          <p className="text-sm text-gray-600">
            Todos los campos son obligatorios
          </p>
        </div>
        <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm whitespace-nowrap">
          {enrolledCount.toLocaleString("es-ES")} ya están inscritos
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de facturación */}
        <Card className="p-6 bg-white border border-gray-200">
          <h2 className="text-xl mb-4">Información de facturación</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm uppercase text-teal-700 mb-2 block">
                Nombre
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Elizabeth Rodríguez"
                required
              />
            </div>

            <div>
              <Label htmlFor="country" className="text-sm uppercase text-teal-700 mb-2 block">
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
        </Card>

        {/* Métodos de pago - Accordion */}
        <Card className="p-6 bg-white border border-gray-200">
          <h2 className="text-xl mb-4">Métodos de pago</h2>

          <Accordion type="single" defaultValue="tarjeta" collapsible>
            {/* Tarjeta */}
            <AccordionItem value="tarjeta" className="border rounded-lg mb-3">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">Tarjeta</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="cardNumber" className="text-sm mb-2 block">
                      Número de tarjeta
                    </Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, cardNumber: e.target.value })
                        }
                        placeholder="1234 1234 1234 1234"
                        maxLength={19}
                        required
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
                      <Label htmlFor="expiryDate" className="text-sm mb-2 block">
                        Fecha de vencimiento
                      </Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          setFormData({ ...formData, expiryDate: e.target.value })
                        }
                        placeholder="MM/AA"
                        maxLength={5}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cvv" className="text-sm mb-2 block">
                        Código de seguridad
                      </Label>
                      <Input
                        id="cvv"
                        type="text"
                        value={formData.cvv}
                        onChange={(e) =>
                          setFormData({ ...formData, cvv: e.target.value })
                        }
                        placeholder="CVC"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    Al suministrar tus datos de tarjeta, le permites a COURSERA
                    EUROPE B.V. efectuar futuros cargos en tu tarjeta conforme a
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
                      className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                    >
                      Guarda esta tarjeta de manera segura para futuros usos.{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        Obtener más información.
                      </a>
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Klarna */}
            <AccordionItem value="klarna" className="border rounded-lg mb-3">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-pink-100 rounded flex items-center justify-center">
                    <span className="text-pink-600 font-bold text-xs">K</span>
                  </div>
                  <span className="font-medium">Klarna</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3 pt-2">
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 border rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Después del envío, se te redirigirá para completar los siguientes pasos de forma segura.
                    </p>
                  </div>
                  
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Al acceder a Klarna, permitirás que COURSERA EUROPE B.V. efectúe cargos
                    de futuros pagos en tu cuenta de Klarna conforme a sus condiciones y a las
                    condiciones de Klarna. Puedes cambiar esta configuración en cualquier
                    momento en tu aplicación de Klarna o comunicándote con COURSERA EUROPE B.V.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* PayPal */}
            <AccordionItem value="paypal" className="border rounded-lg">
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
                  <p className="text-base">
                    <strong>Completa el pago con PayPal.</strong>
                  </p>
                  <p className="text-sm text-gray-700">
                    Se te pedirá el email de tu cuenta Paypal y tu contraseña a
                    través de una forma de acceso segura de PayPal.
                  </p>
                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    PayPal
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex items-start gap-2 mt-4">
            <Checkbox id="save-payment" />
            <Label htmlFor="save-payment" className="text-xs text-gray-700 cursor-pointer leading-relaxed">
              Guarda esta tarjeta de manera segura para futuros usos.{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Obtener más información.
              </a>
            </Label>
          </div>
        </Card>

        {/* Confirmaciones legales */}
        <Card className="p-6 bg-white border border-gray-200">
          <h2 className="text-xl mb-4">Confirmación obligatoria</h2>

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
                className="text-sm text-gray-700 cursor-pointer leading-relaxed"
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
                className="text-sm text-gray-700 cursor-pointer leading-relaxed"
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
                className="text-sm text-gray-700 cursor-pointer leading-relaxed"
              >
                Acepto que la aplicación práctica de los contenidos es
                responsabilidad de mi ejercicio profesional y conforme a la
                normativa vigente en mi país.
              </Label>
            </div>
          </div>
        </Card>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto px-8"
            disabled={!Object.values(legalConsent).every(Boolean) || isSubmitting}
          >
            {isSubmitting ? "Procesando pago..." : "Proceder al pago seguro"}
          </Button>
          <p className="text-sm text-gray-600">No recibirás un cargo hoy</p>
        </div>

        {/* Links legales */}
        <p className="text-xs text-gray-500">
          Acepto los{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Términos de uso
          </a>
          , la{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Política de Reembolso
          </a>{" "}
          y la{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Política de Privacidad
          </a>
          .
        </p>
      </form>
    </div>
  );
}
