"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        ...classNames,
      }}
      components={{
        Nav: ({ className, onPreviousClick, onNextClick }) => (
          <div className={cn("flex justify-between items-center px-2", className)}>
            <button
              onClick={onPreviousClick}
              className={buttonVariants({ variant: "outline" })}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={onNextClick}
              className={buttonVariants({ variant: "outline" })}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
