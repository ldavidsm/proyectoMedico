import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  Star,
  Tag,
  X,
  GripVertical,
  Clock,
  AlertCircle,
  Users,
  BookOpen,
  Zap,
  Percent,
  Gift,
  ArrowRight,
  CalendarDays,
  Info,
  MapPin,
  ChevronDown,
  Upload,
  FileText,
  Check,
  ImageIcon,
  Link2
} from 'lucide-react';
import type { CourseFormData, OfertaCurso, CreatorProfile } from '../course-creation-wizard';
import BannerUploader, { type BannerImage } from '../banner-customizer';

// ============================================================================
// TYPES
// ============================================================================

type CountryPricing = {
  id: string;
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  originPrice: number;
  localPrice: number;
  exchangeRate: number;
  flag: string;
  isOrigin: boolean;
};

type EditMode = 'create' | 'edit';
type PromotionType = 'percentage' | 'fixed' | 'bonus';
type BonusCategory = 'course_content' | 'new_resource' | 'session' | 'access';

type BonusItem = {
  id: string;
  category: BonusCategory;
  description: string;
  selectedModuleIds?: string[];
  resourceType?: 'pdf' | 'template' | 'guide' | 'checklist' | 'other';
  resourceFileName?: string;
};

type Promotion = {
  id: string;
  name: string;
  type: PromotionType;
  value: number;
  startDate: string;
  endDate: string;
  allCountries: boolean;
  selectedCountries: string[];
  active: boolean;
  bonusItems: BonusItem[];
};

type ValidationErrors = {
  nombre?: string;
  precio?: string;
};

// ============================================================================
// CONSTANTS
// ============================================================================


export const DEFAULT_COUNTRIES = [
  { code: 'ES', name: 'España', currency: 'EUR', symbol: '€', flag: '🇪🇸', rateFromEUR: 1, taxRate: 0.21, taxName: 'IVA' },
  { code: 'MX', name: 'México', currency: 'MXN', symbol: '$', flag: '🇲🇽', rateFromEUR: 18.50, taxRate: 0.16, taxName: 'IVA' },
  { code: 'CO', name: 'Colombia', currency: 'COP', symbol: '$', flag: '🇨🇴', rateFromEUR: 4200, taxRate: 0.19, taxName: 'IVA' },
  { code: 'AR', name: 'Argentina', currency: 'ARS', symbol: '$', flag: '🇦🇷', rateFromEUR: 950, taxRate: 0.21, taxName: 'IVA' },
  { code: 'CL', name: 'Chile', currency: 'CLP', symbol: '$', flag: '🇨🇱', rateFromEUR: 1020, taxRate: 0.19, taxName: 'IVA' },
  { code: 'PE', name: 'Perú', currency: 'PEN', symbol: 'S/', flag: '🇵🇪', rateFromEUR: 4.05, taxRate: 0.18, taxName: 'IGV' },
  { code: 'US', name: 'Estados Unidos', currency: 'USD', symbol: '$', flag: '🇺🇸', rateFromEUR: 1.08, taxRate: 0, taxName: '' },
  { code: 'BR', name: 'Brasil', currency: 'BRL', symbol: 'R$', flag: '🇧🇷', rateFromEUR: 5.30, taxRate: 0.12, taxName: 'ISS' },
  { code: 'VE', name: 'Venezuela', currency: 'USD', symbol: '$', flag: '🇻🇪', rateFromEUR: 1.08, taxRate: 0, taxName: '' },
  { code: 'UY', name: 'Uruguay', currency: 'UYU', symbol: '$', flag: '🇺🇾', rateFromEUR: 42.0, taxRate: 0.22, taxName: 'IVA' },
  { code: 'PT', name: 'Portugal', currency: 'EUR', symbol: '€', flag: '🇵🇹', rateFromEUR: 1, taxRate: 0.23, taxName: 'IVA' },
  { code: 'IT', name: 'Italia', currency: 'EUR', symbol: '€', flag: '🇮🇹', rateFromEUR: 1, taxRate: 0.22, taxName: 'IVA' },
];

type Props = {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
  creatorProfile: CreatorProfile;
  mode?: string;
  AVAILABLE_COUNTRIES?: any[];
};

type DragItem = {
  id: string;
  index: number;
  type: string;
};

const DND_MODALIDAD = 'modalidad';

const PLATFORM_COMMISSION = 0.15;

const BONUS_CATEGORIES: { value: BonusCategory; label: string; icon: string; hint: string }[] = [
  { value: 'course_content', label: 'Contenido del curso', icon: '📚', hint: 'Seleccione módulos o lecciones existentes de su curso como bonus.' },
  { value: 'new_resource', label: 'Recurso adicional nuevo', icon: '📎', hint: 'Suba un recurso nuevo: PDF, plantilla, guía, checklist…' },
  { value: 'session', label: 'Sesión en directo adicional', icon: '🎥', hint: 'Webinar, Q&A o masterclass extra para esta promoción.' },
  { value: 'access', label: 'Tiempo de acceso extendido', icon: '⏳', hint: 'Meses adicionales de acceso al contenido del curso.' },
];

const RESOURCE_TYPES: { value: string; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'template', label: 'Plantilla' },
  { value: 'guide', label: 'Guía' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'other', label: 'Otro' },
];

const NAME_SUGGESTIONS = ['Esencial', 'Profesional', 'Premium', 'VIP', 'Básica', 'Completa', 'Con tutorías', 'Autoestudio'];

// ============================================================================
// CURRENCY HELPERS
// ============================================================================

const convertCurrency = (amount: number | undefined | null, fromCode: string, toCode: string, countryList = DEFAULT_COUNTRIES): number => {
  const safeAmount = Number(amount) || 0;
  const from = countryList.find(c => c.currency === fromCode || c.code === fromCode);
  const to = countryList.find(c => c.currency === toCode || c.code === toCode);
  if (!from || !to) return safeAmount;
  const inEUR = safeAmount / from.rateFromEUR;
  return inEUR * to.rateFromEUR;
};

const smartRound = (amount: number | undefined | null, currency: string): number => {
  const safeAmount = Number(amount) || 0;
  if (['COP'].includes(currency)) {
    if (safeAmount >= 100000) return Math.round(safeAmount / 10000) * 10000;
    if (safeAmount >= 10000) return Math.round(safeAmount / 1000) * 1000;
    if (safeAmount >= 100) return Math.round(safeAmount / 100) * 100;
    return Math.round(safeAmount);
  }
  if (['CLP', 'ARS'].includes(currency)) {
    if (safeAmount >= 100000) return Math.round(safeAmount / 10000) * 10000;
    if (safeAmount >= 10000) return Math.round(safeAmount / 1000) * 1000;
    if (safeAmount >= 100) return Math.round(safeAmount / 100) * 100;
    return Math.round(safeAmount);
  }
  if (['MXN', 'BRL', 'PEN'].includes(currency)) {
    if (safeAmount >= 100) return Math.round(safeAmount);
    return Math.round(safeAmount * 10) / 10;
  }
  return Math.round(safeAmount * 100) / 100;
};

const formatPrice = (amount: number | undefined | null, currency: string): string => {
  const safeAmount = Number(amount) || 0;
  if (['COP', 'CLP', 'ARS'].includes(currency)) {
    return Math.round(safeAmount).toLocaleString('es-ES');
  }
  return safeAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const calcNet = (price: number | undefined | null, taxRate: number): number => {
  const safePrice = Number(price) || 0;
  const preTax = safePrice / (1 + taxRate);
  return preTax * (1 - PLATFORM_COMMISSION);
};

const calcTax = (price: number | undefined | null, taxRate: number): number => {
  const safePrice = Number(price) || 0;
  return safePrice - (safePrice / (1 + taxRate));
};

const getPricePlaceholder = (currency: string): string => {
  if (currency === 'COP') return 'Ej: 300000';
  if (currency === 'CLP') return 'Ej: 250000';
  if (currency === 'ARS') return 'Ej: 150000';
  if (currency === 'MXN') return 'Ej: 1500';
  if (currency === 'PEN') return 'Ej: 400';
  if (currency === 'BRL') return 'Ej: 500';
  return 'Ej: 300';
};

/** Format a YYYY-MM-DD date string to Spanish short format */
const formatDateES = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/** Sanitize numeric text input — only digits and at most one decimal point */
const sanitizeNumericInput = (val: string, allowDecimals: boolean): string => {
  let cleaned = val.replace(/[^0-9.]/g, '');
  if (!allowDecimals) {
    cleaned = cleaned.replace(/\./g, '');
  } else {
    const dotIdx = cleaned.indexOf('.');
    if (dotIdx !== -1) {
      cleaned = cleaned.substring(0, dotIdx + 1) + cleaned.substring(dotIdx + 1).replace(/\./g, '');
      // Limit to 2 decimal places
      const parts = cleaned.split('.');
      if (parts[1] && parts[1].length > 2) cleaned = parts[0] + '.' + parts[1].substring(0, 2);
    }
  }
  return cleaned;
};

// ============================================================================
// DATE PICKER COMPONENT
// ============================================================================

const DatePickerField = ({ value, onChange, placeholder, minDate }: {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: Date;
}) => {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value + 'T00:00:00') : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-1 text-sm transition-colors hover:border-gray-400 focus-visible:border-purple-500 focus-visible:ring-purple-500/20 focus-visible:ring-[3px] outline-none cursor-pointer ${!value ? 'text-gray-400' : 'text-gray-900'
            }`}
        >
          <span>{value ? formatDateES(value) : (placeholder || 'Seleccionar fecha…')}</span>
          <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[60]" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              const y = date.getFullYear();
              const m = String(date.getMonth() + 1).padStart(2, '0');
              const dd = String(date.getDate()).padStart(2, '0');
              onChange(`${y}-${m}-${dd}`);
            }
            setOpen(false);
          }}
          fromDate={minDate}
          initialFocus
          classNames={{
            day_selected: "bg-purple-600 text-white hover:bg-purple-700 hover:text-white focus:bg-purple-600 focus:text-white",
            day_today: "bg-purple-100 text-purple-900",
            nav_button: "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-200 rounded-md inline-flex items-center justify-center",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PublishConfigStep({ formData, updateFormData, creatorProfile, mode = 'course', AVAILABLE_COUNTRIES: serverCountries }: Props) {
  const COUNTRIES = serverCountries || DEFAULT_COUNTRIES;
  // Main state
  const [editingModalidad, setEditingModalidad] = useState<OfertaCurso | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('create');
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Promotion state
  const [showPromotionDrawer, setShowPromotionDrawer] = useState(false);
  const [promotionModalidadId, setPromotionModalidadId] = useState<string | null>(null);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null);

  // Country pricing state
  const [enableCountryPricing, setEnableCountryPricing] = useState(false);
  const [countryPricing, setCountryPricing] = useState<CountryPricing[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Countries dropdown state
  const [countriesDropdownOpen, setCountriesDropdownOpen] = useState(false);
  const countriesDropdownRef = useRef<HTMLDivElement>(null);

  // Name suggestions dropdown
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  // Price display (controlled text input)
  const [priceInputDisplay, setPriceInputDisplay] = useState('');

  // Collection creation state
  const [showCollectionPanel, setShowCollectionPanel] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [collectionValidationError, setCollectionValidationError] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countriesDropdownRef.current && !countriesDropdownRef.current.contains(e.target as Node)) {
        setCountriesDropdownOpen(false);
      }
    };
    if (countriesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [countriesDropdownOpen]);

  const modalidades = formData.ofertas || [];
  const canAddMore = modalidades.length < 3;

  const originCountryCode = creatorProfile.paisColegiatura;
  const originCountry = COUNTRIES.find(c => c.code === originCountryCode) || COUNTRIES[0];

  // ============================================================================
  // HANDLERS - MODALIDAD
  // ============================================================================

  const crearNuevaModalidad = () => {
    const nuevaModalidad: OfertaCurso = {
      id: Date.now().toString(),
      nombreInterno: '',
      estado: 'activa',
      precioBase: 0,
      monedaOrigen: originCountry.currency,
      paisOrigen: originCountry.code,
      recomendada: false,
      inscripcionTipo: 'siempre',
      acompanamiento: [],
      accesoContenido: 'vitalicio',
      bloqueAcceso: { tipo: 'permanente' },
      bloqueRitmoFormato: {
        ritmo: 'libre',
        sesionesDirecto: { incluidas: false },
      },
      // bloqueAcompanamiento removed — not in OfertaCurso type
      bloqueCertificacion: { incluida: false },
      fechaCreacion: new Date().toISOString(),
      promociones: [],
      preciosPorPais: [],
    };

    setEditingModalidad(nuevaModalidad);
    setEditMode('create');
    setValidationErrors({});
    setEnableCountryPricing(false);
    setCountryPricing([]);
    setPriceInputDisplay('');
    setShowEditPanel(true);
  };

  const editarModalidad = (modalidad: OfertaCurso) => {
    // Ensure new fields have defaults for backward compat
    const withDefaults: OfertaCurso = {
      ...modalidad,
      inscripcionTipo: modalidad.inscripcionTipo || 'siempre',
      acompanamiento: modalidad.acompanamiento || [],
      accesoContenido: modalidad.accesoContenido || (modalidad.bloqueAcceso?.tipo === 'limitado' ? 'por_meses' : 'vitalicio'),
      accesoMeses: modalidad.accesoMeses || modalidad.bloqueAcceso?.duracionMeses,
    };
    setEditingModalidad(withDefaults);
    setEditMode('edit');
    setValidationErrors({});
    setPriceInputDisplay(modalidad.precioBase > 0 ? String(modalidad.precioBase) : '');

    // Restore country pricing from stored data
    if (modalidad.preciosPorPais && modalidad.preciosPorPais.length > 0) {
      setEnableCountryPricing(true);
      setCountryPricing(modalidad.preciosPorPais.map(cp => {
        const country = COUNTRIES.find(c => c.code === cp.countryCode);
        return {
          id: Math.random().toString(36).substring(7),
          countryCode: cp.countryCode,
          countryName: country?.name || cp.countryCode,
          currency: country?.currency || '',
          currencySymbol: country?.symbol || '',
          originPrice: cp.originPrice,
          localPrice: cp.localPrice,
          exchangeRate: country?.rateFromEUR || 1,
          flag: country?.flag || '',
          isOrigin: false,
        };
      }));
    } else {
      setEnableCountryPricing(false);
      setCountryPricing([]);
    }

    setShowEditPanel(true);
  };

  const duplicarModalidad = (modalidad: OfertaCurso) => {
    if (!canAddMore) return;
    const duplicada: OfertaCurso = {
      ...modalidad,
      id: Date.now().toString(),
      nombreInterno: `${modalidad.nombreInterno} (copia)`,
      recomendada: false,
      promociones: [],
      fechaCreacion: new Date().toISOString(),
    };
    updateFormData({ ofertas: [...modalidades, duplicada] });
    toast.success('Modalidad duplicada correctamente.');
  };

  const eliminarModalidad = (id: string) => {
    if (modalidades.length <= 1) {
      toast.error('Debe mantener al menos una modalidad.');
      return;
    }
    setDeleteConfirmId(id);
  };

  const confirmarEliminar = () => {
    if (!deleteConfirmId) return;
    const remaining = modalidades.filter(m => m.id !== deleteConfirmId);
    // Si queda solo 1 modalidad, quitar el flag recomendada (no tiene sentido con una sola)
    const cleaned = remaining.length === 1
      ? remaining.map(m => ({ ...m, recomendada: false }))
      : remaining;
    updateFormData({ ofertas: cleaned });
    setDeleteConfirmId(null);
    toast.success('Modalidad eliminada.');
  };

  const guardarModalidad = () => {
    if (!editingModalidad) return;

    const errors: ValidationErrors = {};
    if (!editingModalidad.nombreInterno.trim()) {
      errors.nombre = 'El nombre de la modalidad es obligatorio.';
    }
    if (editingModalidad.precioBase <= 0) {
      errors.precio = 'Ingrese un precio mayor a 0.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstErrorSection = errors.nombre ? 'edit-section-1' : 'edit-section-2';
      const el = document.getElementById(firstErrorSection);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      toast.error('Faltan campos obligatorios. Revise los campos marcados en rojo.');
      return;
    }

    const modalidadToSave = {
      ...editingModalidad,
      preciosPorPais: enableCountryPricing
        ? countryPricing.map(cp => ({
          countryCode: cp.countryCode,
          originPrice: cp.originPrice,
          localPrice: cp.localPrice,
        }))
        : [],
    };
    const modalidadesActualizadas = modalidades.some(m => m.id === modalidadToSave.id)
      ? modalidades.map(m => m.id === modalidadToSave.id ? modalidadToSave : m)
      : [...modalidades, modalidadToSave];

    updateFormData({ ofertas: modalidadesActualizadas });
    cerrarPanel();
    toast.success(editMode === 'create' ? 'Modalidad creada correctamente.' : 'Cambios guardados.');
  };

  const cerrarPanel = () => {
    setShowEditPanel(false);
    setEditingModalidad(null);
    setValidationErrors({});
    setEnableCountryPricing(false);
    setCountryPricing([]);
    setPriceInputDisplay('');
  };

  const moveModalidad = useCallback((dragIndex: number, hoverIndex: number) => {
    const updated = [...modalidades];
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, removed);
    updateFormData({ ofertas: updated });
  }, [modalidades, updateFormData]);

  const marcarRecomendada = (id: string) => {
    const modalidadesActualizadas = modalidades.map(m => ({
      ...m,
      recomendada: m.id === id ? !m.recomendada : false
    }));
    updateFormData({ ofertas: modalidadesActualizadas });
  };

  // ============================================================================
  // HANDLERS - COUNTRY PRICING
  // ============================================================================

  const handleEnableCountryPricing = (enabled: boolean) => {
    setEnableCountryPricing(enabled);
  };

  const addCountry = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (!country || country.code === originCountryCode || countryPricing.some(c => c.countryCode === countryCode)) return;
    if (!editingModalidad) return;

    const profOriginPrice = editingModalidad.precioBase;
    const convertedLocal = convertCurrency(profOriginPrice, originCountry.currency, country.currency, COUNTRIES);
    const roundedLocal = smartRound(convertedLocal, country.currency);

    const newCountry: CountryPricing = {
      id: Math.random().toString(36).substring(7),
      countryCode: country.code,
      countryName: country.name,
      currency: country.currency,
      currencySymbol: country.symbol,
      originPrice: profOriginPrice,
      localPrice: roundedLocal,
      exchangeRate: country.rateFromEUR,
      flag: country.flag,
      isOrigin: false,
    };
    setCountryPricing([...countryPricing, newCountry]);
  };

  const removeCountry = (id: string) => {
    setCountryPricing(countryPricing.filter(c => c.id !== id));
  };

  const updateCountryOriginPrice = (id: string, newOriginPrice: number) => {
    if (!editingModalidad) return;
    setCountryPricing(prev => prev.map(c => {
      if (c.id !== id) return c;
      const convertedLocal = convertCurrency(newOriginPrice, originCountry.currency, c.currency, COUNTRIES);
      return { ...c, originPrice: newOriginPrice, localPrice: smartRound(convertedLocal, c.currency) };
    }));
  };

  const recalculateCountryPrices = (newBasePrice: number) => {
    setCountryPricing(prev => prev.map(cp => {
      const convertedLocal = convertCurrency(newBasePrice, originCountry.currency, cp.currency, COUNTRIES);
      return { ...cp, originPrice: newBasePrice, localPrice: smartRound(convertedLocal, cp.currency) };
    }));
  };

  // ============================================================================
  // HANDLERS - PROMOTIONS
  // ============================================================================

  const abrirPromotionDrawer = (modalidadId: string) => {
    setPromotionModalidadId(modalidadId);
    setCurrentPromotion({
      id: Date.now().toString(),
      name: '',
      type: 'percentage',
      value: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      allCountries: true,
      selectedCountries: [],
      active: true,
      bonusItems: [],
    });
    setShowPromotionDrawer(true);
  };

  const cerrarPromotionDrawer = () => {
    setShowPromotionDrawer(false);
    setPromotionModalidadId(null);
    setCurrentPromotion(null);
  };

  const togglePromoCountry = (code: string) => {
    if (!currentPromotion) return;
    const selected = currentPromotion.selectedCountries;
    setCurrentPromotion({
      ...currentPromotion,
      selectedCountries: selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code],
    });
  };

  const addBonusItem = () => {
    if (!currentPromotion) return;
    setCurrentPromotion({
      ...currentPromotion,
      bonusItems: [
        ...currentPromotion.bonusItems,
        { id: Date.now().toString(), category: 'course_content', description: '', selectedModuleIds: [], resourceType: 'pdf' },
      ],
    });
  };

  const updateBonusItem = (id: string, updates: Partial<BonusItem>) => {
    if (!currentPromotion) return;
    setCurrentPromotion({
      ...currentPromotion,
      bonusItems: currentPromotion.bonusItems.map(b => b.id === id ? { ...b, ...updates } : b),
    });
  };

  const removeBonusItem = (id: string) => {
    if (!currentPromotion) return;
    setCurrentPromotion({
      ...currentPromotion,
      bonusItems: currentPromotion.bonusItems.filter(b => b.id !== id),
    });
  };

  const validatePromotion = (): string | null => {
    if (!currentPromotion) return 'No hay promoción para validar.';

    if (!currentPromotion.name.trim()) return 'El nombre de la promoción es obligatorio.';

    if (currentPromotion.type === 'percentage') {
      if (currentPromotion.value <= 0 || currentPromotion.value > 99) {
        return 'El porcentaje debe estar entre 1% y 99%.';
      }
    }

    if (currentPromotion.type === 'fixed') {
      if (currentPromotion.value <= 0) {
        return 'El precio temporal debe ser mayor a 0.';
      }
      const modalidad = modalidades.find(m => m.id === promotionModalidadId);
      if (modalidad && currentPromotion.value >= modalidad.precioBase) {
        return 'El precio temporal debe ser menor al precio base de la modalidad.';
      }
    }

    if (currentPromotion.type === 'bonus') {
      if (currentPromotion.bonusItems.length === 0) {
        return 'Añada al menos un bonus para esta promoción.';
      }
      for (const item of currentPromotion.bonusItems) {
        if (item.category === 'course_content' && (!item.selectedModuleIds || item.selectedModuleIds.length === 0)) {
          return 'Seleccione al menos un módulo en el bonus de contenido del curso.';
        }
        if (item.category === 'new_resource' && !item.resourceFileName) {
          return 'Suba un archivo para el bonus de recurso adicional.';
        }
        if (item.category === 'session' && !item.description.trim()) {
          return 'Describa la sesión en directo adicional.';
        }
        if (item.category === 'access' && !item.description.trim()) {
          return 'Describa el tiempo de acceso extendido.';
        }
      }
    }

    if (!currentPromotion.startDate) return 'La fecha de inicio es obligatoria.';
    if (!currentPromotion.endDate) return 'La fecha de fin es obligatoria.';
    if (currentPromotion.startDate && currentPromotion.endDate && currentPromotion.endDate <= currentPromotion.startDate) {
      return 'La fecha de fin debe ser posterior a la de inicio.';
    }

    if (!currentPromotion.allCountries && currentPromotion.selectedCountries.length === 0) {
      return 'Seleccione al menos un país o elija "Todos los países".';
    }

    return null;
  };

  const guardarPromocion = () => {
    const error = validatePromotion();
    if (error) {
      toast.error(error);
      return;
    }
    if (!currentPromotion || !promotionModalidadId) return;

    // Only one active promotion per modalidad
    if (currentPromotion.active) {
      const modalidad = modalidades.find(m => m.id === promotionModalidadId);
      const otherActive = (modalidad?.promociones || []).find(p => p.active && p.id !== currentPromotion.id);
      if (otherActive) {
        toast.error(`Ya existe una promoción activa ("${otherActive.name}"). Desactívela primero o guarde esta como inactiva.`);
        return;
      }
    }

    const updatedModalidades = modalidades.map(m => {
      if (m.id !== promotionModalidadId) return m;
      const existingPromos = m.promociones || [];
      const isEditing = existingPromos.some(p => p.id === currentPromotion.id);
      return {
        ...m,
        promociones: isEditing
          ? existingPromos.map(p => p.id === currentPromotion.id ? currentPromotion : p)
          : [...existingPromos, currentPromotion],
      };
    });

    updateFormData({ ofertas: updatedModalidades });
    cerrarPromotionDrawer();
    toast.success('Promoción guardada correctamente.');
  };

  const eliminarPromocion = (modalidadId: string, promoId: string) => {
    const updated = modalidades.map(m => {
      if (m.id !== modalidadId) return m;
      return {
        ...m,
        promociones: (m.promociones || []).filter(p => p.id !== promoId),
      };
    });
    updateFormData({ ofertas: updated });
    toast.success('Promoción eliminada.');
  };

  const editarPromocion = (modalidadId: string, promo: Promotion) => {
    setPromotionModalidadId(modalidadId);
    setCurrentPromotion({ ...promo });
    setShowPromotionDrawer(true);
  };

  const togglePromocionActiva = (modalidadId: string, promoId: string, activate: boolean) => {
    if (activate) {
      const modalidad = modalidades.find(m => m.id === modalidadId);
      const otherActive = (modalidad?.promociones || []).find(p => p.active && p.id !== promoId);
      if (otherActive) {
        toast.error(`Solo puede tener una promoción activa por modalidad. Desactive primero "${otherActive.name}".`);
        return;
      }
    }
    const updated = modalidades.map(m => {
      if (m.id !== modalidadId) return m;
      return {
        ...m,
        promociones: (m.promociones || []).map(p =>
          p.id === promoId ? { ...p, active: activate } : p
        ),
      };
    });
    updateFormData({ ofertas: updated });
    toast.success(activate ? 'Promoción activada.' : 'Promoción desactivada.');
  };

  // ============================================================================
  // HANDLERS - COLECCIONES
  // ============================================================================

  const colecciones = formData.colecciones || [];

  const abrirCollectionPanel = () => {
    setNewCollectionName('');
    setNewCollectionDesc('');
    setCollectionValidationError('');
    setShowCollectionPanel(true);
  };

  const cerrarCollectionPanel = () => {
    setShowCollectionPanel(false);
    setNewCollectionName('');
    setNewCollectionDesc('');
    setCollectionValidationError('');
  };

  const guardarColeccion = () => {
    if (!newCollectionName.trim()) {
      setCollectionValidationError('El nombre de la colección es obligatorio.');
      return;
    }
    const newCol = {
      id: `col-${Date.now()}`,
      nombre: newCollectionName.trim(),
      descripcion: newCollectionDesc.trim(),
    };
    const updated = [...colecciones, newCol];
    updateFormData({ colecciones: updated, coleccionId: newCol.id });
    cerrarCollectionPanel();
    toast.success(`Colección "${newCol.nombre}" creada y asignada.`);
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getAccesoLabel = (m: OfertaCurso): string => {
    if (m.accesoContenido === 'por_meses') return `${m.accesoMeses || 3} meses`;
    if (m.bloqueAcceso?.tipo === 'limitado') return `${m.bloqueAcceso.duracionMeses || 3} meses`;
    return 'Vitalicio';
  };

  const getInscripcionLabel = (m: OfertaCurso): string =>
    m.inscripcionTipo === 'convocatoria' ? 'Convocatoria' : 'Siempre abierta';

  const getAcompLabel = (m: OfertaCurso): string => {
    const labels: Record<string, string> = {
      ninguno: 'Sin acompañamiento',
      comunidad: 'Comunidad',
      chat_instructor: 'Chat con instructor',
    };
    if (!m.acompanamiento?.length) return 'No seleccionado';
    return m.acompanamiento.map(a => labels[a] || a).join(' + ');
  };

  const getPromotionPreviewPrice = (): { original: number; final: number } | null => {
    if (!currentPromotion || !promotionModalidadId) return null;
    const modalidad = modalidades.find(m => m.id === promotionModalidadId);
    if (!modalidad) return null;
    const original = modalidad.precioBase;
    if (currentPromotion.type === 'percentage' && currentPromotion.value > 0) {
      return { original, final: original * (1 - currentPromotion.value / 100) };
    }
    if (currentPromotion.type === 'fixed' && currentPromotion.value > 0) {
      return { original, final: currentPromotion.value };
    }
    return null;
  };

  const getOriginSymbol = () => originCountry?.symbol || '$';
  const getOriginCurrency = () => originCountry?.currency || 'EUR';

  // ============================================================================
  // RENDER - EMPTY STATE
  // ============================================================================

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
        <Tag className="w-6 h-6 text-purple-600" />
      </div>
      <h3 className="text-gray-900 mb-1">No ha creado ninguna modalidad todavía</h3>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
        {mode === 'collection'
          ? 'Defina cómo se vende esta colección: precio, tipo de acceso y acompañamiento.'
          : 'Cree su primera modalidad para definir cómo vender su curso.'}
      </p>
      <Button onClick={crearNuevaModalidad} className="bg-purple-600 hover:bg-purple-700 gap-2">
        <Plus className="w-4 h-4" />
        Crear primera modalidad
      </Button>
    </div>
  );

  // ============================================================================
  // RENDER - DELETE CONFIRMATION
  // ============================================================================

  const renderDeleteConfirmation = () => {
    if (!deleteConfirmId) return null;
    const modalidad = modalidades.find(m => m.id === deleteConfirmId);
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
        <Card className="max-w-sm w-full p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="text-gray-900 mb-1">Eliminar modalidad</h4>
              <p className="text-sm text-gray-500">
                ¿Está seguro de eliminar &quot;{modalidad?.nombreInterno || 'esta modalidad'}&quot;? Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1">Cancelar</Button>
            <Button onClick={confirmarEliminar} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Eliminar</Button>
          </div>
        </Card>
      </div>
    );
  };

  // ============================================================================
  // RENDER - DRAGGABLE MODALIDAD CARD
  // ============================================================================

  const DraggableModalidadCard = ({ modalidad, index }: { modalidad: OfertaCurso; index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const dragHandleRef = useRef<HTMLDivElement>(null);
    const sym = originCountry.symbol;
    const cur = originCountry.currency;

    const [{ isDragging }, drag, preview] = useDrag({
      type: DND_MODALIDAD,
      item: (): DragItem => ({ id: modalidad.id, index, type: DND_MODALIDAD }),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
      accept: DND_MODALIDAD,
      collect(monitor) {
        return { handlerId: monitor.getHandlerId() };
      },
      hover(item: DragItem, monitor) {
        if (!cardRef.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;

        const hoverBoundingRect = cardRef.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        moveModalidad(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    preview(drop(cardRef));
    drag(dragHandleRef);

    const promos = modalidad.promociones || [];

    return (
      <div ref={cardRef} data-handler-id={handlerId}>
        <Card
          className={`relative transition-all ${isDragging ? 'opacity-40 scale-[0.98]' : ''} ${modalidad.recomendada
            ? 'border-purple-400 ring-1 ring-purple-200 shadow-sm'
            : 'border-gray-200 hover:border-gray-300'
            }`}
        >
          {modalidad.recomendada && (
            <div className="absolute -top-2.5 left-6">
              <Badge className="bg-purple-600 text-white text-xs px-2.5 py-0.5 shadow-sm">
                <Star className="w-3 h-3 mr-1 fill-white" />
                Recomendada
              </Badge>
            </div>
          )}

          <div className="p-5">
            <div className="flex items-start gap-3">
              <div
                ref={dragHandleRef}
                className="pt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
              >
                <GripVertical className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-gray-900 truncate mb-1.5">
                  {modalidad.nombreInterno || 'Sin nombre'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 rounded-md px-2 py-0.5">
                    <Clock className="w-3 h-3" />
                    {getAccesoLabel(modalidad)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 rounded-md px-2 py-0.5">
                    <CalendarDays className="w-3 h-3" />
                    {getInscripcionLabel(modalidad)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 rounded-md px-2 py-0.5">
                    <Users className="w-3 h-3" />
                    {getAcompLabel(modalidad)}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 pl-4">
                <div className="text-xl text-gray-900">
                  {sym}{formatPrice(modalidad.precioBase, cur)}
                </div>
                <div className="text-xs text-gray-400">{cur}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => editarModalidad(modalidad)}
                className="text-gray-600 hover:text-gray-900 h-8 px-2.5 text-xs">
                <Edit className="w-3.5 h-3.5 mr-1" /> Editar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => duplicarModalidad(modalidad)}
                disabled={!canAddMore} className="text-gray-600 hover:text-gray-900 h-8 px-2.5 text-xs">
                <Copy className="w-3.5 h-3.5 mr-1" /> Duplicar
              </Button>
              <Button variant="outline" size="sm"
                onClick={() => abrirPromotionDrawer(modalidad.id)}
                className="text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 h-8 px-2.5 text-xs">
                <Percent className="w-3.5 h-3.5 mr-1" /> Promoción
              </Button>
              <div className="flex-1" />
              {modalidades.length >= 2 && (
                <Button variant={modalidad.recomendada ? "default" : "outline"} size="sm" onClick={() => marcarRecomendada(modalidad.id)}
                  className={`h-8 px-3 text-xs gap-1.5 ${modalidad.recomendada
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'text-purple-600 border-purple-200 bg-purple-50/80 hover:bg-purple-100 hover:border-purple-300'
                    }`}
                  title={modalidad.recomendada ? 'Quitar recomendación' : 'Marcar como modalidad recomendada al alumno'}>
                  <Star className={`w-3.5 h-3.5 ${modalidad.recomendada ? 'fill-white' : 'fill-purple-200'}`} />
                  {modalidad.recomendada ? 'Recomendada' : 'Recomendar'}
                </Button>
              )}
              {modalidades.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => eliminarModalidad(modalidad.id)}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 px-2">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Saved promotions */}
            {promos.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Promociones</span>
                  <span className="text-[10px] text-gray-400">Solo 1 activa a la vez</span>
                </div>
                {promos.map(promo => {
                  const now = new Date().toISOString().split('T')[0];
                  const isDateActive = promo.startDate <= now && promo.endDate >= now;
                  const isFuture = promo.startDate > now;
                  const isPast = promo.endDate < now;
                  return (
                    <div key={promo.id} className={`flex items-center justify-between rounded-md px-3 py-2 group/promo ${promo.active ? 'bg-purple-50/70' : 'bg-gray-50'
                      }`}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Switch
                            checked={promo.active}
                            onCheckedChange={(checked) => togglePromocionActiva(modalidad.id, promo.id, !!checked)}
                            className="scale-75 origin-left"
                          />
                        </div>
                        <span className={`text-xs truncate ${promo.active ? 'text-purple-800' : 'text-gray-500'}`}>{promo.name}</span>
                        <Badge className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${promo.type === 'percentage' ? 'bg-purple-200/60 text-purple-700' :
                          promo.type === 'fixed' ? 'bg-purple-200/60 text-purple-700' :
                            'bg-purple-200/60 text-purple-700'
                          }`}>
                          {promo.type === 'percentage' ? `${promo.value}%` :
                            promo.type === 'fixed' ? `${sym}${formatPrice(promo.value, cur)}` :
                              'Bonus'}
                        </Badge>
                        {promo.active && (
                          <Badge className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${isDateActive ? 'bg-green-100 text-green-700' :
                            isFuture ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                            {isDateActive ? 'Activa' : isFuture ? 'Programada' : 'Finalizada'}
                          </Badge>
                        )}
                        {!promo.active && (
                          <Badge className="text-[10px] px-1.5 py-0 flex-shrink-0 bg-gray-100 text-gray-400">
                            Inactiva
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/promo:opacity-100 transition-opacity ml-2">
                        <button onClick={(e) => { e.stopPropagation(); editarPromocion(modalidad.id, promo); }}
                          className="text-gray-400 hover:text-purple-600 p-0.5 cursor-pointer">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); eliminarPromocion(modalidad.id, promo.id); }}
                          className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Banner image thumbnail */}
            {modalidad.bannerImage?.imageUrl && (
              <div className="mt-3 -mx-5 -mb-5">
                <div className="relative" style={{ aspectRatio: '4 / 1' }}>
                  <img
                    src={modalidad.bannerImage.imageUrl}
                    alt=""
                    className="w-full h-full object-cover rounded-b-xl"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/30 to-transparent h-8 rounded-b-xl" />
                  <span className="absolute bottom-1.5 right-3 text-[10px] text-white/80 drop-shadow-sm">
                    {modalidad.bannerImage.imageWidth}×{modalidad.bannerImage.imageHeight} px
                  </span>
                </div>
              </div>
            )}

            {/* Stored country pricing count */}
            {modalidad.preciosPorPais && modalidad.preciosPorPais.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{modalidad.preciosPorPais.length} mercado{modalidad.preciosPorPais.length > 1 ? 's' : ''} adicional{modalidad.preciosPorPais.length > 1 ? 'es' : ''}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // ============================================================================
  // RENDER - MAIN VIEW
  // ============================================================================

  const renderMainView = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-gray-900 mb-1">
          {mode === 'collection' ? 'Modalidades de la colección' : 'Formas de vender su curso'}
        </h3>
        <p className="text-sm text-gray-500">
          {mode === 'collection'
            ? 'Cree hasta 3 modalidades con diferentes condiciones de acceso, acompañamiento y precio para todos los cursos de esta colección.'
            : 'Cree hasta 3 modalidades con diferentes condiciones de acceso, acompañamiento y precio.'}
        </p>
      </div>

      {/* Creator origin badge */}
      <div className="flex items-center gap-2.5 rounded-lg bg-purple-50/60 border border-purple-100 px-3.5 py-2.5">
        <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
        <p className="text-sm text-purple-800">
          Su mercado principal es <strong>{originCountry.name}</strong> ({originCountry.currency}) — detectado desde su país de colegiatura.
        </p>
        <Badge className="bg-purple-200/60 text-purple-700 text-[10px] px-2 py-0.5 ml-auto flex-shrink-0">
          {originCountryCode}
        </Badge>
      </div>

      {modalidades.length === 0 ? renderEmptyState() : (
        <div className="space-y-3">
          {modalidades.map((m, idx) => (
            <DraggableModalidadCard key={m.id} modalidad={m} index={idx} />
          ))}
          {canAddMore ? (
            <button onClick={crearNuevaModalidad}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl h-12 flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 transition-colors cursor-pointer">
              <Plus className="w-4 h-4" /> Nueva modalidad
            </button>
          ) : (
            <p className="text-center text-xs text-gray-400 py-2">Máximo 3 modalidades por curso.</p>
          )}
        </div>
      )}

      {modalidades.length >= 2 && !modalidades.some(m => m.recomendada) && (
        <div className="bg-purple-50 rounded-lg p-3.5 flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-purple-900">
            <span className="font-medium">Sugerencia:</span> Marcar una modalidad como &quot;Recomendada&quot; puede aumentar la conversión.
          </p>
        </div>
      )}

      {/* ── Visibilidad ──────────────────── */}
      {mode === 'course' && (
        <>
          <Separator />
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-semibold text-gray-900">Visibilidad del curso</Label>
              <p className="text-xs text-gray-500 mt-1">
                Controla si el curso es público en el catálogo o si es privado (solo accesible con enlace directo).
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateFormData({ visibilidad: 'publico' })}
                className={`flex flex-col items-start rounded-lg p-4 text-left transition-all cursor-pointer ${formData.visibilidad === 'publico'
                  ? 'border-2 border-[#7C3AED] bg-[#F5F3FF]'
                  : 'border border-[#E5E7EB] hover:border-gray-300'
                  }`}
              >
                <span className="text-2xl mb-2">👁️</span>
                <span className="text-sm text-gray-900 font-semibold">Público</span>
                <span className="text-xs text-gray-500 mt-0.5">Visible en el catálogo para todos</span>
              </button>
              <button
                type="button"
                onClick={() => updateFormData({ visibilidad: 'privado' })}
                className={`flex flex-col items-start rounded-lg p-4 text-left transition-all cursor-pointer ${formData.visibilidad === 'privado'
                  ? 'border-2 border-[#7C3AED] bg-[#F5F3FF]'
                  : 'border border-[#E5E7EB] hover:border-gray-300'
                  }`}
              >
                <span className="text-2xl mb-2">👁️‍🗨️</span>
                <span className="text-sm text-gray-900 font-semibold">Privado</span>
                <span className="text-xs text-gray-500 mt-0.5">Solo visible por enlace directo</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Progresión del contenido ──────────────────── */}
      {mode === 'course' && modalidades.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-semibold text-gray-900">¿Cómo acceden los alumnos al contenido?</Label>
              <p className="text-xs text-gray-500 mt-1">
                Define si los alumnos pueden avanzar libremente o deben completar cada clase antes de ver la siguiente.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateFormData({ progresionContenido: 'libre' })}
                className={`flex flex-col items-start rounded-lg p-4 text-left transition-all cursor-pointer ${formData.progresionContenido === 'libre'
                  ? 'border-2 border-[#7C3AED] bg-[#F5F3FF]'
                  : 'border border-[#E5E7EB] hover:border-gray-300'
                  }`}
              >
                <span className="text-2xl mb-2">🔓</span>
                <span className="text-sm text-gray-900 font-semibold">Libre</span>
                <span className="text-xs text-gray-500 mt-0.5">El alumno avanza en el orden que quiera</span>
              </button>
              <button
                type="button"
                onClick={() => updateFormData({ progresionContenido: 'secuencial' })}
                className={`flex flex-col items-start rounded-lg p-4 text-left transition-all cursor-pointer ${formData.progresionContenido === 'secuencial'
                  ? 'border-2 border-[#7C3AED] bg-[#F5F3FF]'
                  : 'border border-[#E5E7EB] hover:border-gray-300'
                  }`}
              >
                <span className="text-2xl mb-2">🔒</span>
                <span className="text-sm text-gray-900 font-semibold">Secuencial</span>
                <span className="text-xs text-gray-500 mt-0.5">Debe completar cada clase para desbloquear la siguiente</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Requiere perfil profesional ──────────────── */}
      {mode === 'course' && modalidades.length > 0 && (
        <>
          <Separator />
          <div className="flex items-start justify-between gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Requiere perfil profesional verificado
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Solo profesionales sanitarios verificados podrán acceder a este curso. Recomendado para contenido clínico avanzado.
                </p>
              </div>
            </div>
            <Switch
              checked={formData.requiresProfessionalProfile || false}
              onCheckedChange={(checked) =>
                updateFormData({ requiresProfessionalProfile: !!checked })
              }
            />
          </div>
        </>
      )}

      {/* ── Disponibilidad de venta ───────────────────── */}
      {mode === 'course' && modalidades.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-semibold text-gray-900">¿Cómo quieres vender este curso?</Label>
              <p className="text-xs text-gray-500 mt-1">
                Puedes venderlo solo, dentro de una colección o de las dos formas a la vez.
              </p>
            </div>
            <div className="space-y-2">
              {/* Opción 1: Solo */}
              <label
                className={`flex items-center gap-3 rounded-lg p-3.5 cursor-pointer transition-all ${formData.disponibilidadVenta === 'solo'
                  ? 'border-2 border-[#7C3AED] bg-[#F5F3FF]'
                  : 'border border-[#E5E7EB] hover:border-gray-300'
                  }`}
                onClick={() => updateFormData({ disponibilidadVenta: 'solo', coleccionId: undefined })}
              >
                <input
                  type="radio"
                  name="disponibilidadVenta"
                  checked={formData.disponibilidadVenta === 'solo'}
                  onChange={() => { }}
                  className="accent-purple-600 flex-shrink-0"
                />
                <span className="text-xl flex-shrink-0">📚</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-900 font-semibold">Solo</span>
                  <p className="text-xs text-gray-500 mt-0.5">Se vende únicamente como curso individual</p>
                </div>
              </label>

              {/* Opción 2: En una colección */}
              <label
                className={`flex items-center gap-3 rounded-lg p-3.5 cursor-pointer transition-all ${formData.disponibilidadVenta === 'en_coleccion'
                  ? 'border-2 border-[#7C3AED] bg-[#F5F3FF]'
                  : 'border border-[#E5E7EB] hover:border-gray-300'
                  }`}
                onClick={() => updateFormData({ disponibilidadVenta: 'en_coleccion' })}
              >
                <input
                  type="radio"
                  name="disponibilidadVenta"
                  checked={formData.disponibilidadVenta === 'en_coleccion'}
                  onChange={() => { }}
                  className="accent-purple-600 flex-shrink-0"
                />
                <span className="text-xl flex-shrink-0">📂</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-900 font-semibold">En una colección</span>
                  <p className="text-xs text-gray-500 mt-0.5">Solo disponible dentro de una colección</p>
                </div>
              </label>

              {/* Panel expandido para "En una colección" */}
              {formData.disponibilidadVenta === 'en_coleccion' && (
                <div className="rounded-lg bg-[#F5F3FF] p-4 space-y-3 ml-8">
                  <Label className="text-xs text-gray-500">¿A qué colección pertenece?</Label>
                  {colecciones.length > 0 ? (
                    <select
                      value={formData.coleccionId || ''}
                      onChange={(e) => updateFormData({ coleccionId: e.target.value || undefined })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="" disabled>Seleccionar colección…</option>
                      {colecciones.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-gray-500">No tiene colecciones. Cree una para continuar.</p>
                  )}
                  <button
                    type="button"
                    onClick={abrirCollectionPanel}
                    className="w-full py-2.5 rounded-lg border-2 border-dashed border-purple-300 text-sm text-purple-600 font-medium hover:bg-purple-50 hover:border-purple-400 transition-colors cursor-pointer"
                  >
                    + Crear colección nueva
                  </button>
                </div>
              )}

              {/* Opción 3: Ambas formas */}
              <label
                className={`flex items-center gap-3 rounded-lg p-3.5 cursor-pointer transition-all ${formData.disponibilidadVenta === 'ambas'
                  ? 'border-2 border-[#7C3AED] bg-[#F5F3FF]'
                  : 'border border-[#E5E7EB] hover:border-gray-300'
                  }`}
                onClick={() => updateFormData({ disponibilidadVenta: 'ambas' })}
              >
                <input
                  type="radio"
                  name="disponibilidadVenta"
                  checked={formData.disponibilidadVenta === 'ambas'}
                  onChange={() => { }}
                  className="accent-purple-600 flex-shrink-0"
                />
                <span className="text-xl flex-shrink-0">🔀</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-900 font-semibold">Ambas formas</span>
                  <p className="text-xs text-gray-500 mt-0.5">Se vende solo y también dentro de una colección</p>
                </div>
              </label>

              {/* Panel expandido para "Ambas formas" */}
              {formData.disponibilidadVenta === 'ambas' && (
                <div className="rounded-lg bg-[#F5F3FF] p-4 space-y-3 ml-8">
                  <Label className="text-xs text-gray-500">¿A qué colección pertenece?</Label>
                  {colecciones.length > 0 ? (
                    <select
                      value={formData.coleccionId || ''}
                      onChange={(e) => updateFormData({ coleccionId: e.target.value || undefined })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="" disabled>Seleccionar colección…</option>
                      {colecciones.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-gray-500">No tiene colecciones. Cree una para continuar.</p>
                  )}
                  <button
                    type="button"
                    onClick={abrirCollectionPanel}
                    className="w-full py-2.5 rounded-lg border-2 border-dashed border-purple-300 text-sm text-purple-600 font-medium hover:bg-purple-50 hover:border-purple-400 transition-colors cursor-pointer"
                  >
                    + Crear colección nueva
                  </button>
                  <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2">
                    <span className="text-xs text-green-700">✓ El precio individual y el precio de la colección son independientes.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Imagen del curso ──────────────────────────── */}
      {mode === 'course' && modalidades.length > 0 && (
        <Card className="p-6 space-y-5 border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold">Imagen del curso</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Cabecera visual de la página de venta.
                {modalidades.length >= 2 && <span className="text-purple-600"> La modalidad recomendada define la portada principal.</span>}
              </p>
            </div>
          </div>

          {modalidades.length >= 2 && (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div>
                <div className="text-sm text-gray-900">Usar la misma imagen para todas</div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {formData.usarImagenCompartida
                    ? 'Todas las modalidades comparten la misma imagen.'
                    : 'Cada modalidad tiene su propia imagen (editar desde el panel de cada una).'}
                </p>
              </div>
              <Switch
                checked={formData.usarImagenCompartida}
                onCheckedChange={(checked) => {
                  updateFormData({ usarImagenCompartida: !!checked });
                  // When switching to shared, copy shared image to all modalidades
                  if (checked && formData.imagenCompartida?.imageUrl) {
                    const updated = modalidades.map(m => ({
                      ...m,
                      bannerImage: { ...formData.imagenCompartida },
                    }));
                    updateFormData({ ofertas: updated });
                  }
                }}
              />
            </div>
          )}

          {/* Shared uploader (when only 1 modality OR shared mode) */}
          {(modalidades.length === 1 || formData.usarImagenCompartida) && (
            <BannerUploader
              image={modalidades.length === 1 ? modalidades[0].bannerImage : formData.imagenCompartida}
              onChange={(img) => {
                if (modalidades.length === 1) {
                  // Single modality: store directly on the modalidad
                  const updated = modalidades.map(m => ({ ...m, bannerImage: img }));
                  updateFormData({ ofertas: updated });
                } else {
                  // Shared: store in imagenCompartida AND apply to all
                  const updated = modalidades.map(m => ({ ...m, bannerImage: { ...img } }));
                  updateFormData({ imagenCompartida: img, ofertas: updated });
                }
              }}
              showPreview
              courseTitle={formData.tituloCurso || formData.titulo}
              courseSubtitle={formData.subtitulo}
              courseCategory={formData.categoria}
            />
          )}

          {/* Per-modality preview (when individual mode) */}
          {modalidades.length >= 2 && !formData.usarImagenCompartida && (
            <div className="space-y-2.5">
              {modalidades.map(m => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 hover:border-purple-200 transition-colors">
                  {m.bannerImage?.imageUrl ? (
                    <img
                      src={m.bannerImage.imageUrl}
                      alt=""
                      className="w-28 h-10 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                    />
                  ) : (
                    <div className="w-28 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-dashed border-gray-200">
                      <ImageIcon className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-800 truncate block">{m.nombreInterno || 'Sin nombre'}</span>
                    <span className="text-xs text-gray-400">
                      {m.bannerImage?.imageUrl ? `${m.bannerImage.imageWidth}×${m.bannerImage.imageHeight} px` : 'Sin imagen — clic en Editar'}
                    </span>
                  </div>
                  {m.recomendada && (
                    <Badge className="bg-purple-600 text-white text-[10px] px-2 py-0.5 flex-shrink-0 gap-1">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      Portada
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs text-purple-600 border-purple-200 hover:bg-purple-50"
                    onClick={() => editarModalidad(m)}
                  >
                    <Edit className="w-3 h-3 mr-1.5" /> Editar imagen
                  </Button>
                </div>
              ))}
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <Info className="w-3 h-3 flex-shrink-0" />
                Configure la imagen de cada modalidad desde su panel de edición.
                {modalidades.some(m => m.recomendada) && ' La imagen de la modalidad recomendada se usará como portada.'}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );

  // ============================================================================
  // RENDER - EDIT PANEL
  // ============================================================================

  const renderEditPanel = () => {
    if (!showEditPanel || !editingModalidad) return null;

    const sym = getOriginSymbol();
    const cur = getOriginCurrency();
    const allowDecimals = !['COP', 'CLP', 'ARS'].includes(cur);

    return (
      <Sheet open={showEditPanel} onOpenChange={cerrarPanel}>
        <SheetContent side="right" className="w-full sm:max-w-[560px] overflow-y-auto p-0">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-6 py-4">
            <SheetHeader className="p-0">
              <SheetTitle className="text-lg">
                {editMode === 'create' ? 'Nueva modalidad' : `Editar: ${editingModalidad.nombreInterno}`}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                {editMode === 'create'
                  ? 'Configure la estructura, precio y mercados de esta modalidad.'
                  : 'Modifique los detalles de esta modalidad.'}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* ── BLOQUE 1: Nombre ──────────────────────────── */}
            <section id="edit-section-1" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nombreInterno" className="text-sm">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="nombreInterno"
                    placeholder="Escriba un nombre o seleccione una de las sugerencias."
                    value={editingModalidad.nombreInterno}
                    spellCheck={true}
                    autoComplete="off"
                    aria-invalid={!!validationErrors.nombre}
                    className={validationErrors.nombre ? 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}
                    onFocus={() => {
                      if (editingModalidad.nombreInterno.trim().length > 0) {
                        setShowNameSuggestions(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingModalidad({ ...editingModalidad, nombreInterno: val });
                      setShowNameSuggestions(val.trim().length > 0);
                      if (validationErrors.nombre) setValidationErrors(v => ({ ...v, nombre: undefined }));
                    }}
                  />
                  {showNameSuggestions && (
                    (() => {
                      const filtered = NAME_SUGGESTIONS.filter(s =>
                        !editingModalidad.nombreInterno || s.toLowerCase().includes(editingModalidad.nombreInterno.toLowerCase())
                      );
                      if (filtered.length === 0 || (filtered.length === 1 && filtered[0] === editingModalidad.nombreInterno)) return null;
                      return (
                        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filtered.map(suggestion => (
                            <button
                              key={suggestion}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setEditingModalidad({ ...editingModalidad, nombreInterno: suggestion });
                                setShowNameSuggestions(false);
                                if (validationErrors.nombre) setValidationErrors(v => ({ ...v, nombre: undefined }));
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-pointer transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
                {validationErrors.nombre ? (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.nombre}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">Escriba un nombre o seleccione una de las sugerencias.</p>
                )}
              </div>

              {/* ── BLOQUE 2: ¿Cuándo pueden inscribirse? ─────── */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">¿Cuándo pueden inscribirse?</Label>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${editingModalidad.inscripcionTipo === 'siempre'
                      ? 'border-purple-600 border-2 bg-purple-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setEditingModalidad({ ...editingModalidad, inscripcionTipo: 'siempre', convocatoria: undefined })}
                  >
                    <input
                      type="radio"
                      name="inscripcionTipo"
                      checked={editingModalidad.inscripcionTipo === 'siempre'}
                      onChange={() => { }}
                      className="mt-0.5 accent-purple-600"
                    />
                    <div>
                      <span className="text-sm text-gray-900">🟢 Siempre disponible</span>
                      <p className="text-xs text-gray-500 mt-0.5">El alumno compra cuando quiera</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${editingModalidad.inscripcionTipo === 'convocatoria'
                      ? 'border-purple-600 border-2 bg-purple-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setEditingModalidad({
                      ...editingModalidad,
                      inscripcionTipo: 'convocatoria',
                      convocatoria: editingModalidad.convocatoria || {},
                    })}
                  >
                    <input
                      type="radio"
                      name="inscripcionTipo"
                      checked={editingModalidad.inscripcionTipo === 'convocatoria'}
                      onChange={() => { }}
                      className="mt-0.5 accent-purple-600"
                    />
                    <div>
                      <span className="text-sm text-gray-900">📅 Por convocatoria</span>
                      <p className="text-xs text-gray-500 mt-0.5">Defines fechas de inicio y cierre</p>
                    </div>
                  </label>
                </div>

                {/* Expanded convocatoria fields */}
                {editingModalidad.inscripcionTipo === 'convocatoria' && (() => {
                  const conv = editingModalidad.convocatoria || {};
                  const updateConv = (updates: Partial<NonNullable<typeof editingModalidad.convocatoria>>) => {
                    setEditingModalidad({
                      ...editingModalidad,
                      convocatoria: { ...conv, ...updates },
                    });
                  };
                  const summaryParts: string[] = [];
                  if (conv.inicioInscripcion && conv.cierreInscripcion) {
                    summaryParts.push(`Inscripción abierta del ${formatDateES(conv.inicioInscripcion)} al ${formatDateES(conv.cierreInscripcion)}`);
                  }
                  if (conv.inicioCurso) {
                    summaryParts.push(`El curso empieza el ${formatDateES(conv.inicioCurso)}`);
                  }
                  return (
                    <div className="rounded-lg bg-purple-50 p-4 space-y-4 mt-1">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-600">Inicio inscripción</Label>
                          <DatePickerField
                            value={conv.inicioInscripcion || ''}
                            onChange={(d) => updateConv({ inicioInscripcion: d })}
                            placeholder="Seleccionar…"
                            minDate={new Date()}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-600">Cierre inscripción</Label>
                          <DatePickerField
                            value={conv.cierreInscripcion || ''}
                            onChange={(d) => updateConv({ cierreInscripcion: d })}
                            placeholder="Seleccionar…"
                            minDate={conv.inicioInscripcion ? new Date(conv.inicioInscripcion + 'T00:00:00') : new Date()}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-600">Inicio del curso</Label>
                          <DatePickerField
                            value={conv.inicioCurso || ''}
                            onChange={(d) => updateConv({ inicioCurso: d })}
                            placeholder="Seleccionar…"
                            minDate={conv.inicioInscripcion ? new Date(conv.inicioInscripcion + 'T00:00:00') : new Date()}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-600">Fin del acompañamiento</Label>
                          <DatePickerField
                            value={conv.finAcompanamiento || ''}
                            onChange={(d) => updateConv({ finAcompanamiento: d })}
                            placeholder="Seleccionar…"
                            minDate={conv.inicioCurso ? new Date(conv.inicioCurso + 'T00:00:00') : new Date()}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-600">Plazas máximas (opcional)</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          className="bg-white"
                          placeholder="Sin límite"
                          value={conv.plazasMaximas ? String(conv.plazasMaximas) : ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            updateConv({ plazasMaximas: val ? parseInt(val) : undefined });
                          }}
                        />
                      </div>
                      {summaryParts.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {summaryParts.join('. ')}.
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* ── BLOQUE 3: ¿Qué acompañamiento incluye? ───── */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">¿Qué acompañamiento incluye?</Label>
                <div className="space-y-2">
                  {/* Opción 0: Sin acompañamiento (exclusiva) */}
                  {(() => {
                    const currentAcomp = editingModalidad.acompanamiento || [];
                    const isSelected = currentAcomp.includes('ninguno');
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingModalidad({
                            ...editingModalidad,
                            acompanamiento: isSelected ? [] : ['ninguno'],
                          });
                        }}
                        className={`w-full flex items-center gap-3 rounded-lg p-3.5 text-left transition-all cursor-pointer ${isSelected
                          ? 'border-2 border-[#7C3AED] bg-[#F5F3FF]'
                          : 'border border-[#E5E7EB] bg-white hover:border-gray-300'
                          }`}
                      >
                        <div className={`w-[18px] h-[18px] rounded flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'bg-[#7C3AED]' : 'border border-[#E5E7EB] bg-white'
                          }`}>
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          )}
                        </div>
                        <span className="text-lg flex-shrink-0">🎬</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-900 font-semibold">Sin acompañamiento</span>
                          <p className="text-xs text-gray-500 mt-0.5">Solo contenido grabado, sin canal de comunicación</p>
                        </div>
                      </button>
                    );
                  })()}

                  {/* Opción 1: Comunidad */}
                  {(() => {
                    const currentAcomp = editingModalidad.acompanamiento || [];
                    const isNinguno = currentAcomp.includes('ninguno');
                    const isSelected = currentAcomp.includes('comunidad');
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          const withoutNinguno = currentAcomp.filter(a => a !== 'ninguno');
                          const newAcomp = isSelected
                            ? withoutNinguno.filter(a => a !== 'comunidad')
                            : [...withoutNinguno, 'comunidad' as const];
                          setEditingModalidad({ ...editingModalidad, acompanamiento: newAcomp });
                        }}
                        className={`w-full flex items-center gap-3 rounded-lg p-3.5 text-left transition-all cursor-pointer ${isSelected
                          ? 'border-2 border-[#7C3AED] bg-[#F5F3FF]'
                          : isNinguno
                            ? 'border border-[#E5E7EB] bg-gray-50/60 opacity-50 hover:opacity-75'
                            : 'border border-[#E5E7EB] bg-white hover:border-gray-300'
                          }`}
                      >
                        <div className={`w-[18px] h-[18px] rounded flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'bg-[#7C3AED]' : 'border border-[#E5E7EB] bg-white'
                          }`}>
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          )}
                        </div>
                        <span className="text-lg flex-shrink-0">👥</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-900 font-semibold">Comunidad</span>
                          <p className="text-xs text-gray-500 mt-0.5">Foro privado entre alumnos del curso</p>
                        </div>
                      </button>
                    );
                  })()}

                  {/* Opción 2: Chat con instructor */}
                  {(() => {
                    const currentAcomp = editingModalidad.acompanamiento || [];
                    const isNinguno = currentAcomp.includes('ninguno');
                    const isSelected = currentAcomp.includes('chat_instructor');
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          const withoutNinguno = currentAcomp.filter(a => a !== 'ninguno');
                          const newAcomp = isSelected
                            ? withoutNinguno.filter(a => a !== 'chat_instructor')
                            : [...withoutNinguno, 'chat_instructor' as const];
                          const updates: Partial<OfertaCurso> = { acompanamiento: newAcomp };
                          if (!isSelected && !editingModalidad.chatConfig) {
                            updates.chatConfig = { preguntasPorAlumno: 5, tiempoRespuesta: '72h' };
                          }
                          setEditingModalidad({ ...editingModalidad, ...updates });
                        }}
                        className={`w-full flex items-center gap-3 rounded-lg p-3.5 text-left transition-all cursor-pointer ${isSelected
                          ? 'border-2 border-[#7C3AED] bg-[#F5F3FF]'
                          : isNinguno
                            ? 'border border-[#E5E7EB] bg-gray-50/60 opacity-50 hover:opacity-75'
                            : 'border border-[#E5E7EB] bg-white hover:border-gray-300'
                          }`}
                      >
                        <div className={`w-[18px] h-[18px] rounded flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'bg-[#7C3AED]' : 'border border-[#E5E7EB] bg-white'
                          }`}>
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          )}
                        </div>
                        <span className="text-lg flex-shrink-0">💬</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900 font-semibold">Chat con instructor</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">Requiere convocatoria</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">Canal directo asíncrono</p>
                        </div>
                      </button>
                    );
                  })()}

                  {/* Opción 3: Prácticas presenciales (desactivada) */}
                  <div className="w-full flex items-center gap-3 rounded-lg p-3.5 text-left border border-[#E5E7EB] bg-gray-50/60 opacity-60 cursor-not-allowed">
                    <div className="w-[18px] h-[18px] rounded flex-shrink-0 border border-gray-300 bg-gray-100" />
                    <span className="text-lg flex-shrink-0 grayscale">🏥</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 font-semibold">Prácticas presenciales</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 font-medium">Próximamente</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aviso: seleccionó Chat con instructor pero inscripción es "siempre" */}
                {editingModalidad.acompanamiento?.includes('chat_instructor') && editingModalidad.inscripcionTipo === 'siempre' && (
                  <div className="flex items-start gap-2 rounded-lg bg-[#FEF2F2] border border-red-200 p-3">
                    <span className="text-sm flex-shrink-0 mt-px">⚠️</span>
                    <p className="text-xs text-[#DC2626]">
                      El chat con instructor requiere convocatoria. El modo de inscripción cambiará automáticamente a «Por convocatoria».
                    </p>
                  </div>
                )}

                {/* Expanded chat config */}
                {editingModalidad.acompanamiento?.includes('chat_instructor') && (() => {
                  const config = editingModalidad.chatConfig || { preguntasPorAlumno: 5, tiempoRespuesta: '72h' as const };
                  const updateChat = (updates: Partial<NonNullable<typeof editingModalidad.chatConfig>>) => {
                    setEditingModalidad({
                      ...editingModalidad,
                      chatConfig: { ...config, ...updates },
                    });
                  };
                  const preguntasLabel = config.preguntasPorAlumno;
                  const tiempoLabel = config.tiempoRespuesta === '48h' ? '48 horas' : config.tiempoRespuesta === '72h' ? '72 horas' : '7 días';
                  return (
                    <div className="rounded-lg bg-purple-50 p-4 space-y-4 mt-1">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">¿Cuántas preguntas puede hacer cada alumno?</Label>
                        <div className="flex gap-2">
                          {([3, 5, 10, 15] as const).map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => updateChat({ preguntasPorAlumno: n })}
                              className={`px-3.5 py-1.5 rounded-md text-sm transition-all cursor-pointer ${config.preguntasPorAlumno === n
                                ? 'bg-purple-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                                }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">¿En cuánto tiempo se compromete a responder?</Label>
                        <div className="flex gap-2">
                          {([
                            { value: '48h' as const, label: '48 horas' },
                            { value: '72h' as const, label: '72 horas' },
                            { value: '7d' as const, label: '7 días' },
                          ]).map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => updateChat({ tiempoRespuesta: opt.value })}
                              className={`px-3.5 py-1.5 rounded-md text-sm transition-all cursor-pointer ${config.tiempoRespuesta === opt.value
                                ? 'bg-purple-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                                }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-md bg-white border border-gray-200 p-3">
                        <p className="text-xs text-purple-700">
                          👁 Tus alumnos verán: <strong>Hasta {preguntasLabel} preguntas al instructor · Respuesta en máx. {tiempoLabel}</strong>
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* ── BLOQUE 4: ¿Cuánto dura el acceso al contenido? ─ */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">¿Cuánto dura el acceso al contenido?</Label>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${editingModalidad.accesoContenido === 'vitalicio'
                      ? 'border-purple-600 border-2 bg-purple-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setEditingModalidad({
                      ...editingModalidad,
                      accesoContenido: 'vitalicio',
                      accesoMeses: undefined,
                      bloqueAcceso: { ...editingModalidad.bloqueAcceso, tipo: 'permanente', duracionMeses: undefined },
                    })}
                  >
                    <input
                      type="radio"
                      name="accesoContenido"
                      checked={editingModalidad.accesoContenido === 'vitalicio'}
                      onChange={() => { }}
                      className="mt-0.5 accent-purple-600"
                    />
                    <div>
                      <span className="text-sm text-gray-900">♾️ Vitalicio</span>
                      <p className="text-xs text-gray-500 mt-0.5">El alumno siempre podrá ver el contenido</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${editingModalidad.accesoContenido === 'por_meses'
                      ? 'border-purple-600 border-2 bg-purple-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setEditingModalidad({
                      ...editingModalidad,
                      accesoContenido: 'por_meses',
                      accesoMeses: editingModalidad.accesoMeses || 3,
                      bloqueAcceso: { ...editingModalidad.bloqueAcceso, tipo: 'limitado', duracionMeses: editingModalidad.accesoMeses || 3 },
                    })}
                  >
                    <input
                      type="radio"
                      name="accesoContenido"
                      checked={editingModalidad.accesoContenido === 'por_meses'}
                      onChange={() => { }}
                      className="mt-0.5 accent-purple-600"
                    />
                    <div>
                      <span className="text-sm text-gray-900">⏱️ Por meses</span>
                      <p className="text-xs text-gray-500 mt-0.5">El acceso expira tras el período elegido</p>
                    </div>
                  </label>
                </div>

                {editingModalidad.accesoContenido === 'por_meses' && (
                  <div className="space-y-2 mt-1">
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 6, 12].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setEditingModalidad({
                            ...editingModalidad,
                            accesoMeses: m,
                            bloqueAcceso: { ...editingModalidad.bloqueAcceso, tipo: 'limitado', duracionMeses: m },
                          })}
                          className={`px-3.5 py-1.5 rounded-full text-sm transition-all cursor-pointer ${editingModalidad.accesoMeses === m
                            ? 'bg-purple-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          {m} {m === 1 ? 'mes' : 'meses'}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      El acompañamiento siempre termina con la convocatoria, independientemente del acceso al contenido.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* ── SECTION 2: Precio ─────────────────────────── */}
            <section id="edit-section-2" className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900">
                <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center text-xs text-purple-700">2</div>
                <span className="text-sm font-semibold">Precio</span>
              </div>

              {/* Origin country — automatic from profile */}
              <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 border border-gray-200 px-3.5 py-2.5">
                <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800">
                    Mercado principal: <strong>{originCountry.name}</strong>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Detectado desde su país de colegiatura · Moneda: {originCountry.currency}
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 flex-shrink-0">
                  {originCountryCode}
                </Badge>
              </div>

              {/* Price card — controlled text input for clean formatting */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 space-y-1.5">
                  <Label htmlFor="precioBase" className="text-sm">
                    Precio al alumno ({cur}) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{sym}</span>
                    <Input
                      id="precioBase"
                      type="text"
                      inputMode="decimal"
                      className={`pl-8 bg-white ${validationErrors.precio ? 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}`}
                      placeholder={getPricePlaceholder(cur)}
                      value={priceInputDisplay}
                      onChange={(e) => {
                        const cleaned = sanitizeNumericInput(e.target.value, allowDecimals);
                        setPriceInputDisplay(cleaned);
                        const num = parseFloat(cleaned) || 0;
                        setEditingModalidad(prev => prev ? { ...prev, precioBase: num } : prev);
                        if (validationErrors.precio) setValidationErrors(v => ({ ...v, precio: undefined }));
                        if (enableCountryPricing) {
                          recalculateCountryPrices(num);
                        }
                      }}
                      onBlur={() => {
                        const num = parseFloat(priceInputDisplay) || 0;
                        setPriceInputDisplay(num > 0 ? String(num) : '');
                      }}
                    />
                  </div>
                  {validationErrors.precio ? (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.precio}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Precio con impuesto incluido. Es lo que verá el alumno.
                    </p>
                  )}
                </div>

                {editingModalidad.precioBase > 0 && (() => {
                  const price = editingModalidad.precioBase;
                  const taxRate = originCountry.taxRate;
                  const taxName = originCountry.taxName;
                  const taxAmount = calcTax(price, taxRate);
                  const preTax = price - taxAmount;
                  const commission = preTax * PLATFORM_COMMISSION;
                  const net = preTax - commission;
                  return (
                    <div className="border-t border-gray-100 text-sm">
                      {taxRate > 0 && (
                        <div className="flex items-center justify-between px-4 py-2 text-gray-500">
                          <span>{taxName} incluido ({(taxRate * 100).toFixed(0)}%)</span>
                          <span>{sym}{formatPrice(taxAmount, cur)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between px-4 py-2 text-gray-500">
                        <span>Comisión plataforma ({(PLATFORM_COMMISSION * 100).toFixed(0)}%)</span>
                        <span>{sym}{formatPrice(commission, cur)}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-2.5 bg-green-50">
                        <span className="text-green-700">Usted recibe</span>
                        <span className="text-green-700">{sym}{formatPrice(net, cur)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>

            <Separator />

            {/* ── SECTION 3: Mercados ───────────────────────── */}
            <section id="edit-section-3" className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900">
                <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center text-xs text-purple-700">3</div>
                <span className="text-sm font-semibold">Mercados</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3.5">
                <div>
                  <div className="text-sm text-gray-900">Vender también en otros países</div>
                  <p className="text-xs text-gray-500 mt-0.5">Active esta opción para ajustar precios por mercado.</p>
                </div>
                <Switch checked={enableCountryPricing} onCheckedChange={handleEnableCountryPricing} />
              </div>

              {enableCountryPricing && (
                <div className="space-y-3">
                  {/* Explanation for professor */}
                  <div className="bg-purple-50 rounded-lg p-3 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-purple-700">
                      Su curso se venderá en {originCountry.name} al precio definido arriba.
                      Aquí puede añadir otros mercados con precios ajustados en {getOriginCurrency()}.
                      Si desea vender <strong>solo</strong> en otros países, puede desactivar su mercado principal desde la configuración avanzada de su cuenta.
                    </p>
                  </div>

                  {/* Available countries (excluding origin) */}
                  {(() => {
                    const availableForAdd = COUNTRIES.filter(
                      c => c.code !== originCountryCode && !countryPricing.some(cp => cp.countryCode === c.code)
                    );
                    return availableForAdd.length > 0 ? (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Añadir mercado</Label>
                        <Select
                          value={selectedCountryCode}
                          onValueChange={(value) => {
                            if (value) {
                              addCountry(value);
                              setSelectedCountryCode('');
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar país..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableForAdd.map(c => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.flag} {c.name} ({c.currency})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null;
                  })()}

                  {/* Country pricing — condensed single-line rows */}
                  {countryPricing.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {countryPricing.map((country) => {
                          const countryData = COUNTRIES.find(c => c.code === country.countryCode);
                          const taxRate = countryData?.taxRate || 0;
                          const netLocal = calcNet(country.localPrice, taxRate);
                          const netInOrigin = convertCurrency(netLocal, country.currency, originCountry.currency, COUNTRIES);

                          return (
                            <div key={country.id} className="flex items-center gap-2 px-3 py-2.5">
                              <span className="inline-flex items-center justify-center w-7 h-5 rounded text-[10px] bg-gray-100 text-gray-600 shrink-0 tracking-wide">
                                {country.countryCode}
                              </span>
                              <span className="text-xs text-gray-700 shrink-0 min-w-0 truncate max-w-[80px]">{country.countryName}</span>

                              <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                                <span className="text-xs text-gray-400">{getOriginSymbol()}</span>
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  className="h-7 text-xs w-20 bg-white text-right"
                                  placeholder="0"
                                  value={country.originPrice > 0 ? String(country.originPrice) : ''}
                                  onChange={(e) => {
                                    const cleaned = sanitizeNumericInput(e.target.value, allowDecimals);
                                    updateCountryOriginPrice(country.id, parseFloat(cleaned) || 0);
                                  }}
                                  onBlur={(e) => updateCountryOriginPrice(country.id, parseFloat(e.target.value) || 0)}
                                />
                              </div>

                              <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                              <span className="text-[11px] text-gray-500 flex-shrink-0 whitespace-nowrap">
                                {country.currencySymbol}{formatPrice(country.localPrice, country.currency)}
                              </span>

                              <span className="text-[11px] text-green-600 flex-shrink-0 whitespace-nowrap">
                                → {getOriginSymbol()}{formatPrice(smartRound(netInOrigin, getOriginCurrency()), getOriginCurrency())}
                              </span>

                              <button onClick={() => removeCountry(country.id)}
                                className="p-0.5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400">
                        <span className="ml-auto">Su precio ({getOriginCurrency()})</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                        <span>Alumno paga</span>
                        <span className="text-green-500">→ Usted recibe</span>
                      </div>
                    </div>
                  )}

                  {countryPricing.length === 0 && (
                    <div className="text-center py-4 text-sm text-gray-400">
                      Seleccione un país arriba para comenzar a configurar precios por mercado.
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-gray-500 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-gray-600">¿Cómo funciona?</strong> El precio de su mercado principal ({originCountry.name}) ya está definido arriba.
                        Aquí puede ajustar el precio al alumno para otros países en {getOriginCurrency()}.
                        El sistema convierte automáticamente a la moneda local (impuesto incluido).
                        De ese precio se descuenta el impuesto local y la comisión ({(PLATFORM_COMMISSION * 100).toFixed(0)}%), y el resto es lo que usted recibe.
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-400 pl-5">
                      Los tipos de cambio son referenciales. Puede ajustar el precio por mercado según su estrategia.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* ── SECTION 4: Imagen de esta modalidad ─────── */}
            {modalidades.length >= 2 && !formData.usarImagenCompartida && (
              <>
                <Separator />
                <section id="edit-section-4" className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-900">
                    <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center text-xs text-purple-700">4</div>
                    <span className="text-sm font-semibold">Imagen de esta modalidad</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Suba una imagen para esta modalidad. Recomendado: 1200×400 px (formato 3:1 panorámico).
                  </p>
                  <BannerUploader
                    image={editingModalidad.bannerImage}
                    onChange={(img) =>
                      setEditingModalidad(prev => prev ? { ...prev, bannerImage: img } : prev)
                    }
                    compact
                  />
                </section>
              </>
            )}

            {/* Warning for edits */}
            {editMode === 'edit' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  Los cambios aplicarán solo a futuras compras. Los alumnos actuales conservan sus condiciones.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
            <Button variant="outline" onClick={cerrarPanel} className="flex-1">Cancelar</Button>
            <Button onClick={guardarModalidad} className="flex-1 bg-purple-600 hover:bg-purple-700">
              {editMode === 'create' ? 'Crear modalidad' : 'Guardar cambios'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  // ============================================================================
  // RENDER - PROMOTION DRAWER
  // ============================================================================

  const renderPromotionDrawer = () => {
    if (!showPromotionDrawer || !currentPromotion) return null;

    const previewPrice = getPromotionPreviewPrice();
    const promoModalidad = modalidades.find(m => m.id === promotionModalidadId);
    const promoSym = originCountry.symbol;
    const promoCur = originCountry.currency;
    const isEditingExisting = (promoModalidad?.promociones || []).some(p => p.id === currentPromotion.id);
    const promoAllowDecimals = !['COP', 'CLP', 'ARS'].includes(promoCur);

    return (
      <Sheet open={showPromotionDrawer} onOpenChange={cerrarPromotionDrawer}>
        <SheetContent side="right" className="w-full sm:max-w-[520px] overflow-y-auto p-0">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-6 py-4">
            <SheetHeader className="p-0">
              <SheetTitle>
                {isEditingExisting ? 'Editar promoción' : 'Añadir promoción'}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                {promoModalidad ? `Para: ${promoModalidad.nombreInterno}` : 'Modifica temporalmente el precio.'}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Active toggle + rule */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3.5">
              <div>
                <div className="text-sm text-gray-900">Promoción activa</div>
                <p className="text-xs text-gray-500 mt-0.5">Solo una promoción puede estar activa por modalidad.</p>
              </div>
              <Switch
                checked={currentPromotion.active}
                onCheckedChange={(checked) => {
                  setCurrentPromotion({ ...currentPromotion, active: !!checked });
                }}
              />
            </div>

            {!currentPromotion.active && (
              <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500">
                  Esta promoción se guardará como <strong>inactiva</strong>. Podrá activarla después desde la tarjeta de modalidad.
                </p>
              </div>
            )}

            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="promo-name" className="text-sm">Nombre <span className="text-red-500">*</span></Label>
              <Input id="promo-name" placeholder="Ej: Black Friday 2026, Lanzamiento"
                value={currentPromotion.name}
                onChange={(e) => setCurrentPromotion({ ...currentPromotion, name: e.target.value })} />
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <Label className="text-sm">Tipo de promoción</Label>
              <select value={currentPromotion.type}
                onChange={(e) => setCurrentPromotion({ ...currentPromotion, type: e.target.value as PromotionType, value: 0, bonusItems: [] })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="percentage">Descuento porcentual (%)</option>
                <option value="fixed">Precio fijo temporal ({promoSym})</option>
                <option value="bonus">Bonus añadido (mismo precio)</option>
              </select>
            </div>

            {/* Percentage discount — text input, no spinners */}
            {currentPromotion.type === 'percentage' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="promo-pct" className="text-sm">Porcentaje de descuento</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="promo-pct"
                      type="text"
                      inputMode="numeric"
                      placeholder="10"
                      className="flex-1"
                      value={currentPromotion.value > 0 ? String(currentPromotion.value) : ''}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, '');
                        const num = Math.min(99, parseInt(cleaned) || 0);
                        setCurrentPromotion({ ...currentPromotion, value: num });
                      }}
                    />
                    <span className="text-sm text-gray-500 flex-shrink-0">%</span>
                  </div>
                </div>
                {previewPrice && (() => {
                  const promoTaxRate = originCountry.taxRate;
                  const promoNet = calcNet(previewPrice.final, promoTaxRate);
                  return (
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                      <p className="text-xs text-gray-500 mb-1.5">Vista previa del precio</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm line-through text-gray-400">{promoSym}{formatPrice(previewPrice.original, promoCur)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-lg text-purple-700">{promoSym}{formatPrice(previewPrice.final, promoCur)}</span>
                        <Badge className="bg-green-100 text-green-800 text-xs ml-auto">{currentPromotion.value}%</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Usted recibe: {promoSym}{formatPrice(promoNet, promoCur)}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Fixed price — text input, clean formatting */}
            {currentPromotion.type === 'fixed' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="promo-fixed" className="text-sm">Precio temporal ({promoCur})</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{promoSym}</span>
                    <Input id="promo-fixed" type="text" inputMode="decimal" placeholder="0"
                      className="pl-8"
                      value={currentPromotion.value > 0 ? String(currentPromotion.value) : ''}
                      onChange={(e) => {
                        const cleaned = sanitizeNumericInput(e.target.value, promoAllowDecimals);
                        setCurrentPromotion({ ...currentPromotion, value: parseFloat(cleaned) || 0 });
                      }}
                      onBlur={() => {
                        const val = currentPromotion.value;
                        // Force re-render clean display handled by value prop
                      }}
                    />
                  </div>
                </div>
                {previewPrice && (() => {
                  const promoTaxRate = originCountry.taxRate;
                  const promoNet = calcNet(previewPrice.final, promoTaxRate);
                  return (
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                      <p className="text-xs text-gray-500 mb-1.5">Vista previa del precio</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm line-through text-gray-400">{promoSym}{formatPrice(previewPrice.original, promoCur)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-lg text-purple-700">{promoSym}{formatPrice(previewPrice.final, promoCur)}</span>
                        {previewPrice.original > 0 && (
                          <Badge className="bg-green-100 text-green-800 text-xs ml-auto">
                            {Math.round((1 - previewPrice.final / previewPrice.original) * 100)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Usted recibe: {promoSym}{formatPrice(promoNet, promoCur)}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Bonus */}
            {currentPromotion.type === 'bonus' && (
              <div className="space-y-3">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-xs text-purple-800">
                    El alumno paga el mismo precio pero obtiene extras temporales. Puede ofrecer contenido existente de su curso o subir un recurso nuevo.
                  </p>
                </div>

                {currentPromotion.bonusItems.map((item, idx) => (
                  <div key={item.id} className="rounded-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                      <span className="text-xs text-gray-500">Bonus {idx + 1}</span>
                      <button onClick={() => removeBonusItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-0.5">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3 space-y-3">
                      {/* Category selector as visual cards */}
                      <div className="grid grid-cols-2 gap-2">
                        {BONUS_CATEGORIES.map(bc => (
                          <button
                            key={bc.value}
                            type="button"
                            onClick={() => updateBonusItem(item.id, { category: bc.value, selectedModuleIds: [], resourceFileName: '' })}
                            className={`flex items-start gap-2 rounded-lg border p-2.5 text-left transition-all cursor-pointer ${item.category === bc.value
                              ? 'border-purple-300 bg-purple-50 ring-1 ring-purple-200'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                          >
                            <span className="text-base flex-shrink-0 mt-0.5">{bc.icon}</span>
                            <div>
                              <div className={`text-xs ${item.category === bc.value ? 'text-purple-800' : 'text-gray-700'}`}>{bc.label}</div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Hint for selected category */}
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Info className="w-3 h-3 flex-shrink-0" />
                        {BONUS_CATEGORIES.find(bc => bc.value === item.category)?.hint}
                      </p>

                      {/* COURSE CONTENT: show modules to select */}
                      {item.category === 'course_content' && (
                        <div className="space-y-2">
                          {formData.modulos && formData.modulos.length > 0 ? (
                            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-40 overflow-y-auto">
                              {formData.modulos.map(mod => (
                                <label key={mod.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                                  <Checkbox
                                    checked={item.selectedModuleIds?.includes(mod.id) || false}
                                    onCheckedChange={() => {
                                      const current = item.selectedModuleIds || [];
                                      const updated = current.includes(mod.id)
                                        ? current.filter(id => id !== mod.id)
                                        : [...current, mod.id];
                                      updateBonusItem(item.id, { selectedModuleIds: updated });
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm text-gray-800 truncate block">{mod.nombre || 'Módulo sin nombre'}</span>
                                    <span className="text-[11px] text-gray-400">{mod.bloques?.length || 0} bloques</span>
                                  </div>
                                  <BookOpen className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-800">
                                No tiene módulos creados todavía. Añada contenido en el paso «Construye» para poder seleccionarlo como bonus.
                              </p>
                            </div>
                          )}
                          <Input placeholder="Describa qué recibirá el alumno como bonus…"
                            value={item.description}
                            spellCheck={true}
                            onChange={(e) => updateBonusItem(item.id, { description: e.target.value })} />
                        </div>
                      )}

                      {/* NEW RESOURCE: file type + upload simulation + description */}
                      {item.category === 'new_resource' && (
                        <div className="space-y-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Tipo de recurso</Label>
                            <select value={item.resourceType || 'pdf'}
                              onChange={(e) => updateBonusItem(item.id, { resourceType: e.target.value as 'pdf' | 'template' | 'guide' | 'checklist' | 'other' })}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                              {RESOURCE_TYPES.map(rt => (
                                <option key={rt.value} value={rt.value}>{rt.label}</option>
                              ))}
                            </select>
                          </div>
                          {/* Simulated file upload area */}
                          <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center hover:border-purple-300 transition-colors cursor-pointer"
                            onClick={() => {
                              const fakeNames: Record<string, string> = {
                                pdf: 'bonus-recurso.pdf',
                                template: 'plantilla-bonus.docx',
                                guide: 'guia-complementaria.pdf',
                                checklist: 'checklist-bonus.pdf',
                                other: 'recurso-extra.zip',
                              };
                              const name = fakeNames[item.resourceType || 'pdf'] || 'archivo-bonus.pdf';
                              updateBonusItem(item.id, { resourceFileName: name });
                              toast.success(`Archivo "${name}" adjuntado (simulado).`);
                            }}
                          >
                            {item.resourceFileName ? (
                              <div className="flex items-center justify-center gap-2 text-sm text-purple-700">
                                <FileText className="w-4 h-4" />
                                <span>{item.resourceFileName}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateBonusItem(item.id, { resourceFileName: '' });
                                  }}
                                  className="text-gray-400 hover:text-red-500 ml-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1.5 text-gray-400">
                                <Upload className="w-5 h-5" />
                                <span className="text-xs">Pulse para subir el archivo</span>
                                <span className="text-[10px] text-gray-300">PDF, DOCX, ZIP — Máx. 50 MB</span>
                              </div>
                            )}
                          </div>
                          <Input placeholder="Describa qué contiene este recurso…"
                            value={item.description}
                            spellCheck={true}
                            onChange={(e) => updateBonusItem(item.id, { description: e.target.value })} />
                        </div>
                      )}

                      {/* SESSION: just description */}
                      {item.category === 'session' && (
                        <Input placeholder="Ej: Webinar exclusivo de Q&A el 15 de marzo…"
                          value={item.description}
                          spellCheck={true}
                          onChange={(e) => updateBonusItem(item.id, { description: e.target.value })} />
                      )}

                      {/* ACCESS: just description */}
                      {item.category === 'access' && (
                        <Input placeholder="Ej: 3 meses adicionales de acceso al curso…"
                          value={item.description}
                          spellCheck={true}
                          onChange={(e) => updateBonusItem(item.id, { description: e.target.value })} />
                      )}
                    </div>
                  </div>
                ))}

                <Button variant="outline" size="sm" onClick={addBonusItem}
                  className="w-full border-dashed border-gray-300 text-gray-500 hover:border-purple-300 hover:text-purple-600 gap-1.5">
                  <Gift className="w-3.5 h-3.5" /> Añadir bonus
                </Button>
              </div>
            )}

            <Separator />

            {/* Fechas — DatePickerField instead of native date inputs */}
            <div className="space-y-1.5">
              <Label className="text-sm">Periodo de la promoción</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500 block">Inicio</Label>
                  <DatePickerField
                    value={currentPromotion.startDate}
                    onChange={(date) => setCurrentPromotion({ ...currentPromotion, startDate: date })}
                    placeholder="Fecha inicio…"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500 block">Fin</Label>
                  <DatePickerField
                    value={currentPromotion.endDate}
                    onChange={(date) => setCurrentPromotion({ ...currentPromotion, endDate: date })}
                    placeholder="Fecha fin…"
                    minDate={currentPromotion.startDate ? new Date(currentPromotion.startDate + 'T00:00:00') : undefined}
                  />
                </div>
              </div>
              {currentPromotion.startDate && currentPromotion.endDate && (
                <p className="text-[11px] text-gray-400">
                  {formatDateES(currentPromotion.startDate)} → {formatDateES(currentPromotion.endDate)}
                </p>
              )}
            </div>

            <Separator />

            {/* Países – multi-select dropdown */}
            <div className="space-y-3">
              <Label className="text-sm">Aplicar a países</Label>
              <div className="relative" ref={countriesDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCountriesDropdownOpen(!countriesDropdownOpen)}
                  className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <span className={currentPromotion.allCountries ? 'text-gray-900' : (currentPromotion.selectedCountries.length > 0 ? 'text-gray-900' : 'text-gray-400')}>
                    {currentPromotion.allCountries
                      ? 'Todos los países'
                      : currentPromotion.selectedCountries.length > 0
                        ? `${currentPromotion.selectedCountries.length} país${currentPromotion.selectedCountries.length > 1 ? 'es' : ''} seleccionado${currentPromotion.selectedCountries.length > 1 ? 's' : ''}`
                        : 'Seleccione países…'
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${countriesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {countriesDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
                    {/* "Todos los países" option */}
                    <label className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-purple-50 cursor-pointer transition-colors border-b border-gray-100">
                      <Checkbox
                        checked={currentPromotion.allCountries}
                        onCheckedChange={(checked) => {
                          setCurrentPromotion({
                            ...currentPromotion,
                            allCountries: !!checked,
                            selectedCountries: checked ? [] : [],
                          });
                          if (checked) setCountriesDropdownOpen(false);
                        }}
                      />
                      <span className="text-sm">
                        <strong>Todos los países</strong>
                      </span>
                      {currentPromotion.allCountries && (
                        <Check className="w-4 h-4 text-purple-600 ml-auto" />
                      )}
                    </label>
                    {/* Individual countries */}
                    {COUNTRIES.map(country => (
                      <label key={country.code}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                        <Checkbox
                          checked={!currentPromotion.allCountries && currentPromotion.selectedCountries.includes(country.code)}
                          onCheckedChange={() => {
                            if (currentPromotion.allCountries) {
                              setCurrentPromotion({
                                ...currentPromotion,
                                allCountries: false,
                                selectedCountries: [country.code],
                              });
                            } else {
                              togglePromoCountry(country.code);
                            }
                          }}
                        />
                        <span className="text-sm">
                          {country.flag} {country.name}
                          <span className="text-gray-400 ml-1">({country.currency})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {/* Selected countries badges (when not "all") */}
              {!currentPromotion.allCountries && currentPromotion.selectedCountries.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {currentPromotion.selectedCountries.map(code => {
                    const c = COUNTRIES.find(ac => ac.code === code);
                    return c ? (
                      <Badge key={code} className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 gap-1 cursor-pointer hover:bg-purple-100"
                        onClick={() => togglePromoCountry(code)}>
                        {c.flag} {c.name}
                        <X className="w-3 h-3" />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
            <Button variant="outline" onClick={cerrarPromotionDrawer} className="flex-1">Cancelar</Button>
            <Button onClick={guardarPromocion}
              className="flex-1 bg-purple-600 hover:bg-purple-700">
              {isEditingExisting ? 'Guardar cambios' : 'Crear promoción'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  // ============================================================================
  // RENDER - COLLECTION PANEL
  // ============================================================================

  const renderCollectionPanel = () => {
    if (!showCollectionPanel) return null;

    return (
      <Sheet open={showCollectionPanel} onOpenChange={cerrarCollectionPanel}>
        <SheetContent side="right" className="w-full sm:max-w-[480px] overflow-y-auto p-0">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-6 py-4">
            <SheetHeader className="p-0">
              <SheetTitle className="text-lg">Nueva colección</SheetTitle>
              <SheetDescription className="text-sm text-gray-500">
                Agrupe varios cursos en un solo producto con precio combinado.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="col-nombre" className="text-sm">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="col-nombre"
                placeholder="Ej: Especialización en Cardiología"
                value={newCollectionName}
                aria-invalid={!!collectionValidationError}
                className={collectionValidationError ? 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}
                onChange={(e) => {
                  setNewCollectionName(e.target.value);
                  if (collectionValidationError) setCollectionValidationError('');
                }}
              />
              {collectionValidationError ? (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {collectionValidationError}
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Nombre visible para los alumnos en la página de venta.
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="col-desc" className="text-sm">Descripción (opcional)</Label>
              <textarea
                id="col-desc"
                rows={3}
                placeholder="Explique brevemente qué incluye esta colección y por qué es conveniente…"
                value={newCollectionDesc}
                onChange={(e) => setNewCollectionDesc(e.target.value)}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 hover:border-gray-400 focus-visible:border-purple-500 focus-visible:ring-purple-500/20 focus-visible:ring-[3px] outline-none resize-none"
              />
              <p className="text-xs text-gray-400">
                Aparecerá como subtítulo en la tarjeta de la colección.
              </p>
            </div>

            {/* Info */}
            <div className="bg-purple-50 rounded-lg p-3.5 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-purple-700 space-y-1">
                <p>La colección se creará como borrador. Podrá añadir más cursos y configurar el precio combinado desde el panel de colecciones.</p>
                <p>Este curso se asignará automáticamente a la colección al guardar.</p>
              </div>
            </div>

            {/* Preview */}
            {newCollectionName.trim() && (
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Vista previa</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-semibold truncate">{newCollectionName.trim()}</p>
                    {newCollectionDesc.trim() && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{newCollectionDesc.trim()}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-0.5">1 curso · Borrador</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
            <Button variant="outline" onClick={cerrarCollectionPanel} className="flex-1">Cancelar</Button>
            <Button onClick={guardarColeccion} className="flex-1 bg-purple-600 hover:bg-purple-700">
              Crear colección
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <DndProvider backend={HTML5Backend}>
      {renderMainView()}
      {renderEditPanel()}
      {renderPromotionDrawer()}
      {renderCollectionPanel()}
      {renderDeleteConfirmation()}
    </DndProvider>
  );
}
