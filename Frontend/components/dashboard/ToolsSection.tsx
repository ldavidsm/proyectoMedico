"use client";

import { Wand2, FileText, Video, Image, BarChart, Users, Sparkles, BookOpen, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SupportSheet } from "@/components/shared/SupportSheet";
import { toast } from "sonner";

const tools: {
  icon: typeof Video;
  title: string;
  description: string;
  status: 'available' | 'coming_soon';
  action?: string;
  badge?: string;
  eta?: string;
}[] = [
  {
    icon: Video,
    title: "Editor de video",
    description: "Edita y recorta tus videos directamente en la plataforma sin software externo.",
    status: "coming_soon" as const,
    badge: "Próximamente",
    eta: "Q3 2025",
  },
  {
    icon: FileText,
    title: "Creador de cuestionarios",
    description: "Crea evaluaciones interactivas para tus estudiantes",
    status: "available" as const,
    action: "quiz",
  },
  {
    icon: Image,
    title: "Banco de imágenes",
    description: "Accede a miles de imágenes médicas y de salud",
    status: "coming_soon" as const,
    badge: "Planificado",
    eta: "2026",
  },
  {
    icon: Sparkles,
    title: "Asistente IA",
    description: "Genera descripciones, objetivos de aprendizaje y materiales con inteligencia artificial.",
    status: "coming_soon" as const,
    badge: "En desarrollo",
    eta: "Q4 2025",
  },
  {
    icon: BarChart,
    title: "Análisis avanzado",
    description: "Herramientas detalladas de análisis y reportes",
    status: "available" as const,
    action: "analytics",
  },
  {
    icon: Users,
    title: "Gestión de estudiantes",
    description: "Administra y comunícate con tus estudiantes eficientemente",
    status: "available" as const,
    action: "students",
  },
  {
    icon: BookOpen,
    title: "Banco de preguntas",
    description: "Crea y reutiliza preguntas de examen en todos tus cursos desde una biblioteca central.",
    status: "coming_soon" as const,
    badge: "Planificado",
    eta: "2026",
  },
];

export function ToolsSection() {
  const router = useRouter();
  const [supportOpen, setSupportOpen] = useState(false);

  function handleToolAction(action?: string) {
    if (!action) return;
    if (action === "quiz") router.push("/create");
    if (action === "analytics") router.push("/?section=creator-analytics");
    if (action === "students") router.push("/?section=creator-students");
  }

  function renderAvailableCard(tool: (typeof tools)[number]) {
    const Icon = tool.icon;
    const labels: Record<string, string> = {
      quiz: "Abrir",
      analytics: "Ver rendimiento",
      students: "Ver estudiantes",
    };
    const label = tool.action ? labels[tool.action] : "Abrir";

    return (
      <>
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-purple-100">
            <Icon className="w-6 h-6 text-purple-600" />
          </div>
          {tool.badge && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              {tool.badge}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-lg mb-2">{tool.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
        <Button
          variant="outline"
          className="w-full hover:bg-purple-50 hover:border-purple-500 hover:text-purple-700"
          onClick={() => handleToolAction(tool.action)}
        >
          {label}
        </Button>
      </>
    );
  }

  function renderComingSoonCard(tool: (typeof tools)[number]) {
    const Icon = tool.icon;

    return (
      <div className="flex flex-col h-full">
        {/* Header con icono y badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">
            {tool.badge}
          </span>
        </div>

        {/* Título y descripción */}
        <h3 className="font-semibold text-gray-500 mb-1 text-sm">
          {tool.title}
        </h3>
        <p className="text-xs text-gray-400 flex-1 leading-relaxed">
          {tool.description}
        </p>

        {/* ETA */}
        {tool.eta && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Disponible: {tool.eta}
            </p>
          </div>
        )}

        {/* Botón de notificación */}
        <button
          onClick={() => {
            toast.info(
              `Te avisaremos cuando ${tool.title} esté disponible`
            );
          }}
          className="mt-3 w-full text-xs text-purple-600 hover:text-purple-700 font-medium py-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
        >
          Avisarme cuando esté listo
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Herramientas</h1>
        <p className="text-gray-600">Recursos y herramientas para crear contenido de calidad</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => {
          const isComingSoon = tool.status === "coming_soon";
          return (
            <Card
              key={index}
              className={`p-6 transition-shadow ${
                isComingSoon
                  ? "bg-gray-50 border-gray-200 opacity-80"
                  : "hover:shadow-lg"
              }`}
            >
              {isComingSoon
                ? renderComingSoonCard(tool)
                : renderAvailableCard(tool)}
            </Card>
          );
        })}
      </div>

      <div className="mt-12">
        <Card className="p-8 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white rounded-lg">
              <Wand2 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                ¿Necesitas una herramienta específica?
              </h3>
              <p className="text-gray-600">
                Déjanos saber qué necesitas y trabajaremos en desarrollarla
              </p>
            </div>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setSupportOpen(true)}
            >
              Solicitar herramienta
            </Button>
          </div>
        </Card>
      </div>

      <SupportSheet open={supportOpen} onOpenChange={setSupportOpen} />
    </div>
  );
}
