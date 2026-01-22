"use client";
import { useState } from "react";
import { ResetPassword } from "@/components/auth/auth-reset-password";
import { CheckEmail } from "@/components/auth/auth-check-email";
import { EnterNewPassword } from "@/components/auth/auth-enter-new-password";
import { PasswordSaved } from "@/components/auth/auth-password-saved";

export default function ResetPasswordPage() {
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(""); // <--- 1. Necesitamos guardar el código

  const handleVerifyCode = async (inputCode: string) => {
    console.log("Verificando código:", inputCode, "para", email);
    
    // 2. Guardamos el código que el usuario escribió en el estado
    setCode(inputCode);
    
    // 3. Pasamos al siguiente paso
    setStep("new-password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md shadow-lg bg-white rounded-2xl overflow-hidden">
        
        {step === "request" && (
          <ResetPassword 
            onSuccess={(inputValue) => {
              setEmail(inputValue);
              setStep("verify");
            }} 
          />
        )}

        {step === "verify" && (
          <CheckEmail 
            email={email} 
            onVerifySuccess={handleVerifyCode} 
            onResend={() => console.log("Reenviando...")}
          />
        )}

        {/* PASO 3: Ahora le pasamos email y code para que TypeScript esté feliz */}
        {step === "new-password" && (
          <EnterNewPassword 
            email={email} 
            code={code} 
            onSuccess={() => setStep("success")} 
          />
        )}

        {step === "success" && (
          <PasswordSaved />
        )}

      </div>
    </div>
  );
}