import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header simple para el Editor */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center font-bold text-white">
              Ú
            </div>
            <span className="font-bold text-xl text-gray-900">HealthLearn - Médicos Creadores</span>
          </div>
          
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <X className="w-4 h-4" />
              Salir del editor
            </Button>
          </Link>
        </div>
      </header>

      {/* El contenido del Wizard */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}