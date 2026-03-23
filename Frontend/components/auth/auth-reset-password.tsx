'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { authService } from '@/lib/auth-service';
import {
  MailCheck, CheckCircle2,
  ArrowLeft, Eye, EyeOff
} from 'lucide-react';

type Step = 'email' | 'check_email' | 'new_password' | 'success';

export function ResetPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // PASO 1 — Solicitar email
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setStep('check_email');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo enviar el c\u00f3digo'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // PASO 2 — Verificar OTP y nueva contrase\u00f1a
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contrase\u00f1as no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setError('La contrase\u00f1a debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('La contrase\u00f1a debe contener al menos una may\u00fascula');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setError('La contrase\u00f1a debe contener al menos un n\u00famero');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPasswordFinal(email, code, newPassword);
      setStep('success');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'C\u00f3digo inv\u00e1lido o expirado'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (() => {
    if (!newPassword) return null;
    const checks = [
      newPassword.length >= 8,
      /[A-Z]/.test(newPassword),
      /\d/.test(newPassword),
    ];
    const passed = checks.filter(Boolean).length;
    if (passed === 3) return 'strong';
    if (passed === 2) return 'medium';
    return 'weak';
  })();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center text-white font-bold">
            HL
          </div>
        </div>

        {/* PASO 1 — Email */}
        {step === 'email' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2">
                Recuperar contrase\u00f1a
              </h1>
              <p className="text-gray-600">
                Introduce tu email y te enviaremos un c\u00f3digo
                para restablecer tu contrase\u00f1a.
              </p>
            </div>

            <form onSubmit={handleRequestReset} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo electr\u00f3nico
                </label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white h-12"
              >
                {isLoading ? 'Enviando...' : 'Enviar c\u00f3digo'}
              </Button>
              <p className="text-center text-sm text-gray-600">
                \u00bfRecordaste tu contrase\u00f1a?{' '}
                <Link href="/login" className="text-purple-600 hover:underline font-medium">
                  Inicia sesi\u00f3n
                </Link>
              </p>
            </form>
          </>
        )}

        {/* PASO 2 — Revisar email */}
        {step === 'check_email' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MailCheck className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-2xl font-semibold mb-3">
              Revisa tu correo
            </h1>
            <p className="text-gray-600 mb-2">
              Hemos enviado un c\u00f3digo de 4 d\u00edgitos a:
            </p>
            <p className="font-semibold text-gray-900 mb-8">
              {email}
            </p>

            <form onSubmit={handleResetPassword} className="text-left space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              {/* C\u00f3digo OTP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  C\u00f3digo de verificaci\u00f3n
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="0000"
                  value={code}
                  onChange={(e) => setCode(
                    e.target.value.replace(/\D/g, '')
                  )}
                  className="text-center text-2xl tracking-widest h-14"
                  required
                />
              </div>

              {/* Nueva contrase\u00f1a */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nueva contrase\u00f1a
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="M\u00ednimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Indicador de fortaleza */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {['weak', 'medium', 'strong'].map(
                        (level, i) => (
                          <div key={level}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              passwordStrength === 'weak' && i === 0
                                ? 'bg-red-400'
                                : passwordStrength === 'medium' && i <= 1
                                  ? 'bg-amber-400'
                                  : passwordStrength === 'strong'
                                    ? 'bg-green-400'
                                    : 'bg-gray-200'
                            }`}
                          />
                        )
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {passwordStrength === 'strong'
                        ? '\u2713 Contrase\u00f1a segura'
                        : passwordStrength === 'medium'
                          ? 'A\u00f1ade un n\u00famero o may\u00fascula'
                          : 'Contrase\u00f1a d\u00e9bil'}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmar contrase\u00f1a */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmar contrase\u00f1a
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repite la contrase\u00f1a"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    Las contrase\u00f1as no coinciden
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white h-12"
              >
                {isLoading ? 'Guardando...' : 'Restablecer contrase\u00f1a'}
              </Button>
            </form>

            {/* Reenviar c\u00f3digo */}
            <button
              type="button"
              onClick={() => {
                setError('');
                handleRequestReset(
                  new Event('submit') as unknown as React.FormEvent
                );
              }}
              className="mt-4 text-sm text-purple-600 hover:underline block mx-auto"
            >
              \u00bfNo recibiste el c\u00f3digo? Reenviar
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
              }}
              className="mt-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Cambiar email
            </button>
          </div>
        )}

        {/* PASO 3 — \u00c9xito */}
        {step === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold mb-3">
              \u00a1Contrase\u00f1a actualizada!
            </h1>
            <p className="text-gray-600 mb-8">
              Tu contrase\u00f1a se ha restablecido correctamente.
              Ya puedes iniciar sesi\u00f3n con tu nueva contrase\u00f1a.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white h-12"
            >
              Ir al inicio de sesi\u00f3n
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
