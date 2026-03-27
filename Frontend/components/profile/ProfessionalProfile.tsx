import { useState, useEffect } from 'react';
import { Camera, Eye, Info, CheckCircle2, Loader2, GraduationCap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ProfessionalProfileModal } from './ProfessionalProfileModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

import { inputClass } from '@/lib/styles';

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
  const [pendingPhotoFile, setPendingPhotoFile] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

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
            profileImage: userData.profile_image || prev.profileImage,
            isProfessionalComplete: user.profile_completed || false,
            specialty: user.profile?.specialty?.join(', ') || '',
            role: user.profile?.role || '',
            credentials: user.profile?.collegiateNumber || '',
          }));
        }
      } catch {
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

      // Fetch contact_phone and bio from /profile/account
      try {
        const accountRes = await fetch(`${API_URL}/profile/account`, { credentials: 'include' });
        if (accountRes.ok) {
          const accountData = await accountRes.json();
          setProfile(prev => ({
            ...prev,
            contactPhone: accountData.contact_phone || '',
            bio: accountData.bio || prev.bio,
          }));
        }
      } catch {
        // silencioso
      }

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
        } catch (err) {
          if (process.env.NODE_ENV === 'development') console.error('Error fetching profile:', err);
        }
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
        const base64 = reader.result as string;
        setProfile({ ...profile, profileImage: base64 });
        setPendingPhotoFile(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/photo`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setProfile({ ...profile, profileImage: '' });
        setPendingPhotoFile(null);
        await refreshUser();
        toast.success('Foto eliminada');
      } else {
        toast.error('Error al eliminar la foto');
      }
    } catch {
      toast.error('Error al eliminar la foto');
    }
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

      // Upload photo if pending
      if (pendingPhotoFile) {
        const photoRes = await fetch(`${API_URL}/profile/photo`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: pendingPhotoFile }),
        });
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          if (photoData.profile_image) {
            setProfile(prev => ({
              ...prev,
              profileImage: photoData.profile_image,
            }));
          }
          setPendingPhotoFile(null);
        }
      }

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
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Profile not complete — action view
  if (!profile.isProfessionalComplete) {
    return (
      <div>
        <div className="text-center py-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-5">
            <GraduationCap className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Completa tu perfil profesional
          </h3>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto text-sm">
            Verifica tus credenciales para acceder a contenido clínico avanzado y aumentar tu credibilidad.
          </p>
          <button
            onClick={() => setShowProfessionalModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-sm text-sm"
          >
            Completar perfil
          </button>
        </div>

        <ProfessionalProfileModal
          open={showProfessionalModal}
          onClose={() => setShowProfessionalModal(false)}
          onComplete={handleUpdateProfessionalInfo}
          initialData={undefined}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Verified badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full w-fit">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-xs font-semibold text-emerald-700">
            Perfil verificado
          </span>
        </div>
        <button
          onClick={() => setShowProfessionalModal(true)}
          className="border border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 font-medium py-2 px-4 rounded-xl transition-all duration-200 text-xs"
        >
          Actualizar credenciales
        </button>
      </div>

      {/* Profile Photo Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Foto de perfil</h2>
        <p className="text-sm text-slate-400 mb-4">
          Esta foto aparecerá en tu perfil y publicaciones
        </p>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {profile.firstName ? profile.firstName[0].toUpperCase() : <Camera size={24} />}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => document.getElementById('profile-upload')?.click()}
              className="border border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 font-medium py-2.5 px-5 rounded-xl transition-all duration-200 text-sm"
            >
              Cambiar
            </button>
            {profile.profileImage && (
              <button
                onClick={handleRemoveImage}
                className="border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-300 font-medium py-2.5 px-5 rounded-xl transition-all duration-200 text-sm"
              >
                Eliminar
              </button>
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
      <div className="border-t border-slate-100 pt-6 mt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Nombre público</h2>
        <p className="text-sm text-slate-400 mb-4">
          Este nombre será visible para todos los usuarios
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nombre
            </label>
            <input
              id="firstName"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              placeholder="Tu nombre"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Apellido
            </label>
            <input
              id="lastName"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              placeholder="Tu apellido"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="border-t border-slate-100 pt-6 mt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Biografía profesional</h2>
        <p className="text-sm text-slate-400 mb-4">
          Describe tu experiencia y especialidades
        </p>

        <Textarea
          id="bio"
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          placeholder="Escribe una breve descripción sobre tu trayectoria profesional..."
          rows={4}
          className="resize-none text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
        />
        <p className="text-xs text-slate-400 mt-1.5">
          Máximo 500 caracteres
        </p>
      </div>

      {/* Contact Information */}
      <div className="border-t border-slate-100 pt-6 mt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Información de contacto</h2>
        <p className="text-sm text-slate-400 mb-4">
          Visible para otros profesionales de la plataforma
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email profesional
            </label>
            <input
              id="contactEmail"
              type="email"
              value={profile.contactEmail}
              onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
              placeholder="ejemplo@correo.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Teléfono <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              id="contactPhone"
              type="tel"
              value={profile.contactPhone}
              onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })}
              placeholder="+34 600 000 000"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Professional Details */}
      <div className="border-t border-slate-100 pt-6 mt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Detalles profesionales</h2>
        <p className="text-sm text-slate-400 mb-4">
          Tu especialidad y credenciales
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Especialidad</p>
            <p className="text-sm font-semibold text-slate-900">{profile.specialty || '—'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Rol</p>
            <p className="text-sm font-semibold text-slate-900">{profile.role || '—'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 sm:col-span-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Credenciales</p>
            <p className="text-sm font-semibold text-slate-900">{profile.credentials || '—'}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-100 pt-6 mt-6 flex flex-col-reverse sm:flex-row justify-between gap-3">
        <button
          className="border border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 font-medium py-2.5 px-5 rounded-xl transition-all duration-200 text-sm flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          Ver perfil público
        </button>
        <div className="flex gap-2">
          <button
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
