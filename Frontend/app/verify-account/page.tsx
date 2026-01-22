"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function VerifyAccountAction() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verificando tu cuenta...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de activación no encontrado.");
      return;
    }

    const verify = async () => {
      try {
        // Ajusta la URL a tu endpoint de FastAPI
        const response = await fetch(`http://localhost:8000/auth/confirm-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("¡Cuenta activada! Redirigiendo...");
          // Esperamos 2 segundos para que el usuario vea el éxito y redirigimos
          setTimeout(() => router.push("/"), 2000); 
        } else {
          setStatus("error");
          setMessage(data.detail || "Error al activar la cuenta.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("No se pudo conectar con el servidor.");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        {status === "loading" && <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />}
        {status === "success" && <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />}
        {status === "error" && <XCircle className="w-12 h-12 text-red-500 mx-auto" />}
        
        <h2 className="text-xl font-medium text-gray-800">{message}</h2>
      </div>
    </div>
  );
}