import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { CheckCircle2, ArrowRight, Loader2, PlayCircle } from "lucide-react";


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface VideoLessonProps {
  title: string;
  blockId: string;
  courseId: string;
  onComplete: () => void;
  onNext: () => void;
}

export function VideoLesson({
  title,
  blockId,
  courseId,
  onComplete,
  onNext,
}: VideoLessonProps) {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let mounted = true;
    const fetchVideoUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/courses/${courseId}/contents/blocks/${blockId}/stream?mode=json`, {
          headers
        });

        if (!res.ok) throw new Error("No se pudo cargar el video");

        const data = await res.json();
        if (mounted) {
          setVideoUrl(data.url);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Error al obtener el video");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (blockId && courseId) {
      fetchVideoUrl();
    }

    return () => { mounted = false; };
  }, [blockId, courseId]);


  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);

      // Autocompletar al 90%
      if (currentProgress >= 90 && !isCompleted) {
        setIsCompleted(true);
        onComplete();
      }
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  if (error) return <div className="text-red-500 p-8 text-center">{error}</div>;

  return (
    <div className="mx-auto max-w-4xl pb-24 px-4 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
      <div className="py-6 border-b mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <PlayCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>

      <div className="mb-8 bg-black rounded-xl overflow-hidden shadow-lg border border-gray-200 aspect-video relative">
        {videoUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            autoPlay={false}
            onTimeUpdate={handleTimeUpdate}
            controlsList="nodownload"
          >
            <source src={videoUrl} />
            Tu navegador no soporta el elemento de video.
          </video>
        ) : (
          <div className="flex items-center justify-center h-full text-white">Video no disponible</div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span className="font-medium">Progreso de la lección</span>
          <span className="font-bold text-blue-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isCompleted && (
        <div className="mb-8 flex items-center gap-3 text-green-700 bg-green-50 rounded-lg p-4 border border-green-100 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-6 w-6 shrink-0" />
          <span className="font-medium text-lg">¡Lección completada!</span>
        </div>
      )}

      {/* Botón fijo en la parte inferior */}
      <div className="fixed bottom-0 right-0 left-80 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-10">
        <div className="mx-auto max-w-4xl flex justify-end">
          <Button onClick={onNext} size="lg" disabled={!isCompleted} className="shadow-lg hover:shadow-xl transition-all">
            Siguiente Lección
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}