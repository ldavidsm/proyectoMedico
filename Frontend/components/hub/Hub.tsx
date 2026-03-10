"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { AdvancedFiltersSheet, AdvancedFilters } from './AdvancedFiltersSheet';
import { CourseSections } from './CourseSections';
import { Course } from './CourseGrid';
import { NotificationsPanel } from './NotificationsPanel';
import { LoginModal } from './LoginModal';
import { Login } from '@/components/auth/auth-login';
import { cn } from '@/lib/utils';

// Dashboard Components
import { CoursesSection } from '@/components/dashboard/CoursesSection';
import { CommunicationSection as CommunicationSectionNew } from '@/components/dashboard/CommunicationSectionNew';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { ToolsSection } from '@/components/dashboard/ToolsSection';
import { ResourcesSection } from '@/components/dashboard/ResourcesSection';

// Mock data para los cursos seleccionados
const selectedCourses: Course[] = [
  {
    id: 's1',
    title: 'What is proponi faucis Ut Colombia in March',
    instructor: {
      name: 'Dra. Vivian Morales',
      title: 'Especialista en Medicina Funcional',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    description: 'Explora este intenso curso que te ayudará a comprender mejor los fundamentos de la anatomía.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80',
    level: 'Intermedio',
    modality: 'Online + directo',
    enrolled: 1245,
    category: 'Fisioterapia',
  },
  {
    id: 's2',
    title: 'What is proponi faucis Ut Colombia in March',
    instructor: {
      name: 'Dra. Vivian Morales',
      title: 'Especialista en Medicina Funcional',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    description: 'Explora este intenso curso que te ayudará a comprender mejor los fundamentos de la anatomía y sus aplicaciones clínicas modernas.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    level: 'Básico',
    modality: 'Online (grabado)',
    enrolled: 987,
    category: 'Fisioterapia',
  },
  {
    id: 's3',
    title: 'What is proponi faucis Ut Colombia in March',
    instructor: {
      name: 'Dra. Vivian Morales',
      title: 'Especialista en Medicina Funcional',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    description: 'Explora este intenso curso que te ayudará a comprender mejor los fundamentos de la anatomía.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    level: 'Avanzado',
    modality: 'Presencial',
    enrolled: 754,
    category: 'Fisioterapia',
  },
];

// Mock data para cursos populares
const popularCourses: Course[] = [
  {
    id: 'p1',
    title: 'What is proponi faucis Ut Colombia in March',
    instructor: {
      name: 'Dra. Vivian Morales',
      title: 'Especialista en Medicina Funcional',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    description: 'Explora este intenso curso que te ayudará a comprender mejor los fundamentos de la anatomía.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    level: 'Intermedio',
    modality: 'Online + directo',
    enrolled: 2341,
    category: 'Fisioterapia',
  },
  {
    id: 'p2',
    title: 'What is proponi faucis Ut Colombia in March',
    instructor: {
      name: 'Dra. Vivian Morales',
      title: 'Especialista en Medicina Funcional',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    description: 'Explora este intenso curso que te ayudará a comprender mejor los fundamentos de la anatomía y sus aplicaciones.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    level: 'Básico',
    modality: 'Online (grabado)',
    enrolled: 3156,
    category: 'Fisioterapia',
  },
  {
    id: 'p3',
    title: 'What is proponi faucis Ut Colombia in March',
    instructor: {
      name: 'Dra. Vivian Morales',
      title: 'Especialista en Medicina Funcional',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    description: 'Explora este intenso curso que te ayudará a comprender mejor los fundamentos de la anatomía.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
    level: 'Avanzado',
    modality: 'Presencial',
    enrolled: 1876,
    category: 'Fisioterapia',
  },
];

// Mock data para catálogo completo
const allCourses: Course[] = [
  {
    id: 'c1',
    title: 'What is proponi faucis Ut Colombia in March',
    instructor: {
      name: 'Dra. Vivian Morales',
      title: 'Especialista en Medicina Funcional',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    description: 'Explora este intenso curso que te ayudará a comprender mejor los fundamentos de la anatomía.',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&q=80',
    level: 'Intermedio',
    modality: 'Online + directo',
    enrolled: 1245,
    category: 'Fisioterapia',
  },
  {
    id: 'c2',
    title: 'What is proponi faucis Ut Colombia in March',
    instructor: {
      name: 'Dra. Vivian Morales',
      title: 'Especialista en Medicina Funcional',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    description: 'Explora este intenso curso que te ayudará a comprender mejor los fundamentos de la anatomía y sus aplicaciones.',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
    level: 'Básico',
    modality: 'Online (grabado)',
    enrolled: 987,
    category: 'Fisioterapia',
  },
  {
    id: 'c3',
    title: 'What is proponi faucis Ut Colombia in March',
    instructor: {
      name: 'Dra. Vivian Morales',
      title: 'Especialista en Medicina Funcional',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    description: 'Explora este intenso curso que te ayudará a comprender mejor los fundamentos de la anatomía.',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
    level: 'Avanzado',
    modality: 'Presencial',
    enrolled: 754,
    category: 'Fisioterapia',
  },
  {
    id: 'c4',
    title: 'What is proponi faucis Ut Colombia in March',
    instructor: {
      name: 'Dr. Marco Delgado',
      title: 'Fisioterapeuta Especializado',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
    },
    description: 'Aprende las técnicas más efectivas de terapia manual para el tratamiento de lesiones.',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
    level: 'Intermedio',
    modality: 'Online + directo',
    enrolled: 1432,
    category: 'Terapia Manual',
  },
  {
    id: 'c5',
    title: 'What is proponi faucis Ut Colombia in March',
    instructor: {
      name: 'Lic. Ana Martínez',
      title: 'Nutricionista Deportiva',
      avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80',
    },
    description: 'Descubre los principios fundamentales de la nutrición aplicada al deporte de alto rendimiento.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    level: 'Básico',
    modality: 'Online (grabado)',
    enrolled: 2130,
    category: 'Nutrición',
  },
  {
    id: 'c6',
    title: 'What is proponi faucis Ut Colombia in March',
    instructor: {
      name: 'Dr. Carlos Ruiz',
      title: 'Médico Deportivo',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
    },
    description: 'Conoce las últimas técnicas de rehabilitación para lesiones deportivas comunes.',
    image: 'https://images.unsplash.com/photo-1485627941502-d2e6429a8af0?w=800&q=80',
    level: 'Avanzado',
    modality: 'Presencial',
    enrolled: 892,
    category: 'Rehabilitación',
  },
];

export default function Hub() {
  const { user, isAuthenticated, logout } = useAuth();

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

  // Dummy handlers for login modal (login is handled inside the Login component)
  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    // You might want to reload or refresh data here if needed, 
    // but auth context should handle user state update.
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
    console.log('Filters applied:', filters);
  };

  const renderContent = () => {
    // Si no está autenticado, solo mostramos home (cursos)
    if (!isAuthenticated) {
      return (
        <CourseSections
          selectedCourses={selectedCourses}
          popularCourses={popularCourses}
          allCourses={allCourses}
        />
      );
    }

    switch (activeSection) {
      case 'creator-courses':
        return <CoursesSection />;
      case 'creator-comunication':
        return <CommunicationSectionNew />;
      case 'creator-analytics':
        return <AnalyticsSection />;
      case 'creator-tools':
        return <ToolsSection />;
      case 'creators-resources':
        return <ResourcesSection />;
      // case 'settings': 
      //   return <SettingsSection />; // To be implemented
      // case 'learning':
      //   return <LearningSection />; // To be implemented
      case 'home':
      default:
        return (
          <CourseSections
            selectedCourses={selectedCourses}
            popularCourses={popularCourses}
            allCourses={allCourses}
          />
        );
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
        onLoginClick={() => setLoginModalOpen(true)}
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
            onLoginClick={() => setLoginModalOpen(true)}
            onLogout={handleLogout}
          />
        </div>

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
    </div>
  );
}