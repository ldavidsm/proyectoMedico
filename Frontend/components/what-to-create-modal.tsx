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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="what-to-create-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl p-1.5 transition-all cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 id="what-to-create-title" className="text-2xl font-bold text-slate-900 mb-2 text-center">
            ¿Qué quieres crear?
          </h2>
          <p className="text-slate-400 text-sm text-center">
            Puedes crear un curso individual o una colección que agrupe varios cursos.
          </p>
        </div>

        {/* Cards de opción */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            data-testid="create-course-btn"
            onClick={onSelectCourse}
            className="group flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-slate-100 hover:border-purple-400 hover:bg-purple-50/50 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="text-5xl mb-1">📚</span>
            <span className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition-colors">Curso individual</span>
            <span className="text-sm text-slate-400 text-center leading-relaxed">Clases, módulos, tareas y evaluaciones</span>
          </button>

          <button
            data-testid="create-package-btn"
            onClick={onSelectPackage}
            className="group flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-slate-100 hover:border-purple-400 hover:bg-purple-50/50 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="text-5xl mb-1">📦</span>
            <span className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition-colors">Colección de cursos</span>
            <span className="text-sm text-slate-400 text-center leading-relaxed">Agrupe varios cursos en un solo producto</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white text-slate-500 text-sm font-medium border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
