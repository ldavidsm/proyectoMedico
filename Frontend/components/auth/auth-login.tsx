"use client";
import { useState, useEffect } from "react";
import { authService, startGoogleOAuth } from "@/lib/auth-sevice";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
      // 1. Iniciamos sesión en el servidor
      await authService.login(email, password);
      
      // 2. Sincronizamos el estado global para quitar el ContentBlocker
      await refreshUser();
      
      // 3. Cerramos el modal si existe
      if (onSuccess) onSuccess();

      // 4. Redirección condicional
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
    <div className={`${isModal ? "" : "min-h-screen flex items-center justify-center bg-gray-50"} p-8`}>
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center text-white font-bold">LOGO</div>
          </div>
          <h1 className="text-3xl font-semibold mb-2 text-slate-900">Bienvenido de nuevo</h1>
          <p className="text-gray-600">Ingresa a tu cuenta para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
            <Input 
              type="email" 
              placeholder="tu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                className="pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link href="/reset-password" oily-true="true" className="text-sm text-purple-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-teal-500 hover:bg-teal-600 h-12">
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">o continuar con</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-300 h-12"
            onClick={() => startGoogleOAuth()}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </Button>

          <p className="text-center text-sm text-gray-600 pt-2">
            ¿No tienes cuenta?{" "}
            <Link 
              href="/signup" 
              className="text-purple-600 font-bold hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </form>

        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-500">
          <Link href="#" className="hover:text-gray-700 hover:underline">Términos y condiciones</Link>
          <Link href="#" className="hover:text-gray-700 hover:underline">Política de privacidad</Link>
        </div>
      </div>
    </div>
  );
}