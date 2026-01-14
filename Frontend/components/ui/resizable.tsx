"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as Panels from "react-resizable-panels";

import { cn } from "@/lib/utils";

// --- Extraemos los componentes usando `as any` para que TS no marque error ---
const PanelGroup = (Panels as any).PanelGroup as React.FC<any>;
const Panel = (Panels as any).Panel as React.FC<any>;
const PanelResizeHandle = (Panels as any).PanelResizeHandle as React.FC<any>;

// --- Tipos ---
type ResizablePanelGroupProps = React.ComponentProps<typeof PanelGroup> & {
  direction?: "horizontal" | "vertical"; // puedes pasar dirección
};

type ResizablePanelProps = React.ComponentProps<typeof Panel>;

type ResizableHandleProps = React.ComponentProps<typeof PanelResizeHandle> & {
  withHandle?: boolean;
};

// --- PanelGroup ---
export function ResizablePanelGroup({
  className,
  direction = "horizontal",
  ...props
}: ResizablePanelGroupProps) {
  return (
    <PanelGroup
      direction={direction}
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

// --- Panel ---
export function ResizablePanel({ ...props }: ResizablePanelProps) {
  return <Panel data-slot="resizable-panel" {...props} />;
}

// --- Handle ---
export function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizableHandleProps) {
  return (
    <PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border relative flex w-px items-center justify-center data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </PanelResizeHandle>
  );
}
