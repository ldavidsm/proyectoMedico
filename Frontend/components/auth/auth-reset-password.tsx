"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Link from "next/link";
import { authService } from "@/lib/auth-sevice"

// Definimos la interfaz para que TypeScript no de error
interface ResetPasswordProps {
  onSuccess?: (email: string) => void;
}

export function ResetPassword({ onSuccess }: ResetPasswordProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Llamada a FastAPI para generar y mandar el código de 4 dígitos
      await authService.requestPasswordReset(email);
      
      // 2. Si FastAPI responde 200 OK, avanzamos al componente CheckEmail
      onSuccess?.(email); 
    } catch (err: any) {
      // Capturamos si el correo no existe o si hubo error de red
      setError(err.message || "No se pudo procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center text-white font-bold">
              LOGO
            </div>
          </div>
          <h1 className="text-3xl font-semibold mb-2">Recuperar contraseña</h1>
          <p className="text-gray-600">
            Ingresa tu correo electrónico y te enviaremos instrucciones para
            restablecer tu contraseña
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Correo electrónico
            </label>
            <Input 
              type="email" 
              placeholder="tu@email.com" 
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white h-12">
            Enviar instrucciones
          </Button>

          <p className="text-center text-sm text-gray-600">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/login" className="text-purple-600 hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </form>
        {/* ... links de términos ... */}
      </div>
    </div>
  );
}