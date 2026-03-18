import { useState, useEffect } from 'react';
import { Camera, Eye, Info, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProfessionalProfileModal } from './ProfessionalProfileModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ProfessionalData {
  firstName: string;
  lastName: string;
  profileImage: string;
  bio: string;
  contactEmail: string;
  contactPhone: string;
  specialty: string;
  role: string;
  credentials: string;
  isProfessionalComplete: boolean;
}

export function ProfessionalProfile() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfessionalData>({
    firstName: '',
    lastName: '',
    profileImage: '',
    bio: '',
    contactEmail: '',
    contactPhone: '',
    specialty: '',
    role: '',
    credentials: '',
    isProfessionalComplete: false
  });

  const [showProfessionalModal, setShowProfessionalModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch fresh user data from /auth/me to get full_name
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          const nameParts = (userData.full_name || '').trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          setProfile(prev => ({
            ...prev,
            firstName,
            lastName,
            contactEmail: userData.email || '',
            isProfessionalComplete: user.profile_completed || false,
            specialty: user.profile?.specialty?.join(', ') || '',
            role: user.profile?.role || '',
            credentials: user.profile?.collegiateNumber || '',
          }));
        }
      } catch {
        // Fall back to context data
        const nameParts = ((user as any).full_name || user.name || '').trim().split(' ');
        setProfile(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          contactEmail: user.email || '',
          isProfessionalComplete: user.profile_completed || false,
          specialty: user.profile?.specialty?.join(', ') || '',
          role: user.profile?.role || '',
          credentials: user.profile?.collegiateNumber || '',
        }));
      }

      // Try to fetch seller profile for bio/image
      if (user.role === 'seller' || user.role === 'admin') {
        try {
          const sellerRes = await fetch(`${API_URL}/seller-profile/me`, { credentials: 'include' });
          if (sellerRes.ok) {
            const data = await sellerRes.json();
            setProfile(prev => ({
              ...prev,
              bio: data.bio || prev.bio,
              profileImage: data.profile_image || prev.profileImage,
            }));
          }
        } catch {}
      }
      setIsLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfile({ ...profile, profileImage: '' });
  };

  const handleUpdateProfessionalInfo = async (data: any) => {
    setProfile({
      ...profile,
      isProfessionalComplete: true
    });
    setShowProfessionalModal(false);
    await refreshUser();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // 1. Update full_name via profile/account
      const accountRes = await fetch(`${API_URL}/profile/account`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
        }),
      });
      if (!accountRes.ok) {
        const err = await accountRes.json();
        throw new Error(err.detail || 'Error al guardar nombre');
      }

      // 2. Update professional fields via profile/professional
      const profRes = await fetch(`${API_URL}/profile/professional`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          bio: profile.bio,
          contactEmail: profile.contactEmail,
          contact_phone: profile.contactPhone,
          credentials: profile.credentials,
        }),
      });
      if (!profRes.ok) {
        const err = await profRes.json();
        throw new Error(err.detail || 'Error al guardar perfil');
      }

      await refreshUser();
      toast.success('Perfil guardado correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  // Check which items are missing
  const missingItems = {
    profileImage: !profile.profileImage,
    bio: !profile.bio || profile.bio.length < 50,
    specialty: !profile.specialty,
    credentials: !profile.credentials
  };

  const totalMissing = Object.values(missingItems).filter(Boolean).length;

  return (
    <div className="w-full">
      {/* Profile Status Alert */}
      {!profile.isProfessionalComplete && (
        <div className="mb-6 px-4 py-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-0.5">Completa tu perfil profesional</p>
              <p className="text-xs text-gray-600 mb-3">
                Completa tu perfil para acceder a todas las funcionalidades.
              </p>
              <Button
                onClick={() => setShowProfessionalModal(true)}
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 h-8 px-4 text-xs font-medium"
              >
                Completar perfil
              </Button>
            </div>
          </div>
        </div>
      )}

      {profile.isProfessionalComplete && (
        <div className="mb-6 px-4 py-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-0.5">Perfil profesional verificado</p>
                <p className="text-xs text-gray-600">
                  Tu perfil está completo y visible para la comunidad
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowProfessionalModal(true)}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-white border-gray-300 hover:bg-gray-50 flex-shrink-0"
            >
              Actualizar
            </Button>
          </div>
        </div>
      )}

      {/* Profile Photo Section */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Foto de perfil</h2>
          <p className="text-xs text-gray-500">
            Esta foto aparecerá en tu perfil y publicaciones
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Camera size={24} />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-white border-gray-300 hover:bg-gray-50"
              onClick={() => document.getElementById('profile-upload')?.click()}
            >
              Cambiar
            </Button>
            {profile.profileImage && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs bg-white border-gray-300 text-red-600 hover:bg-red-50"
                onClick={handleRemoveImage}
              >
                Eliminar
              </Button>
            )}
          </div>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* Personal Information */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Nombre público</h2>
          <p className="text-xs text-gray-500">
            Este nombre será visible para todos los usuarios
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Nombre
            </Label>
            <Input
              id="firstName"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              placeholder="Tu nombre"
              className="h-9 text-sm bg-white border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Apellido
            </Label>
            <Input
              id="lastName"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              placeholder="Tu apellido"
              className="h-9 text-sm bg-white border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Biografía profesional</h2>
          <p className="text-xs text-gray-500">
            Describe tu experiencia y especialidades
          </p>
        </div>

        <Textarea
          id="bio"
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          placeholder="Escribe una breve descripción sobre tu trayectoria profesional..."
          rows={4}
          className="resize-none text-sm bg-white border-gray-300"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Máximo 500 caracteres
        </p>
      </div>

      {/* Contact Information */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Información de contacto</h2>
          <p className="text-xs text-gray-500">
            Visible para otros profesionales de la plataforma
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="contactEmail" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Email profesional
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={profile.contactEmail}
              onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
              placeholder="ejemplo@correo.com"
              className="h-9 text-sm bg-white border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="contactPhone" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            <Input
              id="contactPhone"
              type="tel"
              value={profile.contactPhone}
              onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })}
              placeholder="+34 600 000 000"
              className="h-9 text-sm bg-white border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Professional Details */}
      <div className="mb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Detalles profesionales</h2>
          <p className="text-xs text-gray-500">
            Tu especialidad y credenciales
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialty" className="text-xs font-medium text-gray-700 mb-1.5 block">
                Especialidad
              </Label>
              <Input
                id="specialty"
                value={profile.specialty}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                placeholder="Ej: Cardiología"
                className="h-9 text-sm bg-white border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="role" className="text-xs font-medium text-gray-700 mb-1.5 block">
                Rol
              </Label>
              <Input
                id="role"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                placeholder="Ej: Médico especialista"
                className="h-9 text-sm bg-white border-gray-300"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="credentials" className="text-xs font-medium text-gray-700 mb-1.5 block">
              Credenciales
            </Label>
            <Input
              id="credentials"
              value={profile.credentials}
              onChange={(e) => setProfile({ ...profile, credentials: e.target.value })}
              placeholder="Ej: Colegiado N° 12345"
              className="h-9 text-sm bg-white border-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Número de colegiado o certificaciones oficiales
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs bg-white border-gray-300 hover:bg-gray-50"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          Ver perfil público
        </Button>
        <div className="flex gap-2">
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

      {/* Professional Profile Modal */}
      <ProfessionalProfileModal
        open={showProfessionalModal}
        onClose={() => setShowProfessionalModal(false)}
        onComplete={handleUpdateProfessionalInfo}
        initialData={profile.isProfessionalComplete ? {
          country: user?.profile?.country || '',
          profession: user?.profile?.role || 'medico',
          educationLevel: user?.profile?.formationLevel || 'especialidad',
          specialties: user?.profile?.specialty || [],
          currentSituation: user?.profile?.professionalStatus || 'ejerciendo',
          isAccredited: user?.profile?.collegiated || false
        } : undefined}
      />
    </div>
  );
}
