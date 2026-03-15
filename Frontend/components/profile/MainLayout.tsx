import { useState } from 'react';
import { Settings, BookOpen } from 'lucide-react';
import { SettingsLayout } from '@/components/profile/SettingsLayout';
import { MyLearning } from '@/components/profile/MyLearning';
import profileImage from "figma:asset/8e5bc810bf72b8d10a846ae776aab2db43ff4ff1.png";

type ViewType = 'learning' | 'settings';

export function MainLayout() {
  const [currentView, setCurrentView] = useState<ViewType>('settings');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 fixed h-full">
        <div className="flex flex-col items-center gap-6">
          {/* Learning Icon */}
          <button
            onClick={() => setCurrentView('learning')}
            className={`group flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${currentView === 'learning'
                ? 'bg-teal-50'
                : 'hover:bg-gray-50'
              }`}
            title="Mi aprendizaje"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${currentView === 'learning'
                ? 'border-teal-500 bg-teal-500'
                : 'border-gray-300 group-hover:border-teal-400 group-hover:bg-teal-50'
              }`}>
              <BookOpen className={`w-6 h-6 ${currentView === 'learning'
                  ? 'text-white'
                  : 'text-gray-600 group-hover:text-teal-600'
                }`} />
            </div>
            <span className={`text-xs font-medium ${currentView === 'learning'
                ? 'text-teal-600'
                : 'text-gray-600'
              }`}>
              Cursos
            </span>
          </button>

          {/* Settings Gear */}
          <button
            onClick={() => setCurrentView('settings')}
            className={`group flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${currentView === 'settings'
                ? 'bg-teal-50'
                : 'hover:bg-gray-50'
              }`}
            title="Configuración"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${currentView === 'settings'
                ? 'border-teal-500 bg-teal-500'
                : 'border-gray-300 group-hover:border-teal-400 group-hover:bg-teal-50'
              }`}>
              <Settings className={`w-6 h-6 ${currentView === 'settings'
                  ? 'text-white'
                  : 'text-gray-600 group-hover:text-teal-600'
                }`} />
            </div>
            <span className={`text-xs font-medium ${currentView === 'settings'
                ? 'text-teal-600'
                : 'text-gray-600'
              }`}>
              Config
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-20">
        {/* Content Area */}
        <div className="min-h-screen">
          {currentView === 'learning' && <MyLearning />}
          {currentView === 'settings' && <SettingsLayout />}
        </div>
      </div>
    </div>
  );
}