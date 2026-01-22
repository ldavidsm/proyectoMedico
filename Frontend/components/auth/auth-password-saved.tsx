"use client";

import { Button } from "../ui/button";
import { useRouter } from "next/navigation"; // Importamos el router

export function PasswordSaved() {
  const router = useRouter(); // Inicializamos el router

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center text-white font-bold">
              LOGO
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-teal-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-semibold mb-2">¡Contraseña actualizada!</h1>
          <p className="text-gray-600 mb-8">
            Tu contraseña ha sido cambiada exitosamente.
            <br />
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>

          <Button 
            onClick={() => router.push("/login")} // Redirige al login formal
            className="bg-teal-500 hover:bg-teal-600 text-white px-12 py-2.5 w-full"
          >
            Iniciar sesión
          </Button>
        </div>

        <div className="mt-12 flex justify-center gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-gray-700 hover:underline">
            Términos y condiciones
          </a>
          <a href="#" className="hover:text-gray-700 hover:underline">
            Política de privacidad
          </a>
        </div>
      </div>
    </div>
  );
}