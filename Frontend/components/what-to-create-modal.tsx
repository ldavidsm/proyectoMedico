import { X } from 'lucide-react';

type Props = {
  show: boolean;
  onSelectCourse: () => void;
  onSelectPackage: () => void;
  onClose: () => void;
};

export default function WhatToCreateModal({ show, onSelectCourse, onSelectPackage, onClose }: Props) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="what-to-create-title"
    >
      <div
        className="bg-white w-full shadow-lg animate-slide-up"
        style={{ maxWidth: 440, borderRadius: 12 }}
      >
        <div className="p-7 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1.5 transition-all cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6 pt-1">
            <h2 id="what-to-create-title" className="text-xl font-semibold text-gray-900 mb-1.5">
              ¿Qué quieres crear?
            </h2>
            <p className="text-sm text-gray-500">
              Puedes crear un curso individual o una colección que agrupe varios cursos.
            </p>
          </div>

          {/* Buttons stacked */}
          <div className="space-y-3">
            <button
              data-testid="create-course-btn"
              onClick={onSelectCourse}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold hover:from-purple-600 hover:to-purple-700 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="text-base">📚</span>
              Curso individual
            </button>

            <button
              data-testid="create-package-btn"
              onClick={onSelectPackage}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold hover:from-purple-600 hover:to-purple-700 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="text-base">📦</span>
              Colección de cursos
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-white text-gray-600 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
