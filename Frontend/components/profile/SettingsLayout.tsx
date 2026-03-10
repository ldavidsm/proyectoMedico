"use client";
import { useState } from 'react';
import { User, Shield, Lock, Bell } from 'lucide-react';
import { AccountSettings } from './AccountSettings';
import { PrivacySettings } from './PrivacySettings';
import { SecuritySettings } from './SecuritySettings';

type SettingsTab = 'account' | 'privacy' | 'security';

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  const menuItems = [
    { id: 'account', label: 'Cuenta', icon: User },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'security', label: 'Seguridad', icon: Lock },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configuración</h1>
        <p className="text-gray-500 mt-2">Gestiona tu identidad profesional y la seguridad de tu cuenta</p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar de Navegación Local */}
        <aside className="w-full md:w-64 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-teal-50 text-teal-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === item.id ? 'text-teal-600' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </aside>

        {/* Área de Contenido Dinámico */}
        <main className="flex-1 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[500px]">
          {activeTab === 'account' && <AccountSettings />}
          {activeTab === 'privacy' && <PrivacySettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </main>
      </div>
    </div>
  );
}