import { useState, useRef, useEffect } from "react";
import { CheckCircle2, ArrowRight, Loader2, PlayCircle, AlertTriangle } from "lucide-react";


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
        const res = await fetch(`${API_URL}/courses/${courseId}/contents/blocks/${blockId}/stream?mode=json`, {
          credentials: 'include'
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

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-slate-950">
        <div className="relative bg-black flex-1 flex items-center justify-center min-h-0">
          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-slate-950">
        <div className="relative bg-black flex-1 flex items-center justify-center min-h-0">
          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
            <div className="text-center p-8">
              <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Video area */}
      <div className="relative bg-black flex-1 flex items-center justify-center min-h-0">
        {videoUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain max-h-[70vh]"
            controls
            autoPlay={false}
            onTimeUpdate={handleTimeUpdate}
            controlsList="nodownload"
          >
            <source src={videoUrl} />
            Tu navegador no soporta el elemento de video.
          </video>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">Video no disponible</div>
        )}
      </div>

      {/* Chrome / controls area */}
      <div className="bg-slate-900 px-6 py-4 border-t border-slate-800">
        {/* Progress bar */}
        <div
          className="h-1 bg-slate-700 rounded-full overflow-hidden mb-3 cursor-pointer hover:h-1.5 transition-all"
        >
          <div
            className="h-full bg-purple-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-base mb-1">{title}</h2>
            <p className="text-slate-400 text-xs">Video · {Math.round(progress)}% completado</p>
          </div>

          <div className="flex items-center gap-3">
            {isCompleted ? (
              <div className="flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-4 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                Completado
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsCompleted(true);
                  onComplete();
                }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar como completado
              </button>
            )}

            <button
              onClick={onNext}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
