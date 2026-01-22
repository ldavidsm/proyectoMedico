"use client";
import { useState, useRef } from "react";
import { Button } from "../ui/button";

interface CheckEmailProps {
  email?: string;
  onVerifySuccess?: (code: string) => void;
  onResend?: () => void;
}

export function CheckEmail({ email = "tu correo", onVerifySuccess, onResend }: CheckEmailProps) {
  const [code, setCode] = useState(["", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Maneja el cambio en cada input
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Solo números

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Solo el último dígito
    setCode(newCode);

    // Salto automático al siguiente input
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Maneja la tecla de borrar (Backshadow)
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const finalCode = code.join("");
    if (finalCode.length === 4) {
      onVerifySuccess?.(finalCode);
    }
  };

  return (
    <div className="flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-semibold mb-2">Revisa tu correo</h1>
          <p className="text-gray-600 mb-8">
            Te enviamos un código de 4 dígitos a <span className="font-medium text-gray-900">{email}</span>
          </p>

          <div className="flex justify-center gap-3 mb-8">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {(inputsRef.current[index] = el)}}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-16 text-center border-2 border-gray-200 rounded-xl text-2xl font-bold focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
              />
            ))}
          </div>

          <Button 
            onClick={handleVerify}
            disabled={code.some(d => d === "")}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white h-12 rounded-lg font-semibold mb-6"
          >
            Verificar código
          </Button>

          <p className="text-sm text-gray-600">
            ¿No recibiste el correo?{" "}
            <button 
              onClick={onResend}
              type="button" 
              className="text-purple-600 hover:underline font-medium"
            >
              Reenviar código
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}