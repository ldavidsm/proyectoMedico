import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

interface InlineDropdownProps {
  value: string[];
  options: string[];
  placeholder: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onChange: (value: string[]) => void;
  maxHeight?: string;
}

export function InlineDropdown({
  value,
  options,
  placeholder,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  onChange,
  maxHeight = '300px',
}: InlineDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const displayText = 
    value.length === 0
      ? placeholder
      : value.length === 1
      ? value[0]
      : `${value.length} seleccionados`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="text-sm text-gray-700">{displayText}</span>
        <ChevronDown
          className={`h-4 w-4 opacity-50 flex-shrink-0 ml-2 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto p-2" style={{ maxHeight }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    id={`option-${option}`}
                    checked={value.includes(option)}
                    onCheckedChange={() => toggleOption(option)}
                  />
                  <span className="text-sm text-gray-700 flex-1">{option}</span>
                </label>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-sm text-gray-500">
                No se encontraron resultados
              </div>
            )}
          </div>

          {/* Footer with selection count */}
          {value.length > 0 && (
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-3 py-2">
              <p className="text-xs text-gray-600">
                {value.length} elemento{value.length !== 1 ? 's' : ''}{' '}
                seleccionado{value.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
