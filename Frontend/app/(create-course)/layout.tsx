'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header simple para el Editor */}
      <header className="h-16 bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-between px-6 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">H</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm">HealthLearn</span>
            <span className="text-slate-400 text-sm ml-1.5">· Editor de cursos</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl px-4 py-2 hover:border-slate-300 transition-all duration-200"
          >
            <X className="w-4 h-4" />
            Salir del editor
          </Link>

          {/* Separador */}
          <div className="w-px h-5 bg-slate-200" />

          {/* Avatar/menú usuario */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={async () => { await logout(); router.push('/'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* El contenido del Wizard */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
