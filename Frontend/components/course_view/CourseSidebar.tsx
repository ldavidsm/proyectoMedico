import { CheckCircle2, Circle, PlayCircle, FileText, ClipboardCheck, Lock, X, BookOpen, HelpCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Module, ContentBlock } from "@/lib/course-service";

interface CourseSidebarProps {
  modules: Module[] | undefined;
  currentBlockId: string | null;
  onBlockSelect: (blockId: string) => void;
  courseName: string;
  completedBlockIds?: Set<string>;
  onClose?: () => void;
}

function getBlockTypeIcon(type: string, isCompleted: boolean, isActive: boolean) {
  if (isCompleted) {
    return <CheckCircle2 className="w-4 h-4 text-purple-400" />;
  }
  switch (type) {
    case "video": return <PlayCircle className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-slate-500"}`} />;
    case "reading": return <BookOpen className="w-4 h-4 text-slate-500" />;
    case "quiz": return <HelpCircle className="w-4 h-4 text-slate-500" />;
    case "task": return <ClipboardCheck className="w-4 h-4 text-slate-500" />;
    case "file_task": return <FileText className="w-4 h-4 text-slate-500" />;
    default: return <Circle className="w-4 h-4 text-slate-500" />;
  }
}

export function CourseSidebar({
  modules,
  currentBlockId,
  onBlockSelect,
  courseName,
  completedBlockIds = new Set(),
  onClose,
}: CourseSidebarProps) {

  if (!modules || modules.length === 0) {
    return <div className="p-4 text-slate-500">No hay módulos disponibles.</div>;
  }

  const currentModuleId = modules.find((module) =>
    (module.blocks || []).some((block) => block.id === currentBlockId)
  )?.id;

  return (
    <aside className="w-72 flex-shrink-0 bg-[#0F172A] border-l border-white/5 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/5 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold text-purple-400/70 uppercase tracking-widest mb-1">Curso</div>
            <h2 className="text-sm font-semibold text-white/90 leading-snug line-clamp-2">
              {courseName}
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 hover:bg-white/5 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Accordion
            type="multiple"
            defaultValue={currentModuleId ? [currentModuleId] : [modules[0]?.id]}
            className="space-y-4"
          >
            {modules.map((module, moduleIndex) => {
              const moduleBlocks = module.blocks || [];
              const moduleCompletedCount = moduleBlocks.filter(b => completedBlockIds.has(b.id)).length;
              const moduleTotal = moduleBlocks.length;

              return (
                <AccordionItem
                  key={module.id}
                  value={module.id || `module-${moduleIndex}`}
                  className="border-none rounded-xl overflow-hidden"
                >
                  <AccordionTrigger
                    className="bg-slate-800/40 hover:bg-slate-800/60 text-slate-300 font-medium text-sm px-4 py-3 rounded-xl transition-colors hover:no-underline"
                  >
                    <div className="flex flex-1 items-center justify-between text-left mr-2">
                      <div className="flex items-center">
                        <span className="text-xs text-slate-500 mr-2">
                          {moduleIndex + 1}.
                        </span>
                        <span className="line-clamp-1">
                          {module.title}
                        </span>
                      </div>
                      {moduleTotal > 0 && (
                        <span className={`text-xs ml-auto pl-2 ${
                          moduleCompletedCount === moduleTotal
                            ? "text-purple-400"
                            : "text-slate-500"
                        }`}>
                          {moduleCompletedCount}/{moduleTotal}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-2">
                    <ul className="space-y-1 px-1">
                      {moduleBlocks.map((block) => {
                        const isActive = block.id === currentBlockId;
                        const isCompleted = completedBlockIds.has(block.id);
                        const isLocked = !!block.is_locked;

                        if (isLocked) {
                          return (
                            <li key={block.id}>
                              <div
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-not-allowed opacity-40"
                                title="Completa la lección anterior"
                              >
                                <Lock className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-slate-400 truncate">
                                    {block.title}
                                  </div>
                                  <div className="text-xs text-slate-600">
                                    {block.duration}
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        }

                        return (
                          <li key={block.id}>
                            <button
                              onClick={() => onBlockSelect(block.id)}
                              className={`w-full text-left ${
                                isActive
                                  ? "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20"
                                  : "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {getBlockTypeIcon(block.type, isCompleted, isActive)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className={
                                  isActive
                                    ? "text-sm font-medium text-white truncate"
                                    : isCompleted
                                      ? "text-sm text-slate-300 line-through decoration-slate-600 truncate"
                                      : "text-sm text-slate-400 truncate"
                                }>
                                  {block.title}
                                </div>
                                <div className="text-xs text-slate-600">
                                  {block.duration}
                                </div>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </ScrollArea>
    </aside>
  );
}
