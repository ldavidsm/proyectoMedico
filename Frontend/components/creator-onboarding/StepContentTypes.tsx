'use client';
import { CONTENT_TYPES } from '@/lib/creator-onboarding-data';

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function StepContentTypes({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter(s => s !== id)
        : [...selected, id]
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-1">
          ¿Qué tipo de contenido quieres crear?
        </h3>
        <p className="text-gray-500 text-sm">
          Selecciona uno o varios. Puedes cambiarlo más adelante.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {CONTENT_TYPES.map(type => (
          <button
            key={type.id}
            type="button"
            onClick={() => toggle(type.id)}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              selected.includes(type.id)
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl flex-shrink-0">{type.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{type.label}</p>
              <p className="text-sm text-gray-500">{type.description}</p>
            </div>
            {selected.includes(type.id) && (
              <div className="ml-auto flex-shrink-0 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
