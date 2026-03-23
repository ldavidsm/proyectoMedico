const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  let detail = 'Error desconocido';
  try {
    const body = await response.json();
    detail = body.detail || body.message || detail;
  } catch {
    detail = response.statusText || detail;
  }

  const messages: Record<number, string> = {
    400: detail,
    401: 'Tu sesión ha expirado. Por favor inicia sesión de nuevo.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'El recurso solicitado no existe.',
    422: detail,
    429: 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.',
    500: 'Error del servidor. Por favor inténtalo más tarde.',
    503: 'Servicio no disponible. Por favor inténtalo más tarde.',
  };

  throw new ApiError(
    messages[response.status] || detail,
    response.status,
    detail,
  );
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  let url = `${API_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }
  return url;
}

export const apiClient = {
  async get<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...rest } = options;
    const response = await fetch(buildUrl(path, params), {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...rest,
    });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: unknown, options: FetchOptions = {}): Promise<T> {
    const { params, ...rest } = options;
    const response = await fetch(buildUrl(path, params), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body?: unknown, options: FetchOptions = {}): Promise<T> {
    const { params, ...rest } = options;
    const response = await fetch(buildUrl(path, params), {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...rest } = options;
    const response = await fetch(buildUrl(path, params), {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...rest,
    });
    return handleResponse<T>(response);
  },

  async upload<T>(path: string, formData: FormData, options: FetchOptions = {}): Promise<T> {
    const { params, ...rest } = options;
    const response = await fetch(buildUrl(path, params), {
      method: 'POST',
      credentials: 'include',
      body: formData,
      ...rest,
    });
    return handleResponse<T>(response);
  },
};
