import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { AlertCircle, Clock, ArrowRight } from "lucide-react";

interface TaskLessonProps {
  title: string;
  instructions: string;
  onSubmit: () => void;
  onNext: () => void;
}

export function TaskLesson({
  title,
  instructions,
  onSubmit,
  onNext,
}: TaskLessonProps) {
  const [submission, setSubmission] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (submission.trim().length < 50) {
      alert("Por favor, proporciona una respuesta más detallada (mínimo 50 caracteres).");
      return;
    }

    setIsSubmitted(true);
    onSubmit();
  };

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <h1 className="mb-6 text-3xl font-medium text-gray-900">{title}</h1>

      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Instrucciones</h3>
            <div className="text-sm text-blue-800 whitespace-pre-line">
              {instructions}
            </div>
          </div>
        </div>
      </div>

      {!isSubmitted ? (
        <>
          <div className="mb-6">
            <label
              htmlFor="submission"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Tu respuesta
            </label>
            <textarea
              id="submission"
              rows={12}
              className="w-full rounded-lg border border-gray-300 p-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Escribe tu respuesta aquí..."
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
            />
            <p className="mt-2 text-xs text-gray-500">
              Mínimo 50 caracteres. Actual: {submission.length}
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            size="lg"
            disabled={submission.trim().length < 50}
          >
            Enviar tarea para revisión
          </Button>
        </>
      ) : (
        <>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-900 mb-1">
                  Tarea enviada para revisión
                </h3>
                <p className="text-sm text-amber-800">
                  Tu tarea está siendo revisada por el instructor. Mientras tanto,
                  puedes continuar con el siguiente contenido del curso.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900 mb-2">Tu envío:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {submission}
            </p>
          </div>

          {/* Botón fijo en la parte inferior */}
          <div className="fixed bottom-0 right-0 left-72 bg-white border-t border-gray-200 p-4">
            <div className="mx-auto max-w-3xl flex justify-end">
              <Button onClick={onNext} size="lg">
                Ir al siguiente elemento
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}