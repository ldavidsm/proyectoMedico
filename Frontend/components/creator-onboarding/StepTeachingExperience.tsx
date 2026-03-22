'use client';
import { TEACHING_EXPERIENCE_OPTIONS } from '@/lib/creator-onboarding-data';

interface Props {
  selected: string;
  onChange: (value: string) => void;
}

export function StepTeachingExperience({ selected, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-1">
          ¿Cuál es tu experiencia docente?
        </h3>
        <p className="text-gray-500 text-sm">
          Selecciona la opción que mejor describa tu trayectoria.
        </p>
      </div>

      <div className="space-y-3">
        {TEACHING_EXPERIENCE_OPTIONS.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              selected === option
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              selected === option
                ? 'border-purple-600 bg-purple-600'
                : 'border-gray-300'
            }`}>
              {selected === option && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span className="text-sm text-gray-900">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
