"use client";
import { useState, useEffect } from 'react';
import { Settings, BookOpen, Lock, LogOut } from 'lucide-react';
import Image from 'next/image'; 
import { ProfessionalVerificationForm } from '@/components/course-id/ProfessionalProfileForm';
import { SettingsLayout } from './SettingsLayout';
import { MyLearning } from './MyLearning';
import { useAuth } from '@/context/AuthContext';

// Importación de imagen estática de Figma
import profileImage from "figma:asset/8e5bc810bf72b8d10a846ae776aab2db43ff4ff1.png";

type ViewType = 'profile' | 'learning' | 'settings';

export function MainLayout() {
  const [currentView, setCurrentView] = useState<ViewType>('profile');
  const { isProfileCompleted, isLoading, user, logout, redirectTo, clearRedirect } = useAuth();

  // Escucha si hay una redirección pendiente después de completar el perfil
  const handleProfileSuccess = () => {
    if (redirectTo === 'learning') {
      setCurrentView('learning');
      clearRedirect(); // Limpiamos la memoria de ruta
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-teal-600 font-medium text-sm">Cargando plataforma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 fixed h-full z-20 justify-between">
        <div className="flex flex-col items-center gap-6 w-full">
          
          {/* Avatar / Perfil */}
          <button
            onClick={() => setCurrentView('profile')}
            className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              currentView === 'profile' ? 'bg-teal-50 text-teal-600' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
              currentView === 'profile' ? 'border-teal-500' : 'border-gray-200 group-hover:border-teal-300'
            }`}>
              <Image 
                src={user?.profile_image || profileImage} 
                alt="Foto de perfil" 
                className="w-full h-full object-cover"
                width={48} 
                height={48}
                priority 
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Perfil</span>
          </button>

          {/* Cursos (Bloqueado si no está verificado) */}
          <button
            onClick={() => isProfileCompleted && setCurrentView('learning')}
            className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              !isProfileCompleted ? 'cursor-not-allowed' :
              currentView === 'learning' ? 'bg-teal-50 text-teal-600' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
              currentView === 'learning' 
                ? 'border-teal-500 bg-teal-500 text-white' 
                : 'border-gray-200 group-hover:border-teal-300'
            }`}>
              {isProfileCompleted ? <BookOpen size={22} /> : <Lock size={18} className="opacity-50" />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Cursos</span>
          </button>

          {/* Ajustes */}
          <button
            onClick={() => setCurrentView('settings')}
            className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              currentView === 'settings' ? 'bg-teal-50 text-teal-600' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
              currentView === 'settings' 
                ? 'border-teal-500 bg-teal-500 text-white' 
                : 'border-gray-200 group-hover:border-teal-300'
            }`}>
              <Settings size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Ajustes</span>
          </button>
        </div>

        {/* Botón Salir */}
        <div className="w-full px-4 pt-6 border-t border-gray-100">
          <button 
            onClick={logout}
            className="w-full flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={22} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Salir</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-20">
        <div className="max-w-6xl mx-auto min-h-screen p-6 md:p-10">
          {currentView === 'profile' && (
            <ProfessionalVerificationForm onSuccess={handleProfileSuccess} />
          )}
          
          {currentView === 'learning' && (
            isProfileCompleted 
              ? <MyLearning /> 
              : <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4 text-gray-400"><Lock size={40} /></div>
                  <h2 className="text-xl font-bold text-gray-800">Contenido Restringido</h2>
                  <p className="text-gray-500 max-w-xs mt-2">Completa tu verificación profesional para acceder a tus cursos.</p>
                  <button 
                    onClick={() => setCurrentView('profile')}
                    className="mt-6 text-teal-600 font-semibold hover:underline"
                  >
                    Ir al formulario de verificación
                  </button>
                </div>
          )}
          
          {currentView === 'settings' && <SettingsLayout />}
        </div>
      </div>
    </div>
  );
}