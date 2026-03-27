"use client";
import { useState } from "react";
import { authService, startGoogleOAuth } from "@/lib/auth-service";
import { useRouter } from "next/navigation";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { AuthLeftPanel } from "./AuthLeftPanel";

interface SignUpProps {
  variant?: "with-image" | "without-image";
}

export function SignUp({ variant = "with-image" }: SignUpProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setIsLoading(false);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("La contraseña debe contener al menos una mayúscula");
      setIsLoading(false);
      return;
    }
    if (!/\d/.test(password)) {
      setError("La contraseña debe contener al menos un número");
      setIsLoading(false);
      return;
    }

    try {
      await authService.register(email, password, fullName);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <form className="space-y-5" onSubmit={handleRegister}>
      {error && (
        <div className="p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <span className="text-red-500 mt-0.5">⚠️</span>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre</label>
        <input
          type="text"
          placeholder="Tu nombre completo"
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo electrónico</label>
        <input
          type="email"
          placeholder="tu@email.com"
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              <div className={`h-1 flex-1 rounded-full ${
                password.length >= 8 ? 'bg-green-400' : 'bg-gray-200'
              }`} />
              <div className={`h-1 flex-1 rounded-full ${
                /[A-Z]/.test(password) ? 'bg-green-400' : 'bg-gray-200'
              }`} />
              <div className={`h-1 flex-1 rounded-full ${
                /\d/.test(password) ? 'bg-green-400' : 'bg-gray-200'
              }`} />
            </div>
            <p className="text-xs text-slate-500">
              {password.length < 8
                ? "Mínimo 8 caracteres"
                : !/[A-Z]/.test(password)
                  ? "Añade una mayúscula"
                  : !/\d/.test(password)
                    ? "Añade un número"
                    : "Contraseña segura"}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2">
        <Checkbox id="terms" className="mt-1" required />
        <label htmlFor="terms" className="text-sm text-slate-600 leading-tight">
          Acepto los términos y condiciones de uso de la plataforma
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creando cuenta...
          </>
        ) : 'Crear cuenta'}
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
        Registrarse con Google
      </button>

      <p className="text-center text-sm text-slate-500 pt-1">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-purple-600 font-semibold hover:text-purple-700 hover:underline">
          Inicia Sesión
        </Link>
      </p>
    </form>
  );

  if (variant === "with-image") {
    return (
      <div className="flex min-h-screen">
        <AuthLeftPanel />
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-8">
          <div className="w-full max-w-md">
            <FormHeader />
            {renderForm()}
            <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400">
              <Link href="/legal/terminos" className="hover:text-slate-600 transition-colors">Términos</Link>
              <Link href="/legal/privacidad" className="hover:text-slate-600 transition-colors">Privacidad</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-md">
        <FormHeader />
        {renderForm()}
        <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400">
          <Link href="/legal/terminos" className="hover:text-slate-600 transition-colors">Términos</Link>
          <Link href="/legal/privacidad" className="hover:text-slate-600 transition-colors">Privacidad</Link>
        </div>
      </div>
    </div>
  );
}

function FormHeader() {
  return (
    <div className="mb-8">
      <Link href="/" className="flex items-center gap-2.5 mb-6 lg:hidden hover:opacity-80 transition-opacity w-fit">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        <span className="font-bold text-slate-900 text-lg">HealthLearn</span>
      </Link>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Crear cuenta gratuita</h1>
      <p className="text-slate-500">Únete a la comunidad de profesionales</p>
    </div>
  );
}
