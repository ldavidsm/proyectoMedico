"use client";
import { use } from "react";
import { CourseDetailPage } from "@/components/course-id/CourseDetailPage";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <CourseDetailPage params={{ id: resolvedParams.id }} />;
}
