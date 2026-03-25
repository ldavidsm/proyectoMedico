'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
          : 'No se pudo enviar el código'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('La contraseña debe contener al menos una mayúscula');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setError('La contraseña debe contener al menos un número');
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
          : 'Código inválido o expirado'
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

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200";

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-300 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="text-white font-bold text-xl">HealthLearn</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Formación médica de excelencia
          </h2>
          <p className="text-purple-200 text-lg leading-relaxed">
            Accede a cursos especializados creados por profesionales de la salud para profesionales de la salud.
          </p>
          <div className="flex gap-8 mt-10">
            {[
              { value: '500+', label: 'Cursos' },
              { value: '10K+', label: 'Profesionales' },
              { value: '50+', label: 'Especialidades' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-purple-300 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <p className="text-white/90 text-sm italic leading-relaxed">
            "La formación continua es el pilar de la excelencia médica."
          </p>
          <p className="text-purple-300 text-xs mt-2 font-medium">
            — Comunidad HealthLearn
          </p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-md">

          {/* Logo móvil */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">HealthLearn</span>
          </div>

          {/* PASO 1 — Email */}
          {step === 'email' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Recuperar contraseña
                </h1>
                <p className="text-slate-500">
                  Introduce tu email y te enviaremos un código para restablecer tu contraseña.
                </p>
              </div>

              <form onSubmit={handleRequestReset} className="space-y-5">
                {error && (
                  <div className="p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">⚠️</span>
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : 'Enviar código'}
                </button>
                <p className="text-center text-sm text-slate-500">
                  ¿Recordaste tu contraseña?{' '}
                  <Link href="/login" className="text-purple-600 font-semibold hover:text-purple-700 hover:underline">
                    Inicia sesión
                  </Link>
                </p>
              </form>
            </>
          )}

          {/* PASO 2 — Revisar email + nueva contraseña */}
          {step === 'check_email' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MailCheck className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">
                Revisa tu correo
              </h1>
              <p className="text-slate-500 mb-2">
                Hemos enviado un código de 4 dígitos a:
              </p>
              <p className="font-semibold text-slate-900 mb-8">
                {email}
              </p>

              <form onSubmit={handleResetPassword} className="text-left space-y-5">
                {error && (
                  <div className="p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">⚠️</span>
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="0000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className={`${inputClass} text-center text-2xl tracking-widest !py-4`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputClass} pr-11`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {['weak', 'medium', 'strong'].map((level, i) => (
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
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        {passwordStrength === 'strong'
                          ? '✓ Contraseña segura'
                          : passwordStrength === 'medium'
                            ? 'Añade un número o mayúscula'
                            : 'Contraseña débil'}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repite la contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputClass} pr-11`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : 'Restablecer contraseña'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  handleRequestReset(
                    new Event('submit') as unknown as React.FormEvent
                  );
                }}
                className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline block mx-auto transition-colors"
              >
                ¿No recibiste el código? Reenviar
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
                className="mt-2 flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mx-auto transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Cambiar email
              </button>
            </div>
          )}

          {/* PASO 3 — Éxito */}
          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">
                ¡Contraseña actualizada!
              </h1>
              <p className="text-slate-500 mb-8">
                Tu contraseña se ha restablecido correctamente.
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)]"
              >
                Ir al inicio de sesión
              </button>
            </div>
          )}

          {/* Links legales */}
          <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400">
            <Link href="/legal/terminos" className="hover:text-slate-600 transition-colors">Términos</Link>
            <Link href="/legal/privacidad" className="hover:text-slate-600 transition-colors">Privacidad</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
