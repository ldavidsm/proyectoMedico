"use client";

import { AppShell } from "@/components/layouts/AppShell";
import { CreatorSidebar } from "@/components/shared/CreatorSidebar";
import { Header } from "@/components/shared/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      sidebar={<CreatorSidebar />}
      header={<Header />}
      sidebarWidth="16rem"
    >
      {children}
    </AppShell>
  );
}