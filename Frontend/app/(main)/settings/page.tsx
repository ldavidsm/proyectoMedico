'use client';
import { useState } from 'react';
import { User, Shield, GraduationCap, Eye } from 'lucide-react';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { ProfessionalProfile } from '@/components/profile/ProfessionalProfile';
import { PrivacySettings } from '@/components/profile/PrivacySettings';

type SettingsTab = 'account' | 'security' | 'professional' | 'privacy';

const tabs = [
  {
    id: 'account' as const,
    label: 'Mi cuenta',
    icon: User,
    description: 'Información personal y preferencias'
  },
  {
    id: 'security' as const,
    label: 'Seguridad',
    icon: Shield,
    description: 'Contraseña y acceso'
  },
  {
    id: 'professional' as const,
    label: 'Perfil profesional',
    icon: GraduationCap,
    description: 'Credenciales y especialidad'
  },
  {
    id: 'privacy' as const,
    label: 'Privacidad',
    icon: Eye,
    description: 'Gestión de datos y privacidad'
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Configuración
          </h1>
          <p className="text-slate-500">
            Gestiona tu cuenta y preferencias
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar de navegación */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-2 space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${
                        isActive ? 'text-white' : 'text-slate-700'
                      }`}>
                        {tab.label}
                      </p>
                      <p className={`text-xs truncate ${
                        isActive ? 'text-purple-200' : 'text-slate-400'
                      }`}>
                        {tab.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Contenido */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
              {activeTab === 'account' && <AccountSettings />}
              {activeTab === 'security' && <SecuritySettings />}
              {activeTab === 'professional' && <ProfessionalProfile />}
              {activeTab === 'privacy' && <PrivacySettings />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
