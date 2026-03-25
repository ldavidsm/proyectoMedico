"use client";
import { useState, useEffect } from "react";
import { authService, startGoogleOAuth } from "@/lib/auth-service";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_auth_failed: "Error al autenticar con Google. Inténtalo de nuevo.",
  no_user_info: "No se pudo obtener la información de tu cuenta de Google.",
  no_email: "La cuenta de Google no tiene un email asociado.",
};

export function Login({ onSuccess, isModal = false }:
  { onSuccess?: () => void; isModal?: boolean; }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const googleError = searchParams.get("error");
    if (googleError && GOOGLE_ERROR_MESSAGES[googleError]) {
      setError(GOOGLE_ERROR_MESSAGES[googleError]);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authService.login(email, password);
      await refreshUser();
      if (onSuccess) onSuccess();

      if (!isModal) {
        const redirectTo = searchParams.get('redirect');
        const redirect = redirectTo || sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirect || '/');
      }
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${isModal ? 'p-6' : 'min-h-screen flex'}`}>
      {/* Panel izquierdo — solo en página completa */}
      {!isModal && (
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex-col justify-between p-12 relative overflow-hidden">
          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-300 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white rounded-full blur-2xl" />
          </div>

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-white font-bold text-xl">HealthLearn</span>
          </div>

          {/* Texto central */}
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Formación médica de excelencia
            </h2>
            <p className="text-purple-200 text-lg leading-relaxed">
              Accede a cursos especializados creados por profesionales de la salud para profesionales de la salud.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mt-10">
              {[
                { value: '500+', label: 'Cursos' },
                { value: '10K+', label: 'Profesionales' },
                { value: '50+', label: 'Especialidades' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-purple-300 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <p className="text-white/90 text-sm italic leading-relaxed">
              "La formación continua es el pilar de la excelencia médica."
            </p>
            <p className="text-purple-300 text-xs mt-2 font-medium">
              — Comunidad HealthLearn
            </p>
          </div>
        </div>
      )}

      {/* Panel derecho — formulario */}
      <div className={`${isModal ? 'w-full' : 'w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-8'}`}>
        <div className="w-full max-w-md">

          {/* Header del formulario */}
          <div className="mb-8">
            {/* Logo solo en modal o móvil */}
            <div className="flex items-center gap-2.5 mb-6 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-slate-900 text-lg">HealthLearn</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-2">Bienvenido de nuevo</h1>
            <p className="text-slate-500">Ingresa a tu cuenta para continuar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠️</span>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/reset-password" className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : 'Iniciar sesión'}
            </button>

            {/* Separador */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-50 px-3 text-slate-400 uppercase tracking-wide">
                  o continúa con
                </span>
              </div>
            </div>

            {/* Botón Google */}
            <button
              type="button"
              onClick={() => startGoogleOAuth()}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            <p className="text-center text-sm text-slate-500 pt-1">
              ¿No tienes cuenta?{' '}
              <Link href="/signup" className="text-purple-600 font-semibold hover:text-purple-700 hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </form>

          {/* Links legales */}
          <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400">
            <Link href="/legal/terminos" className="hover:text-slate-600 transition-colors">Términos</Link>
            <Link href="/legal/privacidad" className="hover:text-slate-600 transition-colors">Privacidad</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
