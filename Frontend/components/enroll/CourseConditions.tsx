import { Card } from "../ui/card";

export function CourseConditions() {
  const conditions = [
    {
      concept: "Acceso al contenido",
      details: "Ilimitado desde la fecha de inscripción",
    },
    {
      concept: "Ritmo del curso",
      details: "Autodirigido, sin plazos de finalización",
    },
    {
      concept: "Interacción con el profesorado",
      details: "Tutorías asincrónicas vía plataforma durante 6 meses",
    },
    {
      concept: "Sesiones en directo",
      details: "No incluidas. Material grabado disponible",
    },
    {
      concept: "Certificación",
      details: "Certificado de aprovechamiento tras completar el 100% del contenido y superar la evaluación final",
    },
    {
      concept: "Idioma",
      details: "Español",
    },
  ];

  return (
    <Card className="p-8 bg-white border border-gray-200 shadow-sm">
      <h2 className="text-2xl mb-2 text-gray-900">Condiciones del programa</h2>
      <p className="text-sm text-gray-600 mb-6">
        A continuación se detallan las condiciones específicas de acceso y acompañamiento del programa, para que pueda evaluarlas antes de continuar.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-700 font-medium bg-gray-50">
                Concepto
              </th>
              <th className="text-left py-3 px-4 text-gray-700 font-medium bg-gray-50">
                Detalles
              </th>
            </tr>
          </thead>
          <tbody>
            {conditions.map((condition, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 last:border-b-0"
              >
                <td className="py-3 px-4 text-gray-900 font-medium align-top">
                  {condition.concept}
                </td>
                <td className="py-3 px-4 text-gray-700 align-top">
                  {condition.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}