import { useState, useEffect } from 'react';
import { GraduationCap, Info, Check, ChevronDown, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface ProfessionalData {
  country: string;
  profession: string;
  educationLevel: string;
  specialties: string[];
  currentSituation: string;
  isAccredited: boolean;
  declaration1?: boolean;
  declaration2?: boolean;
}

interface ProfessionalProfileModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: ProfessionalData) => void;
  initialData?: ProfessionalData;
}

export function ProfessionalProfileModal({ open, onClose, onComplete, initialData }: ProfessionalProfileModalProps) {
  const [formData, setFormData] = useState<ProfessionalData>({
    country: '',
    profession: '',
    educationLevel: '',
    specialties: [],
    currentSituation: '',
    isAccredited: false,
    declaration1: false,
    declaration2: false
  });

  const [popoverOpen, setPopoverOpen] = useState(false);

  // Update form data when initialData changes or modal opens
  useEffect(() => {
    if (open && initialData) {
      setFormData({
        ...initialData,
        declaration1: true,
        declaration2: true
      });
    } else if (open && !initialData) {
      // Reset form when opening without initial data
      setFormData({
        country: '',
        profession: '',
        educationLevel: '',
        specialties: [],
        currentSituation: '',
        isAccredited: false,
        declaration1: false,
        declaration2: false
      });
    }
  }, [open, initialData]);

  const availableSpecialties = [
    'Cardiología',
    'Dermatología',
    'Endocrinología',
    'Gastroenterología',
    'Geriatría',
    'Medicina Interna',
    'Neurología',
    'Oncología',
    'Pediatría',
    'Psiquiatría',
    'Traumatología'
  ];

  const handleSpecialtyToggle = (specialty: string) => {
    if (formData.specialties.includes(specialty)) {
      setFormData({
        ...formData,
        specialties: formData.specialties.filter(s => s !== specialty)
      });
    } else if (formData.specialties.length < 3) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty]
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.country &&
      formData.profession &&
      formData.educationLevel &&
      formData.specialties.length > 0 &&
      formData.currentSituation &&
      formData.declaration1 &&
      formData.declaration2
    );
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      onComplete(formData);
    }
  };

  const isEditMode = !!initialData;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Perfil profesional</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {isEditMode ? 'Actualiza tu información profesional' : 'Complete su información para inscribirse en cursos'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Verification Notice */}
          <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-purple-900 mb-1">
                Acceso profesional verificado
              </p>
              <p className="text-purple-800">
                Esta plataforma está dirigida exclusivamente a profesionales del ámbito de la salud. 
                La información recopilada se utiliza únicamente para verificar su cualificación profesional.
              </p>
            </div>
          </div>

          {/* Country */}
          <div>
            <Label htmlFor="country" className="mb-2 block">
              País de ejercicio profesional <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione su país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="argentina">Argentina</SelectItem>
                <SelectItem value="chile">Chile</SelectItem>
                <SelectItem value="colombia">Colombia</SelectItem>
                <SelectItem value="españa">España</SelectItem>
                <SelectItem value="mexico">México</SelectItem>
                <SelectItem value="peru">Perú</SelectItem>
                <SelectItem value="venezuela">Venezuela</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Profession */}
          <div>
            <Label htmlFor="profession" className="mb-2 block">
              Profesión en el ámbito de la salud <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.profession} onValueChange={(value) => setFormData({ ...formData, profession: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione su profesión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medico">Médico</SelectItem>
                <SelectItem value="enfermero">Enfermero/a</SelectItem>
                <SelectItem value="farmaceutico">Farmacéutico/a</SelectItem>
                <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
                <SelectItem value="nutricionista">Nutricionista</SelectItem>
                <SelectItem value="psicologo">Psicólogo/a</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Education Level */}
          <div>
            <Label htmlFor="educationLevel" className="mb-2 block">
              Nivel de formación <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.educationLevel} onValueChange={(value) => setFormData({ ...formData, educationLevel: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione su nivel de formación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="licenciatura">Licenciatura</SelectItem>
                <SelectItem value="especialidad">Especialidad</SelectItem>
                <SelectItem value="maestria">Maestría</SelectItem>
                <SelectItem value="doctorado">Doctorado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specialties */}
          <div>
            <Label className="mb-2 block">
              Especialidad o campo principal <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mb-3">
              Puede seleccionar hasta 3 especialidades
            </p>
            
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between h-10 font-normal text-left"
                  disabled={formData.specialties.length >= 3}
                >
                  <span className="text-gray-500">
                    {formData.specialties.length === 0
                      ? "Seleccione hasta 3 especialidades..."
                      : `${formData.specialties.length} especialidad${formData.specialties.length > 1 ? 'es' : ''} seleccionada${formData.specialties.length > 1 ? 's' : ''}`}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar especialidad..." />
                  <CommandList>
                    <CommandEmpty>No se encontró la especialidad.</CommandEmpty>
                    <CommandGroup>
                      {availableSpecialties.map((specialty) => {
                        const isSelected = formData.specialties.includes(specialty);
                        return (
                          <CommandItem
                            key={specialty}
                            value={specialty}
                            onSelect={() => {
                              handleSpecialtyToggle(specialty);
                              if (!isSelected && formData.specialties.length >= 2) {
                                setPopoverOpen(false);
                              }
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                isSelected ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {specialty}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected Specialties */}
            {formData.specialties.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.specialties.map((specialty) => (
                  <div
                    key={specialty}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-md text-sm"
                  >
                    <span className="text-purple-900 font-medium">{specialty}</span>
                    <button
                      onClick={() => handleSpecialtyToggle(specialty)}
                      className="text-purple-600 hover:text-purple-800 transition-colors"
                      aria-label={`Eliminar ${specialty}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Situation */}
          <div>
            <Label htmlFor="currentSituation" className="mb-2 block">
              Situación profesional actual <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.currentSituation} onValueChange={(value) => setFormData({ ...formData, currentSituation: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione su situación actual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ejerciendo">Ejerciendo</SelectItem>
                <SelectItem value="estudiante">Estudiante</SelectItem>
                <SelectItem value="residente">Residente</SelectItem>
                <SelectItem value="retirado">Retirado/a</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Accreditation Checkbox */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Checkbox 
              id="accredited"
              checked={formData.isAccredited}
              onCheckedChange={(checked) => setFormData({ ...formData, isAccredited: checked as boolean })}
              className="mt-1"
            />
            <Label htmlFor="accredited" className="text-sm cursor-pointer">
              Estoy colegiado/a o acreditado/a oficialmente
              <p className="text-gray-500 mt-1">
                Según la normativa de mi país de ejercicio profesional
              </p>
            </Label>
          </div>

          {/* Responsible Declarations */}
          <div>
            <h3 className="font-semibold mb-4">
              Declaraciones responsables <span className="text-red-500">*</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Checkbox 
                  id="declaration1"
                  checked={formData.declaration1}
                  onCheckedChange={(checked) => setFormData({ ...formData, declaration1: checked as boolean })}
                  className="mt-1"
                />
                <Label htmlFor="declaration1" className="text-sm cursor-pointer">
                  Declaro que soy profesional del ámbito de la salud y que utilizaré el contenido de 
                  esta plataforma exclusivamente con fines formativos, dentro del marco de mis 
                  competencias profesionales.
                </Label>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Checkbox 
                  id="declaration2"
                  checked={formData.declaration2}
                  onCheckedChange={(checked) => setFormData({ ...formData, declaration2: checked as boolean })}
                  className="mt-1"
                />
                <Label htmlFor="declaration2" className="text-sm cursor-pointer">
                  Acepto que la aplicación práctica de los conocimientos adquiridos debe realizarse 
                  conforme a la legislación sanitaria vigente en mi país y bajo mi exclusiva 
                  responsabilidad profesional.
                </Label>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className="flex-1 bg-black hover:bg-gray-800 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              {isEditMode ? 'Guardar cambios' : 'Completar perfil'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Sus datos se utilizan exclusivamente para verificar su acceso profesional y personalizar su experiencia formativa.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}