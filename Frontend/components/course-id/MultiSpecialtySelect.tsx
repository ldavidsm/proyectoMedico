import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';

const SPECIALTIES = [
  'Medicina Interna',
  'Medicina de Familia',
  'Pediatría',
  'Geriatría',
  'Cardiología',
  'Neumología',
  'Gastroenterología',
  'Nefrología',
  'Neurología',
  'Psiquiatría',
  'Endocrinología',
  'Reumatología',
  'Dermatología',
  'Alergología',
  'Hematología',
  'Oncología Médica',
  'Medicina Intensiva',
  'Urgencias y Emergencias',
  'Anestesiología y Reanimación',
  'Cirugía General',
  'Cirugía Cardiovascular',
  'Neurocirugía',
  'Cirugía Torácica',
  'Traumatología y Ortopedia',
  'Obstetricia y Ginecología',
  'Oftalmología',
  'Otorrinolaringología',
  'Urología',
  'Cirugía Pediátrica',
  'Cirugía Plástica y Reparadora',
  'Medicina Preventiva y Salud Pública',
  'Medicina del Trabajo',
  'Medicina Legal y Forense',
  'Medicina del Deporte',
  'Rehabilitación',
  'Radiología y Diagnóstico por Imagen',
  'Medicina Nuclear',
  'Análisis Clínicos',
  'Microbiología y Parasitología',
  'Inmunología',
  'Bioquímica Clínica',
  'Farmacología Clínica',
  'Anatomía Patológica',
  'Genética Médica',
  'Nutrición Clínica',
  'Medicina Integrativa',
  'Medicina Tradicional China',
  'Acupuntura',
  'Fitoterapia',
  'Homeopatía',
  'Osteopatía',
  'Naturopatía',
  'Enfermería General',
  'Enfermería Pediátrica',
  'Enfermería de Salud Mental',
  'Enfermería Geriátrica',
  'Enfermería Comunitaria',
  'Enfermería de Cuidados Intensivos',
  'Fisioterapia Deportiva',
  'Fisioterapia Neurológica',
  'Fisioterapia Respiratoria',
  'Fisioterapia Traumatológica',
  'Psicología Clínica',
  'Psicología Sanitaria',
  'Neuropsicología',
  'Psicología Infantil',
  'Farmacia Hospitalaria',
  'Farmacia Comunitaria',
  'Nutrición y Dietética',
  'Odontología General',
  'Ortodoncia',
  'Periodoncia',
  'Endodoncia',
  'Cirugía Oral y Maxilofacial',
  'Biología Molecular',
  'Bioquímica',
  'Investigación Biomédica',
  'Otra especialidad',
];

interface MultiSpecialtySelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
  error?: boolean;
}

export function MultiSpecialtySelect({ 
  value = [], 
  onChange, 
  maxSelections = 3,
  error = false 
}: MultiSpecialtySelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelect = (specialty: string) => {
    const isSelected = value.includes(specialty);
    
    if (isSelected) {
      // Deseleccionar
      onChange(value.filter((s) => s !== specialty));
    } else {
      // Seleccionar solo si no se ha alcanzado el máximo
      if (value.length < maxSelections) {
        const newValue = [...value, specialty];
        onChange(newValue);
        // Cerrar el popover si se alcanza el máximo
        if (newValue.length >= maxSelections) {
          setOpen(false);
          setSearchTerm('');
        }
      }
    }
  };

  const handleRemove = (specialty: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onChange(value.filter((s) => s !== specialty));
  };

  // Filtrar especialidades basado en el término de búsqueda
  const filteredSpecialties = SPECIALTIES.filter(specialty =>
    specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between h-auto min-h-10 ${error ? 'border-red-500' : ''}`}
          >
            <div className="flex flex-wrap gap-1.5 flex-1 text-left">
              {value.length === 0 ? (
                <span className="text-slate-500">Seleccione hasta {maxSelections} especialidades...</span>
              ) : (
                value.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    {specialty}
                    <button
                      type="button"
                      className="ml-1.5 rounded-full outline-none hover:bg-blue-200 transition-colors"
                      onClick={(e) => handleRemove(specialty, e)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <div className="flex flex-col">
            {/* Barra de búsqueda */}
            <div className="p-2 border-b">
              <Input
                placeholder="Buscar especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>
            
            {/* Lista de especialidades */}
            <ScrollArea className="h-[300px]">
              <div className="p-1">
                {filteredSpecialties.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-500">
                    No se encontraron especialidades.
                  </div>
                ) : (
                  filteredSpecialties.map((specialty) => {
                    const isSelected = value.includes(specialty);
                    const isDisabled = !isSelected && value.length >= maxSelections;
                    
                    return (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => !isDisabled && handleSelect(specialty)}
                        disabled={isDisabled}
                        className={`
                          w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm text-left
                          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'}
                          ${isSelected ? 'bg-slate-100' : ''}
                        `}
                      >
                        <div className={`w-4 h-4 flex items-center justify-center ${isSelected ? '' : 'opacity-0'}`}>
                          <Check className="h-4 w-4 text-blue-600" />
                        </div>
                        <span>{specialty}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Mensaje de límite alcanzado */}
            {value.length >= maxSelections && (
              <div className="border-t px-3 py-2 text-xs text-slate-600 bg-slate-50">
                Máximo de {maxSelections} especialidades alcanzado
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {value.length > 0 && (
        <p className="text-xs text-slate-600">
          {value.length} de {maxSelections} seleccionadas
        </p>
      )}
    </div>
  );
}