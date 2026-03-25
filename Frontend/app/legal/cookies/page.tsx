export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-slate-900">HealthLearn</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Política de Cookies
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            Última actualización: marzo 2026
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            Este documento está siendo redactado y estará disponible próximamente.
            Para cualquier consulta contacta con nosotros en{' '}
            <a href="mailto:legal@healthlearn.es" className="font-medium underline">
              legal@healthlearn.es
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
