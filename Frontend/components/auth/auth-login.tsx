"use client";
import { useState } from "react";
import { authService } from "@/lib/auth-sevice";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuth } from "@/context/AuthContext"; 
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export function Login({ onSuccess, isModal = false }: 
  { onSuccess?: () => void; isModal?: boolean; }) {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const { refreshUser } = useAuth();

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
        router.push("/"); 
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