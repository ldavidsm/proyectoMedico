import { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import {
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  ImageIcon,
} from 'lucide-react';

export type BannerImage = {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
};

// Dimensiones recomendadas
const RECOMMENDED_WIDTH = 1200;
const RECOMMENDED_HEIGHT = 400;
const MIN_WIDTH = 800;
const MIN_HEIGHT = 200;
const MAX_FILE_SIZE_MB = 5;
const ASPECT_RATIO = RECOMMENDED_WIDTH / RECOMMENDED_HEIGHT; // 3:1

type SizeStatus = 'ideal' | 'acceptable' | 'too_small' | 'wrong_ratio' | null;

function getSizeStatus(w: number, h: number): SizeStatus {
  if (w === 0 || h === 0) return null;
  const ratio = w / h;
  const ratioDiff = Math.abs(ratio - ASPECT_RATIO) / ASPECT_RATIO;
  if (w < MIN_WIDTH || h < MIN_HEIGHT) return 'too_small';
  if (ratioDiff > 0.35) return 'wrong_ratio';
  if (w >= RECOMMENDED_WIDTH && h >= RECOMMENDED_HEIGHT && ratioDiff <= 0.15) return 'ideal';
  return 'acceptable';
}

function getSizeFeedback(status: SizeStatus, w: number, h: number) {
  switch (status) {
    case 'ideal':
      return {
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />,
        text: `Imagen perfecta (${w}×${h} px)`,
        color: 'text-green-700',
        bg: 'bg-green-50 border-green-200',
      };
    case 'acceptable':
      return {
        icon: <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />,
        text: `Válida (${w}×${h} px). Ideal: ${RECOMMENDED_WIDTH}×${RECOMMENDED_HEIGHT} px.`,
        color: 'text-blue-700',
        bg: 'bg-blue-50 border-blue-200',
      };
    case 'too_small':
      return {
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />,
        text: `Muy pequeña (${w}×${h} px). Mínimo: ${MIN_WIDTH}×${MIN_HEIGHT} px.`,
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-200',
      };
    case 'wrong_ratio':
      return {
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />,
        text: `Proporción incorrecta (${w}×${h} px). Use formato 3:1 panorámico.`,
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-200',
      };
    default:
      return null;
  }
}

interface BannerUploaderProps {
  image: BannerImage | undefined;
  onChange: (image: BannerImage) => void;
  /** Compact mode for the edit panel */
  compact?: boolean;
  /** Optional course info for preview overlay */
  courseTitle?: string;
  courseSubtitle?: string;
  courseCategory?: string;
  /** Show the preview with text overlay */
  showPreview?: boolean;
}

export default function BannerUploader({
  image,
  onChange,
  compact = false,
  courseTitle,
  courseSubtitle,
  courseCategory,
  showPreview = false,
}: BannerUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        setError('Solo se admiten imágenes JPG, PNG o WebP.');
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`La imagen no debe superar los ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          onChange({ imageUrl: url, imageWidth: img.naturalWidth, imageHeight: img.naturalHeight });
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    onChange({ imageUrl: '', imageWidth: 0, imageHeight: 0 });
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasImage = !!image?.imageUrl;
  const sizeStatus = hasImage ? getSizeStatus(image!.imageWidth, image!.imageHeight) : null;
  const feedback = sizeStatus ? getSizeFeedback(sizeStatus, image!.imageWidth, image!.imageHeight) : null;

  return (
    <div className="space-y-2.5">
      {hasImage ? (
        <div className="space-y-2">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
            <div className="relative" style={{ aspectRatio: '3 / 1' }}>
              <img src={image!.imageUrl} alt="Banner" className="w-full h-full object-cover" />
              {showPreview && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              )}
              {showPreview && (
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  {courseCategory && (
                    <span className="inline-block bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full mb-1.5 border border-white/30 backdrop-blur-sm">
                      {courseCategory}
                    </span>
                  )}
                  <h3 className="text-base font-semibold leading-tight drop-shadow-sm">
                    {courseTitle || 'Título del curso'}
                  </h3>
                  {courseSubtitle && (
                    <p className="text-xs text-white/80 mt-0.5 drop-shadow-sm">{courseSubtitle}</p>
                  )}
                </div>
              )}
              {/* Hover actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 px-2.5 bg-white/90 hover:bg-white text-xs shadow-sm"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Cambiar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRemove}
                  className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-red-600 shadow-sm"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          {/* Size feedback */}
          {feedback && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs ${feedback.bg}`}>
              {feedback.icon}
              <span className={feedback.color}>{feedback.text}</span>
            </div>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-50 scale-[1.01]'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/30'
          }`}
          style={{ aspectRatio: compact ? '4 / 1' : '3 / 1' }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isDragging ? 'bg-purple-200' : 'bg-gray-100'
              }`}
            >
              <Upload className={`w-4 h-4 ${isDragging ? 'text-purple-600' : 'text-gray-400'}`} />
            </div>
            <p className={`text-xs font-medium text-center ${isDragging ? 'text-purple-700' : 'text-gray-500'}`}>
              {isDragging ? 'Suelte aquí' : 'Arrastre una imagen o haga clic'}
            </p>
            <p className="text-[10px] text-gray-400 text-center">
              JPG, PNG o WebP · Máx {MAX_FILE_SIZE_MB} MB · {RECOMMENDED_WIDTH}×{RECOMMENDED_HEIGHT} px
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-red-50 border-red-200 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
