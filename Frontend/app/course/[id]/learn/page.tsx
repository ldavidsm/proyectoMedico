"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CourseProvider } from "@/context/CourseContext";
import { CoursePlayerLayout } from "@/components/course_view/CoursePlayerLayout";

export default function LearnPage({ params }: { params: { id: string } }) {
    return (
        <AuthProvider>
            <CourseProvider courseId={params.id}>
                <CoursePlayerLayout />
            </CourseProvider>
        </AuthProvider>
    );
}
