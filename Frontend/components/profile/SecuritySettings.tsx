'use client';

import { useState } from 'react';
import { Lock, Shield, Edit2, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);

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

  const handleEnable2FA = () => {
    setTwoFactorEnabled(true);
  };

  const handleManage2FA = () => {
    console.log('Managing 2FA...');
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

  return (
    <div>
      {/* Two-Factor Authentication Section */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Autenticación de dos factores</h2>
          <p className="text-xs text-gray-500">
            Agrega una capa adicional de protección a tu cuenta
          </p>
        </div>

        {!twoFactorEnabled ? (
          <div className="px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Recomendado para profesionales
                </h3>
                <p className="text-xs text-blue-800 mb-3">
                  La autenticación de dos factores protege tu cuenta requiriendo un código adicional al iniciar sesión.
                  Recomendado si accedes a información sensible o desde múltiples ubicaciones.
                </p>
                <Button
                  onClick={handleEnable2FA}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 h-8 px-4 text-xs font-medium"
                >
                  Activar autenticación de dos factores
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between px-4 py-3 bg-green-50 rounded-lg border border-green-200 group">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">Autenticación de dos factores</span>
                  <Badge className="bg-green-600 hover:bg-green-700 text-xs px-2 py-0">
                    Activada
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  Tu cuenta está protegida con verificación en dos pasos
                </p>
              </div>
            </div>
            <button
              onClick={handleManage2FA}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-green-100 rounded"
              title="Editar"
            >
              <Edit2 className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Contraseña</h2>
          <p className="text-xs text-gray-500">
            Actualiza tu contraseña cuando lo consideres necesario
          </p>
        </div>

        {!showPasswordForm ? (
          <Button
            onClick={() => setShowPasswordForm(true)}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs bg-white border-gray-300 hover:bg-gray-50"
          >
            Cambiar contraseña
          </Button>
        ) : (
          <div className="px-4 py-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Contraseña actual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 text-sm bg-white border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Nueva contraseña
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 text-sm bg-white border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Confirmar nueva contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 text-sm bg-white border-gray-300"
                />
              </div>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
              )}

              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700 mb-2">
                  Ver requisitos de contraseña
                </summary>
                <ul className="space-y-1 mt-2 ml-4 list-disc">
                  <li>Mínimo 8 caracteres</li>
                  <li>Al menos una letra mayúscula</li>
                  <li>Al menos un número</li>
                  <li>Al menos un carácter especial (@, #, $, etc.)</li>
                </ul>
              </details>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs bg-white border-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 h-8 px-3 text-xs font-medium"
                  disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar contraseña'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-8 border-t border-gray-200"></div>

      {/* PRIVACY SECTION */}

      {/* Profile Visibility */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Visibilidad del perfil</h2>
          <p className="text-xs text-gray-500">
            Controla quién puede ver tu perfil profesional
          </p>
        </div>

        <RadioGroup
          value={profileVisibility}
          onValueChange={(value: 'public' | 'private') => setProfileVisibility(value)}
          className="space-y-3"
        >
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="public" id="public" className="mt-1 w-5 h-5" />
            <Label htmlFor="public" className="cursor-pointer flex-1">
              <span className="text-sm font-medium text-gray-900 block mb-0.5">Público</span>
              <p className="text-xs text-gray-500">Cualquier usuario puede ver tu perfil</p>
            </Label>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="private" id="private" className="mt-1 w-5 h-5" />
            <Label htmlFor="private" className="cursor-pointer flex-1">
              <span className="text-sm font-medium text-gray-900 block mb-0.5">Privado</span>
              <p className="text-xs text-gray-500">Solo tú puedes ver tu perfil completo</p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Activity Status */}
      <div className="mb-6">
        <div className="flex items-start justify-between py-2">
          <div className="flex-1 pr-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Estado de actividad</h2>
            <p className="text-xs text-gray-500">
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
            <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Compartir ubicación</h2>
            <p className="text-xs text-gray-500">
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
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Uso de datos y personalización</h2>
          <p className="text-xs text-gray-500">
            Controla cómo se utilizan tus datos para personalizar tu experiencia
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="dataCollection" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Recopilación de datos
            </Label>
            <Select value={dataCollection} onValueChange={setDataCollection}>
              <SelectTrigger id="dataCollection" className="h-9 text-sm bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="essential">Solo esenciales</SelectItem>
                <SelectItem value="analytics">Con análisis</SelectItem>
                <SelectItem value="full">Completo</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400 mt-1.5">
              Datos necesarios para el funcionamiento de la plataforma
            </p>
          </div>

          <div>
            <Label htmlFor="personalization" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Personalización
            </Label>
            <Select value={personalization} onValueChange={setPersonalization}>
              <SelectTrigger id="personalization" className="h-9 text-sm bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin personalización</SelectItem>
                <SelectItem value="basic">Básica</SelectItem>
                <SelectItem value="full">Completa</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400 mt-1.5">
              Recomendaciones de cursos basadas en tus intereses
            </p>
          </div>
        </div>
      </div>

      {/* Cookies */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Cookies</h2>
          <p className="text-xs text-gray-500">
            Gestiona tus preferencias de cookies
          </p>
        </div>

        <Select value={cookies} onValueChange={setCookies}>
          <SelectTrigger className="h-9 text-sm bg-white border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="essential">Solo esenciales</SelectItem>
            <SelectItem value="functional">Funcionales</SelectItem>
            <SelectItem value="all">Todas</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400 mt-1.5">
          Las cookies esenciales son necesarias para el funcionamiento del sitio
        </p>
      </div>

      {/* Actions */}
      <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs bg-white border-gray-300"
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          className="bg-teal-600 hover:bg-teal-700 h-9 px-4 text-xs font-medium"
          onClick={handleSavePrivacy}
          disabled={isSavingPrivacy}
        >
          {isSavingPrivacy ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>
      </div>
    </div>
  );
}
