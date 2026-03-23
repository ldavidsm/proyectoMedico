import { toast } from 'sonner';
import { ApiError } from './api-client';

export function handleError(
  error: unknown,
  fallbackMessage = 'Ha ocurrido un error inesperado',
): void {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      toast.error(error.message);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return;
    }
    toast.error(error.message);
    return;
  }

  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      toast.error(
        'No se pudo conectar con el servidor. Verifica tu conexión.',
      );
      return;
    }
    toast.error(error.message || fallbackMessage);
    return;
  }

  toast.error(fallbackMessage);

  if (process.env.NODE_ENV === 'development') {
    console.error('[handleError]', error);
  }
}
