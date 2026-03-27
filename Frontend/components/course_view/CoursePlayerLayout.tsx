"use client";

import { useState, useEffect } from "react";
import { CourseHeader } from "./CourseHeader";
import { CourseSidebar } from "./CourseSidebar";
import { LessonContent } from "./LessonContent";
import { CourseForum } from "./CourseForum";
import { useCourse } from "@/context/CourseContext";
import { ChevronLeft, ChevronRight, CheckCircle, MessageSquare, Calendar, Users } from "lucide-react";

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
            <div className="h-screen bg-[#0F172A] flex items-center justify-center">
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
            <div className="h-screen bg-[#0F172A] flex items-center justify-center">
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

    const allBlocks = (course.modules || []).flatMap(m => m.blocks || []);
    const currentIndex = allBlocks.findIndex(b => b.id === currentBlockId);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < allBlocks.length - 1;
    const currentIsCompleted = currentBlockId ? isBlockCompleted(currentBlockId) : false;

    return (
        <div className="h-screen bg-[#0F172A] flex flex-col overflow-hidden">
            {/* HEADER */}
            <CourseHeader
                courseName={course.title}
                courseId={course.id}
                totalLessons={totalBlocks}
                completedLessons={completedBlocks}
            />

            {/* Cohort banner */}
            {myCohort && (
                <div className="bg-purple-900/30 border-b border-white/5 px-6 py-2 flex items-center gap-3 text-sm flex-shrink-0">
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
                            className="ml-auto text-xs bg-purple-800/40 text-purple-300 px-2 py-0.5 rounded-full cursor-pointer"
                            title={myCohort.announcement}
                        >
                            Anuncio del instructor
                        </span>
                    )}
                </div>
            )}

            {/* BODY — content + sidebar */}
            <div className="flex flex-1 overflow-hidden">
                {/* Main content area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Tabs */}
                    {hasForum && (
                        <div className="flex items-center gap-1 px-6 py-2.5 bg-[#0F172A] border-b border-white/5">
                            <button
                                onClick={() => setActiveTab('content')}
                                className={activeTab === 'content'
                                    ? "px-4 py-1.5 rounded-lg text-sm font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20"
                                    : "px-4 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
                                }
                            >
                                Contenido
                            </button>
                            <button
                                onClick={() => setActiveTab('forum')}
                                className={activeTab === 'forum'
                                    ? "px-4 py-1.5 rounded-lg text-sm font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20"
                                    : "px-4 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
                                }
                            >
                                <span className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Foro
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Lesson content */}
                    <main className="flex-1 overflow-auto">
                        {isCourseNotStarted ? (
                            <div className="flex-1 flex items-center justify-center bg-[#0F172A] min-h-[60vh]">
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
                            <div>
                                {currentBlock ? (
                                    <LessonContent
                                        block={currentBlock}
                                        courseId={course.id}
                                        isLocked={isBlockLocked(currentBlock.id)}
                                        onComplete={() => markBlockAsComplete(currentBlock.id)}
                                        onNext={goToNextBlock}
                                        onGoBack={goToPrevBlock}
                                    />
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
                        <div className="bg-[#0F172A] border-t border-white/5 px-6 py-3.5 flex items-center justify-between">
                            <button
                                onClick={goToPrevBlock}
                                disabled={!hasPrev}
                                className="flex items-center gap-2 text-sm text-slate-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>

                            <span className="text-xs text-slate-600">
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
                                className="flex items-center gap-2 text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-20 shadow-lg shadow-purple-900/20"
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

                {/* Sidebar (right) */}
                <CourseSidebar
                    modules={course.modules}
                    currentBlockId={activeTab === 'content' ? currentBlockId : null}
                    onBlockSelect={(id) => { setActiveTab('content'); setCurrentBlockId(id); }}
                    courseName={course.title}
                    completedBlockIds={completedBlockIds}
                />
            </div>
        </div>
    );
}
