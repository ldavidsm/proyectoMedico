"use client";
import { useState } from 'react';
import { CheckCircle2, Info, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { authService } from '@/lib/auth-sevice';
import { toast } from "sonner";

export function SecuritySettings() {
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handlePasswordChange = async () => {
    if (passData.new !== passData.confirm) {
      return toast.error("Las contraseñas no coinciden");
    }
    setIsLoading(true);
    try {
      await authService.updatePassword(passData.current, passData.new);
      toast.success("Contraseña actualizada correctamente");
      setShowPasswordForm(false);
      setPassData({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* 2FA Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Autenticación de dos factores (2FA)</h2>
          <p className="text-xs text-gray-500">Protección extra para tu cuenta profesional</p>
        </div>

        {!twoFactorEnabled ? (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-4">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-blue-800 mb-3">
                Recomendamos activar 2FA para proteger tus certificados y datos de colegiado.
              </p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8" onClick={() => setTwoFactorEnabled(true)}>
                Configurar 2FA
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">2FA Activado</span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-red-600">Desactivar</Button>
          </div>
        )}
      </section>

      {/* Password Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Contraseña</h2>
        </div>

        {!showPasswordForm ? (
          <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>
            Cambiar contraseña
          </Button>
        ) : (
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium">Contraseña actual</Label>
                <Input 
                  type="password" 
                  value={passData.current}
                  onChange={(e) => setPassData({...passData, current: e.target.value})}
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Nueva contraseña</Label>
                <Input 
                  type="password" 
                  value={passData.new}
                  onChange={(e) => setPassData({...passData, new: e.target.value})}
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Confirmar nueva contraseña</Label>
                <Input 
                  type="password" 
                  value={passData.confirm}
                  onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                  className="bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(false)}>Cancelar</Button>
              <Button 
                size="sm" 
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={handlePasswordChange}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
                Actualizar Contraseña
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}