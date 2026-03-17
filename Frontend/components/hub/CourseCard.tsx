'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Star, Heart } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
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
  /** Pre-loaded favorite state to avoid N+1 fetches */
  initialFavorited?: boolean;
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
}: CourseCardProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited ?? false);

  useEffect(() => {
    if (initialFavorited !== undefined) {
      setIsFavorited(initialFavorited);
    }
  }, [initialFavorited]);

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
    <Link href={`/course/${id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        {/* Course Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={toggleFavorite}
                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
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
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-900">
              {modality}
            </span>
          </div>
        </div>

        {/* Course Content */}
        <div className="p-5">
          {/* Category and Level */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">
              {category}
            </span>
            <span className="text-xs text-gray-500">• {level}</span>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <ImageWithFallback
                src={instructor.avatar}
                alt={instructor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{instructor.name}</p>
              <p className="text-xs text-gray-500 truncate">{instructor.title}</p>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{description}</p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{enrolled.toLocaleString()} inscritos</span>
            </div>
            {ratingAvg != null && ratingAvg > 0 && ratingCount != null && ratingCount > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900">{ratingAvg.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({ratingCount})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
