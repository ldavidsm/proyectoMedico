import { Home, Settings, BookOpen, CreditCard, Bell, Wrench, X, BarChart3, Users, Sparkles, Plus, ShieldCheck, GraduationCap } from 'lucide-react';
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

  const isCreator = user?.role === 'seller';
  const isAdmin = user?.role === 'admin';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isAuthenticated || isCreator || isAdmin) return;
    fetch(`${API_URL}/seller-requests/my-status`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.status) setRequestStatus(data.status); })
      .catch(() => {});
  }, [isAuthenticated, isCreator, isAdmin]);

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

  const creatorSections = ['creator-courses', 'creator-students', 'creator-comunication', 'creator-analytics', 'creator-tools', 'creators-resources'];

  const handleSectionChange = (section: string) => {
    if (section === 'become-creator') {
      router.push('/become-instructor');
      return;
    }
    if (creatorSections.includes(section)) {
      // Navigate to home with section param so it works from any page
      router.push(`/?section=${section}`);
    }
    onSectionChange(section);
    // Close mobile drawer when a section is selected
    if (window.innerWidth < 768) {
      onMobileClose();
    }
  };

  // Helper for nav item classes
  const navItemClass = (section: string) =>
    cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
      activeSection === section && !notificationsPanelOpen
        ? "bg-purple-600 text-white"
        : "text-slate-400 hover:bg-[#1E293B] hover:text-white"
    );

  const navIconClass = (section: string) =>
    cn(
      "w-5 h-5 flex-shrink-0",
      activeSection === section && !notificationsPanelOpen
        ? "text-white"
        : "text-slate-500"
    );

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onMobileClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen flex flex-col overflow-hidden bg-[#0F172A] border-r border-[#1E293B]",
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
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between min-h-[65px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            {shouldBeExpanded && (
              <div>
                <span className="font-bold text-white text-sm whitespace-nowrap tracking-tight">
                  HealthLearn
                </span>
                <p className="text-[10px] text-slate-400 whitespace-nowrap">
                  Formaci\u00f3n m\u00e9dica
                </p>
              </div>
            )}
          </div>

          {/* Botón X solo en móvil */}
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-1 hover:bg-[#1E293B] rounded-lg transition-colors"
              aria-label="Cerrar men\u00fa"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {/* Página principal */}
          <button
            onClick={() => { router.push('/'); handleSectionChange('home'); }}
            className={navItemClass('home')}
            title={!shouldBeExpanded ? 'P\u00e1gina principal' : ''}
          >
            <Home className={navIconClass('home')} />
            {shouldBeExpanded && (
              <span className="text-sm whitespace-nowrap">P\u00e1gina principal</span>
            )}
          </button>

          {/* Mi Perfil - Sección con header no clickeable */}
          {shouldBeExpanded && (
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 py-2">
              Mi Perfil
            </div>
          )}

          {/* Items de Mi Perfil */}
          <button
            onClick={() => router.push('/settings')}
            className={navItemClass('settings')}
            title={!shouldBeExpanded ? 'Configuraci\u00f3n' : ''}
          >
            <Settings className={navIconClass('settings')} />
            {shouldBeExpanded && (
              <span className="text-sm whitespace-nowrap">Configuraci\u00f3n</span>
            )}
          </button>

          <button
            onClick={() => router.push('/my-courses')}
            className={navItemClass('learning')}
            title={!shouldBeExpanded ? 'Aprendizaje en curso' : ''}
          >
            <BookOpen className={navIconClass('learning')} />
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
                ? "bg-purple-600 text-white"
                : "text-slate-400 hover:bg-[#1E293B] hover:text-white"
            )}
            title={!shouldBeExpanded ? 'Notificaciones' : ''}
          >
            <div className="relative flex-shrink-0">
              <Bell className={cn("w-5 h-5", notificationsPanelOpen ? "text-white" : "text-slate-500")} />
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
                  <div className="h-px bg-[#1E293B]"></div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 py-2">
                    Perfil de Creador
                  </div>
                </div>
              )}

              {/* Items de Perfil de Creador */}
              <button
                onClick={() => handleSectionChange('creator-courses')}
                className={navItemClass('creator-courses')}
                title={!shouldBeExpanded ? 'Cursos' : ''}
              >
                <BookOpen className={navIconClass('creator-courses')} />
                {shouldBeExpanded && (
                  <span className="text-sm whitespace-nowrap">Cursos</span>
                )}
              </button>

              <button
                onClick={() => handleSectionChange('creator-students')}
                className={navItemClass('creator-students')}
                title={!shouldBeExpanded ? 'Estudiantes' : ''}
              >
                <GraduationCap className={navIconClass('creator-students')} />
                {shouldBeExpanded && (
                  <span className="text-sm whitespace-nowrap">Estudiantes</span>
                )}
              </button>

              <button
                onClick={() => handleSectionChange('creator-comunication')}
                className={navItemClass('creator-comunication')}
                title={!shouldBeExpanded ? 'Comunicaci\u00f3n' : ''}
              >
                <Users className={navIconClass('creator-comunication')} />
                {shouldBeExpanded && (
                  <span className="text-sm whitespace-nowrap">Comunicaci\u00f3n</span>
                )}
              </button>

              <button
                onClick={() => handleSectionChange('creator-analytics')}
                className={navItemClass('creator-analytics')}
                title={!shouldBeExpanded ? 'Rendimiento' : ''}
              >
                <BarChart3 className={navIconClass('creator-analytics')} />
                {shouldBeExpanded && (
                  <span className="text-sm whitespace-nowrap">Rendimiento</span>
                )}
              </button>

              <button
                onClick={() => handleSectionChange('creator-tools')}
                className={navItemClass('creator-tools')}
                title={!shouldBeExpanded ? 'Herramientas' : ''}
              >
                <Wrench className={navIconClass('creator-tools')} />
                {shouldBeExpanded && (
                  <span className="text-sm whitespace-nowrap">Herramientas</span>
                )}
              </button>

              <button
                onClick={() => handleSectionChange('creators-resources')}
                className={navItemClass('creators-resources')}
                title={!shouldBeExpanded ? 'Recursos' : ''}
              >
                <Sparkles className={navIconClass('creators-resources')} />
                {shouldBeExpanded && (
                  <span className="text-sm whitespace-nowrap">Recursos</span>
                )}
              </button>
            </>
          )}

          {/* Admin Panel - Solo si es admin */}
          {isAdmin && (
            <>
              {shouldBeExpanded && (
                <div className="pt-2 pb-1">
                  <div className="h-px bg-[#1E293B]"></div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 py-2">
                    Administraci\u00f3n
                  </div>
                </div>
              )}
              <button
                onClick={() => router.push('/admin')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  "text-slate-400 hover:bg-[#1E293B] hover:text-white"
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
        {!isCreator && !isAdmin && isAuthenticated && (
          <div className="p-3 border-t border-[#1E293B]">
            <Button
              onClick={() => handleSectionChange('become-creator')}
              className={cn(
                "bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 font-medium",
                shouldBeExpanded ? "w-full justify-start rounded-lg px-3 py-2.5" : "w-full h-10 p-0 justify-center rounded-lg"
              )}
              title={!shouldBeExpanded ? 'Hacerme Creador' : ''}
            >
              <Wrench className={cn("w-4 h-4 flex-shrink-0", shouldBeExpanded && "mr-2")} />
              {shouldBeExpanded && (
                <>
                  <span className="whitespace-nowrap">Hacerme Creador</span>
                  {requestStatus === 'pending' && (
                    <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-medium">
                      En revisi\u00f3n
                    </span>
                  )}
                  {requestStatus === 'rejected' && (
                    <span className="ml-auto text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-medium">
                      No aprobada
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Crear curso Button - Solo para creadores */}
        {isCreator && (
          <div className="p-3 border-t border-[#1E293B]">
            <button
              onClick={() => router.push('/create')}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors",
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
