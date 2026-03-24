import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CourseHeaderProps {
  courseName: string;
  currentModule: string;
  currentLesson: string;
  totalLessons: number;
  completedLessons: number;
  ratingAvg?: number;
  ratingCount?: number;
}

export function CourseHeader({
  courseName,
  currentModule,
  currentLesson,
  totalLessons,
  completedLessons,
  ratingAvg,
  ratingCount,
}: CourseHeaderProps) {
  const progressPercentage = Math.round(
    (completedLessons / totalLessons) * 100
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-700/50 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo area */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="font-bold text-white text-sm hidden sm:block">
              HealthLearn
            </span>
          </div>

          <div className="w-px h-5 bg-slate-600 mx-2 hidden sm:block" />

          <span className="text-sm text-slate-300 truncate max-w-xs hidden md:block">
            {courseName}
          </span>
        </div>

        {/* Center - Progress */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {completedLessons}/{totalLessons}
          </span>
          <span className="text-xs font-bold text-purple-400">
            {progressPercentage}%
          </span>
          <div className="h-1.5 bg-slate-700 rounded-full w-32 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Right area - Rating & Back link */}
        <div className="flex items-center gap-4">
          {ratingAvg != null && ratingAvg > 0 && ratingCount != null && ratingCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{ratingAvg.toFixed(1)}</span>
              <span>({ratingCount})</span>
            </div>
          )}
          <Link
            href="/my-courses"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al curso
          </Link>
        </div>
      </div>
    </header>
  );
}
