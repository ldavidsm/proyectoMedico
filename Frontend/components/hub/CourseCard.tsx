'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Users, Star, Heart, Check } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { getDefaultBanner } from '@/lib/course-banners';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  description: string;
  image: string;
  level: string;
  modality: string;
  enrolled: number;
  category: string;
  ratingAvg?: number;
  ratingCount?: number;
  initialFavorited?: boolean;
  learningGoals?: string[];
  badges?: ('nuevo' | 'popular' | 'actualizado')[];
}

export function CourseCard({
  id,
  title,
  instructor,
  description,
  image,
  level,
  modality,
  enrolled,
  category,
  ratingAvg,
  ratingCount,
  initialFavorited,
  learningGoals,
  badges,
}: CourseCardProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited ?? false);
  const defaultBanner = getDefaultBanner(category, id);

  // Hover popover state
  const [showHover, setShowHover] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<'right' | 'left'>('right');
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const hasGoals = learningGoals && learningGoals.length > 0;

  useEffect(() => {
    if (initialFavorited !== undefined) {
      setIsFavorited(initialFavorited);
    }
  }, [initialFavorited]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!hasGoals) return;

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      setHoverPosition(spaceRight > 340 ? 'right' : 'left');
    }

    hoverTimerRef.current = setTimeout(() => {
      setShowHover(true);
    }, 400);
  }, [hasGoals]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setShowHover(false);
  }, []);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const prev = isFavorited;
    setIsFavorited(!prev);

    try {
      const res = await fetch(`${API_URL}/favorites/${id}`, {
        method: prev ? 'DELETE' : 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
    } catch {
      setIsFavorited(prev);
    }
  };

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/course/${id}`} className="block group">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          {/* Course Image */}
          <div className="relative aspect-video overflow-hidden bg-slate-100">
            <ImageWithFallback
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              fallbackType="course"
              courseTitle={title}
              defaultBannerUrl={defaultBanner}
            />
            {/* Badges */}
            {badges && badges.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                {badges.includes('popular') && (
                  <span className="bg-amber-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                    Más vendido
                  </span>
                )}
                {badges.includes('nuevo') && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                    Nuevo
                  </span>
                )}
                {badges.includes('actualizado') && (
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                    Actualizado
                  </span>
                )}
              </div>
            )}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={toggleFavorite}
                  className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 transition-all duration-200"
                  aria-label={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavorited
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-600 hover:text-red-400'
                    }`}
                  />
                </button>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/95 backdrop-blur-sm text-slate-700 shadow-sm">
                {modality}
              </span>
            </div>
          </div>

          {/* Course Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Category and Level */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                {category}
              </span>
              <span className="text-xs text-slate-400 font-medium">{level}</span>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white ring-offset-0 shadow-sm flex-shrink-0">
                <ImageWithFallback
                  src={instructor.avatar}
                  alt={instructor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{instructor.name}</p>
                <p className="text-xs text-slate-400 truncate">{instructor.title}</p>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-purple-700 transition-colors duration-200">
              {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed flex-1">{description}</p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5" />
                <span>{enrolled.toLocaleString()} inscritos</span>
              </div>
              {ratingAvg != null && ratingAvg > 0 && ratingCount != null && ratingCount > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-slate-800">{ratingAvg.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">({ratingCount})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Hover popover — learning goals */}
      {showHover && hasGoals && (
        <div
          className={`absolute top-0 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 hidden lg:block transition-all duration-150 ease-out ${
            hoverPosition === 'right'
              ? 'left-[calc(100%+12px)]'
              : 'right-[calc(100%+12px)]'
          }`}
          onMouseEnter={() => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            setShowHover(true);
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Arrow */}
          <div
            className={`absolute top-5 w-3 h-3 bg-white rotate-45 border-slate-100 ${
              hoverPosition === 'right'
                ? '-left-1.5 border-l border-b'
                : '-right-1.5 border-r border-t'
            }`}
          />

          <p className="font-bold text-slate-900 text-sm mb-3">
            Lo que aprenderás
          </p>
          <ul className="space-y-2">
            {learningGoals!.slice(0, 5).map((goal, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <Check className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {goal}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
