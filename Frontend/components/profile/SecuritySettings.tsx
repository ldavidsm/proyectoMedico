'use client';

import { useState, useEffect } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

import { inputClass } from '@/lib/styles';

export function SecuritySettings() {
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);

  // 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<{
    qr_image: string;
    secret: string;
  } | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpLoading, setTotpLoading] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  useEffect(() => {
    if (user) {
      setTwoFactorEnabled(user?.totp_enabled || false);
    }
  }, [user]);

  const handleSetup2FA = async () => {
    setTotpLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/2fa/setup`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSetupData(data);
      setShowSetup(true);
    } catch {
      toast.error('Error al iniciar la configuración del 2FA');
    } finally {
      setTotpLoading(false);
    }
  };

  const handleConfirm2FA = async () => {
    if (totpCode.length !== 6) {
      toast.error('Introduce el código de 6 dígitos');
      return;
    }
    setTotpLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/2fa/confirm`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: totpCode }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail);
      }
      setTwoFactorEnabled(true);
      setShowSetup(false);
      setSetupData(null);
      setTotpCode('');
      await refreshUser();
      toast.success('2FA activado correctamente');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Código incorrecto');
    } finally {
      setTotpLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setTotpLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/2fa/disable`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail);
      }
      setTwoFactorEnabled(false);
      setShowDisable(false);
      setDisablePassword('');
      await refreshUser();
      toast.success('2FA desactivado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al desactivar el 2FA');
    } finally {
      setTotpLoading(false);
    }
  };

  // Privacy states
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public');
  const [activityStatus, setActivityStatus] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [dataCollection, setDataCollection] = useState('essential');
  const [personalization, setPersonalization] = useState('full');
  const [cookies, setCookies] = useState('all');

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast.error('Necesita al menos una mayúscula');
      return;
    }
    if (!/\d/.test(newPassword)) {
      toast.error('Necesita al menos un número');
      return;
    }
    try {
      setIsChangingPassword(true);
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al cambiar la contraseña');
      }
      toast.success('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setIsSavingPrivacy(true);
      const res = await fetch(`${API_URL}/profile/privacy`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicProfile: profileVisibility === 'public',
          showEmail: false,
          showSpecialty: true,
        }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      toast.success('Configuración de privacidad guardada');
    } catch {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  // Password strength
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
    <div>
      {/* Security status card */}
      <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Cuenta protegida
          </p>
          <p className="text-xs text-emerald-600">
            Tu cuenta está segura con contraseña activa
          </p>
        </div>
      </div>

      {/* Two-Factor Authentication Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Autenticación de dos factores</h2>
        <p className="text-sm text-slate-400 mb-4">
          Agrega una capa adicional de protección a tu cuenta
        </p>

        {/* Estado: 2FA no activado */}
        {!twoFactorEnabled && !showSetup && (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    Autenticación en dos pasos (2FA)
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Añade una capa extra de seguridad. Necesitarás Google Authenticator o Authy en tu móvil.
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-200 text-slate-500 flex-shrink-0">
                Inactivo
              </span>
            </div>
            <button
              onClick={handleSetup2FA}
              disabled={totpLoading}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-60"
            >
              {totpLoading ? 'Cargando...' : 'Activar 2FA'}
            </button>
          </div>
        )}

        {/* Estado: configurando 2FA — mostrar QR */}
        {showSetup && setupData && (
          <div className="bg-white rounded-2xl p-5 border-2 border-purple-200">
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Configura tu autenticador
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Escanea este código QR con Google Authenticator o Authy, luego introduce el código de 6 dígitos.
            </p>

            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                <img src={setupData.qr_image} alt="QR Code 2FA" className="w-48 h-48" />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-slate-500 mb-1">
                ¿No puedes escanear? Introduce esta clave manualmente:
              </p>
              <code className="text-xs font-mono font-bold text-purple-600 break-all">
                {setupData.secret}
              </code>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Código de verificación
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl tracking-widest font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowSetup(false); setSetupData(null); setTotpCode(''); }}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-slate-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm2FA}
                disabled={totpLoading || totpCode.length !== 6}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              >
                {totpLoading ? 'Verificando...' : 'Activar 2FA'}
              </button>
            </div>
          </div>
        )}

        {/* Estado: 2FA activo */}
        {twoFactorEnabled && !showDisable && (
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900 mb-1">2FA activado</p>
                  <p className="text-xs text-emerald-600 leading-relaxed">
                    Tu cuenta está protegida con autenticación en dos pasos.
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-700 flex-shrink-0">
                Activo
              </span>
            </div>
            <button
              onClick={() => setShowDisable(true)}
              className="mt-4 w-full border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium py-2.5 rounded-xl transition-all"
            >
              Desactivar 2FA
            </button>
          </div>
        )}

        {/* Modal desactivar 2FA */}
        {showDisable && (
          <div className="bg-white rounded-2xl p-5 border-2 border-red-200">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Desactivar 2FA</h4>
            <p className="text-xs text-slate-400 mb-4">
              Introduce tu contraseña para confirmar.
            </p>
            <input
              type="password"
              placeholder="Tu contraseña actual"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDisable(false); setDisablePassword(''); }}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-slate-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDisable2FA}
                disabled={totpLoading || !disablePassword}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              >
                {totpLoading ? 'Desactivando...' : 'Desactivar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="border-t border-slate-100 pt-6 mt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Contraseña</h2>
        <p className="text-sm text-slate-400 mb-4">
          Actualiza tu contraseña cuando lo consideres necesario
        </p>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="border border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 font-medium py-2.5 px-5 rounded-xl transition-all duration-200 text-sm"
          >
            Cambiar contraseña
          </button>
        ) : (
          <div className="px-5 py-5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Contraseña actual
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nueva contraseña
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />

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
                                  ? 'bg-emerald-400'
                                  : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
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
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirmar nueva contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="border border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 font-medium py-2.5 px-5 rounded-xl transition-all duration-200 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)] text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar contraseña'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 pt-6 mt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Privacidad</h2>
        <p className="text-sm text-slate-400 mb-4">
          Controla la visibilidad de tu perfil y el uso de tus datos
        </p>
      </div>

      {/* Profile Visibility */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">Visibilidad del perfil</label>

        <RadioGroup
          value={profileVisibility}
          onValueChange={(value: 'public' | 'private') => setProfileVisibility(value)}
          className="space-y-3"
        >
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="public" id="public" className="mt-1 w-5 h-5" />
            <Label htmlFor="public" className="cursor-pointer flex-1">
              <span className="text-sm font-semibold text-slate-700 block mb-0.5">Público</span>
              <p className="text-xs text-slate-400">Cualquier usuario puede ver tu perfil</p>
            </Label>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="private" id="private" className="mt-1 w-5 h-5" />
            <Label htmlFor="private" className="cursor-pointer flex-1">
              <span className="text-sm font-semibold text-slate-700 block mb-0.5">Privado</span>
              <p className="text-xs text-slate-400">Solo tú puedes ver tu perfil completo</p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Activity Status */}
      <div className="mb-6">
        <div className="flex items-start justify-between py-2">
          <div className="flex-1 pr-4">
            <p className="text-sm font-semibold text-slate-700">Estado de actividad</p>
            <p className="text-xs text-slate-400">
              Mostrar cuándo estás activo en la plataforma
            </p>
          </div>
          <Switch
            checked={activityStatus}
            onCheckedChange={setActivityStatus}
          />
        </div>
      </div>

      {/* Location Sharing */}
      <div className="mb-6">
        <div className="flex items-start justify-between py-2">
          <div className="flex-1 pr-4">
            <p className="text-sm font-semibold text-slate-700">Compartir ubicación</p>
            <p className="text-xs text-slate-400">
              Mostrar eventos y cursos cerca de tu ubicación
            </p>
          </div>
          <Switch
            checked={locationSharing}
            onCheckedChange={setLocationSharing}
          />
        </div>
      </div>

      {/* Data Usage and Personalization */}
      <div className="border-t border-slate-100 pt-6 mt-6 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Uso de datos y personalización</h2>
        <p className="text-sm text-slate-400 mb-4">
          Controla cómo se utilizan tus datos para personalizar tu experiencia
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="dataCollection" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Recopilación de datos
            </label>
            <Select value={dataCollection} onValueChange={setDataCollection}>
              <SelectTrigger id="dataCollection" className="bg-slate-50 border-slate-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="essential">Solo esenciales</SelectItem>
                <SelectItem value="analytics">Con análisis</SelectItem>
                <SelectItem value="full">Completo</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400 mt-1.5">
              Datos necesarios para el funcionamiento de la plataforma
            </p>
          </div>

          <div>
            <label htmlFor="personalization" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Personalización
            </label>
            <Select value={personalization} onValueChange={setPersonalization}>
              <SelectTrigger id="personalization" className="bg-slate-50 border-slate-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin personalización</SelectItem>
                <SelectItem value="basic">Básica</SelectItem>
                <SelectItem value="full">Completa</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400 mt-1.5">
              Recomendaciones de cursos basadas en tus intereses
            </p>
          </div>
        </div>
      </div>

      {/* Cookies */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cookies</label>
        <Select value={cookies} onValueChange={setCookies}>
          <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="essential">Solo esenciales</SelectItem>
            <SelectItem value="functional">Funcionales</SelectItem>
            <SelectItem value="all">Todas</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-400 mt-1.5">
          Las cookies esenciales son necesarias para el funcionamiento del sitio
        </p>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-100 pt-6 mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
        <button
          className="border border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 font-medium py-2.5 px-5 rounded-xl transition-all duration-200 text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={handleSavePrivacy}
          disabled={isSavingPrivacy}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)] text-sm flex items-center gap-2 disabled:opacity-60"
        >
          {isSavingPrivacy ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
      </div>
    </div>
  );
}
