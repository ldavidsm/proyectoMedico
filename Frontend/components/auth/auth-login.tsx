"use client";
import { useState, useEffect } from "react";
import { authService, startGoogleOAuth } from "@/lib/auth-service";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { AuthLeftPanel } from "./AuthLeftPanel";

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
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId2FA, setUserId2FA] = useState('');
  const [totpCode, setTotpCode] = useState('');

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
      const result = await authService.login(email, password);

      if (result?.requires_2fa) {
        setRequires2FA(true);
        setUserId2FA(result.user_id);
        setIsLoading(false);
        return;
      }

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

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/2fa/verify`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId2FA, code: totpCode }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Código incorrecto');
      }
      await refreshUser();
      if (onSuccess) onSuccess();
      if (!isModal) {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código incorrecto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${isModal ? 'p-6' : 'min-h-screen flex'}`}>
      {/* Panel izquierdo — solo en página completa */}
      {!isModal && <AuthLeftPanel />}

      {/* Panel derecho — formulario */}
      <div className={`${isModal ? 'w-full' : 'w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-8'}`}>
        <div className="w-full max-w-md">

          {/* Logo solo en modal o móvil */}
          <Link href="/" className="flex items-center gap-2.5 mb-6 lg:hidden hover:opacity-80 transition-opacity w-fit">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">HealthLearn</span>
          </Link>

          {requires2FA ? (
          /* Formulario de código 2FA */
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Verificación en dos pasos
              </h1>
              <p className="text-slate-500 text-sm">
                Abre Google Authenticator o Authy e introduce el código de 6 dígitos de HealthLearn.
              </p>
            </div>

            <form onSubmit={handleVerify2FA} className="space-y-5">
              {error && (
                <div className="p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Código de verificación
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 text-center text-3xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200"
                />
                <p className="text-xs text-slate-400 mt-1.5 text-center">
                  El código cambia cada 30 segundos
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || totpCode.length !== 6}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : 'Verificar'}
              </button>

              <button
                type="button"
                onClick={() => { setRequires2FA(false); setTotpCode(''); setError(''); }}
                className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Volver al login
              </button>
            </form>
          </div>
          ) : (
          /* Formulario de login normal */
          <div>
          {/* Header del formulario */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Bienvenido de nuevo</h1>
            <p className="text-slate-500">Ingresa a tu cuenta para continuar</p>
          </div>

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
          </div>
          )}

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
