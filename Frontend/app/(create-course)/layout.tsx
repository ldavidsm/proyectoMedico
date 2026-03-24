import Link from 'next/link';
import { X } from 'lucide-react';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header simple para el Editor */}
      <header className="h-16 bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">H</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm">HealthLearn</span>
            <span className="text-slate-400 text-sm ml-1.5">· Editor de cursos</span>
          </div>
        </div>

        <Link href="/"
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl px-4 py-2 hover:border-slate-300 transition-all duration-200"
        >
          <X className="w-4 h-4" />
          Salir del editor
        </Link>
      </header>

      {/* El contenido del Wizard */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
