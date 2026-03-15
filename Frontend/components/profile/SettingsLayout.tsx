"use client";
import { useState } from 'react';
import { User, Lock, UserCircle } from 'lucide-react';
import { ProfessionalProfile } from '@/components/profile/ProfessionalProfile';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { SecuritySettings } from '@/components/profile/SecuritySettings';

type TabType = 'profile' | 'account' | 'security';

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const tabs = [
    { id: 'profile' as TabType, label: 'Perfil', icon: UserCircle },
    { id: 'account' as TabType, label: 'Cuenta', icon: User },
    { id: 'security' as TabType, label: 'Seguridad y Privacidad', icon: Lock }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Configuración</h1>
        <p className="text-sm text-gray-500">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Horizontal Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'profile' && <ProfessionalProfile />}
        {activeTab === 'account' && <AccountSettings />}
        {activeTab === 'security' && <SecuritySettings />}
      </div>
    </div>
  );
}