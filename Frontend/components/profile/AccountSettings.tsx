'use client';

import { useState, useEffect } from 'react';
import { Mail, Bell, Globe, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function AccountSettings() {
  const { user, refreshUser } = useAuth();
  const [accountEmail, setAccountEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setAccountEmail(user.email);
    }
  }, [user?.email]);

  const [language, setLanguage] = useState('es');
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [securityEmails, setSecurityEmails] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`${API_URL}/profile/account`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: accountEmail,
          language: language,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al guardar');
      }
      await refreshUser();
      toast.success('Configuración guardada');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Email Section */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Correo electrónico de la cuenta</h2>
          <p className="text-xs text-gray-500">
            Este correo se usa para iniciar sesión y recibir notificaciones del sistema
          </p>
        </div>

        <div className="flex gap-3">
          <Input
            id="accountEmail"
            type="email"
            value={accountEmail}
            onChange={(e) => setAccountEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="flex-1 h-9 text-sm bg-white border-gray-300"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Te enviaremos un correo de confirmación al cambiar tu dirección. Este es diferente a tu email de contacto profesional visible en tu perfil.
        </p>
      </div>

      {/* Language Section */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Idioma de la interfaz</h2>
          <p className="text-xs text-gray-500">
            Selecciona el idioma en el que deseas ver la plataforma
          </p>
        </div>

        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="h-9 text-sm bg-white border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="pt">Português</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400 mt-1.5">
          Los cambios se aplicarán inmediatamente en toda la plataforma
        </p>
      </div>

      {/* Notifications Section */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Notificaciones</h2>
          <p className="text-xs text-gray-500">
            Elige qué notificaciones deseas recibir
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between py-2">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-gray-900">Correos de marketing</p>
              <p className="text-xs text-gray-500">
                Recibe información sobre nuevos cursos, funciones y promociones
              </p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
            />
          </div>

          <div className="flex items-start justify-between py-2">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-gray-900">Actualizaciones de cursos</p>
              <p className="text-xs text-gray-500">
                Notificaciones sobre cursos en los que estás inscrito
              </p>
            </div>
            <Switch
              checked={courseUpdates}
              onCheckedChange={setCourseUpdates}
            />
          </div>

          <div className="flex items-start justify-between py-2">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-gray-900">Correos de seguridad</p>
              <p className="text-xs text-gray-500">
                Alertas importantes sobre la seguridad de tu cuenta
              </p>
            </div>
            <Switch
              checked={securityEmails}
              onCheckedChange={setSecurityEmails}
              disabled
            />
          </div>

          <div className="flex items-start justify-between py-2">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-gray-900">Notificaciones push</p>
              <p className="text-xs text-gray-500">
                Recibe notificaciones en tu dispositivo aunque no estés en la app
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Los correos de seguridad no se pueden desactivar para proteger tu cuenta
        </p>
      </div>

      {/* Actions */}
      <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 text-xs bg-white border-gray-300"
          onClick={() => setAccountEmail(user?.email || '')}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          className="bg-teal-600 hover:bg-teal-700 h-9 px-4 text-xs font-medium"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
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
