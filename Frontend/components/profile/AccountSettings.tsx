'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

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
        <h2 className="text-lg font-bold text-slate-900 mb-1">Correo electrónico de la cuenta</h2>
        <p className="text-sm text-slate-400 mb-4">
          Este correo se usa para iniciar sesión y recibir notificaciones del sistema
        </p>

        <div>
          <label htmlFor="accountEmail" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Email
          </label>
          <input
            id="accountEmail"
            type="email"
            value={accountEmail}
            onChange={(e) => setAccountEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className={inputClass}
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Te enviaremos un correo de confirmación al cambiar tu dirección.
          </p>
        </div>
      </div>

      {/* Language Section */}
      <div className="border-t border-slate-100 pt-6 mt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Idioma de la interfaz</h2>
        <p className="text-sm text-slate-400 mb-4">
          Selecciona el idioma en el que deseas ver la plataforma
        </p>

        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="pt">Português</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-400 mt-1.5">
          Los cambios se aplicarán inmediatamente en toda la plataforma
        </p>
      </div>

      {/* Notifications Section */}
      <div className="border-t border-slate-100 pt-6 mt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Notificaciones</h2>
        <p className="text-sm text-slate-400 mb-4">
          Elige qué notificaciones deseas recibir
        </p>

        <div className="space-y-3">
          <div className="flex items-start justify-between py-2">
            <div className="flex-1 pr-4">
              <p className="text-sm font-semibold text-slate-700">Correos de marketing</p>
              <p className="text-xs text-slate-400">
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
              <p className="text-sm font-semibold text-slate-700">Actualizaciones de cursos</p>
              <p className="text-xs text-slate-400">
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
              <p className="text-sm font-semibold text-slate-700">Correos de seguridad</p>
              <p className="text-xs text-slate-400">
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
              <p className="text-sm font-semibold text-slate-700">Notificaciones push</p>
              <p className="text-xs text-slate-400">
                Recibe notificaciones en tu dispositivo aunque no estés en la app
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Los correos de seguridad no se pueden desactivar para proteger tu cuenta
        </p>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-100 pt-6 mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
        <button
          onClick={() => setAccountEmail(user?.email || '')}
          className="border border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 font-medium py-2.5 px-5 rounded-xl transition-all duration-200 text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)] text-sm flex items-center gap-2 disabled:opacity-60"
        >
          {isSaving ? (
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
