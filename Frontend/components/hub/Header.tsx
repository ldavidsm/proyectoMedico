import { Search, ChevronDown, SlidersHorizontal, LogIn, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onOpenAdvancedFilters: () => void;
  selectedLevel: string[];
  selectedModality: string[];
  selectedCertification: string[];
  onLevelChange: (level: string) => void;
  onModalityChange: (modality: string) => void;
  onCertificationChange: (certification: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAuthenticated: boolean;
  userName?: string;
  userEmail?: string;
  onLoginClick: () => void;
  onLogout: () => void;
}

export function Header({
  onOpenAdvancedFilters,
  selectedLevel,
  selectedModality,
  selectedCertification,
  onLevelChange,
  onModalityChange,
  onCertificationChange,
  searchQuery,
  onSearchChange,
  isAuthenticated,
  userName,
  userEmail,
  onLoginClick,
  onLogout,
}: HeaderProps) {
  const levelOptions = ['Introductorio', 'Básico', 'Intermedio', 'Avanzado', 'Especialización', 'Actualización'];
  const modalityOptions = ['Online (grabado)', 'Online + sesiones en directo', 'Presencial', 'Híbrido'];
  const certificationOptions = ['KIN McNeill', 'La Collective'];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Logo, Title and User Authentication */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Formación Profesional en Salud</h1>
              <p className="text-sm text-gray-500">Cursos especializados para profesionales de la salud</p>
            </div>
          </div>

          {/* User Authentication Button */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{userName}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Cerrar sesión
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <LogIn className="w-5 h-5" />
              <span>Iniciar sesión</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por curso, especialidad o instructor..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-3">
          {/* Nivel Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center justify-between w-[200px] px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 13L12 4L21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 13V20H17V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Nivel
                  {selectedLevel.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                      {selectedLevel.length}
                    </span>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" alignOffset={0} sideOffset={8} className="w-[200px]" onCloseAutoFocus={(e) => e.preventDefault()}>
              {levelOptions.map((level) => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={selectedLevel.includes(level)}
                  onCheckedChange={() => onLevelChange(level)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {level}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Modalidad Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center justify-between w-[200px] px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
                    <path d="M9 21V9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Modalidad
                  {selectedModality.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                      {selectedModality.length}
                    </span>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" alignOffset={0} sideOffset={8} className="w-[200px]" onCloseAutoFocus={(e) => e.preventDefault()}>
              {modalityOptions.map((modality) => (
                <DropdownMenuCheckboxItem
                  key={modality}
                  checked={selectedModality.includes(modality)}
                  onCheckedChange={() => onModalityChange(modality)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {modality}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Certificación Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center justify-between w-[200px] px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Certificación
                  {selectedCertification.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                      {selectedCertification.length}
                    </span>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" alignOffset={0} sideOffset={8} className="w-[200px]" onCloseAutoFocus={(e) => e.preventDefault()}>
              {certificationOptions.map((cert) => (
                <DropdownMenuCheckboxItem
                  key={cert}
                  checked={selectedCertification.includes(cert)}
                  onCheckedChange={() => onCertificationChange(cert)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {cert}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Advanced Filters Button */}
          <button
            onClick={onOpenAdvancedFilters}
            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros avanzados
          </button>
        </div>
      </div>
    </header>
  );
}