"use client";

import { useState, useEffect } from "react";
import { BookOpen, Video, FileText, Headphones, Download, Users, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { WebinarsSection } from "@/components/dashboard/WebinarsSection";
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
  const [activeTab, setActiveTab] = useState<'guides' | 'webinars' | 'community' | 'faq'>('guides');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

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
      .catch((err) => {
        if (process.env.NODE_ENV === 'development') console.error('Error fetching resources:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Recursos</h1>
        <p className="text-sm text-slate-400">Aprende, crece y mejora tus habilidades como instructor</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {[
          { id: 'guides' as const, label: 'Guías y tutoriales' },
          { id: 'webinars' as const, label: 'Webinars' },
          { id: 'community' as const, label: 'Comunidad' },
          { id: 'faq' as const, label: 'Preguntas frecuentes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id
              ? "px-4 py-2 rounded-lg text-sm font-semibold bg-white text-slate-900 shadow-sm"
              : "px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 transition-all"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Guías y tutoriales ─────────────────────────────────────────── */}
      {activeTab === 'guides' && (
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Sin recursos disponibles
              </h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                Los recursos y materiales de la plataforma aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((r) => {
                const Icon = TYPE_ICON[r.type] || FileText;
                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 self-start">
                        {r.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{r.title}</h3>
                    {r.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      {r.duration && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {r.duration}
                        </span>
                      )}
                      <button
                        onClick={() => window.open(r.url, "_blank")}
                        className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all ml-auto"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Acceder
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Webinars ──────────────────────────────────────────────────── */}
      {activeTab === 'webinars' && (
        <div className="mt-6">
          <WebinarsSection />
        </div>
      )}

      {/* ── Comunidad ─────────────────────────────────────────────────── */}
      {activeTab === 'community' && (
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Foro de instructores</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Conecta con otros instructores, comparte experiencias y aprende de la comunidad
              </p>
              <button className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Unirse al foro
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <Headphones className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Soporte dedicado</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                ¿Necesitas ayuda? Nuestro equipo está disponible para asistirte
              </p>
              <button
                onClick={() => setSupportOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Contactar soporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      {activeTab === 'faq' && (
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Sin preguntas frecuentes
              </h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                Aún no hay preguntas frecuentes publicadas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                >
                  <button
                    onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                    className="px-5 py-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-between w-full text-left"
                  >
                    {faq.question}
                    {openFaqId === faq.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaqId === faq.id && (
                    <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <SupportSheet open={supportOpen} onOpenChange={setSupportOpen} />
    </div>
  );
}
