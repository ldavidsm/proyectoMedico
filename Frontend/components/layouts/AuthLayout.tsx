"use client";

import { AppLogo } from "@/components/shared/AppLogo";
import { cn } from "@/lib/utils";

type AuthLayoutProps = {
  children: React.ReactNode;
  /** Título sobre el formulario (ej. "Crear cuenta gratuita") */
  title: string;
  /** Subtítulo opcional */
  subtitle?: string;
  className?: string;
};

export function AuthLayout({ children, title, subtitle, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background p-4 sm:p-8",
        className
      )}
    >
      <div className="w-full max-w-md space-y-8">
        <div>
          <AppLogo size="lg" className="mb-6" />
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
