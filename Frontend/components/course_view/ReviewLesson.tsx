import { Button } from "../ui/button";
import { ArrowRight, CheckCircle2, Clock, MessageSquare, XCircle } from "lucide-react";

interface ReviewLessonProps {
  title: string;
  submittedContent: string;
  reviewStatus: "pending" | "approved" | "needs-changes";
  feedback?: {
    instructorName: string;
    comment: string;
    date: string;
  };
  onNext: () => void;
}

export function ReviewLesson({
  title,
  submittedContent,
  reviewStatus,
  feedback,
  onNext,
}: ReviewLessonProps) {
  const isApproved = reviewStatus === "approved";
  const needsChanges = reviewStatus === "needs-changes";
  const isPending = reviewStatus === "pending";

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <h1 className="mb-6 text-3xl font-medium text-gray-900">{title}</h1>

      {/* Estado de la revisión */}
      {isPending && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-900 mb-1">En revisión</h3>
              <p className="text-sm text-amber-800">
                Tu tarea está siendo revisada por el instructor. Te notificaremos
                cuando haya feedback disponible.
              </p>
            </div>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-900 mb-1">Tarea aprobada</h3>
              <p className="text-sm text-green-800">
                ¡Excelente trabajo! Tu tarea ha sido aprobada por el instructor.
              </p>
            </div>
          </div>
        </div>
      )}

      {needsChanges && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900 mb-1">Requiere cambios</h3>
              <p className="text-sm text-red-800">
                El instructor ha solicitado que revises y mejores tu trabajo. Por
                favor, lee el feedback a continuación.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tu envío */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="font-medium text-gray-900 mb-3">Tu envío:</h3>
        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {submittedContent}
        </p>
      </div>

      {/* Feedback del instructor */}
      {feedback && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-3 mb-3">
            <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <h3 className="font-medium text-blue-900">
              Feedback del instructor
            </h3>
          </div>
          <div className="ml-8">
            <p className="text-sm text-blue-900 mb-3 font-medium">
              {feedback.instructorName}
            </p>
            <p className="text-sm text-blue-800 whitespace-pre-line leading-relaxed">
              {feedback.comment}
            </p>
            <p className="text-xs text-blue-600 mt-3">
              {new Date(feedback.date).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      )}

      {needsChanges && (
        <div className="mt-6">
          <Button size="lg" variant="outline">
            Reenviar tarea corregida
          </Button>
        </div>
      )}

      {/* Botón fijo en la parte inferior */}
      {(isApproved || isPending) && (
        <div className="fixed bottom-0 right-0 left-72 bg-white border-t border-gray-200 p-4">
          <div className="mx-auto max-w-3xl flex justify-end">
            <Button onClick={onNext} size="lg">
              Ir al siguiente elemento
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}