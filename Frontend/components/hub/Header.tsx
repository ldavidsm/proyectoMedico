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
  const levelOptions = ['Introductorio', 'B\u00e1sico', 'Intermedio', 'Avanzado', 'Especializaci\u00f3n', 'Actualizaci\u00f3n'];
  const modalityOptions = ['Online (grabado)', 'Online + sesiones en directo', 'Presencial', 'H\u00edbrido'];
  const certificationOptions = ['KIN McNeill', 'La Collective'];

  return (
    <header className="bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-6 py-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Logo, Title and User Authentication */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-bold text-base">H</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">HealthLearn</h1>
              <p className="text-xs text-slate-500">Formaci\u00f3n para profesionales de la salud</p>
            </div>
          </div>

          {/* User Authentication Button */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200 shadow-sm">
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
                  Cerrar sesi\u00f3n
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-4 py-2 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white rounded-xl transition-all duration-200 font-medium text-sm"
            >
              <LogIn className="w-5 h-5" />
              <span>Iniciar sesi\u00f3n</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4 flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar cursos, especialidades..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-3">
          {/* Nivel Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`inline-flex items-center justify-between w-[200px] px-3 py-2 text-sm border rounded-lg transition-colors cursor-pointer ${
                selectedLevel.length > 0
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600'
              }`}>
                <span className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 13L12 4L21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 13V20H17V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Nivel
                  {selectedLevel.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded">
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
              <button className={`inline-flex items-center justify-between w-[200px] px-3 py-2 text-sm border rounded-lg transition-colors cursor-pointer ${
                selectedModality.length > 0
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600'
              }`}>
                <span className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
                    <path d="M9 21V9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Modalidad
                  {selectedModality.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded">
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
              <button className={`inline-flex items-center justify-between w-[200px] px-3 py-2 text-sm border rounded-lg transition-colors cursor-pointer ${
                selectedCertification.length > 0
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600'
              }`}>
                <span className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Certificaci\u00f3n
                  {selectedCertification.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded">
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
            className="inline-flex items-center px-3 py-2 text-sm font-medium border border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 rounded-lg transition-colors cursor-pointer gap-1.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros avanzados
          </button>
        </div>
      </div>
    </header>
  );
}
