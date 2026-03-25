"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { AdvancedFiltersSheet, AdvancedFilters } from './AdvancedFiltersSheet';
import { CourseSections } from './CourseSections';
import { NotificationsPanel } from './NotificationsPanel';
import { LoginModal } from './LoginModal';
import { Login } from '@/components/auth/auth-login';
import { ProfileCompletionBanner } from './ProfileCompletionBanner';
import { ProfessionalProfileForm } from '@/components/course-id/ProfessionalProfileForm';
import { cn } from '@/lib/utils';

// Dashboard Components
import { CoursesSection } from '@/components/dashboard/CoursesSection';
import { CommunicationSection } from '@/components/dashboard/CommunicationSection';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { ToolsSection } from '@/components/dashboard/ToolsSection';
import { ResourcesSection } from '@/components/dashboard/ResourcesSection';
import { StudentsSection } from '@/components/dashboard/StudentsSection';


export default function Hub() {
  const { user, isAuthenticated, isProfileCompleted, logout, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    clinicalArea: [],
    courseLevel: [],
    modality: [],
    format: [],
    duration: [0, 500],
    price: [0, 5000],
    certification: 'any',
    language: [],
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const [selectedModality, setSelectedModality] = useState<string[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);

  // Read section, google_connected, and google_login from URL query params
  useEffect(() => {
    const section = searchParams.get('section');
    const googleConnected = searchParams.get('google_connected');
    const googleLogin = searchParams.get('google_login');
    if (section) setActiveSection(section);
    if (googleConnected === 'true') {
      toast.success('¡Google Meet conectado correctamente!');
      window.history.replaceState({}, '', '/');
    }
    if (googleLogin === 'success') {
      toast.success('¡Bienvenido! Has iniciado sesión con Google.');
      window.history.replaceState({}, '', '/');
      const redirect = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
      if (redirect && redirect !== '/') {
        router.push(redirect);
      }
    }
  }, [searchParams]);

  const openLoginModal = () => {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    const redirect = sessionStorage.getItem('redirectAfterLogin');
    sessionStorage.removeItem('redirectAfterLogin');
    if (redirect && redirect !== '/' && redirect !== window.location.pathname) {
      router.push(redirect);
    }
  };

  const handleLogout = async () => {
    await logout();
    setActiveSection('home');
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  const handleApplyAdvancedFilters = (filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
    // filters applied
  };

  const renderContent = () => {
    const courseCatalog = (
      <CourseSections
        searchQuery={searchQuery}
        selectedLevel={selectedLevel}
        selectedModality={selectedModality}
        advancedFilters={advancedFilters}
      />
    );

    // Si no está autenticado, solo mostramos home (cursos)
    if (!isAuthenticated) {
      return courseCatalog;
    }

    switch (activeSection) {
      case 'creator-courses':
        return <CoursesSection />;
      case 'creator-students':
        return <StudentsSection />;
      case 'creator-comunication':
        return <CommunicationSection />;
      case 'creator-analytics':
        return (
          <Suspense fallback={null}>
            <AnalyticsSection />
          </Suspense>
        );
      case 'creator-tools':
        return <ToolsSection />;
      case 'creators-resources':
        return <ResourcesSection />;
      case 'home':
      default:
        return courseCatalog;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Only on mobile */}
      <MobileHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onFiltersClick={() => setAdvancedFiltersOpen(true)}
        menuOpen={sidebarOpen}
        isAuthenticated={isAuthenticated}
        userName={user?.name || ''}
        onLoginClick={openLoginModal}
        onLogout={handleLogout}
      />

      {/* Sidebar - Desktop: Fixed, Mobile: Drawer - Only show if authenticated */}
      {isAuthenticated && (
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            setNotificationsPanelOpen(false); // Cerrar notificaciones al cambiar de sección
          }}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
          onNotificationsClick={() => {
            setSidebarOpen(false);
            setNotificationsPanelOpen(!notificationsPanelOpen);
          }}
          notificationsPanelOpen={notificationsPanelOpen}
        />
      )}

      {/* Main Content */}
      <div className={cn(
        "flex flex-col h-screen pt-[120px] md:pt-0 transition-all duration-300",
        isAuthenticated ? "md:ml-16" : "md:ml-0"
      )}>
        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden md:block flex-shrink-0 bg-white sticky top-0 z-20">
          <Header
            onOpenAdvancedFilters={() => setAdvancedFiltersOpen(true)}
            selectedLevel={selectedLevel}
            selectedModality={selectedModality}
            selectedCertification={selectedCertification}
            onLevelChange={(level) => setSelectedLevel(toggleArrayItem(selectedLevel, level))}
            onModalityChange={(modality) => setSelectedModality(toggleArrayItem(selectedModality, modality))}
            onCertificationChange={(cert) => setSelectedCertification(toggleArrayItem(selectedCertification, cert))}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isAuthenticated={isAuthenticated}
            userName={user?.name || ''}
            userEmail={user?.email || ''}
            onLoginClick={openLoginModal}
            onLogout={handleLogout}
          />
        </div>

        {/* Profile completion banner */}
        {isAuthenticated && !isProfileCompleted && user?.role !== 'seller' && (
          <ProfileCompletionBanner
            onComplete={() => setIsProfileFormOpen(true)}
          />
        )}

        {/* Dynamic Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Advanced Filters Sheet */}
      <AdvancedFiltersSheet
        open={advancedFiltersOpen}
        onOpenChange={setAdvancedFiltersOpen}
        filters={advancedFilters}
        onApplyFilters={handleApplyAdvancedFilters}
      />

      {/* Notifications Panel - Only show if authenticated */}
      {isAuthenticated && (
        <NotificationsPanel
          open={notificationsPanelOpen}
          onOpenChange={setNotificationsPanelOpen}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      // The modal content itself handles the login logic via the Login component below
      >
        <Login isModal={true} onSuccess={handleLoginSuccess} />
      </LoginModal>

      {/* Professional Profile Form Modal */}
      {isProfileFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <ProfessionalProfileForm
              onClose={() => setIsProfileFormOpen(false)}
              onComplete={() => {
                setIsProfileFormOpen(false);
                refreshUser();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}