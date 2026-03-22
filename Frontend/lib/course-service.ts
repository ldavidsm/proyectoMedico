
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────
// Auth helper
// ─────────────────────────────────────────────
function getAuthHeaders(): HeadersInit {
    return {
        'Content-Type': 'application/json',
    };
}

function getAuthHeadersMultipart(): HeadersInit {
    // Do NOT set Content-Type for multipart — the browser sets it with the boundary
    return {};
}

// ─────────────────────────────────────────────
// Types mirroring backend schemas
// ─────────────────────────────────────────────

export interface ContentBlock {
    id: string;
    type: 'video' | 'reading' | 'quiz' | 'task' | 'file_task';
    title: string;
    order: number;
    duration?: string;
    content_url?: string;
    url?: string;
    body_text?: string;
    quiz_data?: unknown;
}

export interface Module {
    id: string;
    title: string;
    description?: string;
    order: number;
    blocks: ContentBlock[];
}

export interface CourseDetail {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    short_description?: string;
    long_description?: string;
    category: string;
    subcategory?: string;
    topic?: string;
    subtopic?: string;
    instructor: {
        name: string;
        specialty?: string;
        bio?: string;
        image?: string;
        country?: string;
    };
    level?: string;
    duration?: string;
    modality?: string;
    price?: number;
    learning_goals?: string[];
    target_audience?: string[];
    modules: Module[];
    is_protected?: boolean;
    requires_professional_profile?: boolean;
    requirements?: string;
    [key: string]: unknown;
}

// Represents the payload sent when creating / updating a course (Spanish keys — backend convention)
export interface BlockPayload {
    type: 'video' | 'reading' | 'task' | 'quiz';
    titulo: string;
    order: number;
    duracion?: string;
    url?: string;
    contenido?: string;
    quiz_data?: Record<string, unknown>;
}

export interface SellerProfile {
    id: string;
    user_id: string;
    bio?: string;
    experience_years?: number;
    linkedin_url?: string;
    is_verified: boolean;
    [key: string]: unknown;
}

export interface CourseCatalogs {
    categories: { data: { id: string; label: string }[] };
    topics: { data: { id: string; label: string }[] };
    audiences: { data: { id: string; label: string }[] };
    countries: { data: any[] };
}


export interface ModulePayload {
    nombre: string;
    descripcion?: string;
    order: number;
    bloques: BlockPayload[];
}

export interface BibliographyPayload {
    tipo: string;
    referencia: string;
    enlaceDOI?: string;
}

export interface OfferPayload {
    nombrePublico: string;
    precioBase: number;
    access_type?: string;
    certificate_included: boolean;
}

export interface CourseCreatePayload {
    titulo: string;
    subtitulo?: string;
    categoria?: string;
    tema?: string;
    subtema?: string;
    nivelCurso?: string;
    publicoObjetivo?: string[];
    descripcionCorta?: string;
    modulos?: ModulePayload[];
    queAprendera?: string[];
    requisitos?: string;
    descripcionDetallada?: string;
    objetivosAprendizaje?: string[];
    bibliografia?: BibliographyPayload[];
    ofertas?: OfferPayload[];
    visibilidad?: string;
    has_forum?: boolean;
}

// Backend response (English keys)
export interface OfferResponse {
    id: string;
    name_public: string;
    price_base: number;
    status: string;
    access_type?: string;
    certificate_included: boolean;
}

export interface BibliographyResponse {
    id: string;
    type: string;
    reference_text: string;
    doi_url?: string;
}

export interface CourseResponse {
    id: string;
    title: string;
    subtitle?: string;
    category?: string;
    topic?: string;
    subtopic?: string;
    level?: string;
    short_description?: string;
    long_description?: string;
    banner_url?: string;
    target_audience: string[];
    learning_goals: string[];
    requirements?: string;
    modules: Module[];
    offers: OfferResponse[];
    bibliography: BibliographyResponse[];
    seller_id: string;
    status: 'borrador' | 'revision' | 'publicado';
    visibility: 'publico' | 'privado';
    rating_avg: number;
    rating_count: number;
    has_forum?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface UploadUrlResponse {
    id: string;
    course_id: string;
    file_url: string;
    file_type: string;
    order: number;
    upload_url: string;
}

export interface BannerUploadResponse {
    banner_url: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        let detail = `Error ${res.status}`;
        try {
            const err = await res.json();
            detail = err.detail ?? JSON.stringify(err);
        } catch {
            // ignore parse errors
        }
        throw new Error(detail);
    }
    return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

export const courseService = {
    // ── READ ────────────────────────────────────

    getCourseById: async (id: string): Promise<CourseDetail> => {
        const res = await fetch(`${API_URL}/courses/${id}`, {
            credentials: 'include'
        });
        return handleResponse<CourseDetail>(res);
    },

    /** List all courses that belong to the current seller. */
    getMyCourses: async (sellerId: string): Promise<CourseResponse[]> => {
        const res = await fetch(`${API_URL}/courses/?seller_id=${sellerId}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        return handleResponse<CourseResponse[]>(res);
    },

    getSellerProfile: async (): Promise<SellerProfile> => {
        const response = await fetch(`${API_URL}/seller-profile/me`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al obtener perfil seller');
        return response.json();
    },

    getCatalogs: async (): Promise<CourseCatalogs> => {
        const [categories, topics, audiences, countries] = await Promise.all([
            fetch(`${API_URL}/catalogs/categories`, { credentials: 'include' }).then(r => r.json()),
            fetch(`${API_URL}/catalogs/topics`, { credentials: 'include' }).then(r => r.json()),
            fetch(`${API_URL}/catalogs/audiences`, { credentials: 'include' }).then(r => r.json()),
            fetch(`${API_URL}/catalogs/countries`, { credentials: 'include' }).then(r => r.json()),
        ]);
        return { categories, topics, audiences, countries };
    },

    // ── CREATE ───────────────────────────────────

    /** Create a new course draft. Returns the created course (English keys). */
    createCourse: async (data: CourseCreatePayload): Promise<CourseResponse> => {
        const res = await fetch(`${API_URL}/courses/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        });
        return handleResponse<CourseResponse>(res);
    },

    // ── UPDATE ───────────────────────────────────

    /** Partial update of a course (autosave). */
    updateCourse: async (
        id: string,
        data: Partial<CourseCreatePayload>
    ): Promise<CourseResponse> => {
        const res = await fetch(`${API_URL}/courses/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        });
        return handleResponse<CourseResponse>(res);
    },

    // ── PUBLISH ──────────────────────────────────

    /** Submit course for review (sets status → "revision"). */
    publishCourse: async (id: string): Promise<CourseResponse> => {
        const res = await fetch(`${API_URL}/courses/${id}/publish`, {
            method: 'POST',
            credentials: 'include',
            headers: getAuthHeaders(),
        });
        return handleResponse<CourseResponse>(res);
    },

    // ── S3 UPLOAD ────────────────────────────────

    /**
     * Request a presigned S3 URL to upload a content block file.
     * Returns `upload_url` (for PUT to S3) and the `file_url` (S3 key stored in DB).
     */
    getUploadUrl: async (
        courseId: string,
        blockId: string,
        filename: string,
        fileType: string
    ): Promise<UploadUrlResponse> => {
        const form = new FormData();
        form.append('filename', filename);
        form.append('file_type', fileType);

        const res = await fetch(
            `${API_URL}/courses/${courseId}/contents/blocks/${blockId}/upload`,
            {
                method: 'POST',
                credentials: 'include',
                headers: getAuthHeadersMultipart(),
                body: form,
            }
        );
        return handleResponse<UploadUrlResponse>(res);
    },

    /**
     * Upload a File directly to the presigned S3 URL returned by `getUploadUrl`.
     * Call this AFTER calling getUploadUrl and receiving the presigned URL.
     */
    putFileToS3: async (presignedUrl: string, file: File): Promise<void> => {
        const res = await fetch(presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
        });
        if (!res.ok) {
            throw new Error(`S3 upload failed: ${res.status}`);
        }
    },

    /**
     * Upload a banner image for a course (multipart POST to backend).
     * Returns the S3 key stored as `banner_url` on the course.
     */
    uploadBanner: async (
        courseId: string,
        file: File
    ): Promise<BannerUploadResponse> => {
        const form = new FormData();
        form.append('file', file);

        const res = await fetch(`${API_URL}/courses/${courseId}/banner`, {
            method: 'POST',
            credentials: 'include',
            headers: getAuthHeadersMultipart(),
            body: form,
        });
        return handleResponse<BannerUploadResponse>(res);
    },
};
