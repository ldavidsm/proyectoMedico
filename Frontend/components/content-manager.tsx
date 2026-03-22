'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  BookOpen,
  FolderOpen,
  GripVertical,
  Edit,
  Check,
  ArrowLeft,
  LogOut,
  Pencil,
  Lock,
  Unlock,
  Info,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courseService, type CourseCreatePayload } from '@/lib/course-service';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import CourseBuilderStep from './steps/course-builder-step';
import CourseInfoStep from './steps/course-info-step';
import PublishConfigStep from './steps/publish-config-step';
import ReviewStep from './steps/review-step';
import SuccessModal from './success-modal';
import { AlertModal } from './ui/alert-modal';
import { uploadPendingVideos, type CourseFormData, type OfertaCurso, type CreatorProfile } from './course-creation-wizard';

// ============================================================================
// TYPES
// ============================================================================

export type CourseItem = {
  id: string;
  formData: CourseFormData;
  status: 'borrador' | 'publicado';
};

export type CollectionItem = {
  id: string;
  nombre: string;
  descripcion: string;
  status: 'borrador' | 'publicado';
  courseIds: string[];
  ofertas: OfertaCurso[];
  progresionCursos: 'libre' | 'secuencial';
};

type StepDef = {
  id: number;
  name: string;
  description: string;
  type: 'construir' | 'informacion' | 'configuracion' | 'revision';
};

type SidebarFilter = 'todos' | 'colecciones' | 'cursos';

type Selection =
  | { type: 'none' }
  | { type: 'course'; id: string }
  | { type: 'collection'; id: string };

type AddCourseMode = null | { collectionId: string };

// ============================================================================
// CREATOR PROFILE (simulated)
// ============================================================================

const INITIAL_CREATOR_PROFILE: CreatorProfile = {
  nombre: 'Instructor',
  paisColegiatura: 'ES',
  moneda: 'EUR',
  simboloMoneda: '€',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================================================
// DEFAULT FORM DATA
// ============================================================================

const createDefaultFormData = (): CourseFormData => ({
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
  visibilidad: '',
  progresionContenido: 'libre',
  disponibilidadVenta: 'solo',
  colecciones: [],
});

// ============================================================================
// MOCK DATA
// ============================================================================

const INITIAL_COURSES: CourseItem[] = [];

const INITIAL_COLLECTIONS: CollectionItem[] = [];

// ============================================================================
// HELPERS
// ============================================================================

function buildCoursePayload(formData: CourseFormData): CourseCreatePayload {
  return {
    titulo: formData.tituloCurso || formData.titulo,
    subtitulo: formData.subtitulo || undefined,
    categoria: formData.categoria || undefined,
    tema: formData.tema || undefined,
    nivelCurso: formData.nivelCurso || undefined,
    publicoObjetivo: formData.publicoObjetivo,
    descripcionCorta: formData.descripcionCorta || undefined,
    modulos: formData.modulos.filter(m => m && m.nombre).map((m, mi) => ({
      nombre: m.nombre,
      descripcion: m.descripcion || undefined,
      order: mi,
      bloques: m.bloques.map((b, bi) => ({
        type: b.tipo === 'lectura' ? 'reading' : b.tipo === 'tarea' ? 'task' : b.tipo === 'examen' ? 'quiz' : 'video',
        titulo: b.titulo,
        order: bi,
        duracion: b.duracion ? String(b.duracion) : undefined,
        url: b.url ? String(b.url) : undefined,
        contenido: b.contenido ? String(b.contenido) : undefined,
      })),
    })),
    queAprendera: formData.queAprendera,
    
    requisitos: formData.requisitos || undefined,
    descripcionDetallada: formData.descripcionDetallada || undefined,
    objetivosAprendizaje: formData.objetivosAprendizaje.filter(Boolean),
    bibliografia: formData.bibliografia.map(b => ({
      tipo: b.tipo,
      referencia: b.referencia,
      enlaceDOI: b.enlaceDOI || undefined,
    })),
    ofertas: formData.ofertas.map(o => ({
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
  };
}

/** Check if a course belongs to any collection */
const getCourseCollections = (courseId: string, collections: CollectionItem[]): CollectionItem[] =>
  collections.filter(col => col.courseIds.includes(courseId));

/** Check if a course is standalone (not in any collection) */
const isStandaloneCourse = (courseId: string, collections: CollectionItem[]): boolean =>
  !collections.some(col => col.courseIds.includes(courseId));

/** Check if course is sold individually (standalone or both) */
const isSoldIndividually = (courseId: string, course: CourseItem, collections: CollectionItem[]): boolean => {
  const inCollection = collections.some(col => col.courseIds.includes(courseId));
  if (!inCollection) return true; // standalone
  return course.formData.disponibilidadVenta === 'ambas' || course.formData.disponibilidadVenta === 'solo';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type Props = {
  onExit?: () => void;
};

export default function ContentManager({ onExit }: Props) {
  // Data
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES);
  const [collections, setCollections] = useState<CollectionItem[]>(INITIAL_COLLECTIONS);
  const [isLoading, setIsLoading] = useState(true);

  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile>({
    ...INITIAL_CREATOR_PROFILE,
    nombre: user?.name || 'Instructor',
  });

  useEffect(() => {
    if (user?.name) {
      setCreatorProfile(prev => ({ ...prev, nombre: user.name }));
    }
  }, [user?.name]);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchCourses = async () => {
      try {
        const res = await fetch(
          `${API_URL}/courses/?seller_id=${user.id}`,
          { credentials: 'include' }
        );
        if (!res.ok) throw new Error('Error al cargar cursos');
        const data = await res.json();

        // Mapear respuesta del backend al formato CourseItem
        const mapped: CourseItem[] = data.map((c: any) => ({
          id: c.id,
          status: c.status === 'publicado' ? 'publicado' : 'borrador',
          formData: {
            ...createDefaultFormData(),
            titulo: c.title || c.titulo || '',
            subtitulo: c.subtitle || c.subtitulo || '',
            categoria: c.category || c.categoria || '',
            tema: c.topic || c.tema || '',
            subtema: c.subtopic || c.subtema || '',
            nivelCurso: c.level || c.nivelCurso || '',
            publicoObjetivo: c.target_audience || c.publicoObjetivo || [],
            descripcionCorta: c.short_description || c.descripcionCorta || '',
            modulos: c.modules?.map((m: any) => ({
              nombre: m.title || m.nombre || '',
              descripcion: m.description || m.descripcion || '',
              bloques: m.blocks?.map((b: any) => ({
                id: b.id,
                tipo: b.type === 'video' ? 'video' : b.type === 'reading' ? 'lectura' : b.type === 'task' ? 'tarea' : 'examen',
                titulo: b.title || '',
                duracion: b.duration || '',
                url: b.content_url || b.url || '',
                contenido: b.body_text || b.contenido || '',
              })) || [],
            })) || [],
            tituloCurso: c.title || c.titulo || '',
            queAprendera: c.learning_goals || c.queAprendera || [],
            requisitos: c.requirements || c.requisitos || '',
            dirigidoA: c.target_description || c.dirigidoA || '',
            descripcionDetallada: c.long_description || c.descripcionDetallada || '',
            usarImagenCompartida: true,
            imagenCompartida: { imageUrl: c.banner_url || '', imageWidth: 0, imageHeight: 0 },
            _bannerFile: null,
            usarPlantilla: false,
            estructuraPersonalizada: [],
            videos: [],
            presentacion: null,
            objetivosAprendizaje: c.learning_goals || [''],
            modalidades: [],
            bibliografia: c.bibliography?.map((b: any) => ({
              tipo: b.type || '',
              referencia: b.reference_text || '',
              enlaceDOI: b.doi_url || '',
            })) || [],
            criteriosCalidad: {
              audioClaro: false, videoHD: false,
              contenidoOriginal: false, casosPracticos: false,
            },
            ofertas: c.offers?.map((o: any) => ({
              nombreInterno: o.name_public || '',
              nombrePublico: o.name_public || '',
              precioBase: o.price_base || 0,
              bloqueAcceso: { tipo: o.access_type === 'permanente' ? 'permanente' : 'limitado' },
              bloqueCertificacion: { incluida: o.certificate_included },
            })) || [],
            visibilidad: c.visibility || 'borrador',
            progresionContenido: 'libre',
            disponibilidadVenta: 'solo',
            colecciones: [],
          }
        }));
        setCourses(mapped);

        // Fetch collections
        try {
          const colRes = await fetch(
            `${API_URL}/collections/?seller_id=${user.id}`,
            { credentials: 'include' }
          );
          if (colRes.ok) {
            const colData = await colRes.json();
            if (Array.isArray(colData)) {
              setCollections(colData.map((c: any) => ({
                id: c.id,
                nombre: c.nombre,
                descripcion: c.descripcion || '',
                status: c.status === 'publicado' ? 'publicado' : 'borrador',
                courseIds: c.courseIds || [],
                ofertas: [],
                progresionCursos: (c.progression as 'libre' | 'secuencial') || 'libre',
              })));
            }
          }
        } catch {
          // non-blocking
        }
      } catch (err) {
        console.error('Error cargando cursos:', err);
        toast.error('Error al cargar tus cursos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id]);

  // Navigation
  const [selection, setSelection] = useState<Selection>({ type: 'none' });
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>('todos');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  // Course editor
  const [courseStep, setCourseStep] = useState(0);

  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertErrors, setAlertErrors] = useState<string[]>([]);

  // Collection edit info panel
  const [editingCollectionInfo, setEditingCollectionInfo] = useState(false);
  const [editCollectionName, setEditCollectionName] = useState('');
  const [editCollectionDesc, setEditCollectionDesc] = useState('');

  // Sidebar inline rename
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [renamingItemType, setRenamingItemType] = useState<'course' | 'collection' | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Drag & drop state for reordering
  const dragIndexRef = useRef<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);
  const [dragActiveColId, setDragActiveColId] = useState<string | null>(null);

  // Add existing course to collection modal
  const [addCourseMode, setAddCourseMode] = useState<AddCourseMode>(null);
  const [addCourseSearch, setAddCourseSearch] = useState('');

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'course' | 'collection' | 'remove-from-collection';
    id: string;
    name: string;
    status: 'borrador' | 'publicado';
    collectionId?: string;
    collectionName?: string;
    courseCount?: number;
  } | null>(null);

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const selectedCourse = selection.type === 'course'
    ? courses.find(c => c.id === selection.id)
    : null;

  const selectedCollection = selection.type === 'collection'
    ? collections.find(c => c.id === selection.id)
    : null;

  // Determine which steps a course shows
  const getCourseSteps = (courseId: string): StepDef[] => {
    const isInCollection = collections.some(col => col.courseIds.includes(courseId));
    const course = courses.find(c => c.id === courseId);
    if (isInCollection && course?.formData.disponibilidadVenta !== 'ambas' && course?.formData.disponibilidadVenta !== 'solo') {
      // Course only in collection — Build + Info + Review (no Config)
      return [
        { id: 0, name: 'Construir', description: 'Contenido del curso', type: 'construir' },
        { id: 1, name: 'Información', description: 'Sobre el curso', type: 'informacion' },
        { id: 2, name: 'Revisión', description: 'Revisar y guardar', type: 'revision' },
      ];
    }
    return [
      { id: 0, name: 'Construir', description: 'Contenido del curso', type: 'construir' },
      { id: 1, name: 'Información', description: 'Sobre el curso', type: 'informacion' },
      { id: 2, name: 'Configuración', description: 'Precio y acceso', type: 'configuracion' },
      { id: 3, name: 'Revisión', description: 'Publicar', type: 'revision' },
    ];
  };

  const standaloneCourses = courses.filter(c => isStandaloneCourse(c.id, collections));

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleCollection = (colId: string) => {
    setExpandedCollections(prev => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      return next;
    });
  };

  const selectItem = (sel: Selection) => {
    setSelection(sel);
    setCourseStep(0);
    setEditingCollectionInfo(false);
  };

  const updateCourseFormData = useCallback((courseId: string, data: Partial<CourseFormData>) => {
    setCourses(prev => prev.map(c =>
      c.id === courseId ? { ...c, formData: { ...c.formData, ...data } } : c
    ));
  }, []);

  const handleStepChange = async (newStep: number) => {
    if (!selection || selection.type !== 'course') return;

    const course = courses.find(c => c.id === selection.id);
    if (!course) return;

    try {
      const updated = await courseService.updateCourse(
        selection.id,
        buildCoursePayload(course.formData)
      );

      // Upload any pending video files
      const uploaded = await uploadPendingVideos(selection.id, updated, course.formData);
      if (uploaded.length > 0) {
        updateCourseFormData(selection.id, {
          modulos: course.formData.modulos.map((m, mi) => ({
            ...m,
            bloques: m.bloques.map((b, bi) => {
              const match = uploaded.find(u => u.moduleIdx === mi && u.blockIdx === bi);
              return match ? { ...b, archivo: null, url: match.fileUrl } : b;
            }),
          })),
        });
      }
    } catch {
      // Non-blocking — no bloquear navegación si falla el save
    }

    setCourseStep(newStep);
  };

  const handlePublish = async () => {
    if (!selection || selection.type !== 'course') return;

    const errors: string[] = [];
    const course = courses.find(c => c.id === selection.id);
    if (!course) return;

    const titulo = course.formData.tituloCurso || course.formData.titulo;
    if (!titulo || titulo === 'Sin título') {
      errors.push('Título del curso');
    }
    if (!course.formData.modulos || course.formData.modulos.length === 0) {
      errors.push('Al menos un módulo con contenido');
    }
    if (!course.formData.imagenCompartida?.imageUrl) {
      errors.push('Imagen del curso (requerida para publicar)');
    }

    if (errors.length > 0) {
      setAlertErrors(errors);
      setShowAlertModal(true);
      return;
    }

    try {
      // Final save
      const updated = await courseService.updateCourse(
        selection.id,
        buildCoursePayload(course.formData)
      );

      // Upload any pending video files before publishing
      const uploaded = await uploadPendingVideos(selection.id, updated, course.formData);
      if (uploaded.length > 0) {
        updateCourseFormData(selection.id, {
          modulos: course.formData.modulos.map((m, mi) => ({
            ...m,
            bloques: m.bloques.map((b, bi) => {
              const match = uploaded.find(u => u.moduleIdx === mi && u.blockIdx === bi);
              return match ? { ...b, archivo: null, url: match.fileUrl } : b;
            }),
          })),
        });
      }

      // Publish
      await courseService.publishCourse(selection.id);

      // Update local state
      setCourses(prev => prev.map(c =>
        c.id === selection.id ? { ...c, status: 'publicado' } : c
      ));

      setShowSuccessModal(true);
    } catch (err: any) {
      toast.error(err.message || 'Error al publicar');
    }
  };

  const createNewCourse = async (collectionId?: string) => {
    try {
      // Crear borrador vacío en el backend
      const created = await courseService.createCourse({
        titulo: 'Sin título',
        publicoObjetivo: [],
        queAprendera: [],
        objetivosAprendizaje: [],
        bibliografia: [],
        ofertas: [],
        modulos: [],
        visibilidad: 'borrador',
      });

      const newId = created.id;
      const newCourse: CourseItem = {
        id: newId,
        status: 'borrador',
        formData: createDefaultFormData(),
      };
      setCourses(prev => [...prev, newCourse]);

      if (collectionId) {
        setCollections(prev => prev.map(col =>
          col.id === collectionId
            ? { ...col, courseIds: [...col.courseIds, newId] }
            : col
        ));
      }

      setSelection({ type: 'course', id: newId });
      setCourseStep(0);
      toast.success('Curso creado. Empiece a construir su contenido.');
    } catch (err) {
      toast.error('Error al crear el curso');
    }
  };

  const createNewCollection = async () => {
    try {
      const res = await fetch(`${API_URL}/collections/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'Nueva colección', descripcion: '' }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      const newCol: CollectionItem = {
        id: created.id,
        nombre: created.nombre,
        descripcion: created.descripcion || '',
        status: created.status || 'borrador',
        courseIds: [],
        ofertas: [],
        progresionCursos: 'libre',
      };
      setCollections(prev => [...prev, newCol]);
      setExpandedCollections(prev => new Set([...prev, created.id]));
      setSelection({ type: 'collection', id: created.id });
      setEditingCollectionInfo(true);
      setEditCollectionName('Nueva colección');
      setEditCollectionDesc('');
      toast.success('Colección creada. Asígnele un nombre.');
    } catch {
      toast.error('Error al crear la colección');
    }
  };

  /** Persist collection changes to the backend (fire-and-forget) */
  const persistCollection = (colId: string, updates: Record<string, any>) => {
    fetch(`${API_URL}/collections/${colId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => console.error('Error saving collection'));
  };

  const removeCourseFromCollection = (courseId: string, collectionId: string) => {
    setCollections(prev => {
      const updated = prev.map(col =>
        col.id === collectionId
          ? { ...col, courseIds: col.courseIds.filter(id => id !== courseId) }
          : col
      );
      const col = updated.find(c => c.id === collectionId);
      if (col) persistCollection(collectionId, { courseIds: col.courseIds });
      return updated;
    });
    toast.success('Curso eliminado de la colección.');
  };

  /** Reorder courses within a collection */
  const reorderCourseInCollection = (collectionId: string, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setCollections(prev => {
      const updated = prev.map(col => {
        if (col.id !== collectionId) return col;
        const newIds = [...col.courseIds];
        const [moved] = newIds.splice(fromIndex, 1);
        newIds.splice(toIndex, 0, moved);
        return { ...col, courseIds: newIds };
      });
      const col = updated.find(c => c.id === collectionId);
      if (col) persistCollection(collectionId, { courseIds: col.courseIds });
      return updated;
    });
  };

  const saveCollectionInfo = () => {
    if (!selectedCollection) return;
    if (!editCollectionName.trim()) {
      toast.error('El nombre de la colección es obligatorio.');
      return;
    }
    const nombre = editCollectionName.trim();
    const descripcion = editCollectionDesc.trim();
    setCollections(prev => prev.map(col =>
      col.id === selectedCollection.id
        ? { ...col, nombre, descripcion }
        : col
    ));
    persistCollection(selectedCollection.id, { nombre, descripcion });
    setEditingCollectionInfo(false);
    toast.success('Información de la colección guardada.');
  };

  const startEditCollectionInfo = () => {
    if (!selectedCollection) return;
    setEditCollectionName(selectedCollection.nombre);
    setEditCollectionDesc(selectedCollection.descripcion);
    setEditingCollectionInfo(true);
  };

  const startRenameItem = (itemId: string, itemType: 'course' | 'collection') => {
    setRenamingItemId(itemId);
    setRenamingItemType(itemType);
    if (itemType === 'course') {
      const course = courses.find(c => c.id === itemId);
      setRenameValue(course?.formData.titulo || '');
    } else {
      const col = collections.find(c => c.id === itemId);
      setRenameValue(col?.nombre || '');
    }
  };

  const cancelRenameItem = () => {
    setRenamingItemId(null);
    setRenamingItemType(null);
    setRenameValue('');
  };

  const saveRenameItem = () => {
    if (!renamingItemId || !renamingItemType || !renameValue.trim()) {
      toast.error('El nombre no puede estar vacío.');
      return;
    }

    if (renamingItemType === 'course') {
      const trimmed = renameValue.trim();
      updateCourseFormData(renamingItemId, { titulo: trimmed, tituloCurso: trimmed });
      fetch(`${API_URL}/courses/${renamingItemId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: trimmed }),
      }).catch(() => {});
    } else if (renamingItemType === 'collection') {
      const nombre = renameValue.trim();
      setCollections(prev => prev.map(col =>
        col.id === renamingItemId
          ? { ...col, nombre }
          : col
      ));
      persistCollection(renamingItemId, { nombre });
    }

    cancelRenameItem();
    toast.success('Nombre actualizado.');
  };

  const confirmDelete = (type: 'course' | 'collection' | 'remove-from-collection', id: string, name: string, status: 'borrador' | 'publicado', collectionId?: string, collectionName?: string, courseCount?: number) => {
    setDeleteTarget({ type, id, name, status, collectionId, collectionName, courseCount });
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const getDeleteModalProps = () => {
    if (!deleteTarget) return { dTitle: '', dMessage: '', dItems: [] as string[], dType: 'warning' as const, dConfirm: 'Eliminar' };
    const isRemove = deleteTarget.type === 'remove-from-collection';
    const isCol = deleteTarget.type === 'collection';
    const isPub = deleteTarget.status === 'publicado';
    const dTitle = isRemove ? 'Quitar curso de la colección' : isCol ? 'Eliminar colección' : 'Eliminar curso';
    const dMessage = isRemove
      ? 'El curso no se eliminará, solo dejará de pertenecer a la colección.'
      : 'Esta operación eliminará ' + (isCol ? 'la colección' : 'el curso') + ' "' + (deleteTarget.name || '') + '".';
    const dItems: string[] = [];
    if (!isRemove) {
      if (isPub) {
        dItems.push('Este elemento está publicado y visible para los usuarios.');
        dItems.push('Los alumnos que ya lo adquirieron perderán el acceso.');
      }
      if (isCol && (deleteTarget.courseCount || 0) > 0) {
        dItems.push('Los cursos de la colección no se eliminarán, quedarán como cursos sueltos.');
      }
      if (deleteTarget.type === 'course') {
        const cols = getCourseCollections(deleteTarget.id, collections);
        if (cols.length > 0) dItems.push('El curso se eliminará también de las colecciones a las que pertenece.');
      }
      dItems.push('Esta acción no se puede deshacer.');
    }
    const dType = isPub ? 'error' as const : 'warning' as const;
    const dConfirm = isRemove ? 'Quitar' : 'Eliminar';
    return { dTitle, dMessage, dItems, dType, dConfirm };
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'course') {
      try {
        const res = await fetch(`${API_URL}/courses/${deleteTarget.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!res.ok) {
          toast.error('Error al eliminar el curso');
          setDeleteTarget(null);
          return;
        }
      } catch {
        toast.error('Error al eliminar el curso');
        setDeleteTarget(null);
        return;
      }
      setCourses(prev => prev.filter(c => c.id !== deleteTarget.id));
      // Remove course from any collections
      setCollections(prev => prev.map(col => ({
        ...col,
        courseIds: col.courseIds.filter(id => id !== deleteTarget.id),
      })));
      if (selection.type === 'course' && selection.id === deleteTarget.id) {
        setSelection({ type: 'none' });
      }
      toast.success('Curso eliminado.');
    } else if (deleteTarget.type === 'collection') {
      fetch(`${API_URL}/collections/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      }).catch(() => {});
      setCollections(prev => prev.filter(c => c.id !== deleteTarget.id));
      toast.success('Colección eliminada.');
    } else if (deleteTarget.type === 'remove-from-collection') {
      setCollections(prev => {
        const updated = prev.map(col =>
          col.id === deleteTarget.collectionId
            ? { ...col, courseIds: col.courseIds.filter(id => id !== deleteTarget.id) }
            : col
        );
        const col = updated.find(c => c.id === deleteTarget.collectionId);
        if (col && deleteTarget.collectionId) {
          persistCollection(deleteTarget.collectionId, { courseIds: col.courseIds });
        }
        return updated;
      });
      toast.success('Curso eliminado de la colección.');
    }

    setDeleteTarget(null);
    setSelection({ type: 'none' });
  };

  /** Open the "add existing course" picker for a collection */
  const openAddCoursePicker = (collectionId: string) => {
    setAddCourseMode({ collectionId });
    setAddCourseSearch('');
  };

  /** Add an existing course to the collection */
  const addExistingCourseToCollection = (courseId: string) => {
    if (!addCourseMode) return;
    const collectionId = addCourseMode.collectionId;
    setCollections(prev => {
      const updated = prev.map(col =>
        col.id === collectionId
          ? { ...col, courseIds: [...col.courseIds, courseId] }
          : col
      );
      const col = updated.find(c => c.id === collectionId);
      if (col) persistCollection(collectionId, { courseIds: col.courseIds });
      return updated;
    });
    toast.success('Curso agregado a la colección.');
    setAddCourseMode(null);
  };

  /** Courses available to add (not already in this collection) */
  const getAvailableCourses = (collectionId: string) => {
    const col = collections.find(c => c.id === collectionId);
    if (!col) return [];
    return courses.filter(c =>
      !col.courseIds.includes(c.id) &&
      (addCourseSearch === '' || (c.formData.titulo || '').toLowerCase().includes(addCourseSearch.toLowerCase()))
    );
  };

  // ============================================================================
  // RENDER - SIDEBAR
  // ============================================================================

  const renderSidebar = () => {
    const filteredCollections = sidebarFilter === 'cursos' ? [] : collections;
    const filteredStandalone = sidebarFilter === 'colecciones' ? [] : standaloneCourses;

    /** Inline rename input shared across items */
    const renderRenameInput = (itemId: string) => (
      <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveRenameItem();
            if (e.key === 'Escape') cancelRenameItem();
          }}
          onBlur={() => saveRenameItem()}
          className="flex-1 min-w-0 text-sm bg-white border border-purple-300 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-purple-400"
        />
      </div>
    );

    /** Status badge (replaces colored dots) */
    const renderStatusBadge = (status: 'borrador' | 'publicado', size: 'sm' | 'xs' = 'sm') => (
      <span className={`inline-flex items-center gap-1 flex-shrink-0 ${size === 'xs' ? 'text-[9px]' : 'text-[10px]'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'publicado' ? 'bg-green-400' : 'bg-amber-400'
          }`} />
        <span className={status === 'publicado' ? 'text-green-600' : 'text-amber-600'}>
          {status === 'publicado' ? 'Activo' : 'Borrador'}
        </span>
      </span>
    );

    return (
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-cyan-500 font-bold text-lg">Health</span>
            <span className="text-gray-900 font-bold text-lg">Learn</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['todos', 'colecciones', 'cursos'] as SidebarFilter[]).map(filter => (
              <button
                key={filter}
                onClick={() => setSidebarFilter(filter)}
                className={`flex-1 text-xs py-1.5 rounded-md capitalize transition-all cursor-pointer ${sidebarFilter === filter
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {filter === 'todos' ? 'Todos' : filter === 'colecciones' ? 'Colecciones' : 'Cursos'}
              </button>
            ))}
          </div>
        </div>

        {/* Tree */}
        <nav className="flex-1 overflow-y-auto px-2 py-1">
          {/* Collections section header (in "todos" view when both exist) */}
          {sidebarFilter === 'todos' && filteredCollections.length > 0 && filteredStandalone.length > 0 && (
            <div className="px-2.5 pt-2 pb-1.5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Colecciones</span>
            </div>
          )}
          {/* Collections */}
          {filteredCollections.map(col => {
            const isExpanded = expandedCollections.has(col.id);
            const isSelected = selection.type === 'collection' && selection.id === col.id;
            const isRenaming = renamingItemId === col.id && renamingItemType === 'collection';
            const colCourses = col.courseIds.map(id => courses.find(c => c.id === id)).filter(Boolean) as CourseItem[];

            return (
              <div key={col.id} className="mb-0.5">
                <div
                  className={`w-full flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer group ${isSelected
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  onClick={() => {
                    toggleCollection(col.id);
                    selectItem({ type: 'collection', id: col.id });
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startRenameItem(col.id, 'collection');
                  }}
                >
                  {isExpanded
                    ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  }
                  {isRenaming ? (
                    renderRenameInput(col.id)
                  ) : (
                    <span className={`text-sm truncate flex-1 ${isSelected ? 'text-purple-700 font-medium' : ''}`}>
                      {col.nombre}
                    </span>
                  )}
                  {!isRenaming && (
                    <>
                      <Badge className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0 font-normal">
                        {col.courseIds.length}
                      </Badge>
                      {renderStatusBadge(col.status)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRenameItem(col.id, 'collection');
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-all"
                        title="Renombrar"
                      >
                        <Pencil className="w-3 h-3 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete('collection', col.id, col.nombre, col.status);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3 h-3 text-gray-400" />
                      </button>
                    </>
                  )}
                </div>

                {/* Child courses */}
                {isExpanded && (
                  <div className="ml-4 border-l border-gray-100 pl-2 mt-0.5">
                    {colCourses.map((course, courseIdx) => {
                      const isCourseSelected = selection.type === 'course' && selection.id === course.id;
                      const isCourseRenaming = renamingItemId === course.id && renamingItemType === 'course';
                      return (
                        <div
                          key={course.id}
                          draggable
                          onDragStart={() => {
                            dragIndexRef.current = courseIdx;
                            setDragActiveColId(col.id);
                          }}
                          onDragEnter={() => {
                            dragOverIndexRef.current = courseIdx;
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={() => {
                            if (dragIndexRef.current !== null && dragOverIndexRef.current !== null && dragActiveColId === col.id) {
                              reorderCourseInCollection(col.id, dragIndexRef.current, dragOverIndexRef.current);
                            }
                            dragIndexRef.current = null;
                            dragOverIndexRef.current = null;
                            setDragActiveColId(null);
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-all cursor-pointer group ${isCourseSelected
                            ? 'bg-purple-50 text-purple-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          onClick={() => selectItem({ type: 'course', id: course.id })}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            startRenameItem(course.id, 'course');
                          }}
                        >
                          {isCourseRenaming ? (
                            renderRenameInput(course.id)
                          ) : (
                            <>
                              <span className="text-sm truncate flex-1">
                                {course.formData.titulo || 'Sin título'}
                              </span>
                              {renderStatusBadge(course.status, 'xs')}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startRenameItem(course.id, 'course');
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-all"
                                title="Renombrar"
                              >
                                <Pencil className="w-2.5 h-2.5 text-gray-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete('remove-from-collection', course.id, course.formData.titulo || 'Sin título', course.status, col.id, col.nombre);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-all"
                                title="Eliminar de la colección"
                              >
                                <Trash2 className="w-2.5 h-2.5 text-gray-400" />
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                    {/* Add course to collection */}
                    <button
                      onClick={() => createNewCourse(col.id)}
                      className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Añadir curso</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Create collection button (visible when not filtering to "cursos" only) */}
          {sidebarFilter !== 'cursos' && (
            <button
              onClick={createNewCollection}
              className="w-full flex items-center gap-1.5 px-2.5 py-2 text-xs text-gray-400 hover:text-purple-600 transition-colors cursor-pointer rounded-lg hover:bg-purple-50/50 mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva colección</span>
            </button>
          )}

          {/* Standalone courses */}
          {filteredStandalone.length > 0 && (
            <>
              {filteredCollections.length > 0 && (
                <div className="px-2.5 pt-4 pb-1.5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Cursos</span>
                </div>
              )}
              {filteredStandalone.map(course => {
                const isCourseSelected = selection.type === 'course' && selection.id === course.id;
                const isCourseRenaming = renamingItemId === course.id && renamingItemType === 'course';
                return (
                  <div
                    key={course.id}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer group ${isCourseSelected
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => selectItem({ type: 'course', id: course.id })}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startRenameItem(course.id, 'course');
                    }}
                  >
                    {isCourseRenaming ? (
                      renderRenameInput(course.id)
                    ) : (
                      <>
                        <span className={`text-sm truncate flex-1 ${isCourseSelected ? 'font-medium' : ''}`}>
                          {course.formData.titulo || 'Sin título'}
                        </span>
                        {renderStatusBadge(course.status)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRenameItem(course.id, 'course');
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-all"
                          title="Renombrar"
                        >
                          <Pencil className="w-3 h-3 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete('course', course.id, course.formData.titulo || 'Sin título', course.status);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3 h-3 text-gray-400" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Create standalone course button (visible when not filtering to "colecciones" only) */}
          {sidebarFilter !== 'colecciones' && (
            <button
              onClick={() => createNewCourse()}
              className="w-full flex items-center gap-1.5 px-2.5 py-2 text-xs text-gray-400 hover:text-purple-600 transition-colors cursor-pointer rounded-lg hover:bg-purple-50/50 mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo curso</span>
            </button>
          )}

          {/* Empty states */}
          {filteredCollections.length === 0 && filteredStandalone.length === 0 && (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-gray-400">No hay contenido todavía</p>
            </div>
          )}
        </nav>

        {/* Create button */}
        <div className="p-3 border-t border-gray-100">
          <Button
            onClick={() => selectItem({ type: 'none' })}
            className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear nuevo
          </Button>
        </div>
      </aside>
    );
  };

  // ============================================================================
  // RENDER - TOP BAR
  // ============================================================================

  const renderTopBar = () => {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-end flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onExit}
          className="gap-2 border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          Salir del editor
        </Button>
      </div>
    );
  };

  // ============================================================================
  // RENDER - EMPTY STATE (no selection)
  // ============================================================================

  const renderEmptyState = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1.5">
            ¿Qué quieres crear?
          </h2>
          <p className="text-sm text-gray-500">
            Seleccione un elemento en la barra lateral o cree uno nuevo.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Curso individual */}
          <button
            onClick={() => createNewCourse()}
            className="group flex flex-col items-center text-center rounded-xl border border-gray-200 p-6 hover:border-purple-400 hover:bg-purple-50/60 transition-all cursor-pointer"
          >
            <span className="text-4xl mb-3">📚</span>
            <span className="text-sm font-semibold text-gray-900 mb-1">Curso individual</span>
            <span className="text-xs text-gray-500">Clases, módulos, tareas y evaluaciones</span>
          </button>

          {/* Colección */}
          <button
            onClick={createNewCollection}
            className="group flex flex-col items-center text-center rounded-xl border border-gray-200 p-6 hover:border-purple-400 hover:bg-purple-50/60 transition-all cursor-pointer"
          >
            <span className="text-4xl mb-3">📦</span>
            <span className="text-sm font-semibold text-gray-900 mb-1">Colección de cursos</span>
            <span className="text-xs text-gray-500">Agrupe varios cursos en un solo producto</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER - COLLECTION DETAIL
  // ============================================================================

  const renderCollectionDetail = () => {
    if (!selectedCollection) return null;

    const colCourses = selectedCollection.courseIds
      .map(id => courses.find(c => c.id === id))
      .filter(Boolean) as CourseItem[];

    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header card */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">Colección</span>
                <h2 className="text-2xl font-semibold text-gray-900 mt-1">{selectedCollection.nombre}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedCollection.courseIds.length} curso{selectedCollection.courseIds.length !== 1 ? 's' : ''} · {
                    selectedCollection.status === 'publicado' ? 'Publicado' : 'Borrador'
                  }
                </p>
                {selectedCollection.descripcion && (
                  <p className="text-sm text-gray-600 mt-2">{selectedCollection.descripcion}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={startEditCollectionInfo}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar información
                </Button>
                <Button
                  variant="outline"
                  onClick={() => confirmDelete('collection', selectedCollection.id, selectedCollection.nombre, selectedCollection.status, undefined, undefined, selectedCollection.courseIds.length)}
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </Button>
              </div>
            </div>

            {/* Inline edit form */}
            {editingCollectionInfo && (
              <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={editCollectionName}
                    onChange={(e) => setEditCollectionName(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm transition-colors hover:border-gray-400 focus-visible:border-purple-500 focus-visible:ring-purple-500/20 focus-visible:ring-[3px] outline-none"
                    placeholder="Nombre de la colección"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={editCollectionDesc}
                    onChange={(e) => setEditCollectionDesc(e.target.value)}
                    rows={2}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:border-purple-500 focus-visible:ring-purple-500/20 focus-visible:ring-[3px] outline-none resize-none"
                    placeholder="Breve descripción de la colección…"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingCollectionInfo(false)} className="text-sm">
                    Cancelar
                  </Button>
                  <Button onClick={saveCollectionInfo} className="bg-purple-600 hover:bg-purple-700 text-sm">
                    Guardar
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Courses included */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Cursos incluidos</h3>

            {colCourses.length > 0 ? (
              <div className="space-y-2">
                {colCourses.map((course, idx) => {
                  const soldIndividually = isSoldIndividually(course.id, course, collections);
                  const isDragTarget = dragActiveColId === selectedCollection.id;
                  return (
                    <div
                      key={course.id}
                      draggable
                      onDragStart={() => {
                        dragIndexRef.current = idx;
                        setDragActiveColId(selectedCollection.id);
                      }}
                      onDragEnter={() => {
                        dragOverIndexRef.current = idx;
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnd={() => {
                        if (dragIndexRef.current !== null && dragOverIndexRef.current !== null) {
                          reorderCourseInCollection(selectedCollection.id, dragIndexRef.current, dragOverIndexRef.current);
                        }
                        dragIndexRef.current = null;
                        dragOverIndexRef.current = null;
                        setDragActiveColId(null);
                      }}
                      className={`flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 transition-colors ${isDragTarget ? 'cursor-grabbing' : ''}`}
                    >
                      <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab" />
                      <span className="text-[11px] text-gray-400 w-5 text-center flex-shrink-0">{idx + 1}</span>
                      <span className="text-sm text-gray-900 flex-1 truncate">
                        {course.formData.titulo || 'Sin título'}
                      </span>
                      {soldIndividually ? (
                        <Badge className="bg-cyan-50 text-cyan-700 text-[10px] px-2 py-0.5 font-normal border border-cyan-200">
                          +individual
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-gray-400">Solo colección</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-7 px-2.5 text-xs gap-1.5"
                        onClick={() => selectItem({ type: 'course', id: course.id })}
                      >
                        <Edit className="w-3 h-3" />
                        Editar
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                Esta colección no tiene cursos todavía.
              </p>
            )}

            {colCourses.length > 1 && (
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <GripVertical className="w-3 h-3" />
                Arrastre los cursos para cambiar el orden
              </p>
            )}

            {/* Add course actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => createNewCourse(selectedCollection.id)}
                className="border-2 border-dashed border-gray-200 rounded-xl py-3 flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Crear curso nuevo
              </button>
              <button
                onClick={() => openAddCoursePicker(selectedCollection.id)}
                className="border-2 border-dashed border-gray-200 rounded-xl py-3 flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50/50 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                Añadir curso existente
              </button>
            </div>
          </Card>

          {/* Course progression setting */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Progresión de cursos</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Defina cómo el alumno avanza por los cursos de esta colección.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCollections(prev => prev.map(col =>
                  col.id === selectedCollection.id ? { ...col, progresionCursos: 'libre' } : col
                ))}
                className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${selectedCollection.progresionCursos === 'libre'
                  ? 'border-purple-400 bg-purple-50/60'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedCollection.progresionCursos === 'libre' ? 'bg-purple-600' : 'bg-gray-100'
                  }`}>
                  <Unlock className={`w-4 h-4 ${selectedCollection.progresionCursos === 'libre' ? 'text-white' : 'text-gray-500'
                    }`} />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">Acceso libre</span>
                  <p className="text-xs text-gray-500 mt-0.5">El alumno puede ver cualquier curso en el orden que prefiera.</p>
                </div>
              </button>

              <button
                onClick={() => setCollections(prev => prev.map(col =>
                  col.id === selectedCollection.id ? { ...col, progresionCursos: 'secuencial' } : col
                ))}
                className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${selectedCollection.progresionCursos === 'secuencial'
                  ? 'border-purple-400 bg-purple-50/60'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedCollection.progresionCursos === 'secuencial' ? 'bg-purple-600' : 'bg-gray-100'
                  }`}>
                  <Lock className={`w-4 h-4 ${selectedCollection.progresionCursos === 'secuencial' ? 'text-white' : 'text-gray-500'
                    }`} />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">Secuencial</span>
                  <p className="text-xs text-gray-500 mt-0.5">Debe completar cada curso para desbloquear el siguiente.</p>
                </div>
              </button>
            </div>

            {selectedCollection.progresionCursos === 'secuencial' && colCourses.length > 1 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-purple-700">
                  Los cursos se desbloquearán en el orden mostrado arriba. Use el arrastre para reorganizarlos.
                </p>
              </div>
            )}
          </Card>

          {/* Collection modalities — reuses PublishConfigStep in collection mode */}
          <Card className="p-6">
            <PublishConfigStep
              formData={{ ...createDefaultFormData(), ofertas: selectedCollection.ofertas }}
              updateFormData={(data) => {
                if (data.ofertas !== undefined) {
                  setCollections(prev => prev.map(col =>
                    col.id === selectedCollection.id
                      ? { ...col, ofertas: data.ofertas as OfertaCurso[] }
                      : col
                  ));
                }
              }}
              creatorProfile={creatorProfile}
            />
          </Card>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER - COURSE EDITOR
  // ============================================================================

  const renderCourseEditor = () => {
    if (!selectedCourse) return null;

    const courseId = selectedCourse.id;
    const steps = getCourseSteps(courseId);
    const isInCollection = collections.some(col => col.courseIds.includes(courseId));
    const isCollectionOnly = isInCollection
      && selectedCourse.formData.disponibilidadVenta !== 'ambas'
      && selectedCourse.formData.disponibilidadVenta !== 'solo';
    const progress = ((courseStep + 1) / steps.length) * 100;
    const currentStepType = steps[courseStep]?.type;
    const parentCollections = getCourseCollections(courseId, collections);

    const handleUpdateFormData = (data: Partial<CourseFormData>) => {
      updateCourseFormData(courseId, data);
    };

    // Build a "live" formData reference
    const formData = selectedCourse.formData;

    /** Navigate back to parent collection */
    const goBackToCollection = () => {
      if (parentCollections.length > 0) {
        selectItem({ type: 'collection', id: parentCollections[0].id });
      }
    };

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          {/* Course context header */}
          <div className="flex items-center gap-3 mb-6">
            {/* Back to collection button (only for courses in collections) */}
            {isInCollection && (
              <button
                onClick={goBackToCollection}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
                title={`Volver a ${parentCollections[0]?.nombre || 'colección'}`}
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}
            <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold text-gray-900 truncate">
                {selectedCourse.formData.titulo || 'Nuevo curso'}
              </h1>
              <p className="text-xs text-gray-500 truncate">
                {parentCollections.length > 0
                  ? `Curso · ${parentCollections.map(c => c.nombre).join(', ')}`
                  : 'Curso individual'}
              </p>
            </div>
            <Badge className={`text-[10px] px-2 py-0.5 font-normal border ${selectedCourse.status === 'publicado'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
              {selectedCourse.status === 'publicado' ? 'Publicado' : 'Borrador'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => confirmDelete('course', courseId, selectedCourse.formData.titulo || 'Sin título', selectedCourse.status)}
              className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-2.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar
            </Button>
          </div>

          {/* Step indicator (sticky) */}
          <div className="sticky top-0 z-10 bg-gray-50 pb-4 mb-2 -mx-6 px-6 pt-1">
            <Progress value={progress} className="h-1.5 mb-3" />
            <div className="flex gap-2">
              {steps.map((step) => {
                const isCompleted = courseStep > step.id;
                const isCurrent = courseStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => { if (isCompleted) handleStepChange(step.id); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${isCurrent
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : isCompleted
                        ? 'text-purple-600 hover:bg-purple-50 cursor-pointer'
                        : 'text-gray-400'
                      }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isCurrent ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                        {step.id + 1}
                      </span>
                    )}
                    {step.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info banner for collection-only courses */}
          {isCollectionOnly && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3.5 mb-4 flex items-start gap-2.5">
              <FolderOpen className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-cyan-800">
                Este curso pertenece a una colección. La configuración de precio y acceso se gestiona a nivel de colección.
              </p>
            </div>
          )}

          {/* Step content */}
          <Card>
            <CardContent className="p-6">
              {currentStepType === 'construir' && (
                <CourseBuilderStep formData={formData} updateFormData={handleUpdateFormData} />
              )}
              {currentStepType === 'informacion' && (
                <CourseInfoStep formData={formData} updateFormData={handleUpdateFormData} />
              )}
              {currentStepType === 'configuracion' && (
                <PublishConfigStep formData={formData} updateFormData={handleUpdateFormData} creatorProfile={creatorProfile} />
              )}
              {currentStepType === 'revision' && (
                <>
                  {/* Collection-dependency notice */}
                  {isCollectionOnly && parentCollections.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 mb-5 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium">
                          Publicación vinculada a la colección
                        </p>
                        <p className="text-sm text-amber-700 mt-0.5">
                          Este curso se publicará automáticamente cuando la colección
                          <span className="font-medium"> "{parentCollections[0].nombre}"</span>
                          {parentCollections[0].status === 'publicado'
                            ? ' esté publicada. Puede guardar sus cambios ahora.'
                            : ' sea publicada. Actualmente la colección está en borrador.'}
                        </p>
                      </div>
                    </div>
                  )}
                  <ReviewStep formData={formData} onEdit={(step) => setCourseStep(step)} />
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {courseStep > 0 ? (
              <Button
                variant="outline"
                onClick={() => setCourseStep(courseStep - 1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>
            ) : (
              /* Empty spacer to keep "Siguiente" right-aligned */
              <div />
            )}
            {courseStep < steps.length - 1 ? (
              <Button
                onClick={() => handleStepChange(courseStep + 1)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Siguiente →
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                className="bg-purple-600 hover:bg-purple-700 gap-2"
              >
                <Check className="w-4 h-4" />
                {isCollectionOnly ? 'Guardar curso' : 'Publicar curso'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  const dm = getDeleteModalProps();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-500">Cargando tus cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {renderSidebar()}

      <div className="flex-1 flex flex-col min-w-0">
        {renderTopBar()}

        {selection.type === 'none' && renderEmptyState()}
        {selection.type === 'collection' && renderCollectionDetail()}
        {selection.type === 'course' && renderCourseEditor()}
      </div>

      {/* Success modal */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        courseName={selectedCourse?.formData.titulo || ''}
      />

      {/* Alert modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Aún no puede publicar"
        message="Le falta completar lo siguiente:"
        items={alertErrors}
        type="error"
      />

      {/* Delete confirmation modal */}
      <AlertModal
        isOpen={deleteTarget !== null}
        onClose={cancelDelete}
        title={dm.dTitle}
        message={dm.dMessage}
        items={dm.dItems}
        type={dm.dType}
        confirmLabel={dm.dConfirm}
        onConfirm={executeDelete}
      />

      {/* Add existing course to collection modal */}
      {addCourseMode && (() => {
        const available = getAvailableCourses(addCourseMode.collectionId);
        const colName = collections.find(c => c.id === addCourseMode.collectionId)?.nombre || 'colección';
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setAddCourseMode(null)} />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-900">Añadir curso existente</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Seleccione un curso para agregar a "{colName}"</p>
                  </div>
                  <button
                    onClick={() => setAddCourseMode(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search */}
                <input
                  autoFocus
                  type="text"
                  value={addCourseSearch}
                  onChange={(e) => setAddCourseSearch(e.target.value)}
                  placeholder="Buscar curso por nombre..."
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm transition-colors hover:border-gray-400 focus-visible:border-purple-500 focus-visible:ring-purple-500/20 focus-visible:ring-[3px] outline-none"
                />

                {/* Course list */}
                <div className="max-h-64 overflow-y-auto space-y-1.5">
                  {available.length > 0 ? (
                    available.map(course => (
                      <button
                        key={course.id}
                        onClick={() => addExistingCourseToCollection(course.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm text-gray-900 truncate block">
                            {course.formData.titulo || 'Sin título'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {course.formData.categoria || 'Sin categoría'}
                            {isStandaloneCourse(course.id, collections) ? '' : ' · En otra colección'}
                          </span>
                        </div>
                        <Plus className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-400">
                        {courses.length === 0
                          ? 'No hay cursos creados todavía.'
                          : 'Todos los cursos ya pertenecen a esta colección.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 pb-5 flex justify-end">
                <Button variant="outline" onClick={() => setAddCourseMode(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
// end