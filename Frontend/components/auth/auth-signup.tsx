"use client";
import { useState } from "react";
import { authService } from "@/lib/auth-sevice";
import { useRouter } from "next/navigation";
import { ImageWithFallback } from "../shared/ImageWithFallback";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

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

  const backgroundImage = "figma:asset/ae01ce966b78b0c5e625afba490d78b6f66e8c13.png";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Llamada al servicio que conecta con @router.post("/register")
      await authService.register(email, password, fullName);
      
      // Si el registro es exitoso, lo enviamos al login 
      // o podrías loguearlo automáticamente
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Contenido del formulario (para no repetirlo en las variantes)
  const renderForm = () => (
    <form className="space-y-4" onSubmit={handleRegister}>
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
        <Input 
          type="text" 
          placeholder="Tu nombre completo" 
          className="w-full"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
        <Input 
          type="email" 
          placeholder="tu@email.com" 
          className="w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
      </div>

      <div>
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    Contraseña
  </label>

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
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
         </button>
        </div>
        </div>

      <div className="flex items-start gap-2">
        <Checkbox id="terms" className="mt-1" required />
        <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
          Acepto los términos y condiciones de uso de la plataforma
        </label>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white h-12"
      >
        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      {/* Botón de Google (estético de momento) */}
      <Button type="button" variant="outline" className="w-full border-gray-300">
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Registrarse con Google
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-purple-600 font-bold hover:underline">
          Inicia Sesión
        </Link>
      </p>
    </form>
  );

  if (variant === "with-image") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="hidden lg:block lg:w-1/2 relative">
          <ImageWithFallback src={backgroundImage} alt="Sign up background" className="w-full h-full object-cover" />
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Header />
            {renderForm()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md">
        <Header />
        {renderForm()}
      </div>
    </div>
  );
}

// Sub-componente para el logo y título
function Header() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center text-white font-bold">LOGO</div>
      </div>
      <h1 className="text-3xl font-semibold mb-2">Crear cuenta gratuita</h1>
      <p className="text-gray-600">Comencemos a diseñar juntos</p>
    </div>
  );
}