import type { Metadata } from 'next';
import { SignUp } from "@/components/auth/auth-signup";

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Únete a HealthLearn y accede a formación especializada para profesionales de la salud.',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <SignUp variant="without-image" />
      </div>
    </div>
  );
}