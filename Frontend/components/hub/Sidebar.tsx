import { Home, Settings, BookOpen, CreditCard, Bell, Wrench, X, BarChart3, Users, Sparkles, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useUnreadCount } from '@/hooks/useNotifications';
import { NotificationsPanel } from '@/components/hub/NotificationsPanel';

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onNotificationsClick?: () => void;
  notificationsPanelOpen?: boolean;
}

export function Sidebar({
  activeSection = 'home',
  onSectionChange = () => { },
  mobileOpen = false,
  onMobileClose = () => { },
  onNotificationsClick,
  notificationsPanelOpen: externalNotifOpen
}: SidebarProps) {
  // Internal notifications state - used when no external handler is provided
  const [internalNotifOpen, setInternalNotifOpen] = useState(false);
  const notificationsPanelOpen = externalNotifOpen ?? internalNotifOpen;
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const unreadCount = useUnreadCount();

  const isCreator = user?.role === 'seller' || user?.role === 'admin';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil de manera reactiva
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // En móvil, el sidebar siempre está expandido cuando está abierto
  // En desktop, está expandido con hover O cuando el panel de notificaciones está abierto
  const shouldBeExpanded = isMobile ? mobileOpen : (isExpanded || notificationsPanelOpen);

  // Prevenir scroll del body cuando el sidebar móvil está abierto
  useEffect(() => {
    if (mobileOpen && typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup cuando el componente se desmonta
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleSectionChange = (section: string) => {
    if (section === 'become-creator') {
      router.push('/become-instructor'); // Assuming this is the route for BecomeCreatorSection
      return;
    }
    onSectionChange(section);
    // Close mobile drawer when a section is selected
    if (window.innerWidth < 768) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-out",
          mobileOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        )}
        onClick={onMobileClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col overflow-hidden",
          // Transiciones optimizadas para móvil y desktop
          "transition-all duration-[350ms] ease-out",
          // Mobile: siempre w-64 cuando está abierto
          mobileOpen ? "w-64" : "w-16",
          // Desktop: cambia entre w-16 y w-64 con hover o cuando notificaciones está abierto
          notificationsPanelOpen ? "md:w-64" : "md:w-16 md:hover:w-64 md:duration-300",
          // Z-index: móvil z-50, desktop z-30, pero z-40 cuando notificaciones está abierto
          notificationsPanelOpen ? "z-40" : "z-50 md:z-30",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        onMouseEnter={() => !isMobile && !notificationsPanelOpen && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && !notificationsPanelOpen && setIsExpanded(false)}
      >
        {/* Header */}
        <div className={cn(
          "p-4 border-b border-gray-200 flex items-center justify-between",
          "transition-opacity duration-200",
          mobileOpen ? "delay-150 opacity-100" : "opacity-100"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center flex-shrink-0">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-2 h-2 bg-teal-400"></div>
                <div className="w-2 h-2 bg-teal-400"></div>
                <div className="w-2 h-2 bg-teal-400"></div>
                <div className="w-2 h-2 bg-teal-400"></div>
              </div>
            </div>
            {shouldBeExpanded && (
              <span className="font-semibold text-gray-900 whitespace-nowrap">Collective Kit</span>
            )}
          </div>

          {/* Botón X solo en móvil */}
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {/* Página principal */}
          <button
            onClick={() => { router.push('/'); handleSectionChange('home'); }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              activeSection === 'home' && !notificationsPanelOpen
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
            title={!shouldBeExpanded ? 'Página principal' : ''}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {shouldBeExpanded && (
              <span className="text-sm text-gray-600 whitespace-nowrap">Página principal</span>
            )}
          </button>

          {/* Mi Perfil - Sección con header no clickeable */}
          {shouldBeExpanded && (
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mi Perfil
            </div>
          )}

          {/* Items de Mi Perfil */}
          <button
            onClick={() => router.push('/settings')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              activeSection === 'settings' && !notificationsPanelOpen
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
            title={!shouldBeExpanded ? 'Configuración' : ''}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {shouldBeExpanded && (
              <span className="text-sm whitespace-nowrap">Configuración</span>
            )}
          </button>

          <button
            onClick={() => router.push('/my-courses')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              activeSection === 'learning' && !notificationsPanelOpen
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
            title={!shouldBeExpanded ? 'Aprendizaje en curso' : ''}
          >
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            {shouldBeExpanded && (
              <span className="text-sm whitespace-nowrap">Mis Cursos</span>
            )}
          </button>

          {/* Notificaciones */}
          <button
            onClick={() => {
              if (onNotificationsClick) {
                onNotificationsClick();
              } else {
                onMobileClose();
                setInternalNotifOpen(!internalNotifOpen);
              }
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
              notificationsPanelOpen
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            )}
            title={!shouldBeExpanded ? 'Notificaciones' : ''}
          >
            <div className="relative flex-shrink-0">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {shouldBeExpanded && (
              <>
                <span className="text-sm whitespace-nowrap">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Perfil de Creador - Solo si es creador */}
          {isCreator && (
            <>
              {/* Separator */}
              {shouldBeExpanded && (
                <div className="pt-2 pb-1">
                  <div className="h-px bg-gray-200"></div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perfil de Creador
                  </div>
                </div>
              )}

              {/* Items de Perfil de Creador */}
              <button
                onClick={() => handleSectionChange('creator-courses')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  activeSection === 'creator-courses' && !notificationsPanelOpen
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                title={!shouldBeExpanded ? 'Cursos' : ''}
              >
                <BookOpen className="w-5 h-5 flex-shrink-0 text-teal-500" />
                {shouldBeExpanded && (
                  <span className="text-sm whitespace-nowrap">Cursos</span>
                )}
              </button>

              <button
                onClick={() => handleSectionChange('creator-comunication')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  activeSection === 'creator-comunication' && !notificationsPanelOpen
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                title={!shouldBeExpanded ? 'Comunicación' : ''}
              >
                <Users className="w-5 h-5 flex-shrink-0 text-teal-500" />
                {shouldBeExpanded && (
                  <span className="text-sm whitespace-nowrap">Comunicación</span>
                )}
              </button>

              <button
                onClick={() => handleSectionChange('creator-analytics')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  activeSection === 'creator-analytics' && !notificationsPanelOpen
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                title={!shouldBeExpanded ? 'Rendimiento' : ''}
              >
                <BarChart3 className="w-5 h-5 flex-shrink-0 text-teal-500" />
                {shouldBeExpanded && (
                  <span className="text-sm whitespace-nowrap">Rendimiento</span>
                )}
              </button>

              <button
                onClick={() => handleSectionChange('creator-tools')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  activeSection === 'creator-tools' && !notificationsPanelOpen
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                title={!shouldBeExpanded ? 'Herramientas' : ''}
              >
                <Wrench className="w-5 h-5 flex-shrink-0 text-teal-500" />
                {shouldBeExpanded && (
                  <span className="text-sm whitespace-nowrap">Herramientas</span>
                )}
              </button>

              <button
                onClick={() => handleSectionChange('creators-resources')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  activeSection === 'creators-resources' && !notificationsPanelOpen
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                title={!shouldBeExpanded ? 'Recursos' : ''}
              >
                <Sparkles className="w-5 h-5 flex-shrink-0 text-teal-500" />
                {shouldBeExpanded && (
                  <span className="text-sm whitespace-nowrap">Recursos</span>
                )}
              </button>
            </>
          )}

          {/* Admin Panel - Solo si es admin */}
          {user?.role === 'admin' && (
            <>
              {shouldBeExpanded && (
                <div className="pt-2 pb-1">
                  <div className="h-px bg-gray-200"></div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administración
                  </div>
                </div>
              )}
              <button
                onClick={() => router.push('/admin')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  "text-gray-700 hover:bg-gray-50"
                )}
                title={!shouldBeExpanded ? 'Panel Admin' : ''}
              >
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-amber-500" />
                {shouldBeExpanded && (
                  <span className="text-sm whitespace-nowrap">Panel Admin</span>
                )}
              </button>
            </>
          )}
        </nav>

        {/* Hacerse Creador Button */}
        {!isCreator && isAuthenticated && (
          <div className="p-3 border-t border-gray-200">
            <Button
              onClick={() => handleSectionChange('become-creator')}
              className={cn(
                "bg-teal-500 hover:bg-teal-600 text-white transition-all font-medium",
                shouldBeExpanded ? "w-full justify-start" : "w-full h-12 p-0 justify-center"
              )}
              title={!shouldBeExpanded ? 'Hacerme Creador' : ''}
            >
              <Wrench className={cn("w-4 h-4 flex-shrink-0", shouldBeExpanded && "mr-2")} />
              {shouldBeExpanded && <span className="whitespace-nowrap">Hacerme Creador</span>}
            </Button>
          </div>
        )}

        {/* Crear curso Button - Solo para creadores */}
        {isCreator && (
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => router.push('/create')}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors",
                !shouldBeExpanded && "px-0"
              )}
              title={!shouldBeExpanded ? 'Crear curso' : ''}
            >
              <Plus className="w-5 h-5 flex-shrink-0" />
              {shouldBeExpanded && <span className="whitespace-nowrap">Crear curso</span>}
            </button>
          </div>
        )}
      </aside>

      {/* Notifications panel - rendered by Sidebar when no external handler */}
      {!onNotificationsClick && (
        <NotificationsPanel
          open={internalNotifOpen}
          onOpenChange={setInternalNotifOpen}
        />
      )}
    </>
  );
}