"use client";

import { Wand2, FileText, Video, Image, BarChart, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SupportSheet } from "@/components/shared/SupportSheet";

const tools: { icon: typeof Video; title: string; description: string; status: 'available' | 'coming_soon'; action?: string; badge?: string }[] = [
  {
    icon: Video,
    title: "Editor de video",
    description: "Edita y mejora tus videos de clase con herramientas profesionales",
    status: "coming_soon" as const,
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
  },
  {
    icon: Wand2,
    title: "Generador de contenido IA",
    description: "Asistente de IA para crear descripciones y materiales del curso",
    status: "coming_soon" as const,
    badge: "Beta",
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

  function renderButton(tool: (typeof tools)[number]) {
    if (tool.status === "coming_soon") {
      return (
        <Button variant="outline" className="w-full" disabled>
          Próximamente
        </Button>
      );
    }

    const labels: Record<string, string> = {
      quiz: "Abrir",
      analytics: "Ver rendimiento",
      students: "Ver estudiantes",
    };
    const label = tool.action ? labels[tool.action] : "Abrir";

    return (
      <Button
        variant="outline"
        className="w-full hover:bg-teal-50 hover:border-teal-500 hover:text-teal-700"
        onClick={() => handleToolAction(tool.action)}
      >
        {label}
      </Button>
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
          const Icon = tool.icon;
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
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${
                    isComingSoon ? "bg-gray-100" : "bg-purple-100"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isComingSoon ? "text-gray-400" : "text-purple-600"
                    }`}
                  />
                </div>
                {isComingSoon ? (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                    Próximamente
                  </span>
                ) : tool.badge ? (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    {tool.badge}
                  </span>
                ) : null}
              </div>
              <h3 className="font-semibold text-lg mb-2">{tool.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
              {renderButton(tool)}
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
