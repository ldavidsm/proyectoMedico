"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { authService } from "@/lib/auth-sevice"; 
import { Eye, EyeOff } from "lucide-react";


interface EnterNewPasswordProps {
  email: string;      
  code: string;       
  onSuccess?: () => void;
}

export function EnterNewPassword({ email, code, onSuccess }: EnterNewPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    try {
      // AQUÍ ES DONDE SE CONECTA AL BACKEND REAL
      await authService.resetPasswordFinal(email, code, password);
      
      // Si el backend responde 200 OK, entonces mostramos la vista de éxito
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Error al actualizar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const isInvalid = password !== confirmPassword || password.length < 8 || isLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          {/* ... (SVG y Título igual que antes) */}

          <form className="space-y-4 text-left" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="relative">
        <Input
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            className="w-full pr-10"
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

            
            <div className="relative">
            <Input
               type={showConfirmPassword ? "text" : "password"}
               placeholder="Repite tu contraseña"
               className="w-full pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
               required
                />

               <button
              type="button"
               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                   >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button 
              type="submit" 
              disabled={isInvalid}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white h-12"
            >
              {isLoading ? "Actualizando..." : "Confirmar nueva contraseña"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}