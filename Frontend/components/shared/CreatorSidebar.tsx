'use client';

import { Video, MessageSquare, TrendingUp, Wrench, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const menuItems = [
  { id: 'courses', label: 'Cursos', icon: Video },
  { id: 'communication', label: 'Comunicación', icon: MessageSquare },
  { id: 'analytics', label: 'Rendimiento', icon: TrendingUp },
  { id: 'tools', label: 'Herramientas', icon: Wrench },
  { id: 'resources', label: 'Recursos', icon: BookOpen },
];

export function CreatorSidebar() {
  // Estado opcional para saber en qué sección está el scroll actualmente
  const [activeSection, setActiveSection] = useState('courses');

  useEffect(() => {
    const handleScroll = () => {
      const sections = menuItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      sections.forEach(section => {
        if (section && scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 text-gray-800 flex flex-col h-screen fixed left-0 top-0 shadow-sm z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center font-bold text-white">
            Ú
          </div>
          <span className="font-bold text-xl text-gray-900">HealthLearn</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={`#${item.id}`} // Enlace al ID de la sección
              className={cn(
                "w-full flex items-center gap-3 px-6 py-3 transition-colors",
                activeSection === item.id
                  ? "bg-teal-50 text-teal-600 border-l-4 border-teal-500"
                  : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}