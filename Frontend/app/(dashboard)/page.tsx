'use client';

import { CoursesSection } from '@/components/dashboard/CoursesSection';
import { CommunicationSection } from '@/components/dashboard/CommunicationSection';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { ToolsSection } from '@/components/dashboard/ToolsSection';
import { ResourcesSection } from '@/components/dashboard/ResourcesSection';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-24">
      {/* Cada section tiene el ID que el Sidebar busca al hacer clic */}
      <section id="courses" className="scroll-mt-24">
        <CoursesSection />
      </section>

      <section id="communication" className="scroll-mt-24">
        <CommunicationSection />
      </section>

      <section id="analytics" className="scroll-mt-24">
        <AnalyticsSection />
      </section>

      <section id="tools" className="scroll-mt-24">
        <ToolsSection />
      </section>

      <section id="resources" className="scroll-mt-24">
        <ResourcesSection />
      </section>
    </div>
  );
}