'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Check, X, Save, ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import CourseBuilderStep from './steps/course-builder-step';
import CourseInfoStep from './steps/course-info-step';
import PublishConfigStep from './steps/publish-config-step';
import ReviewStep from './steps/review-step';
import SuccessModal from './success-modal';
import WhatToCreateModal from './what-to-create-modal';
import ExitConfirmationModal from './exit-confirmation-modal';
import { AlertModal } from './ui/alert-modal';
import { courseService, CourseCreatePayload, CourseResponse, BibliographyPayload, OfferPayload, ModulePayload, BlockPayload, CourseCatalogs } from '@/lib/course-service';
import { useAuth } from '@/context/AuthContext';

// Tipo para las ofertas del curso
export type OfertaCurso = {
  id: string;

  // 1. Identificación
  nombreInterno: string; // Ej: "Básica", "Premium", "Con tutorías"
  nombrePublico?: string; // Nombre que verá el alumno (opcional, se puede generar auto)
  estado: 'activa' | 'archivada';

  // 2. Precio
  precioBase: number;
  monedaOrigen?: string; // Código ISO de la moneda principal (ej: 'COP', 'EUR')
  paisOrigen?: string;   // Código del país del profesor (ej: 'CO', 'ES')
  descuentoTemporal?: {
    porcentaje: number;
    fechaInicio: string;
    fechaFin: string;
  };
  codigosPromocionales?: Array<{
    codigo: string;
    descuento: number;
    usos: number;
    activo: boolean;
  }>;

  // Indicador de modalidad recomendada
  recomendada?: boolean;

  // 3. BLOQUE: INSCRIPCIÓN
  inscripcionTipo: 'siempre' | 'convocatoria';
  convocatoria?: {
    inicioInscripcion?: string;
    cierreInscripcion?: string;
    inicioCurso?: string;
    finAcompanamiento?: string;
    plazasMaximas?: number;
  };

  // 4. BLOQUE: ACOMPAÑAMIENTO
  acompanamiento: ('ninguno' | 'comunidad' | 'chat_instructor')[];
  chatConfig?: {
    preguntasPorAlumno: number;
    tiempoRespuesta: '48h' | '72h' | '7d';
  };

  // 5. BLOQUE: DURACIÓN DEL ACCESO AL CONTENIDO
  accesoContenido: 'vitalicio' | 'por_meses';
  accesoMeses?: number;

  // Legacy blocks (kept for backward compat)
  bloqueAcceso: {
    tipo: 'permanente' | 'limitado' | 'suscripcion';
    duracionMeses?: number;
    periodoSuscripcion?: 'mensual' | 'trimestral' | 'anual';
    descripcionAcceso?: string;
  };

  // 6. BLOQUE: RITMO Y FORMATO
  bloqueRitmoFormato: {
    ritmo: 'libre' | 'guiado';
    calendarioSugerido?: string;
    tipoInicio?: 'al_inscribirse' | 'fecha_fija';
    fechaInicioCohort?: string;
    ritmoDesbloqueo?: 'semanal' | 'quincenal' | 'mensual' | 'personalizado';
    diasEntreModulos?: number;
    duracionSemanas?: number;
    sesionesDirecto: {
      incluidas: boolean;
      descripcion?: string;
      duracionTotal?: string;
    };
  };

  // 7. BLOQUE: CERTIFICACIÓN
  bloqueCertificacion: {
    incluida: boolean;
    requisitos?: {
      progresoMinimo: number;
      aprobarEvaluacion: boolean;
      descripcionExtra?: string;
    };
    tipoCertificado?: string;
  };

  // Metadata
  fechaCreacion: string;
  ordenVisualizacion?: number;
  cursosIncluidos?: string[];

  promociones?: Array<{
    id: string;
    name: string;
    type: 'percentage' | 'fixed' | 'bonus';
    value: number;
    startDate: string;
    endDate: string;
    allCountries: boolean;
    selectedCountries: string[];
    active: boolean;
    bonusItems: Array<{
      id: string;
      category: 'course_content' | 'new_resource' | 'session' | 'access';
      description: string;
      selectedModuleIds?: string[];
      resourceType?: 'pdf' | 'template' | 'guide' | 'checklist' | 'other';
      resourceFileName?: string;
    }>;
  }>;

  preciosPorPais?: Array<{
    countryCode: string;
    originPrice: number;
    localPrice: number;
  }>;

  bannerImage?: {
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
  };
};

export type CourseFormData = {
  // PASO 1: Definición del curso
  titulo: string;
  subtitulo: string;
  categoria: string;
  tema: string;
  subtema: string;
  nivelCurso: string;
  publicoObjetivo: string[];
  descripcionCorta: string;

  // PASO 1: Módulos del curso
  modulos: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    bloques: Array<{
      id: string;
      tipo: 'video' | 'lectura' | 'tarea' | 'examen';
      titulo: string;
      [key: string]: unknown;
    }>;
  }>;

  // PASO 2: Información del curso (para la card)
  tituloCurso: string;
  queAprendera: string[];
  requisitos: string;
  dirigidoA: string;
  descripcionDetallada: string;

  // PASO 2: Banner personalizado
  usarImagenCompartida: boolean;
  imagenCompartida: {
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
  };
  // Raw File for upload (not persisted in JSON)
  _bannerFile?: File | null;

  // PASO 2: Enfoque y estructura
  usarPlantilla: boolean;
  estructuraPersonalizada: string[];

  // PASO 3: Contenido
  videos: Array<{
    id: string;
    seccion: string;
    titulo: string;
    archivo: File | null;
    duracion: string;
    descripcion: string;
  }>;
  presentacion: File | null;

  // PASO 4: Objetivos y calidad académica
  objetivosAprendizaje: string[];
  modalidades: string[];
  bibliografia: Array<{
    id: string;
    tipo: string;
    referencia: string;
    enlaceDOI: string;
  }>;
  criteriosCalidad: {
    audioClaro: boolean;
    videoHD: boolean;
    contenidoOriginal: boolean;
    casosPracticos: boolean;
  };

  // PASO 5: Ofertas del curso
  ofertas: OfertaCurso[];
  visibilidad: string;

  // PASO 5: Progresión del contenido
  progresionContenido: 'libre' | 'secuencial';

  // Requiere perfil profesional
  requiresProfessionalProfile?: boolean;

  // PASO 5: Disponibilidad de venta
  disponibilidadVenta: 'solo' | 'en_coleccion' | 'ambas';
  coleccionId?: string;

  colecciones: Array<{
    id: string;
    nombre: string;
    descripcion: string;
  }>;
};

// Perfil del creador (en producción viene del auth + backend)
export type CreatorProfile = {
  nombre: string;
  paisColegiatura: string;
  moneda: string;
  simboloMoneda: string;
};

const steps = [
  { id: 0, name: 'Construye', description: 'Tu curso completo' },
  { id: 1, name: 'Información', description: 'Sobre tu curso' },
  { id: 2, name: 'Configuración', description: 'Precio y acceso' },
  { id: 3, name: 'Publicar', description: 'Revisión final' },
];

type CourseCreationWizardProps = {
  onClose?: () => void;
};

// ─── Helpers to map local form data to backend payload ───────────────────────

function buildCoursePayload(formData: CourseFormData): CourseCreatePayload {
  return {
    titulo: formData.titulo,
    subtitulo: formData.subtitulo || undefined,
    categoria: formData.categoria || undefined,
    tema: formData.tema || undefined,
    subtema: formData.subtema || undefined,
    nivelCurso: formData.nivelCurso || undefined,
    publicoObjetivo: formData.publicoObjetivo,
    descripcionCorta: formData.descripcionCorta || undefined,
    modulos: formData.modulos.map((m, mi): ModulePayload => ({
      nombre: m.nombre,
      descripcion: m.descripcion || undefined,
      order: mi,
      bloques: m.bloques.map((b, bi): BlockPayload => {
        const tipoMap: Record<string, BlockPayload['type']> = {
          video: 'video',
          lectura: 'reading',
          tarea: 'task',
          examen: 'quiz',
        };
        return {
          type: tipoMap[b.tipo] || (b.tipo as BlockPayload['type']),
          titulo: b.titulo,
          order: bi,
          duracion: (b.duracion as string) || undefined,
          url: (b.url as string) || undefined,
          contenido: (b.contenido as string) || undefined,
          quiz_data: (b.quiz_data as Record<string, unknown>) ?? undefined,
        };
      }),
    })),
    queAprendera: formData.queAprendera,
    requisitos: formData.requisitos || undefined,
    descripcionDetallada: formData.descripcionDetallada || undefined,
    objetivosAprendizaje: formData.objetivosAprendizaje.filter(Boolean),
    bibliografia: formData.bibliografia.map((b): BibliographyPayload => ({
      tipo: b.tipo,
      referencia: b.referencia,
      enlaceDOI: b.enlaceDOI || undefined,
    })),
    ofertas: formData.ofertas.map((o): OfferPayload => ({
      nombrePublico: o.nombrePublico || o.nombreInterno,
      precioBase: o.precioBase,
      recomendada: o.recomendada || false,
      monedaOrigen: o.monedaOrigen,
      paisOrigen: o.paisOrigen,
      preciosPorPais: o.preciosPorPais || [],
      inscripcionTipo: o.inscripcionTipo || 'siempre',
      acompanamiento: o.acompanamiento || ['ninguno'],
      accesoContenido: o.accesoContenido || 'vitalicio',
      accesoMeses: o.accesoMeses,
      access_type: o.bloqueAcceso?.tipo || 'permanente',
      certificate_included: o.bloqueCertificacion?.incluida ?? true,
      certificate_min_progress: o.bloqueCertificacion?.requisitos?.progresoMinimo ?? 100,
      certificate_requires_exam: o.bloqueCertificacion?.requisitos?.aprobarEvaluacion ?? false,
    })),
    visibilidad: formData.visibilidad || 'borrador',
    has_forum: formData.ofertas?.some(o => o.acompanamiento?.includes('comunidad')) || false,
    progresionContenido: formData.progresionContenido || 'libre',
    requires_professional_profile: formData.requiresProfessionalProfile || false,
  };
}

/**
 * After creating/updating a course, upload any video files that are pending.
 * Matches local blocks (with archivo: File) to backend blocks (with id) by order.
 * Returns indices of uploaded blocks so the caller can clear archivo.
 */
export async function uploadPendingVideos(
  courseId: string,
  response: CourseResponse,
  formData: CourseFormData
): Promise<Array<{ moduleIdx: number; blockIdx: number; fileUrl: string }>> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[uploadPendingVideos] called for course:', courseId);
    console.log('[uploadPendingVideos] backend modules count:', response.modules?.length ?? 0);
    console.log('[uploadPendingVideos] local modules count:', formData.modulos?.length ?? 0);
  }

  const results: Array<{ moduleIdx: number; blockIdx: number; fileUrl: string }> = [];
  const uploads: Promise<void>[] = [];

  for (let mi = 0; mi < formData.modulos.length; mi++) {
    const localModule = formData.modulos[mi];
    const backendModule = response.modules?.[mi];
    if (!backendModule) {
      console.warn(`[uploadPendingVideos] No backend module at index ${mi}, skipping`);
      continue;
    }

    for (let bi = 0; bi < localModule.bloques.length; bi++) {
      const localBlock = localModule.bloques[bi];
      const backendBlock = backendModule.blocks?.[bi];
      if (!backendBlock) {
        console.warn(`[uploadPendingVideos] No backend block at module ${mi}, block ${bi}, skipping`);
        continue;
      }

      const hasFile = localBlock.archivo instanceof File;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[uploadPendingVideos] module ${mi} block ${bi}: tipo=${localBlock.tipo}, hasFile=${hasFile}, blockId=${backendBlock.id}`);
      }

      if (localBlock.tipo === 'video' && hasFile) {
        const file = localBlock.archivo as File;
        const blockId = backendBlock.id;

        uploads.push(
          (async () => {
            try {
              if (process.env.NODE_ENV === 'development') {
                console.log(`[uploadPendingVideos] Getting presigned URL for block ${blockId}, file: ${file.name} (${file.type})`);
              }
              const { upload_url, file_url } = await courseService.getUploadUrl(
                courseId,
                blockId,
                file.name,
                file.type
              );
              if (process.env.NODE_ENV === 'development') {
                console.log(`[uploadPendingVideos] Got presigned URL for block ${blockId}:`, upload_url?.substring(0, 80) + '...');
              }

              await courseService.putFileToS3(upload_url, file);
              if (process.env.NODE_ENV === 'development') {
                console.log(`[uploadPendingVideos] S3 upload SUCCESS for block ${blockId}`);
              }
              results.push({ moduleIdx: mi, blockIdx: bi, fileUrl: file_url });
            } catch (err) {
              console.error(`[uploadPendingVideos] FAILED for block ${blockId}:`, err);
            }
          })()
        );
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[uploadPendingVideos] Total uploads queued: ${uploads.length}`);
  }

  if (uploads.length > 0) {
    await Promise.all(uploads);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[uploadPendingVideos] Completed. Successful uploads: ${results.length}`);
  }
  return results;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CourseCreationWizard({ onClose }: CourseCreationWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWhatToCreate, setShowWhatToCreate] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertErrors, setAlertErrors] = useState<string[]>([]);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState<CourseFormData>({
    titulo: '',
    subtitulo: '',
    categoria: '',
    tema: '',
    subtema: '',
    nivelCurso: '',
    publicoObjetivo: [],
    descripcionCorta: '',
    modulos: [],
    tituloCurso: '',
    queAprendera: [],
    requisitos: '',
    dirigidoA: '',
    descripcionDetallada: '',
    usarImagenCompartida: true,
    imagenCompartida: { imageUrl: '', imageWidth: 0, imageHeight: 0 },
    _bannerFile: null,
    usarPlantilla: false,
    estructuraPersonalizada: [],
    videos: [],
    presentacion: null,
    objetivosAprendizaje: [''],
    modalidades: [],
    bibliografia: [],
    criteriosCalidad: {
      audioClaro: false,
      videoHD: false,
      contenidoOriginal: false,
      casosPracticos: false,
    },
    ofertas: [],
    visibilidad: 'borrador',
    progresionContenido: 'libre',
    disponibilidadVenta: 'solo',
    colecciones: [],
  });

  const [catalogs, setCatalogs] = useState<CourseCatalogs | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Derive creator profile from auth context
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile>({
    nombre: user?.name || 'Instructor',
    paisColegiatura: 'ES',
    moneda: 'EUR',
    simboloMoneda: '€',
  });

  useEffect(() => {
    courseService.getSellerProfile()
      .then(profile => {
        setCreatorProfile(prev => ({
          ...prev,
          nombre: user?.name || prev.nombre,
        }));
      })
      .catch(() => { }); // Silencioso — usa fallback si falla

    courseService.getCatalogs()
      .then(res => {
        setCatalogs(res);
      })
      .catch(() => { });
  }, [user?.name]);

  const updateFormData = (data: Partial<CourseFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...data };
      if (courseId && currentStep < 3) {
        setSaveStatus('unsaved');
        if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = setTimeout(async () => {
          setSaveStatus('saving');
          try {
            await courseService.updateCourse(courseId, buildCoursePayload(updated));
            setSaveStatus('saved');
          } catch {
            setSaveStatus('unsaved');
          }
        }, 3000);
      }
      return updated;
    });
  };

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  // ─── Navigation helpers ───────────────────────────────────────────────────

  const handleNext = async () => {
    if (currentStep >= steps.length) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      if (currentStep === 0 && !courseId) {
        // Step 0 → 1: create the course draft
        const payload = buildCoursePayload(formData);
        if (!payload.titulo) {
          setAlertErrors(['Título del curso es obligatorio para continuar']);
          setShowAlertModal(true);
          return;
        }
        const created = await courseService.createCourse(payload);
        setCourseId(created.id);

        // Upload any video files that were added during step 0
        const uploaded = await uploadPendingVideos(created.id, created, formData);
        if (uploaded.length > 0) {
          setFormData(prev => ({
            ...prev,
            modulos: prev.modulos.map((m, mi) => ({
              ...m,
              bloques: m.bloques.map((b, bi) => {
                const match = uploaded.find(idx => idx.moduleIdx === mi && idx.blockIdx === bi);
                return match ? { ...b, archivo: null, url: match.fileUrl } : b;
              }),
            })),
          }));
        }
      } else if (courseId) {
        // Any subsequent step: patch with current data
        const payload = buildCoursePayload(formData);
        const updated = await courseService.updateCourse(courseId, payload);

        // Upload any new video files
        const uploadedBlocks = await uploadPendingVideos(courseId, updated, formData);
        if (uploadedBlocks.length > 0) {
          setFormData(prev => ({
            ...prev,
            modulos: prev.modulos.map((m, mi) => ({
              ...m,
              bloques: m.bloques.map((b, bi) => {
                const match = uploadedBlocks.find(idx => idx.moduleIdx === mi && idx.blockIdx === bi);
                return match ? { ...b, archivo: null, url: match.fileUrl } : b;
              }),
            })),
          }));
        }

        // Step 1 → 2: upload banner if user set one
        if (currentStep === 1 && formData._bannerFile) {
          try {
            await courseService.uploadBanner(courseId, formData._bannerFile);
          } catch {
            // Non-blocking — banner upload failure shouldn't stop progression
            console.warn('Banner upload failed, continuing...');
          }
        }
      }

      setCurrentStep(prev => prev + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el borrador';
      setSaveError(msg);
      setAlertErrors([msg]);
      setShowAlertModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    // Client-side validation
    const errors: string[] = [];
    if (!formData.titulo) errors.push('Título del curso');
    if (formData.modulos.length === 0) errors.push('Al menos un módulo con contenido');
    if (formData.ofertas.length === 0) errors.push('Al menos una modalidad de venta configurada');
    if (!formData.imagenCompartida?.imageUrl) errors.push('Imagen del curso');

    if (errors.length > 0) {
      setAlertErrors(errors);
      setShowAlertModal(true);
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      // If the course was never saved (edge case: user skipped step 0 somehow), create it first
      let id = courseId;
      if (!id) {
        const created = await courseService.createCourse(buildCoursePayload(formData));
        id = created.id;
        setCourseId(id);
        await uploadPendingVideos(id, created, formData);
      } else {
        // Final save before publish
        const updated = await courseService.updateCourse(id, buildCoursePayload(formData));
        await uploadPendingVideos(id, updated, formData);
      }

      // Publish
      await courseService.publishCourse(id);
      setShowSuccessModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al publicar el curso';
      setSaveError(msg);
      setAlertErrors([msg]);
      setShowAlertModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    if (onClose) onClose();
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) setCurrentStep(stepId);
  };

  const handleSaveDraft = async () => {
    if (courseId) {
      try {
        setIsSaving(true);
        await courseService.updateCourse(courseId, buildCoursePayload(formData));
      } catch {
        // Best effort
      } finally {
        setIsSaving(false);
      }
    }
    if (onClose) onClose();
  };

  const handleExit = () => setShowExitModal(true);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      <div className="h-full flex flex-col bg-slate-50">
        {/* Barra superior fija */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo y título - Izquierda */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="text-base font-semibold text-slate-900">
                  {formData.titulo || 'Nuevo curso'}
                </h1>
                <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
                  {saveStatus === 'saving' || isSaving ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Guardando...
                    </>
                  ) : saveStatus === 'unsaved' ? (
                    '● Sin guardar'
                  ) : saveError ? (
                    <span className="text-red-500">⚠ {saveError}</span>
                  ) : courseId ? (
                    '✓ Guardado'
                  ) : (
                    '✏️ Editando'
                  )}
                </p>
              </div>
            </div>

            {/* Acciones - Derecha */}
            <div className="flex items-center gap-3">
              {onClose && (
                <button
                  onClick={handleExit}
                  disabled={isSaving}
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl px-4 py-2 hover:border-slate-300 transition-all duration-200 disabled:opacity-40"
                >
                  <X className="w-4 h-4" />
                  Salir del editor
                </button>
              )}

              {currentStep === steps.length - 1 && (
                <Button
                  onClick={handleSubmit}
                  className="bg-purple-600 hover:bg-purple-700 gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Publicar curso
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            {/* Progress Bar con navegación */}
            <div className="mb-8">
              <Progress value={progress} className="h-2 mb-4" />
              <div className="grid grid-cols-4 gap-4">
                {steps.map((step) => {
                  const isCompleted = currentStep > step.id;
                  const isCurrent = currentStep === step.id;
                  const isClickable = isCompleted;

                  return (
                    <div key={step.id} className="relative">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          onClick={() => isClickable && handleStepClick(step.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${isCompleted
                            ? 'bg-purple-600 text-white cursor-pointer hover:bg-purple-700'
                            : isCurrent
                              ? 'bg-purple-600 text-white cursor-default shadow-[0_0_0_4px_rgba(124,58,237,0.15)]'
                              : 'bg-white border-2 border-slate-200 text-slate-400 cursor-default'
                            }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{step.id + 1}</span>}
                        </div>
                        <div className="text-center">
                          <p className={`text-sm ${isCurrent ? 'font-bold text-slate-900' : isCompleted ? 'font-medium text-purple-600' : 'font-medium text-slate-400'}`}>
                            {step.name}
                          </p>
                          <p className={`text-xs ${currentStep >= step.id ? 'text-slate-500' : 'text-slate-400'}`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <Card className="mb-6">
              <CardContent className="p-6">
                {currentStep === 0 && (
                  <CourseBuilderStep
                    formData={formData}
                    updateFormData={updateFormData}
                  />
                )}
                {currentStep === 1 && (
                  <CourseInfoStep
                    formData={formData}
                    updateFormData={updateFormData}
                  />
                )}
                {currentStep === 2 && (
                  <PublishConfigStep
                    formData={formData}
                    updateFormData={updateFormData}
                    creatorProfile={creatorProfile}
                    AVAILABLE_COUNTRIES={catalogs?.countries?.data}
                  />
                )}
                {currentStep === 3 && (
                  <ReviewStep formData={formData} onEdit={(step) => setCurrentStep(step)} />
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <button
                data-testid="wizard-back-btn"
                onClick={handleBack}
                disabled={currentStep === 0 || isSaving}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl px-5 py-2.5 hover:border-slate-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
              {currentStep < steps.length - 1 ? (
                <button
                  data-testid="wizard-next-btn"
                  onClick={handleNext}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)] text-sm disabled:opacity-60"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                  ) : (
                    'Siguiente →'
                  )}
                </button>
              ) : (
                <button
                  data-testid="wizard-publish-btn"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-sm text-sm disabled:opacity-60"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
                  ) : (
                    '🎉 Publicar mi curso'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de éxito */}
      <SuccessModal
        show={showSuccessModal}
        onClose={handleCloseSuccess}
        courseName={formData.titulo}
        onCreateAnother={() => {
          setShowSuccessModal(false);
          setFormData({
            titulo: '',
            subtitulo: '',
            categoria: '',
            tema: '',
            subtema: '',
            nivelCurso: '',
            publicoObjetivo: [],
            descripcionCorta: '',
            modulos: [],
            tituloCurso: '',
            queAprendera: [],
            requisitos: '',
            dirigidoA: '',
            descripcionDetallada: '',
            usarImagenCompartida: true,
            imagenCompartida: { imageUrl: '', imageWidth: 0, imageHeight: 0 },
            _bannerFile: null,
            usarPlantilla: false,
            estructuraPersonalizada: [],
            videos: [],
            presentacion: null,
            objetivosAprendizaje: [''],
            modalidades: [],
            bibliografia: [],
            criteriosCalidad: {
              audioClaro: false,
              videoHD: false,
              contenidoOriginal: false,
              casosPracticos: false,
            },
            ofertas: [],
            visibilidad: 'borrador',
            progresionContenido: 'libre',
            disponibilidadVenta: 'solo',
            colecciones: [],
          });
          setCurrentStep(0);
          setCourseId(null);
          setShowWhatToCreate(true);
        }}
      />
      {/* Modal ¿Qué quieres crear? */}
      <WhatToCreateModal
        show={showWhatToCreate}
        onSelectCourse={() => setShowWhatToCreate(false)}
        onSelectPackage={() => setShowWhatToCreate(false)}
        onClose={() => setShowWhatToCreate(false)}
      />
      {/* Modal de confirmación de salida */}
      <ExitConfirmationModal
        show={showExitModal}
        courseName={formData.titulo}
        onSaveAndExit={handleSaveDraft}
        onDiscardAndExit={() => {
          if (onClose) onClose();
        }}
        onCancel={() => setShowExitModal(false)}
      />
      {/* Modal de alerta */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Aún no puede publicar"
        message="Le falta completar lo siguiente:"
        items={alertErrors}
        type="error"
      />
    </>
  );
}