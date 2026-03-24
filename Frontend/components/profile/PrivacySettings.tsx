'use client';

import { useState } from 'react';
import { Eye, MapPin, Database, Cookie } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function PrivacySettings() {
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public');
  const [activityStatus, setActivityStatus] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [dataCollection, setDataCollection] = useState('essential');
  const [personalization, setPersonalization] = useState('full');
  const [cookies, setCookies] = useState('all');

  return (
    <div>
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
          className="bg-purple-600 hover:bg-purple-700 h-9 px-4 text-xs font-medium"
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}