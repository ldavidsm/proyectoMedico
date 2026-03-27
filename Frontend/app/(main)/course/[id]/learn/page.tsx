"use client";

import { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CourseProvider } from "@/context/CourseContext";
import { CoursePlayerLayout } from "@/components/course_view/CoursePlayerLayout";

function LearnPageInner({ courseId }: { courseId: string }) {
    const searchParams = useSearchParams();
    const initialBlockId = searchParams.get('block') || undefined;

    return (
        <CourseProvider courseId={courseId} initialBlockId={initialBlockId}>
            <CoursePlayerLayout />
        </CourseProvider>
    );
}

export default function LearnPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return (
        <Suspense fallback={null}>
            <LearnPageInner courseId={resolvedParams.id} />
        </Suspense>
    );
}
