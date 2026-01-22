"use client";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-2xl shadow-sm">
        <div className="mx-auto w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
          <MailCheck size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">¡Revisa tu bandeja de entrada!</h1>
        
        <p className="text-gray-600">
          Hemos enviado un enlace de activación a <span className="font-semibold text-gray-900">{email || "tu correo"}</span>.
        </p>

        <div className="pt-4">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}