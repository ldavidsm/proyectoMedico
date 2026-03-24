import { CheckCircle2, ExternalLink, BookOpen } from "lucide-react";
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
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-10 w-full">
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>

        <div className="text-sm text-slate-400 mb-8 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Lectura
          <span className="w-1 h-1 bg-slate-600 rounded-full" />
          {content.split(/\s+/).length > 200 ? `${Math.ceil(content.split(/\s+/).length / 200)} min` : "1 min"}
        </div>

        <div className="border-t border-slate-800 mb-8" />

        <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-purple-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded">
          {content.split("\n\n").map((paragraph, index) => {
            // Si el párrafo es un título (todo en mayúsculas)
            if (paragraph === paragraph.toUpperCase() && paragraph.length < 50) {
              return (
                <h2 key={index}>
                  {paragraph}
                </h2>
              );
            }

            // Si el párrafo comienza con un número seguido de punto (lista numerada)
            if (/^\d+\./.test(paragraph)) {
              return (
                <p key={index} className="ml-4">
                  {paragraph}
                </p>
              );
            }

            // Párrafo normal
            return (
              <p key={index}>
                {paragraph}
              </p>
            );
          })}
        </div>

        {bibliography && bibliography.length > 0 && (
          <div className="mt-12 border-t border-slate-800 pt-8">
            <h3 className="text-xl font-semibold text-white mb-4">Bibliografía recomendada</h3>
            <div className="space-y-4">
              {bibliography.map((item, index) => (
                <div key={index} className="border border-slate-700 rounded-lg p-4 hover:border-purple-500/50 hover:bg-purple-900/10 transition-colors">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 group"
                  >
                    <ExternalLink className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-base font-medium text-purple-400 group-hover:text-purple-300 group-hover:underline">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                      )}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isCompleted ? (
          <button
            onClick={handleMarkComplete}
            className="mt-8 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
          >
            <CheckCircle2 className="h-5 w-5" />
            Marcar como completado
          </button>
        ) : (
          <div className="mt-8 flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-medium px-6 py-3 rounded-xl">
            <CheckCircle2 className="h-5 w-5" />
            Lectura completada
          </div>
        )}
      </div>
    </div>
  );
}
