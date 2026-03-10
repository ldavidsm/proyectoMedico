"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/auth-sevice';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from "sonner";

export function PrivacySettings() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Mapeo inicial con datos del backend si existen
  const [privacy, setPrivacy] = useState({
    profile_visibility: (user?.profile as any)?.visibility || 'public',
    activity_status: true,
    location_sharing: false,
    data_collection: 'essential',
    personalization: 'full',
    cookies: 'all'
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authService.updatePrivacySettings(privacy);
      toast.success("Preferencias de privacidad actualizadas");
    } catch (error) {
      toast.error("Error al guardar privacidad");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Visibilidad del Perfil */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Visibilidad del perfil</h2>
          <p className="text-xs text-gray-500">Define quién accede a tu historial y certificaciones</p>
        </div>
        <RadioGroup 
          value={privacy.profile_visibility} 
          onValueChange={(val: any) => setPrivacy({...privacy, profile_visibility: val})}
          className="space-y-3"
        >
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
            <RadioGroupItem value="public" id="public" className="mt-1" />
            <Label htmlFor="public" className="flex-1 cursor-pointer">
              <span className="text-sm font-medium">Público (Recomendado)</span>
              <p className="text-xs text-gray-500">Colegas y reclutadores pueden ver tus logros.</p>
            </Label>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
            <RadioGroupItem value="private" id="private" className="mt-1" />
            <Label htmlFor="private" className="flex-1 cursor-pointer">
              <span className="text-sm font-medium">Privado</span>
              <p className="text-xs text-gray-500">Solo tú tienes acceso a la información completa.</p>
            </Label>
          </div>
        </RadioGroup>
      </section>

      {/* Switches de Actividad */}
      <section className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="flex-1 pr-4">
            <h3 className="text-sm font-semibold text-gray-900">Estado de actividad</h3>
            <p className="text-xs text-gray-500">Permitir que otros profesionales vean si estás conectado.</p>
          </div>
          <Switch 
            checked={privacy.activity_status}
            onCheckedChange={(val) => setPrivacy({...privacy, activity_status: val})}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="flex-1 pr-4">
            <h3 className="text-sm font-semibold text-gray-900">Compartir ubicación</h3>
            <p className="text-xs text-gray-500">Para eventos y congresos médicos locales.</p>
          </div>
          <Switch 
            checked={privacy.location_sharing}
            onCheckedChange={(val) => setPrivacy({...privacy, location_sharing: val})}
          />
        </div>
      </section>

      <div className="pt-4 flex justify-end gap-3">
        <Button variant="ghost" size="sm">Descartar</Button>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          {isSaving ? "Guardando..." : "Guardar privacidad"}
        </Button>
      </div>
    </div>
  );
}