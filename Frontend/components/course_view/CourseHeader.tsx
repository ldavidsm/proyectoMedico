import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CourseHeaderProps {
  courseName: string;
  courseId: string;
  totalLessons: number;
  completedLessons: number;
}

export function CourseHeader({
  courseName,
  courseId,
  totalLessons,
  completedLessons,
}: CourseHeaderProps) {
  const progressPercentage = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return (
    <header className="bg-[#0F172A] border-b border-white/5 px-6 py-3.5 flex-shrink-0 flex items-center justify-between gap-4">
      {/* Left: logo + course name */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            <span className="text-white font-bold text-xs">H</span>
          </div>
          <span className="text-white font-semibold text-sm hidden sm:block">
            HealthLearn
          </span>
        </Link>

        <div className="w-px h-4 bg-white/10 hidden sm:block" />

        <span className="text-slate-400 text-sm truncate max-w-[200px] lg:max-w-xs">
          {courseName}
        </span>
      </div>

      {/* Center: progress bar */}
      <div className="hidden md:flex items-center gap-3">
        <span className="text-xs text-slate-500">
          {completedLessons}/{totalLessons} lecciones
        </span>
        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-purple-400">
          {progressPercentage}%
        </span>
      </div>

      {/* Right: back to course */}
      <Link
        href={`/course/${courseId}`}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors flex-shrink-0"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al curso
      </Link>
    </header>
  );
}
