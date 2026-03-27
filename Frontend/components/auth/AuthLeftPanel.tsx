'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PlatformStats {
  total_courses: number;
  total_users: number;
  total_instructors: number;
  total_specialties: number;
}

function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K+`;
  if (n > 0) return `${n}+`;
  return '0';
}

export function AuthLeftPanel() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${API_URL}/courses/platform-stats`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data); })
      .catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching platform stats:', err);
        }
      });
  }, []);

  const statsItems = [
    { value: stats ? formatStat(stats.total_courses) : '...', label: 'Cursos' },
    { value: stats ? formatStat(stats.total_users) : '...', label: 'Profesionales' },
    { value: stats ? formatStat(stats.total_specialties) : '...', label: 'Especialidades' },
  ];

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex-col justify-between p-12 relative overflow-hidden">
      {/* Patrón decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-300 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white rounded-full blur-2xl" />
      </div>

      {/* Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
          <span className="text-white font-bold text-lg">H</span>
        </div>
        <span className="text-white font-bold text-xl">HealthLearn</span>
      </Link>

      {/* Texto central */}
      <div className="relative z-10">
        <h2 className="text-4xl font-bold text-white leading-tight mb-4">
          Formación médica de excelencia
        </h2>
        <p className="text-purple-200 text-lg leading-relaxed">
          Accede a cursos especializados creados por profesionales de la salud para profesionales de la salud.
        </p>

        {/* Stats reales */}
        <div className="flex gap-8 mt-10">
          {statsItems.map(stat => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white transition-all duration-500">
                {stat.value}
              </p>
              <p className="text-purple-300 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
        <p className="text-white/90 text-sm italic leading-relaxed">
          "La formación continua es el pilar de la excelencia médica."
        </p>
        <p className="text-purple-300 text-xs mt-2 font-medium">
          — Comunidad HealthLearn
        </p>
      </div>
    </div>
  );
}
