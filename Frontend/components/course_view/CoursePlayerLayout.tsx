"use client";

import { useState } from "react";
import { CourseHeader } from "./CourseHeader";
import { CourseSidebar } from "./CourseSidebar";
import { LessonContent } from "./LessonContent";
import { useCourse } from "@/context/CourseContext";
import { Loader2 } from "lucide-react";

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
        markBlockAsComplete
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

    // Calculate generic progress
    const totalBlocks = course.modules.reduce((acc, m) => acc + (m.blocks?.length || 0), 0);
    const completedBlocks = 0; // TODO: Get from context

    return (
        <div className="flex h-screen flex-col bg-white">
            {!isFullscreen && (
                <CourseHeader
                    courseName={course.title}
                    currentModule={"Módulo Actual"} // Improve context to provide module name
                    currentLesson={currentBlock?.title || ""}
                    totalLessons={totalBlocks}
                    completedLessons={completedBlocks}
                />
            )}

            <div className="flex flex-1 overflow-hidden">
                {!isFullscreen && (
                    <CourseSidebar
                        modules={course.modules}
                        currentBlockId={currentBlockId}
                        onBlockSelect={setCurrentBlockId}
                        courseName={course.title}
                    />
                )}

                <main className="flex-1 overflow-auto bg-gray-50">
                    <div className={isFullscreen ? "p-0" : "p-8"}>
                        {currentBlock ? (
                            <LessonContent
                                block={currentBlock}
                                courseId={course.id}
                                isLocked={isBlockLocked(currentBlock.id)}

                                onComplete={() => markBlockAsComplete(currentBlock.id)}
                                onNext={goToNextBlock}
                                onGoBack={goToPrevBlock}
                            // onFullscreenChange={setIsFullscreen} // Optional: Implement fullscreen toggle in future
                            />
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
