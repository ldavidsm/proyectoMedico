"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CourseDetail, Module, ContentBlock, courseService } from "@/lib/course-service";
// import { useAuth } from "./AuthContext"; // We might need auth mainly to fetch progress

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

    // Status check
    isBlockLocked: (blockId: string) => boolean;
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

    // TODO: Load real progress from backend (UserProgress)
    // For MVP, we might store local completed set or fetch from API
    const [completedBlockIds, setCompletedBlockIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!courseId) return;

        const fetchCourse = async () => {
            try {
                setIsLoading(true);
                const data = await courseService.getCourseById(courseId);
                setCourse(data);

                // Set first block as active if none selected
                if (!currentBlockId && data.modules?.length > 0 && data.modules[0].blocks?.length > 0) {
                    setCurrentBlockId(data.modules[0].blocks[0].id);
                }
            } catch (err) {
                console.error(err);
                setError("Error cargando el curso");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    // Helper to flatten blocks for easier navigation
    const getAllBlocks = (): ContentBlock[] => {
        if (!course) return [];
        return course.modules.flatMap(m => m.blocks || []);
    };

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
        // Implement real locking logic here (e.g. check if previous block is completed)
        // For now, unlock all if user purchased (checked by page protection)
        // Or check specific sequence
        return false;
    };

    const markBlockAsComplete = (blockId: string) => {
        setCompletedBlockIds(prev => new Set(prev).add(blockId));
        // TODO: Sync with backend
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
                isBlockLocked,
                markBlockAsComplete
            }}
        >
            {children}
        </CourseContext.Provider>
    );
}
