import type { Metadata } from 'next';
import { Suspense } from "react";
import { Login } from "@/components/auth/auth-login";

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Accede a tu cuenta de HealthLearn.',
};

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
