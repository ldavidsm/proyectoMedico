import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface LegalConsentProps {
  consent: {
    conditionsReviewed: boolean;
    understandsNature: boolean;
    acceptsResponsibility: boolean;
  };
  onConsentChange: (consent: {
    conditionsReviewed: boolean;
    understandsNature: boolean;
    acceptsResponsibility: boolean;
  }) => void;
}

export function LegalConsent({ consent, onConsentChange }: LegalConsentProps) {
  const handleCheckboxChange = (field: keyof typeof consent) => {
    onConsentChange({
      ...consent,
      [field]: !consent[field],
    });
  };

  return (
    <Card className="p-8 bg-white border border-gray-200 shadow-sm">
      <h2 className="text-2xl mb-6 text-gray-900">Confirmación obligatoria</h2>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="conditions-reviewed"
            checked={consent.conditionsReviewed}
            onCheckedChange={() => handleCheckboxChange("conditionsReviewed")}
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
            checked={consent.understandsNature}
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
            checked={consent.acceptsResponsibility}
            onCheckedChange={() => handleCheckboxChange("acceptsResponsibility")}
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
  );
}