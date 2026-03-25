import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Página no encontrada',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="text-center max-w-md">

        {/* Número 404 decorativo */}
        <div className="relative mb-8">
          <p className="text-[10rem] font-black text-slate-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-xl shadow-purple-200">
              <span className="text-white text-4xl">🔍</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Página no encontrada
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)]">
            Volver al inicio
          </Link>
          <Link href="/login"
            className="bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl hover:border-purple-400 hover:text-purple-600 transition-all duration-200">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
