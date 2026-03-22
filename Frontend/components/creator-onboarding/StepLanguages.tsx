'use client';
import { LANGUAGES } from '@/lib/creator-onboarding-data';

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function StepLanguages({ selected, onChange }: Props) {
  const toggle = (code: string) => {
    onChange(
      selected.includes(code)
        ? selected.filter(s => s !== code)
        : [...selected, code]
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-1">
          ¿En qué idiomas impartirás contenido?
        </h3>
        <p className="text-gray-500 text-sm">
          Selecciona todos los idiomas en los que puedes crear contenido.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            type="button"
            onClick={() => toggle(lang.code)}
            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
              selected.includes(lang.code)
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div>
              <p className="font-semibold text-gray-900 text-sm">{lang.name}</p>
              <p className="text-xs text-gray-400">{lang.nativeName}</p>
            </div>
            {selected.includes(lang.code) && (
              <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
