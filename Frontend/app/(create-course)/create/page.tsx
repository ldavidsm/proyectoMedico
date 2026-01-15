'use client';

import CourseCreationWizard from '@/components/course-creation-wizard';

export default function CreateCoursePage() {
  return (
    <div className="py-8 px-4">
      {/* Tu componente wizard maneja internamente los 6 pasos */}
      <CourseCreationWizard />
    </div>
  );
}