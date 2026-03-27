'use client';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push('/');
  };

  const initial = user?.name?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2
          rounded-xl hover:bg-slate-100
          transition-colors"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-purple-600 flex-shrink-0">
          {user?.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.name || 'Avatar'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-white text-sm font-bold">
              {initial}
            </span>
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-slate-900
            leading-tight">
            {user?.name || user?.email || 'Usuario'}
          </p>
          <p className="text-xs text-slate-400">
            {user?.role === 'seller' ? 'Instructor' : 'Estudiante'}
          </p>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-slate-400 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white
          rounded-2xl shadow-lg border border-slate-100
          py-2 z-50
          shadow-[0_8px_24px_rgba(0,0,0,0.12)]">

          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.name || 'Usuario'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {user?.email}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => {
                router.push('/settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4
                py-2.5 text-sm text-slate-700
                hover:bg-slate-50 transition-colors text-left"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Configuración
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4
                py-2.5 text-sm text-red-600
                hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
