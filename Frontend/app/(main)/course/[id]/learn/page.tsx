"use client";

import { use } from "react";
import { CourseProvider } from "@/context/CourseContext";
import { CoursePlayerLayout } from "@/components/course_view/CoursePlayerLayout";

export default function LearnPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return (
        <CourseProvider courseId={resolvedParams.id}>
            <CoursePlayerLayout />
        </CourseProvider>
    );
}
