/**
 * Clases CSS compartidas para componentes comunes.
 * Importar desde aquí en lugar de duplicar.
 */

export const inputClass = [
  'w-full px-4 py-3 bg-slate-50 border border-slate-200',
  'rounded-xl text-sm text-slate-900',
  'placeholder:text-slate-400',
  'focus:outline-none focus:ring-2',
  'focus:ring-purple-500/30 focus:border-purple-400',
  'transition-all duration-200',
  'disabled:opacity-60 disabled:cursor-not-allowed',
].join(' ');

export const inputClassWhite = [
  'w-full px-4 py-3 bg-white border border-slate-200',
  'rounded-xl text-sm text-slate-900',
  'placeholder:text-slate-400',
  'focus:outline-none focus:ring-2',
  'focus:ring-purple-500/30 focus:border-purple-400',
  'transition-all duration-200',
].join(' ');

export const buttonPrimary = [
  'bg-purple-600 hover:bg-purple-700 text-white',
  'font-semibold rounded-xl transition-all duration-200',
  'shadow-sm hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)]',
  'disabled:opacity-60 disabled:cursor-not-allowed',
].join(' ');

export const buttonOutline = [
  'border border-slate-200 text-slate-600',
  'hover:border-purple-400 hover:text-purple-600',
  'rounded-xl transition-all duration-200 font-medium',
].join(' ');
