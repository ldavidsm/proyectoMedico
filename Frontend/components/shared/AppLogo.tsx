"use client";

import { cn } from "@/lib/utils";

type AppLogoProps = {
  /** Texto opcional tras el nombre (ej. "Médicos Creadores") */
  suffix?: string;
  className?: string;
  /** Tamaño: "sm" | "md" | "lg" */
  size?: "sm" | "md" | "lg";
};

export function AppLogo({ suffix, className, size = "md" }: AppLogoProps) {
  const boxSize = size === "sm" ? "w-7 h-7" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded flex items-center justify-center font-bold text-brand-primary-foreground bg-brand-primary",
          boxSize
        )}
        aria-hidden
      >
        Ú
      </div>
      <span className={cn("font-bold text-foreground", textSize)}>
        HealthLearn
        {suffix ? (
          <span className="font-normal text-muted-foreground"> · {suffix}</span>
        ) : null}
      </span>
    </div>
  );
}
