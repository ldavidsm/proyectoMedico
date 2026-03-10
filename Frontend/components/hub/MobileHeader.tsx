import { Search, SlidersHorizontal, LogIn, User } from 'lucide-react';
import { useState } from 'react';
import { NotificationsPanel } from './NotificationsPanel';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onSearchClick?: () => void;
  onFiltersClick?: () => void;
  menuOpen?: boolean;
  isAuthenticated: boolean;
  userName?: string;
  onLoginClick: () => void;
  onLogout: () => void;
}

export function MobileHeader({ onMenuClick, onSearchClick, onFiltersClick, menuOpen = false, isAuthenticated, userName, onLoginClick, onLogout }: MobileHeaderProps) {
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
        {/* Top Row: Hamburger, Logo, and Filters */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Left: Animated Hamburger Menu */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2 relative"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {/* Animated Hamburger to X */}
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="relative w-5 h-4">
                {/* Top line */}
                <span
                  className={`absolute left-0 w-5 h-0.5 bg-gray-700 transition-all duration-300 ease-out ${menuOpen ? 'top-[7px] rotate-45' : 'top-0 rotate-0'
                    }`}
                />
                {/* Middle line */}
                <span
                  className={`absolute left-0 top-[7px] w-5 h-0.5 bg-gray-700 transition-all duration-300 ease-out ${menuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                    }`}
                />
                {/* Bottom line */}
                <span
                  className={`absolute left-0 w-5 h-0.5 bg-gray-700 transition-all duration-300 ease-out ${menuOpen ? 'top-[7px] -rotate-45' : 'top-[14px] rotate-0'
                    }`}
                />
              </div>
            </div>
          </button>

          {/* Center: Logo */}
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-sm leading-none">Formación Salud</span>
          </div>

          {/* Right: User Authentication and Filters */}
          <div className="flex items-center gap-2">
            {/* User Button */}
            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label={userName}
                title={`Cerrar sesión - ${userName}`}
              >
                <User className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Iniciar sesión"
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}

            {/* Filters Button */}
            <button
              onClick={onFiltersClick}
              className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Abrir filtros"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Search Bar */}
        <div className="px-4 pb-3">
          <button
            onClick={onSearchClick}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-left text-sm text-gray-500"
          >
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>Buscar cursos...</span>
          </button>
        </div>
      </header>

      {/* Notifications Panel */}
      <NotificationsPanel
        open={notificationsPanelOpen}
        onOpenChange={setNotificationsPanelOpen}
      />
    </>
  );
}