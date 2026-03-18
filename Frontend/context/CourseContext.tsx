"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CourseDetail, Module, ContentBlock, courseService } from "@/lib/course-service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CourseContextType {
    course: CourseDetail | null;
    isLoading: boolean;
    error: string | null;

    currentBlockId: string | null;
    currentBlock: ContentBlock | null;

    // Navigation
    setCurrentBlockId: (id: string) => void;
    goToNextBlock: () => void;
    goToPrevBlock: () => void;

    // Progress
    completedBlockIds: Set<string>;
    progressPercentage: number;
    isBlockLocked: (blockId: string) => boolean;
    isBlockCompleted: (blockId: string) => boolean;
    markBlockAsComplete: (blockId: string) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function useCourse() {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error("useCourse must be used within a CourseProvider");
    }
    return context;
}

interface CourseProviderProps {
    courseId: string;
    children: React.ReactNode;
}

export function CourseProvider({ courseId, children }: CourseProviderProps) {
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);

    const [completedBlockIds, setCompletedBlockIds] = useState<Set<string>>(new Set());
    const [progressPercentage, setProgressPercentage] = useState(0);

    // Helper to flatten blocks for easier navigation
    const getAllBlocks = useCallback((): ContentBlock[] => {
        if (!course) return [];
        return (course.modules || []).flatMap(m => m.blocks || []);
    }, [course]);

    // Load progress from backend
    const loadProgress = useCallback(async (cId: string) => {
        try {
            const res = await fetch(
                `${API_URL}/courses/${cId}/progress/`,
                { credentials: 'include' }
            );
            if (res.ok) {
                const data = await res.json();
                setCompletedBlockIds(new Set(data.completed_block_ids));
                setProgressPercentage(data.percentage);
            }
        } catch {
            // Silently fail - progress just won't show
        }
    }, []);

    useEffect(() => {
        if (!courseId) return;

        const fetchCourse = async () => {
            try {
                setIsLoading(true);
                const data = await courseService.getCourseById(courseId);
                setCourse(data);

                // Set first block as active if none selected
                const modules = data.modules || [];
                if (!currentBlockId && modules.length > 0 && modules[0].blocks?.length > 0) {
                    setCurrentBlockId(modules[0].blocks[0].id);
                }

                // Load progress after course is fetched
                await loadProgress(courseId);
            } catch (err) {
                console.error(err);
                setError("Error cargando el curso");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const currentBlock = getAllBlocks().find(b => b.id === currentBlockId) || null;

    const goToNextBlock = () => {
        const blocks = getAllBlocks();
        const currentIndex = blocks.findIndex(b => b.id === currentBlockId);
        if (currentIndex !== -1 && currentIndex < blocks.length - 1) {
            setCurrentBlockId(blocks[currentIndex + 1].id);
        }
    };

    const goToPrevBlock = () => {
        const blocks = getAllBlocks();
        const currentIndex = blocks.findIndex(b => b.id === currentBlockId);
        if (currentIndex > 0) {
            setCurrentBlockId(blocks[currentIndex - 1].id);
        }
    };

    const isBlockLocked = (blockId: string) => {
        return false;
    };

    const isBlockCompleted = (blockId: string) => {
        return completedBlockIds.has(blockId);
    };

    const markBlockAsComplete = async (blockId: string) => {
        if (completedBlockIds.has(blockId)) return;

        // Optimistic update
        const newCompleted = new Set([...completedBlockIds, blockId]);
        setCompletedBlockIds(newCompleted);

        const allBlocks = getAllBlocks();
        const newPercentage = allBlocks.length > 0
            ? Math.round(newCompleted.size / allBlocks.length * 100)
            : 0;
        setProgressPercentage(newPercentage);

        try {
            await fetch(
                `${API_URL}/courses/${courseId}/progress/blocks/${blockId}/complete`,
                { method: 'POST', credentials: 'include' }
            );
        } catch {
            // Revert on error
            setCompletedBlockIds(prev => {
                const next = new Set(prev);
                next.delete(blockId);
                return next;
            });
            // Revert percentage
            const revertedSize = newCompleted.size - 1;
            setProgressPercentage(
                allBlocks.length > 0 ? Math.round(revertedSize / allBlocks.length * 100) : 0
            );
        }
    };

    return (
        <CourseContext.Provider
            value={{
                course,
                isLoading,
                error,
                currentBlockId,
                currentBlock,
                setCurrentBlockId,
                goToNextBlock,
                goToPrevBlock,
                completedBlockIds,
                progressPercentage,
                isBlockLocked,
                isBlockCompleted,
                markBlockAsComplete
            }}
        >
            {children}
        </CourseContext.Provider>
    );
}
