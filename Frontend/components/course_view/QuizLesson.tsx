import { useState } from "react";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizLessonProps {
  title: string;
  questions: Question[];
  onComplete: () => void;
  onNext: () => void;
}

export function QuizLesson({
  title,
  questions,
  onComplete,
  onNext,
}: QuizLessonProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    if (!isSubmitted) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: answerIndex,
      }));
    }
  };

  const handleSubmit = () => {
    // Verificar que todas las preguntas han sido respondidas
    const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);
    if (!allAnswered) {
      alert("Por favor, responde todas las preguntas antes de enviar.");
      return;
    }

    setIsSubmitted(true);
    setShowResults(true);

    // Calcular el puntaje
    const correctCount = questions.filter(
      (q) => selectedAnswers[q.id] === q.correctAnswer
    ).length;

    // Si aprueba (más del 60%), completar la lección
    if (correctCount / questions.length >= 0.6) {
      onComplete();
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setShowResults(false);
  };

  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id] === q.correctAnswer
  ).length;
  const score = (correctCount / questions.length) * 100;
  const passed = score >= 60;

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <h1 className="mb-6 text-3xl font-medium text-gray-900">{title}</h1>

      {showResults && (
        <div
          className={`mb-6 rounded-lg p-4 ${
            passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {passed ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <div>
              <p
                className={`font-medium ${
                  passed ? "text-green-900" : "text-red-900"
                }`}
              >
                {passed ? "¡Felicidades! Has aprobado" : "No has aprobado"}
              </p>
              <p
                className={`text-sm ${
                  passed ? "text-green-700" : "text-red-700"
                }`}
              >
                Puntaje: {correctCount} de {questions.length} correctas ({Math.round(score)}%)
              </p>
            </div>
          </div>
          {!passed && (
            <Button onClick={handleRetry} variant="outline" className="mt-4">
              Reintentar cuestionario
            </Button>
          )}
        </div>
      )}

      <div className="space-y-6">
        {questions.map((question, qIndex) => {
          const isCorrect = selectedAnswers[question.id] === question.correctAnswer;
          const userAnswer = selectedAnswers[question.id];

          return (
            <div
              key={question.id}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <h3 className="mb-4 text-base font-medium text-gray-900">
                {qIndex + 1}. {question.question}
              </h3>

              <div className="space-y-2">
                {question.options.map((option, optIndex) => {
                  const isSelected = userAnswer === optIndex;
                  const isCorrectAnswer = optIndex === question.correctAnswer;
                  const showCorrect = isSubmitted && isCorrectAnswer;
                  const showIncorrect = isSubmitted && isSelected && !isCorrect;

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleAnswerSelect(question.id, optIndex)}
                      disabled={isSubmitted}
                      className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                        showCorrect
                          ? "border-green-500 bg-green-50"
                          : showIncorrect
                          ? "border-red-500 bg-red-50"
                          : isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      } ${isSubmitted ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          showCorrect
                            ? "border-green-600 bg-green-600"
                            : showIncorrect
                            ? "border-red-600 bg-red-600"
                            : isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        {(isSelected || showCorrect) && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={`flex-1 text-sm ${
                          showCorrect || showIncorrect
                            ? "font-medium"
                            : ""
                        }`}
                      >
                        {option}
                      </span>
                      {showCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {showIncorrect && <XCircle className="h-5 w-5 text-red-600" />}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <div
                  className={`mt-3 flex items-start gap-2 text-sm ${
                    isCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Respuesta correcta</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Respuesta incorrecta. La respuesta correcta es:{" "}
                        {question.options[question.correctAnswer]}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isSubmitted && (
        <div className="mt-6">
          <Button onClick={handleSubmit} size="lg">
            Enviar respuestas
          </Button>
        </div>
      )}

      {/* Botón fijo en la parte inferior */}
      {isSubmitted && passed && (
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