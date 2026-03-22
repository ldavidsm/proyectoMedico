'use client';
import { useState } from 'react';
import {
  PROFESSIONS, EDUCATION_LEVELS,
  SPECIALTIES_BY_PROFESSION, COLLEGE_NUMBER_FORMATS, COUNTRIES
} from '@/lib/creator-onboarding-data';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ProfileData {
  country: string;
  profession: string;
  educationLevel: string;
  specialty: string;
  collegeNumber: string;
}

// SUB-PASO A: País y profesión
export function StepCountryProfession({
  data, onChange
}: {
  data: Partial<ProfileData>;
  onChange: (data: Partial<ProfileData>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold mb-1">País y profesión</h3>
        <p className="text-gray-500 text-sm">
          Información básica sobre tu perfil profesional.
        </p>
      </div>

      <div>
        <Label>País donde ejerces *</Label>
        <Select
          value={data.country || ''}
          onValueChange={v => onChange({ ...data, country: v })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Seleccionar país..." />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map(c => (
              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Profesión sanitaria *</Label>
        <div className="grid grid-cols-1 gap-2 mt-1.5 max-h-[340px] overflow-y-auto pr-1">
          {PROFESSIONS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange({ ...data, profession: p.id, specialty: '' })}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all text-sm ${
                data.profession === p.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                data.profession === p.id
                  ? 'border-purple-600 bg-purple-600'
                  : 'border-gray-300'
              }`}>
                {data.profession === p.id && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// SUB-PASO B: Formación y especialidad
export function StepEducationSpecialty({
  data, onChange
}: {
  data: Partial<ProfileData>;
  onChange: (data: Partial<ProfileData>) => void;
}) {
  const profession = PROFESSIONS.find(p => p.id === data.profession);
  const specialties = data.profession
    ? SPECIALTIES_BY_PROFESSION[data.profession] || []
    : [];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold mb-1">Formación académica</h3>
      </div>

      <div>
        <Label>Nivel de formación *</Label>
        <div className="grid grid-cols-2 gap-2 mt-1.5">
          {EDUCATION_LEVELS.map(level => (
            <button
              key={level.id}
              type="button"
              onClick={() => onChange({ ...data, educationLevel: level.id })}
              className={`p-3 rounded-lg border-2 text-sm text-left transition-all ${
                data.educationLevel === level.id
                  ? 'border-purple-600 bg-purple-50 font-medium'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {profession?.requiresSpecialty && specialties.length > 0 && (
        <div>
          <Label>Especialidad *</Label>
          <Select
            value={data.specialty || ''}
            onValueChange={v => onChange({ ...data, specialty: v })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Seleccionar especialidad..." />
            </SelectTrigger>
            <SelectContent>
              {specialties.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// SUB-PASO C: Número de colegiado
export function StepCollegeNumber({
  data, onChange
}: {
  data: Partial<ProfileData>;
  onChange: (data: Partial<ProfileData>) => void;
}) {
  const country = COUNTRIES.find(c => c.code === data.country);
  const format = COLLEGE_NUMBER_FORMATS[data.country || '']
    || COLLEGE_NUMBER_FORMATS['default'];

  const [error, setError] = useState('');

  const validate = (value: string) => {
    if (!value) {
      setError('Este campo es obligatorio');
      return;
    }
    const regex = new RegExp(format.pattern);
    if (!regex.test(value)) {
      setError(`Formato incorrecto. ${format.example}`);
    } else {
      setError('');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold mb-1">Acreditación profesional</h3>
        <p className="text-gray-500 text-sm">
          Necesitamos verificar tu número de colegiado para garantizar la calidad de la plataforma.
        </p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        Tus credenciales se tratan con total confidencialidad
        según el RGPD y la normativa de protección de datos.
      </div>

      <div>
        <Label>{country?.collegeLabel || 'Número de registro profesional'} *</Label>
        <Input
          className="mt-1.5"
          value={data.collegeNumber || ''}
          onChange={e => {
            onChange({ ...data, collegeNumber: e.target.value });
            if (error) validate(e.target.value);
          }}
          onBlur={e => validate(e.target.value)}
          placeholder={format.example}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        <p className="text-gray-400 text-xs mt-1">{format.example}</p>
      </div>
    </div>
  );
}
