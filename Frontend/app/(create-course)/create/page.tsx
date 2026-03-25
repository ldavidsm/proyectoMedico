'use client';

import { Suspense } from 'react';
import ContentManager from '@/components/content-manager';

export default function CreateCoursePage() {
  return (
    <Suspense fallback={null}>
      <ContentManager />
    </Suspense>
  );
}
