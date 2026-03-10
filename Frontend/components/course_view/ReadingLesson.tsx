import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface BibliographyItem {
  title: string;
  url: string;
  description?: string;
}

interface ReadingLessonProps {
  title: string;
  content: string;
  bibliography?: BibliographyItem[];
  isCompleted: boolean;
  onComplete: () => void;
  onNext: () => void;
}

export function ReadingLesson({
  title,
  content,
  bibliography,
  isCompleted: initialCompleted = false,
  onComplete,
  onNext,
}: ReadingLessonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);

  const handleMarkComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      onComplete();
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <h1 className="mb-6 text-3xl font-medium text-gray-900">{title}</h1>

      <div className="prose prose-slate max-w-none">
        {content.split("\n\n").map((paragraph, index) => {
          // Si el párrafo es un título (todo en mayúsculas)
          if (paragraph === paragraph.toUpperCase() && paragraph.length < 50) {
            return (
              <h2 key={index} className="text-xl font-semibold text-gray-900 mt-8 mb-3">
                {paragraph}
              </h2>
            );
          }

          // Si el párrafo comienza con un número seguido de punto (lista numerada)
          if (/^\d+\./.test(paragraph)) {
            return (
              <p key={index} className="text-base text-gray-700 leading-relaxed mb-2 ml-4">
                {paragraph}
              </p>
            );
          }

          // Párrafo normal
          return (
            <p key={index} className="text-base text-gray-700 leading-relaxed mb-4">
              {paragraph}
            </p>
          );
        })}
      </div>

      {bibliography && bibliography.length > 0 && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Bibliografía recomendada</h3>
          <div className="space-y-4">
            {bibliography.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 group"
                >
                  <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-base font-medium text-blue-600 group-hover:text-blue-700 group-hover:underline">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isCompleted && (
        <div className="mt-8">
          <Button onClick={handleMarkComplete} variant="outline" size="lg">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Marcar como completado
          </Button>
        </div>
      )}

      {isCompleted && (
        <div className="mt-8 flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">Lectura completada</span>
        </div>
      )}

      {/* Botón fijo en la parte inferior */}
      <div className="fixed bottom-0 right-0 left-72 bg-white border-t border-gray-200 p-4">
        <div className="mx-auto max-w-3xl flex justify-end">
          <Button onClick={onNext} size="lg" disabled={!isCompleted}>
            Ir al siguiente elemento
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}