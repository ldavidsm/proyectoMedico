import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

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
    <header className="border-b bg-white px-6 py-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo/Brand area */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <span className="text-sm font-medium text-gray-700">MedLearn</span>
            </div>
          </div>

          {/* Center - Progress */}
          <div className="flex-1 max-w-md mx-8">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {completedLessons}/{totalLessons} elementos de aprendizaje
              </span>
              <Progress value={progressPercentage} className="h-2 flex-1" />
            </div>
          </div>

          {/* Right area - Rating & Actions */}
          <div className="flex items-center gap-4">
            {ratingAvg != null && ratingAvg > 0 && ratingCount != null && ratingCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{ratingAvg.toFixed(1)}</span>
                <span className="text-gray-400">({ratingCount})</span>
              </div>
            )}
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Ayuda
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}