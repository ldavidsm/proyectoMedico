"use client";

import { useState } from "react";
import { CourseHeader } from "./CourseHeader";
import { CourseSidebar } from "./CourseSidebar";
import { LessonContent } from "./LessonContent";
import { useCourse } from "@/context/CourseContext";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export function CoursePlayerLayout() {
    const {
        course,
        isLoading,
        error,
        currentBlock,
        currentBlockId,
        setCurrentBlockId,
        goToNextBlock,
        goToPrevBlock,
        isBlockLocked,
        markBlockAsComplete,
        completedBlockIds,
        progressPercentage,
        isBlockCompleted
    } = useCourse();

    const [isFullscreen, setIsFullscreen] = useState(false);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
                <span className="ml-3 text-gray-500 font-medium">Cargando curso...</span>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="h-screen flex items-center justify-center text-red-500">
                {error || "Curso no encontrado"}
            </div>
        );
    }

    const totalBlocks = (course.modules || []).reduce((acc, m) => acc + (m.blocks?.length || 0), 0);
    const completedBlocks = completedBlockIds.size;

    // Check if there's a next/prev block
    const allBlocks = (course.modules || []).flatMap(m => m.blocks || []);
    const currentIndex = allBlocks.findIndex(b => b.id === currentBlockId);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < allBlocks.length - 1;
    const currentIsCompleted = currentBlockId ? isBlockCompleted(currentBlockId) : false;

    return (
        <div className="flex h-screen flex-col bg-white">
            {!isFullscreen && (
                <CourseHeader
                    courseName={course.title}
                    currentModule={"Módulo Actual"}
                    currentLesson={currentBlock?.title || ""}
                    totalLessons={totalBlocks}
                    completedLessons={completedBlocks}
                    ratingAvg={course.rating_avg as number | undefined}
                    ratingCount={course.rating_count as number | undefined}
                />
            )}

            <div className="flex flex-1 overflow-hidden">
                {!isFullscreen && (
                    <CourseSidebar
                        modules={course.modules}
                        currentBlockId={currentBlockId}
                        onBlockSelect={setCurrentBlockId}
                        courseName={course.title}
                        completedBlockIds={completedBlockIds}
                    />
                )}

                <main className="flex-1 overflow-auto bg-gray-50">
                    <div className={isFullscreen ? "p-0" : "p-8"}>
                        {currentBlock ? (
                            <>
                                <LessonContent
                                    block={currentBlock}
                                    courseId={course.id}
                                    isLocked={isBlockLocked(currentBlock.id)}
                                    onComplete={() => markBlockAsComplete(currentBlock.id)}
                                    onNext={goToNextBlock}
                                    onGoBack={goToPrevBlock}
                                />

                                {/* Navigation & Mark Complete Bar */}
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 max-w-4xl mx-auto">
                                    <button
                                        onClick={goToPrevBlock}
                                        disabled={!hasPrev}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300
                                            disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors
                                            text-gray-700 text-sm font-medium"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Anterior
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (!currentIsCompleted) {
                                                markBlockAsComplete(currentBlockId!);
                                            }
                                            if (hasNext) {
                                                goToNextBlock();
                                            }
                                        }}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors
                                            ${currentIsCompleted
                                                ? "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100"
                                                : "bg-teal-500 hover:bg-teal-600 text-white"
                                            }`}
                                    >
                                        {currentIsCompleted ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Completado {hasNext ? "— Siguiente" : ""}
                                            </>
                                        ) : (
                                            <>
                                                Marcar como completado {hasNext ? "y continuar" : ""}
                                                {hasNext && <ChevronRight className="w-4 h-4" />}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Selecciona una lección para comenzar
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
