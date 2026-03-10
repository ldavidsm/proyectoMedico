"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/auth-sevice';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from "sonner"; // O tu librería de notificaciones

export function AccountSettings() {
  const { user, refreshUser } = useAuth();
  
  // Estado unificado siguiendo el esquema del backend
  const [settings, setSettings] = useState({
    email: user?.email || '',
    language: 'es',
    marketing_emails: true,
    course_updates: true,
    push_notifications: false
  });

  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar si el usuario cambia
  useEffect(() => {
    if (user) {
      setSettings(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Usamos el servicio para persistir en FastAPI
      await authService.updateAccountSettings(settings);
      toast.success("Configuración actualizada correctamente");
      await refreshUser();
    } catch (error) {
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Email Section */}
      <div className="mb-8 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Correo de la cuenta</h2>
          <p className="text-xs text-gray-500">Gestión de acceso y notificaciones legales</p>
        </div>
        <div className="flex gap-3">
          <Input 
            value={settings.email}
            onChange={(e) => setSettings({...settings, email: e.target.value})}
            className="flex-1 h-9 text-sm bg-gray-50"
            disabled // El email usualmente requiere un flujo de verificación aparte
          />
          <Button variant="outline" size="sm" className="h-9 text-xs">Cambiar</Button>
        </div>
      </div>

      {/* Language & Interface */}
      <div className="mb-8">
        <Label className="text-sm font-semibold mb-3 block">Idioma de la interfaz</Label>
        <Select value={settings.language} onValueChange={(val) => setSettings({...settings, language: val})}>
          <SelectTrigger className="h-10 bg-white shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications Switch Group */}
      <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Preferencias de comunicación</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Correos de marketing</p>
            <p className="text-xs text-gray-500">Nuevos cursos y promociones</p>
          </div>
          <Switch 
            checked={settings.marketing_emails}
            onCheckedChange={(val) => setSettings({...settings, marketing_emails: val})}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Actualizaciones de cursos</p>
            <p className="text-xs text-gray-500">Actividad en tus cursos inscritos</p>
          </div>
          <Switch 
            checked={settings.course_updates}
            onCheckedChange={(val) => setSettings({...settings, course_updates: val})}
          />
        </div>

        <div className="flex items-center justify-between opacity-60">
          <div>
            <p className="text-sm font-medium">Seguridad (Obligatorio)</p>
            <p className="text-xs text-gray-500">Alertas de inicio de sesión</p>
          </div>
          <Switch checked disabled />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Button variant="ghost" size="sm">Cancelar</Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}