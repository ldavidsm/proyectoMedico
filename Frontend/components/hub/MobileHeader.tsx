import { Search, SlidersHorizontal, LogIn, User } from 'lucide-react';
import Link from 'next/link';
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
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-sm z-30">
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
                  className={`absolute left-0 w-5 h-0.5 bg-slate-700 transition-all duration-300 ease-out ${menuOpen ? 'top-[7px] rotate-45' : 'top-0 rotate-0'
                    }`}
                />
                {/* Middle line */}
                <span
                  className={`absolute left-0 top-[7px] w-5 h-0.5 bg-slate-700 transition-all duration-300 ease-out ${menuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                    }`}
                />
                {/* Bottom line */}
                <span
                  className={`absolute left-0 w-5 h-0.5 bg-slate-700 transition-all duration-300 ease-out ${menuOpen ? 'top-[7px] -rotate-45' : 'top-[14px] rotate-0'
                    }`}
                />
              </div>
            </div>
          </button>

          {/* Center: Logo */}
          <Link href="/" className="flex items-center gap-2 flex-1 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-slate-900 text-sm leading-none">HealthLearn</span>
          </Link>

          {/* Right: User Authentication and Filters */}
          <div className="flex items-center gap-2">
            {/* User Button */}
            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200"
                aria-label={userName}
                title={`Cerrar sesión - ${userName}`}
              >
                <User className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="p-2 border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-200"
                aria-label="Iniciar sesión"
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}

            {/* Filters Button */}
            <button
              onClick={onFiltersClick}
              className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200"
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
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200"
          >
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Buscar cursos, especialidades...</span>
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
