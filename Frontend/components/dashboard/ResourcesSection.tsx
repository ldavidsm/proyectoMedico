"use client";

import { useState, useEffect } from "react";
import { BookOpen, Video, FileText, Headphones, Download, Users, Clock } from "lucide-react";
import { WebinarsSection } from "@/components/dashboard/WebinarsSection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportSheet } from "@/components/shared/SupportSheet";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  duration: string | null;
  is_active: boolean;
  order: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  PDF: FileText,
  Video: Video,
  Plantilla: FileText,
  Curso: BookOpen,
  Enlace: BookOpen,
};

export function ResourcesSection() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    const opts = { credentials: "include" as RequestCredentials };
    Promise.all([
      fetch(`${API_URL}/resources/`, opts).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/resources/faqs`, opts).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([res, faqData]) => {
        setResources(Array.isArray(res) ? res : []);
        setFaqs(Array.isArray(faqData) ? faqData : []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Recursos</h1>
        <p className="text-gray-600">Aprende, crece y mejora tus habilidades como instructor</p>
      </div>

      <Tabs defaultValue="guides" className="mb-6">
        <TabsList>
          <TabsTrigger value="guides">Guías y tutoriales</TabsTrigger>
          <TabsTrigger value="webinars">Webinars</TabsTrigger>
          <TabsTrigger value="community">Comunidad</TabsTrigger>
          <TabsTrigger value="faq">Preguntas frecuentes</TabsTrigger>
        </TabsList>

        {/* ── Guías y tutoriales ─────────────────────────────────────────── */}
        <TabsContent value="guides" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <Card className="p-10 flex flex-col items-center gap-3 text-center text-gray-400">
              <BookOpen className="w-12 h-12 text-gray-200" />
              <p className="text-base font-medium text-gray-500">
                El equipo de HealthLearn publicará recursos pronto.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((r) => {
                const Icon = TYPE_ICON[r.type] || FileText;
                return (
                  <Card key={r.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                        <Icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded self-start">
                        {r.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{r.title}</h3>
                    {r.description && (
                      <p className="text-gray-600 text-sm mb-3">{r.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {r.duration && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {r.duration}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-purple-600 ml-auto"
                        onClick={() => window.open(r.url, "_blank")}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Acceder
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Webinars ──────────────────────────────────────────────────── */}
        <TabsContent value="webinars" className="mt-6">
          <WebinarsSection />
        </TabsContent>

        {/* ── Comunidad ─────────────────────────────────────────────────── */}
        <TabsContent value="community" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Foro de instructores</h3>
              <p className="text-gray-600 mb-4">
                Conecta con otros instructores, comparte experiencias y aprende de la comunidad
              </p>
              <Button variant="outline" className="w-full">
                Unirse al foro
              </Button>
            </Card>

            <Card className="p-6">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                <Headphones className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Soporte dedicado</h3>
              <p className="text-gray-600 mb-4">
                ¿Necesitas ayuda? Nuestro equipo está disponible para asistirte
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSupportOpen(true)}
              >
                Contactar soporte
              </Button>
            </Card>
          </div>
        </TabsContent>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <TabsContent value="faq" className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <Card className="p-10 flex flex-col items-center gap-2 text-center text-gray-400">
              <p className="text-base font-medium text-gray-500">
                Aún no hay preguntas frecuentes publicadas.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.id} className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <SupportSheet open={supportOpen} onOpenChange={setSupportOpen} />
    </div>
  );
}
