import { useState, useRef, useEffect } from "react";
import { CheckCircle2, ArrowRight, Loader2, AlertTriangle } from "lucide-react";

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

      if (currentProgress >= 90 && !isCompleted) {
        setIsCompleted(true);
        onComplete();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#0F172A]">
        <div className="flex-1 flex items-center justify-center p-6 min-h-0">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-[#0F172A]">
        <div className="flex-1 flex items-center justify-center p-6 min-h-0">
          <div className="text-center p-8">
            <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0F172A]">
      {/* Video area */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        {videoUrl ? (
          <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/50">
            <video
              ref={videoRef}
              className="w-full aspect-video object-contain"
              controls
              autoPlay={false}
              onTimeUpdate={handleTimeUpdate}
              controlsList="nodownload"
            >
              <source src={videoUrl} />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">Video no disponible</div>
        )}
      </div>

      {/* Chrome / controls area */}
      <div className="bg-[#0F172A] px-6 py-5 border-t border-white/5">
        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-4 cursor-pointer group">
          <div
            className="h-full bg-purple-500 rounded-full group-hover:bg-purple-400 transition-colors"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-base mb-0.5">{title}</h2>
            <p className="text-slate-500 text-xs">Video · {Math.round(progress)}% completado</p>
          </div>

          <div className="flex items-center gap-3">
            {isCompleted ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium px-5 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                Completado
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsCompleted(true);
                  onComplete();
                }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar como completado
              </button>
            )}

            <button
              onClick={onNext}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
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
