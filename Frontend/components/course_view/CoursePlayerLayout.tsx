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
            .catch((err) => {
              if (process.env.NODE_ENV === 'development') console.error('Error fetching cohort:', err);
            });
    }, [course?.id]);

    if (isLoading) {
        return (
            <div className="h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">
                        Cargando curso...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-sm">
                        {error || "Curso no encontrado"}
                    </p>
                </div>
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
        <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
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

            {/* Cohort banner */}
            {myCohort && (
                <div className="bg-purple-900/50 border-b border-purple-700/30 px-6 py-2 flex items-center gap-3 text-sm flex-shrink-0">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-200">
                        <span className="font-semibold text-purple-100">{myCohort.name}</span>
                        {" · "}{myCohort.member_count} compañeros
                        {myCohort.course_end && (
                            <span className="text-purple-300">
                                {" · "}Hasta{" "}
                                {new Date(myCohort.course_end).toLocaleDateString("es-ES", {
                                    day: "numeric", month: "short"
                                })}
                            </span>
                        )}
                    </span>
                    {myCohort.announcement && (
                        <span
                            className="ml-auto text-xs bg-purple-800/60 text-purple-300 px-2 py-0.5 rounded-full cursor-pointer"
                            title={myCohort.announcement}
                        >
                            Anuncio del instructor
                        </span>
                    )}
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {!isFullscreen && (
                    <CourseSidebar
                        modules={course.modules}
                        currentBlockId={activeTab === 'content' ? currentBlockId : null}
                        onBlockSelect={(id) => { setActiveTab('content'); setCurrentBlockId(id); }}
                        courseName={course.title}
                        completedBlockIds={completedBlockIds}
                    />
                )}

                <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                    {/* Tabs */}
                    {hasForum && (
                        <div className="flex items-center gap-1 px-6 py-2 bg-slate-900 border-b border-slate-800">
                            <button
                                onClick={() => setActiveTab('content')}
                                className={activeTab === 'content'
                                    ? "px-4 py-1.5 rounded-lg text-sm font-semibold bg-purple-600 text-white"
                                    : "px-4 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                                }
                            >
                                Contenido
                            </button>
                            <button
                                onClick={() => setActiveTab('forum')}
                                className={activeTab === 'forum'
                                    ? "px-4 py-1.5 rounded-lg text-sm font-semibold bg-purple-600 text-white"
                                    : "px-4 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                                }
                            >
                                <span className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Foro
                                </span>
                            </button>
                        </div>
                    )}

                    <main className="flex-1 overflow-auto">
                        {isCourseNotStarted ? (
                            <div className="flex-1 flex items-center justify-center bg-slate-950 min-h-[60vh]">
                                <div className="text-center max-w-md">
                                    <Calendar className="w-16 h-16 text-purple-500/40 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        El curso comienza pronto
                                    </h2>
                                    <p className="text-slate-300 mb-4">
                                        Este curso empieza el{' '}
                                        <span className="font-semibold text-purple-400">
                                            {new Date(cohortInfo!.course_start!).toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </p>
                                    <p className="text-sm text-slate-400">
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
                        <div className={isFullscreen ? "p-0" : ""}>
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
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                    Selecciona una lección para comenzar
                                </div>
                            )}
                        </div>
                        )}
                    </main>

                    {/* Navigation prev/next */}
                    {currentBlock && !isCourseNotStarted && activeTab === 'content' && (
                        <div className="flex items-center justify-between px-6 py-3 bg-slate-900/80 border-t border-slate-800">
                            <button
                                onClick={goToPrevBlock}
                                disabled={!hasPrev}
                                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>

                            <span className="text-xs text-slate-500">
                                {currentIndex + 1} / {allBlocks.length}
                            </span>

                            <button
                                onClick={() => {
                                    if (!currentIsCompleted) {
                                        markBlockAsComplete(currentBlockId!);
                                    }
                                    if (hasNext) {
                                        goToNextBlock();
                                    }
                                }}
                                disabled={!hasNext && currentIsCompleted}
                                className="flex items-center gap-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {currentIsCompleted ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        {hasNext ? "Siguiente" : "Completado"}
                                    </>
                                ) : (
                                    <>
                                        Completar {hasNext ? "y continuar" : ""}
                                        {hasNext && <ChevronRight className="w-4 h-4" />}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
