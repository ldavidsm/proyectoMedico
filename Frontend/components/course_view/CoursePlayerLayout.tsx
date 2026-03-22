"use client";

import { useState, useEffect } from "react";
import { CourseHeader } from "./CourseHeader";
import { CourseSidebar } from "./CourseSidebar";
import { LessonContent } from "./LessonContent";
import { CourseForum } from "./CourseForum";
import { useCourse } from "@/context/CourseContext";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle, MessageSquare, Calendar, Users } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface MyCohort {
    id: string;
    name: string;
    member_count: number;
    course_end: string | null;
    announcement: string | null;
}

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
    const [activeTab, setActiveTab] = useState<'content' | 'forum'>('content');
    const hasForum = !!(course as Record<string, unknown>)?.has_forum;

    const cohortInfo = (course as Record<string, unknown>)?.cohort_info as {
        course_start?: string; course_started?: boolean;
    } | null | undefined;
    const isCourseNotStarted = !!(
        cohortInfo?.course_start && !cohortInfo?.course_started
    );

    const [myCohort, setMyCohort] = useState<MyCohort | null>(null);

    useEffect(() => {
        if (!course?.id) return;
        fetch(`${API_URL}/cohorts/my-cohort?course_id=${course.id}`, {
            credentials: "include",
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setMyCohort(data); })
            .catch(() => {});
    }, [course?.id]);

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
                    <div className="flex flex-col w-80 border-r border-gray-200 bg-white">
                        <CourseSidebar
                            modules={course.modules}
                            currentBlockId={activeTab === 'content' ? currentBlockId : null}
                            onBlockSelect={(id) => { setActiveTab('content'); setCurrentBlockId(id); }}
                            courseName={course.title}
                            completedBlockIds={completedBlockIds}
                        />
                        {hasForum && (
                            <button
                                onClick={() => setActiveTab(activeTab === 'forum' ? 'content' : 'forum')}
                                className={`flex items-center gap-2 px-5 py-3 border-t border-gray-200 text-sm font-medium transition-colors ${
                                    activeTab === 'forum'
                                        ? 'bg-teal-50 text-teal-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                Foro del curso
                            </button>
                        )}
                    </div>
                )}

                <div className="flex-1 flex flex-col overflow-hidden">
                {myCohort && (
                    <div className="bg-purple-50 border-b border-purple-100 px-6 py-2 flex items-center gap-3 text-sm flex-shrink-0">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-purple-700">
                            <span className="font-medium">{myCohort.name}</span>
                            {" · "}{myCohort.member_count} compañeros
                            {myCohort.course_end && (
                                <span className="text-purple-500">
                                    {" · "}Hasta{" "}
                                    {new Date(myCohort.course_end).toLocaleDateString("es-ES", {
                                        day: "numeric", month: "short"
                                    })}
                                </span>
                            )}
                        </span>
                        {myCohort.announcement && (
                            <span
                                className="ml-auto text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full cursor-pointer"
                                title={myCohort.announcement}
                            >
                                Anuncio del instructor
                            </span>
                        )}
                    </div>
                )}
                <main className="flex-1 overflow-auto bg-gray-50">
                    {isCourseNotStarted ? (
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <div className="text-center max-w-md">
                                <Calendar className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    El curso comienza pronto
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    Este curso empieza el{' '}
                                    <span className="font-semibold text-purple-600">
                                        {new Date(cohortInfo!.course_start!).toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </p>
                                <p className="text-sm text-gray-500">
                                    Recibirás un email cuando el curso esté disponible.
                                </p>
                            </div>
                        </div>
                    ) : activeTab === 'forum' && hasForum ? (
                        <div className="p-8 max-w-4xl mx-auto">
                            <CourseForum
                                courseId={course.id}
                                sellerId={(course as Record<string, unknown>).seller_id as string}
                            />
                        </div>
                    ) : (
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
                    )}
                </main>
                </div>
            </div>
        </div>
    );
}
