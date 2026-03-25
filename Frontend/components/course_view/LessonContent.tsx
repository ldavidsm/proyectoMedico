import { useState, useEffect } from "react";
import { toast } from 'sonner';
import { VideoLesson } from "./VideoLesson";
import { QuizLesson } from "./QuizLesson";
import { FileTaskLesson } from "./FileTaskLesson";
import { ReadingLesson } from "./ReadingLesson";
import { LockedLessonContent } from "./LockedLessonContent";
import { ContentBlock } from "@/lib/course-service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface LessonContentProps {
  block: ContentBlock;
  courseId: string;
  isLocked?: boolean;

  onComplete: () => void;
  onNext: () => void;
  onGoBack?: () => void;
}

export function LessonContent({
  block,
  courseId,
  isLocked = false,
  onComplete,
  onNext,
  onGoBack,
}: LessonContentProps) {
  const [submission, setSubmission] = useState<{
    file_url?: string;
    file_name?: string;
    status: string;
    grade?: number;
    feedback?: string;
    submitted_at?: string;
  } | null>(null);

  useEffect(() => {
    if (block.type !== 'task' && block.type !== 'file_task') return;
    fetch(`${API_URL}/messaging/tasks/${block.id}/my-submission`, {
      credentials: 'include',
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setSubmission(data))
      .catch(() => {});
  }, [block.id, block.type]);

  if (isLocked) {
    return <LockedLessonContent lessonTitle={block.title} onGoBack={onGoBack} />;
  }

  if (block.type === "video") {
    return (
      <VideoLesson
        title={block.title}
        blockId={block.id}
        courseId={courseId}
        onComplete={onComplete}
        onNext={onNext}
      />
    );
  }

  if (block.type === "reading") {
    return (
      <ReadingLesson
        title={block.title}
        content={block.body_text || ""}
        bibliography={[]}
        isCompleted={false}
        onComplete={onComplete}
        onNext={onNext}
      />
    );
  }

  if (block.type === "file_task" || block.type === "task") {
    const attachments = block.content_url ? [{ name: "Recurso Adjunto", url: block.content_url }] : [];
    return (
      <FileTaskLesson
        title={block.title}
        duration={block.duration}
        instructions={block.body_text || "Sigue las instrucciones."}
        attachments={attachments}
        lessonId={block.id}
        courseId={courseId}
        currentSubmission={submission}
        onSubmit={onComplete}
        onNext={onNext}
        onBack={onGoBack}
      />
    );
  }

  if (block.type === "quiz") {
    return (
      <QuizLesson
        title={block.title}
        questions={(block.quiz_data as any) || []}
        onComplete={onComplete}
        onNext={onNext}
      />
    );
  }

  if (block.type === "resource" || (block.content_url && block.type !== "video" && block.type !== "quiz" && block.type !== "task" && block.type !== "file_task")) {
    const handleDownload = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/courses/${courseId}/contents/blocks/${block.id}/stream?mode=json`;
        const res = await fetch(url, { credentials: 'include' });

        if (res.ok) {
          const data = await res.json();
          if (data.url) window.open(data.url, '_blank');
        } else {
          toast.error("Error al descargar el archivo");
        }
      } catch (e) {
        console.error(e);
        toast.error("Error de conexión. Inténtalo de nuevo.");
      }
    };

    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-center">
        <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{block.title}</h2>
        <p className="text-gray-500 mb-6">Este contenido es un archivo descargable.</p>
        <button
          onClick={handleDownload}
          className="bg-white border-2 border-purple-600 text-purple-600 px-6 py-2.5 rounded-lg hover:bg-purple-50 transition font-medium mr-4"
        >
          Descargar Archivo
        </button>
        <button
          onClick={onNext}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition font-medium"
        >
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl mt-12 text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Tipo de contenido: {block.type}</h3>
      <p className="text-gray-500 mb-6">Este tipo de contenido está en desarrollo o no soportado.</p>
      <button onClick={onNext} className="text-purple-600 hover:underline">Saltar esta lección</button>
    </div>
  );
}