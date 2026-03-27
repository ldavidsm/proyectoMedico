import type { Metadata } from 'next';
import { SignUp } from "@/components/auth/auth-signup";

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Únete a HealthLearn y accede a formación especializada para profesionales de la salud.',
};

export default function SignUpPage() {
  return <SignUp variant="with-image" />;
}
