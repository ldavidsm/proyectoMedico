"use client";
import { use } from "react";
import { CourseEnrollmentPage } from "@/components/enroll/CourseEnrollmentPage";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <CourseEnrollmentPage courseId={resolvedParams.id} />;
}