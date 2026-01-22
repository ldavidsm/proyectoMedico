"use client";

import { useState } from 'react';
import { GraduationCap, Check, AlertCircle, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { useAuth, ProfessionalProfile, UserRole, FormationLevel, ProfessionalStatus } from '@/context/AuthContext';
import { MultiSpecialtySelect } from './MultiSpecialtySelect';

interface ProfessionalProfileFormProps {
  onClose: () => void;
  onComplete?: () => void;
}

export function ProfessionalProfileForm({ onClose, onComplete }: ProfessionalProfileFormProps) {
  const { completeProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el botón de carga
  
  // Inicializamos con los tipos correctos para evitar errores de Partial
  const [formData, setFormData] = useState<ProfessionalProfile>({
    country: '',
    role: 'medico', // Valor por defecto seguro
    roleOther: '',
    formationLevel: 'grado',
    specialty: [],
    professionalStatus: 'ejerciendo',
    collegiated: false,
    collegiateNumber: '',
    acceptTerms: false,
    acceptResponsibleUse: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const countries = ['España', 'Argentina', 'México', 'Colombia', 'Chile', 'Perú', 'Venezuela', 'Ecuador', 'Guatemala', 'Cuba', 'Bolivia', 'República Dominicana', 'Uruguay', 'Otro'];

  const roles: { value: UserRole; label: string }[] = [
    { value: 'medico', label: 'Medicina' },
    { value: 'enfermeria', label: 'Enfermería' },
    { value: 'fisioterapia', label: 'Fisioterapia' },
    { value: 'psicologia', label: 'Psicología' },
    { value: 'farmacia', label: 'Farmacia' },
    { value: 'biologia', label: 'Biología / Ciencias Biomédicas' },
    { value: 'nutricion', label: 'Nutrición y Dietética' },
    { value: 'odontologia', label: 'Odontología' },
    { value: 'otro', label: 'Otra profesión sanitaria' },
  ];

  const formationLevels: { value: FormationLevel; label: string }[] = [
    { value: 'grado', label: 'Grado / Licenciatura' },
    { value: 'especialista', label: 'Especialista (MIR, EIR, FIR, etc.)' },
    { value: 'master', label: 'Máster / Postgrado' },
    { value: 'doctorado', label: 'Doctorado' },
  ];

  const professionalStatuses: { value: ProfessionalStatus; label: string }[] = [
    { value: 'ejerciendo', label: 'Ejerciendo activamente' },
    { value: 'residente', label: 'Residente en formación' },
    { value: 'investigador', label: 'Investigador/a' },
    { value: 'docente', label: 'Docente universitario/a' },
    { value: 'no_ejerciendo', label: 'No ejerciendo actualmente' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.country) newErrors.country = 'El país es obligatorio';
    if (!formData.role) newErrors.role = 'El rol profesional es obligatorio';
    if (formData.role === 'otro' && !formData.roleOther?.trim()) newErrors.roleOther = 'Especifique su profesión';
    if (!formData.formationLevel) newErrors.formationLevel = 'El nivel de formación es obligatorio';
    if (!formData.specialty?.length) newErrors.specialty = 'Seleccione al menos una especialidad';
    if (!formData.professionalStatus) newErrors.professionalStatus = 'La situación profesional es obligatoria';
    if (formData.collegiated && !formData.collegiateNumber?.trim()) newErrors.collegiateNumber = 'Indique su número de colegiado';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Debe aceptar las condiciones';
    if (!formData.acceptResponsibleUse) newErrors.acceptResponsibleUse = 'Debe aceptar el uso responsable';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await completeProfile(formData);
      if (onComplete) onComplete();
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ form: 'Error al guardar el perfil. Inténtelo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof ProfessionalProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <Card className="w-full max-w-2xl relative flex flex-col shadow-2xl animate-in zoom-in-95 duration-200" style={{ maxHeight: '90vh' }}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-slate-600" />
        </button>

        <CardContent className="p-8 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Perfil profesional</h2>
              <p className="text-sm text-slate-500">Verificación obligatoria para acceso a contenidos médicos</p>
            </div>
          </div>

          {errors.form && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>País de ejercicio *</Label>
                <Select value={formData.country} onValueChange={(val) => updateField('country', val)}>
                  <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccione país" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
              </div>

              <div className="space-y-2">
                <Label>Profesión Sanitaria *</Label>
                <Select value={formData.role} onValueChange={(val) => updateField('role', val)}>
                  <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccione profesión" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.role === 'otro' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <Label>Especifique su profesión *</Label>
                <Input 
                  value={formData.roleOther} 
                  onChange={(e) => updateField('roleOther', e.target.value)}
                  className={errors.roleOther ? 'border-red-500' : ''}
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nivel de formación *</Label>
                <Select value={formData.formationLevel} onValueChange={(val) => updateField('formationLevel', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {formationLevels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Situación actual *</Label>
                <Select value={formData.professionalStatus} onValueChange={(val) => updateField('professionalStatus', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {professionalStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Especialidades (Máx. 3) *</Label>
              <MultiSpecialtySelect
                value={formData.specialty}
                onChange={(val) => updateField('specialty', val)}
                error={!!errors.specialty}
              />
              {errors.specialty && <p className="text-xs text-red-500">{errors.specialty}</p>}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="collegiated" 
                  checked={formData.collegiated} 
                  onCheckedChange={(val) => updateField('collegiated', !!val)} 
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="collegiated">Estoy colegiado/a oficialmente</Label>
                </div>
              </div>

              {formData.collegiated && (
                <div className="pl-7 animate-in fade-in duration-300">
                  <Label className="text-xs mb-1 block">Número de colegiado / Registro sanitario *</Label>
                  <Input 
                    placeholder="Ej: 282812345"
                    value={formData.collegiateNumber}
                    onChange={(e) => updateField('collegiateNumber', e.target.value)}
                    className={errors.collegiateNumber ? 'border-red-500' : ''}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="acceptTerms" 
                  checked={formData.acceptTerms} 
                  onCheckedChange={(val) => updateField('acceptTerms', !!val)} 
                />
                <Label htmlFor="acceptTerms" className="text-xs text-slate-600 leading-normal cursor-pointer">
                  Confirmo que soy profesional sanitario y usaré esta plataforma con fines formativos.
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="acceptRes" 
                  checked={formData.acceptResponsibleUse} 
                  onCheckedChange={(val) => updateField('acceptResponsibleUse', !!val)} 
                />
                <Label htmlFor="acceptRes" className="text-xs text-slate-600 leading-normal cursor-pointer">
                  Acepto que la aplicación de estos conocimientos es bajo mi exclusiva responsabilidad profesional.
                </Label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-teal-600 hover:bg-teal-700">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Completar Perfil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}