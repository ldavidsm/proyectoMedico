import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { CheckCircle2, XCircle, Download, Upload, FileText, X, ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface FileAttachment {
  name: string;
  url: string;
  size?: string;
}

interface FileTaskLessonProps {
  title: string;
  duration?: string;
  instructions: string;
  attachments?: FileAttachment[];
  lessonId: string;
  currentGrade?: number;
  onSubmit: () => void;
  onCompleteWithGrade?: (lessonId: string, grade: number) => void;
  onNext: () => void;
  onBack?: () => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

type FileTaskState = "intro" | "working" | "submitting" | "submitted" | "completed";

export function FileTaskLesson({
  title,
  duration = "60 min",
  instructions,
  attachments = [],
  lessonId,
  currentGrade,
  onSubmit,
  onCompleteWithGrade,
  onNext,
  onBack,
  onFullscreenChange,
}: FileTaskLessonProps) {
  const initialState: FileTaskState = currentGrade !== undefined ? "completed" : "intro";
  const [taskState, setTaskState] = useState<FileTaskState>(initialState);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsTopRef = useRef<HTMLDivElement>(null);

  // Notificar cambios de fullscreen al componente padre
  useEffect(() => {
    if (onFullscreenChange) {
      const needsFullscreen = taskState === "working" || taskState === "submitting" || taskState === "submitted";
      onFullscreenChange(needsFullscreen);
    }
  }, [taskState, onFullscreenChange]);

  // Scroll al inicio cuando se muestran los resultados
  useEffect(() => {
    if (taskState === "submitted" || taskState === "completed") {
      if (resultsTopRef.current) {
        resultsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [taskState]);

  const handleStart = () => {
    setTaskState("working");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitClick = () => {
    if (uploadedFiles.length === 0) {
      alert("Por favor, sube al menos un archivo antes de enviar.");
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    setTaskState("submitting");

    // Simular envío y calificación
    setTimeout(() => {
      const simulatedGrade = Math.floor(Math.random() * 26) + 75;
      
      if (onCompleteWithGrade) {
        onCompleteWithGrade(lessonId, simulatedGrade);
      }
      
      onSubmit();
      setTaskState("submitted");
    }, 3000);
  };

  const handleBackToView = () => {
    if (taskState === "submitted" && currentGrade !== undefined) {
      setTaskState("completed");
    } else if (onBack) {
      onBack();
    }
  };

  const handleRetry = () => {
    setUploadedFiles([]);
    setTaskState("working");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Pantalla completada (cuando ya hay un grado guardado)
  if (taskState === "completed" && currentGrade !== undefined) {
    const completedPassed = currentGrade >= 75;
    const submissionDate = new Date();
    const formattedDate = `${submissionDate.getDate()} de ${submissionDate.toLocaleDateString('es-ES', { month: 'short' })}. ${submissionDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} CET`;

    return (
      <div ref={resultsTopRef} className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-8 py-12">
          {/* Título principal */}
          <h1 className="mb-8 text-4xl font-normal text-gray-900">{title}</h1>

          {/* Sección coach */}
          <div className="mb-8 flex items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">Instrucciones</h2>
              <div className="whitespace-pre-line text-sm text-gray-700">{instructions}</div>
            </div>
          </div>

          {/* Archivos descargables */}
          {attachments.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 text-base font-medium text-gray-900">Archivos adjuntos</h3>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    download
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      {file.size && <p className="text-xs text-gray-500">{file.size}</p>}
                    </div>
                    <Download className="h-5 w-5 text-blue-600" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Detalles de la entrega */}
          <div className="mb-8 grid grid-cols-2 gap-6 rounded-lg border border-gray-200 bg-white p-6">
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-700">Calificación recibida</h3>
              <div className="flex items-center gap-3">
                {completedPassed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <span className="text-2xl font-semibold text-gray-900">{currentGrade}%</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {completedPassed ? "Aprobado" : "No aprobado"} (se requiere 75% o más)
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-700">Última entrega</h3>
              <p className="text-sm text-gray-900">{formattedDate}</p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            {!completedPassed && (
              <Button onClick={handleRetry} variant="outline" size="lg">
                Vuelve a intentarlo
              </Button>
            )}
            <Button onClick={onNext} size="lg">
              Ir al siguiente elemento
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de introducción
  if (taskState === "intro") {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-3xl font-medium text-gray-900">{title}</h1>
        <p className="mb-6 text-base text-gray-600">Tarea • {duration}</p>

        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Instrucciones</h2>
          <div className="whitespace-pre-line text-sm text-gray-700">{instructions}</div>
        </div>

        {attachments.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-3 text-base font-medium text-gray-900">Archivos para descargar</h3>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <a
                  key={index}
                  href={file.url}
                  download
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                >
                  <FileText className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    {file.size && <p className="text-xs text-gray-500">{file.size}</p>}
                  </div>
                  <Download className="h-5 w-5 text-blue-600" />
                </a>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleStart} size="lg">
          Comenzar tarea
        </Button>
      </div>
    );
  }

  // Pantalla de envío/procesando
  if (taskState === "submitting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <h2 className="mt-4 text-xl font-medium text-gray-900">Enviando tu tarea...</h2>
          <p className="mt-2 text-sm text-gray-600">Por favor espera mientras procesamos tu entrega</p>
        </div>
      </div>
    );
  }

  // Pantalla de resultados después de enviar
  if (taskState === "submitted" && currentGrade !== undefined) {
    const passed = currentGrade >= 75;
    const submissionDate = new Date();
    const formattedDate = `${submissionDate.getDate()} de ${submissionDate.toLocaleDateString('es-ES', { month: 'short' })}. ${submissionDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} CET`;

    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToView}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ChevronLeft className="h-5 w-5" />
              Volver
            </button>
            <div>
              <h1 className="text-lg font-medium text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">Tarea • {duration}</p>
            </div>
          </div>
        </div>

        {/* Banner de resultados */}
        <div ref={resultsTopRef} className={`px-8 py-6 ${passed ? "bg-green-50" : "bg-red-50"}`}>
          <div className="mx-auto flex max-w-4xl items-center gap-4">
            {passed ? (
              <CheckCircle2 className="h-8 w-8 flex-shrink-0 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 flex-shrink-0 text-red-600" />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {passed ? "¡Felicitaciones! Has aprobado" : "No has alcanzado la calificación mínima"}
              </h2>
              <p className="text-sm text-gray-700">
                Tu calificación: <span className="font-semibold">{currentGrade}%</span> (se requiere 75% o más para aprobar)
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-8 py-8">
          <div className="mx-auto max-w-4xl">
            {/* Detalles de la entrega */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Detalles de la tarea</h3>
              <div className="grid grid-cols-2 gap-6 rounded-lg border border-gray-200 bg-white p-6">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-700">Calificación</p>
                  <p className="text-2xl font-semibold text-gray-900">{currentGrade}%</p>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-700">Fecha de entrega</p>
                  <p className="text-sm text-gray-900">{formattedDate}</p>
                </div>
              </div>
            </div>

            {/* Archivos enviados */}
            <div className="mb-8">
              <h3 className="mb-3 text-base font-medium text-gray-900">Archivos enviados</h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              {!passed && (
                <Button onClick={handleRetry} variant="outline" size="lg">
                  Vuelve a intentarlo
                </Button>
              )}
              <Button onClick={onNext} size="lg">
                Ir al siguiente elemento
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de trabajo
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToView}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ChevronLeft className="h-5 w-5" />
            Salir sin guardar
          </button>
          <div>
            <h1 className="text-lg font-medium text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600">Tarea • {duration}</p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Instrucciones */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Instrucciones</h2>
            <div className="whitespace-pre-line text-sm text-gray-700">{instructions}</div>
          </div>

          {/* Archivos descargables */}
          {attachments.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 text-base font-medium text-gray-900">Archivos adjuntos</h3>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    download
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      {file.size && <p className="text-xs text-gray-500">{file.size}</p>}
                    </div>
                    <Download className="h-5 w-5 text-blue-600" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Subir archivos */}
          <div className="mb-8">
            <h3 className="mb-3 text-base font-medium text-gray-900">Entrega de la tarea</h3>
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Arrastra archivos aquí o</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Selecciona archivos
              </Button>
              <p className="mt-2 text-xs text-gray-500">PDF, DOC, DOCX, TXT, imágenes (máx. 50MB por archivo)</p>
            </div>
          </div>

          {/* Lista de archivos subidos */}
          {uploadedFiles.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 text-base font-medium text-gray-900">Archivos seleccionados ({uploadedFiles.length})</h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="rounded p-1 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmitClick}
              size="lg"
              disabled={uploadedFiles.length === 0}
            >
              Enviar tarea
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Enviar la tarea?</DialogTitle>
            <DialogDescription>
              Estás a punto de enviar {uploadedFiles.length} archivo{uploadedFiles.length !== 1 ? 's' : ''}. Una vez enviada, la tarea será evaluada por el instructor.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmSubmit}>
              Confirmar envío
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
