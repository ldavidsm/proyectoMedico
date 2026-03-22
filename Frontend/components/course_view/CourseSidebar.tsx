import { CheckCircle2, Circle, PlayCircle, Clock, AlertCircle, FileText, ClipboardCheck, Lock, X, BookOpen, HelpCircle } from "lucide-react";
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

function getBlockTypeIcon(type: string, isCompleted: boolean) {
  if (isCompleted) {
    return <CheckCircle2 className="w-4 h-4 text-teal-500" />;
  }
  switch (type) {
    case "video": return <PlayCircle className="w-4 h-4" />;
    case "reading": return <BookOpen className="w-4 h-4" />;
    case "quiz": return <HelpCircle className="w-4 h-4" />;
    case "task": return <ClipboardCheck className="w-4 h-4" />;
    case "file_task": return <FileText className="w-4 h-4" />;
    default: return <Circle className="w-4 h-4" />;
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
    return <div className="p-4 text-gray-500">No hay módulos disponibles.</div>;
  }

  // Find current module to expand
  const currentModuleId = modules.find((module) =>
    (module.blocks || []).some((block) => block.id === currentBlockId)
  )?.id;

  return (
    <aside className="flex-1 bg-white flex flex-col min-h-0">
      {/* Header del sidebar */}
      <div className="border-b border-gray-100 p-5 bg-gray-50/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Curso</div>
            <h2 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
              {courseName}
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido scrollable */}
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
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                >
                  <AccordionTrigger
                    className="px-4 py-3 hover:bg-gray-50 transition-all hover:no-underline"
                  >
                    <div className="flex flex-1 items-center justify-between text-left mr-2">
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-0.5">
                          MÓDULO {moduleIndex + 1}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {module.title}
                        </div>
                      </div>
                      {moduleTotal > 0 && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-2 ${
                          moduleCompletedCount === moduleTotal
                            ? "bg-teal-50 text-teal-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {moduleCompletedCount}/{moduleTotal}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="border-t border-gray-100 bg-gray-50/30">
                    <ul className="py-2">
                      {moduleBlocks.map((block) => {
                        const isActive = block.id === currentBlockId;
                        const isCompleted = completedBlockIds.has(block.id);
                        const isLocked = !!block.is_locked;

                        if (isLocked) {
                          return (
                            <li key={block.id}>
                              <div
                                className="w-full flex items-start gap-3 px-4 py-3 text-gray-400 cursor-not-allowed relative"
                                title="Completa la lección anterior"
                              >
                                <div className="mt-0.5">
                                  <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs leading-snug truncate">
                                    {block.title}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-medium uppercase tracking-wider opacity-50">
                                      {block.duration}
                                    </span>
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
                              className={`w-full flex items-start gap-3 px-4 py-3 transition-colors text-left relative
                                ${isActive
                                  ? "bg-blue-50/80 text-blue-700"
                                  : isCompleted
                                    ? "text-teal-700 hover:bg-teal-50/50"
                                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                                }
                              `}
                            >
                              {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                              )}

                              <div className={`mt-0.5 ${
                                isCompleted
                                  ? "text-teal-500"
                                  : isActive
                                    ? "text-blue-600"
                                    : "text-gray-400"
                              }`}>
                                {getBlockTypeIcon(block.type, isCompleted)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className={`text-sm leading-snug ${
                                  isActive ? "font-medium" : isCompleted ? "font-normal" : "font-normal"
                                }`}>
                                  {block.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                                    {block.duration}
                                  </span>
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
