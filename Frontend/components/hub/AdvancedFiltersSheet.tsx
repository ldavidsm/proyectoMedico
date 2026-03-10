import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { InlineDropdown } from './InlineDropdown';
import { useState } from 'react';

interface AdvancedFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: AdvancedFilters;
  onApplyFilters: (filters: AdvancedFilters) => void;
}

export interface AdvancedFilters {
  clinicalArea: string[];
  courseLevel: string[];
  modality: string[];
  format: string[];
  duration: [number, number];
  price: [number, number];
  certification: 'with' | 'without' | 'any';
  language: string[];
}

const courseLevels = [
  'Introductorio',
  'Básico',
  'Intermedio',
  'Avanzado',
  'Especialización',
  'Actualización clínica',
];

const modalities = [
  'Online (grabado)',
  'Online + sesiones en directo',
  'Presencial',
  'Híbrido',
];

const formats = [
  'Curso teórico',
  'Curso práctico',
  'Workshop',
  'Programa formativo',
  'Masterclass',
  'Seminario',
];

const languages = ['Español', 'Inglés', 'Portugués', 'Catalán', 'Francés', 'Alemán'];

const allClinicalAreas = [
  'Fisioterapia',
  'Medicina deportiva',
  'Rehabilitación',
  'Neurología',
  'Traumatología',
  'Pediatría',
  'Nutrición funcional',
  'Medicina integrativa',
  'Microbiota',
  'Hormonas',
  'Metabolismo',
  'Dolor crónico',
  'Sistema musculoesquelético',
  'Sistema respiratorio',
  'Sistema cardiovascular',
  'Terapia manual',
  'Osteopatía',
  'Acupuntura',
  'Pilates terapéutico',
  'Ejercicio terapéutico',
];

export function AdvancedFiltersSheet({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
}: AdvancedFiltersSheetProps) {
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);
  const [clinicalAreaSearch, setClinicalAreaSearch] = useState('');

  const filteredClinicalAreas = allClinicalAreas.filter((area) =>
    area.toLowerCase().includes(clinicalAreaSearch.toLowerCase())
  );

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const clearedFilters: AdvancedFilters = {
      clinicalArea: [],
      courseLevel: [],
      modality: [],
      format: [],
      duration: [0, 100],
      price: [0, 500],
      certification: 'any',
      language: [],
    };
    setLocalFilters(clearedFilters);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[480px] p-0 flex flex-col h-full max-h-screen overflow-hidden [&>button]:hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5">
          <SheetHeader className="p-0 text-left space-y-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-xl sm:text-2xl font-semibold text-gray-900 text-left">
                  Filtros avanzados
                </SheetTitle>
                <SheetDescription className="text-sm text-gray-500 mt-1 text-left">
                  Refina tu búsqueda con filtros específicos
                </SheetDescription>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors -mt-1"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </SheetHeader>
        </div>

        {/* Scrollable Content with custom scrollbar */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          <div className="space-y-8">
            {/* Área clínica / Temática */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-base">Área clínica / Temática</h3>
              <InlineDropdown
                value={localFilters.clinicalArea}
                options={allClinicalAreas}
                placeholder="Seleccionar áreas clínicas"
                searchable={true}
                searchPlaceholder="Buscar área clínica..."
                onChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, clinicalArea: value }))
                }
              />
            </div>

            {/* Nivel del curso */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-base">Nivel del curso</h3>
              <div className="flex flex-wrap gap-2">
                {courseLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        courseLevel: toggleArrayItem(prev.courseLevel, level),
                      }))
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${localFilters.courseLevel.includes(level)
                        ? 'bg-slate-700 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Modalidad */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-base">Modalidad</h3>
              <div className="space-y-3">
                {modalities.map((modality) => (
                  <div key={modality} className="flex items-center gap-2">
                    <Checkbox
                      id={`modality-${modality}`}
                      checked={localFilters.modality.includes(modality)}
                      onCheckedChange={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          modality: toggleArrayItem(prev.modality, modality),
                        }))
                      }
                    />
                    <Label
                      htmlFor={`modality-${modality}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {modality}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Formato del curso */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-base">Formato del curso</h3>
              <div className="space-y-3">
                {formats.map((format) => (
                  <div key={format} className="flex items-center gap-2">
                    <Checkbox
                      id={`format-${format}`}
                      checked={localFilters.format.includes(format)}
                      onCheckedChange={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          format: toggleArrayItem(prev.format, format),
                        }))
                      }
                    />
                    <Label
                      htmlFor={`format-${format}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {format}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Duración estimada */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-base">Duración estimada</h3>
              <Slider
                min={0}
                max={100}
                step={5}
                value={localFilters.duration}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, duration: value as [number, number] }))
                }
                className="mb-3"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0h</span>
                <span className="font-medium text-gray-700">
                  {localFilters.duration[0]}h - {localFilters.duration[1]}
                  {localFilters.duration[1] >= 100 ? '+' : ''} h
                </span>
                <span>100+ h</span>
              </div>
            </div>

            {/* Precio */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-base">Precio</h3>
              <Slider
                min={0}
                max={500}
                step={10}
                value={localFilters.price}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, price: value as [number, number] }))
                }
                className="mb-3"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Gratis</span>
                <span className="font-medium text-gray-700">
                  {localFilters.price[0] === 0 ? 'Gratis' : `${localFilters.price[0]}€`} -{' '}
                  {localFilters.price[1]}
                  {localFilters.price[1] >= 500 ? '+' : ''}€
                </span>
                <span>500+ €</span>
              </div>
            </div>

            {/* Certificación */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-base">Certificación</h3>
              <RadioGroup
                value={localFilters.certification}
                onValueChange={(value: 'with' | 'without' | 'any') =>
                  setLocalFilters((prev) => ({ ...prev, certification: value }))
                }
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="with" id="cert-with" />
                  <Label htmlFor="cert-with" className="text-sm text-gray-700 cursor-pointer">
                    Con certificado
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="without" id="cert-without" />
                  <Label htmlFor="cert-without" className="text-sm text-gray-700 cursor-pointer">
                    Sin certificado
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="any" id="cert-any" />
                  <Label htmlFor="cert-any" className="text-sm text-gray-700 cursor-pointer">
                    Indiferente
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Idioma del curso */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-base">Idioma del curso</h3>
              <InlineDropdown
                value={localFilters.language}
                options={languages}
                placeholder="Seleccionar idiomas"
                onChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, language: value }))
                }
              />
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              Limpiar filtros
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-slate-700 hover:bg-slate-800 text-white"
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}