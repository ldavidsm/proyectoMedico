'use client';
import { useState } from 'react';
import { ShieldCheck, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileCompletionBannerProps {
  onComplete: () => void;
}

export function ProfileCompletionBanner({ onComplete }: ProfileCompletionBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Completa tu perfil profesional</span>
            {' '}&mdash; Desbloquea el acceso a todos los cursos clínicos avanzados de la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={onComplete}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1 h-8"
          >
            Completar ahora
            <ArrowRight className="w-3 h-3" />
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-amber-500 hover:text-amber-700 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
