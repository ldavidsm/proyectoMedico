"use client";

import type { ReactNode } from "react";

const SIDEBAR_WIDTH_DEFAULT = "16rem"; // 256px, equivalente a Tailwind w-64

type AppShellProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  /** Ancho del sidebar (ej. "16rem", "256px"). Debe coincidir con el ancho real del sidebar. */
  sidebarWidth?: string;
};

export function AppShell({
  sidebar,
  header,
  children,
  sidebarWidth = SIDEBAR_WIDTH_DEFAULT,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {sidebar}
      <div
        className="min-h-screen flex flex-col"
        style={{ marginLeft: sidebarWidth }}
      >
        {header}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
