'use client';
import { MOTIVATION_OPTIONS } from '@/lib/creator-onboarding-data';

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function StepMotivation({ selected, onChange }: Props) {
  const toggle = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter(s => s !== option)
        : [...selected, option]
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-1">
          ¿Qué te motiva a ser instructor?
        </h3>
        <p className="text-gray-500 text-sm">
          Puedes seleccionar varias opciones.
        </p>
      </div>

      <div className="space-y-3">
        {MOTIVATION_OPTIONS.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              selected.includes(option)
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
              selected.includes(option)
                ? 'border-purple-600 bg-purple-600'
                : 'border-gray-300'
            }`}>
              {selected.includes(option) && (
                <span className="text-white text-xs">✓</span>
              )}
            </div>
            <span className="text-sm text-gray-900">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
