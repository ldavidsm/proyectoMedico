import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: {
    default: 'HealthLearn — Formación médica especializada',
    template: '%s | HealthLearn',
  },
  description:
    'Plataforma de formación continua para profesionales ' +
    'de la salud. Cursos especializados en medicina, ' +
    'enfermería, farmacología y más.',
  keywords: [
    'formación médica',
    'cursos medicina',
    'enfermería online',
    'formación sanitaria',
    'educación médica continua',
    'cursos salud',
  ],
  authors: [{ name: 'HealthLearn' }],
  creator: 'HealthLearn',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'HealthLearn',
    title: 'HealthLearn — Formación médica especializada',
    description:
      'Plataforma de formación continua para ' +
      'profesionales de la salud.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HealthLearn — Formación médica especializada',
    description:
      'Plataforma de formación continua para ' +
      'profesionales de la salud.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}