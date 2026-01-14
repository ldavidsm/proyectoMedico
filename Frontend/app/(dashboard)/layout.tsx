"use client";

import { CreatorSidebar } from "@/components/shared/CreatorSidebar";
import { Header } from "@/components/shared/Header";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        <Toaster />

        {/* El Sidebar ahora no necesita que le pases nada (props) */}
        <CreatorSidebar />

        <div className="ml-64">
          <Header />
          <main className="p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}