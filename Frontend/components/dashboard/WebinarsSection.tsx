"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Video,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Copy,
  Link as LinkIcon,
  Pencil,
  Trash2,
  ChevronDown,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGoogleAuthStatus } from "@/hooks/useWebinars";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Webinar {
  id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  meet_link?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  max_attendees?: number;
  is_public: boolean;
  recording_url?: string;
  course_title?: string;
  registration_count: number;
  google_event_id?: string;
}

interface Registration {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  registered_at: string;
  attended: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  live: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Programado",
  live: "En directo",
  completed: "Finalizado",
  cancelled: "Cancelado",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Google Auth Card ─────────────────────────────────────────────────────────

function GoogleAuthCard() {
  const { connected, google_email, isLoading, connect, disconnect } =
    useGoogleAuthStatus();

  if (isLoading) {
    return <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />;
  }

  if (connected) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Google Meet conectado
            </p>
            {google_email && (
              <p className="text-xs text-green-600">{google_email}</p>
            )}
          </div>
        </div>
        <button
          onClick={disconnect}
          className="text-xs text-red-500 hover:text-red-700 font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:border-red-400 transition-colors"
        >
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            Conecta tu cuenta de Google para crear reuniones de Meet automáticamente
          </p>
        </div>
        <button
          onClick={connect}
          className="text-xs text-white bg-green-600 hover:bg-green-700 font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ml-4"
        >
          Conectar con Google
        </button>
      </div>
      <p className="text-xs text-amber-600">
        Sin conexión puedes añadir el link manualmente al crear el webinar.
      </p>
    </div>
  );
}

// ─── Webinar Form Sheet ───────────────────────────────────────────────────────

function WebinarFormSheet({
  open,
  onOpenChange,
  webinar,
  courses,
  googleConnected,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  webinar: Webinar | null;
  courses: { id: string; title: string }[];
  googleConnected: boolean;
  onSaved: () => void;
}) {
  const isEdit = !!webinar;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: webinar?.title ?? "",
    description: webinar?.description ?? "",
    scheduled_at: webinar?.scheduled_at
      ? new Date(webinar.scheduled_at).toISOString().slice(0, 16)
      : "",
    duration_minutes: webinar?.duration_minutes ?? 60,
    course_id: webinar?.course_title ? "" : "",
    max_attendees: webinar?.max_attendees?.toString() ?? "",
    is_public: webinar?.is_public ?? true,
    meet_link: webinar?.meet_link ?? "",
  });

  // Reset form when webinar changes
  useEffect(() => {
    setForm({
      title: webinar?.title ?? "",
      description: webinar?.description ?? "",
      scheduled_at: webinar?.scheduled_at
        ? new Date(webinar.scheduled_at).toISOString().slice(0, 16)
        : "",
      duration_minutes: webinar?.duration_minutes ?? 60,
      course_id: "",
      max_attendees: webinar?.max_attendees?.toString() ?? "",
      is_public: webinar?.is_public ?? true,
      meet_link: webinar?.meet_link ?? "",
    });
  }, [webinar]);

  const field = (key: keyof typeof form, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.scheduled_at) {
      toast.error("Título y fecha son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || null,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        duration_minutes: Number(form.duration_minutes),
        is_public: form.is_public,
        max_attendees: form.max_attendees ? Number(form.max_attendees) : null,
        course_id: form.course_id || null,
      };
      if (!googleConnected && form.meet_link) {
        payload.meet_link = form.meet_link;
      }

      const url = isEdit
        ? `${API_URL}/webinars/${webinar!.id}`
        : `${API_URL}/webinars/`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isEdit ? "Webinar actualizado" : "Webinar creado");
        onOpenChange(false);
        onSaved();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Error al guardar");
      }
    } catch {
      toast.error("Error al guardar el webinar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Editar webinar" : "Nuevo webinar"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => field("title", e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora *
            </label>
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => field("scheduled_at", e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración
            </label>
            <select
              value={form.duration_minutes}
              onChange={(e) => field("duration_minutes", Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {[30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m}>
                  {m} minutos
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curso asociado
            </label>
            <select
              value={form.course_id}
              onChange={(e) => field("course_id", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Ninguno</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de asistentes (opcional)
            </label>
            <input
              type="number"
              value={form.max_attendees}
              onChange={(e) => field("max_attendees", e.target.value)}
              min={1}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Público</p>
              <p className="text-xs text-gray-500">
                {form.is_public
                  ? "Visible para todos"
                  : "Solo matriculados en el curso"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => field("is_public", !form.is_public)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.is_public ? "bg-purple-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.is_public ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {!googleConnected && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link de Google Meet (manual)
              </label>
              <input
                type="url"
                value={form.meet_link}
                onChange={(e) => field("meet_link", e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear webinar"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ─── Registrations Sheet ──────────────────────────────────────────────────────

function RegistrationsSheet({
  open,
  onOpenChange,
  webinarId,
  webinarTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  webinarId: string;
  webinarTitle: string;
}) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !webinarId) return;
    setLoading(true);
    fetch(`${API_URL}/webinars/${webinarId}/registrations`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : []))
      .then(setRegistrations)
      .catch(() => setRegistrations([]))
      .finally(() => setLoading(false));
  }, [open, webinarId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Registrados — {webinarTitle}</SheetTitle>
        </SheetHeader>
        <div className="mt-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Nadie se ha registrado aún.
            </p>
          ) : (
            <div className="space-y-2">
              {registrations.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(r.student_name || r.student_email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {r.student_name || "—"}
                      </p>
                      <p className="text-xs text-gray-500">{r.student_email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      r.attended
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {r.attended ? "Asistió" : "No asistió"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Webinar Row Card ─────────────────────────────────────────────────────────

function WebinarRow({
  webinar,
  onEdit,
  onDelete,
  onViewRegistrations,
}: {
  webinar: Webinar;
  onEdit: () => void;
  onDelete: () => void;
  onViewRegistrations: () => void;
}) {
  const [linkInput, setLinkInput] = useState("");
  const [savingLink, setSavingLink] = useState(false);
  const [localLink, setLocalLink] = useState(webinar.meet_link);

  async function saveLink() {
    if (!linkInput.trim()) return;
    setSavingLink(true);
    try {
      const res = await fetch(`${API_URL}/webinars/${webinar.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meet_link: linkInput }),
      });
      if (res.ok) {
        setLocalLink(linkInput);
        setLinkInput("");
        toast.success("Link guardado");
      }
    } catch {
      toast.error("Error al guardar el link");
    } finally {
      setSavingLink(false);
    }
  }

  function copyLink() {
    if (localLink) {
      navigator.clipboard.writeText(localLink);
      toast.success("Link copiado");
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[webinar.status]}`}
            >
              {STATUS_LABEL[webinar.status]}
            </span>
            {webinar.course_title && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {webinar.course_title}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">{webinar.title}</h3>
          {webinar.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {webinar.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-400"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(webinar.scheduled_at)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {webinar.duration_minutes} min
        </span>
        <button
          onClick={onViewRegistrations}
          className="flex items-center gap-1 hover:text-purple-600 transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          {webinar.registration_count} registrados
        </button>
      </div>

      {/* Meet link */}
      {localLink ? (
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500 truncate flex-1">{localLink}</p>
          <button
            onClick={copyLink}
            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 border border-purple-200 px-2 py-1 rounded-lg transition-colors"
          >
            <Copy className="w-3 h-3" />
            Copiar link
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="Añadir link de Meet..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={saveLink}
            disabled={savingLink || !linkInput.trim()}
            className="flex items-center gap-1 text-xs text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <LinkIcon className="w-3 h-3" />
            Guardar
          </button>
        </div>
      )}
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WebinarsSection() {
  const { user } = useAuth();
  const { connected } = useGoogleAuthStatus();

  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formSheet, setFormSheet] = useState<{
    open: boolean;
    webinar: Webinar | null;
  }>({ open: false, webinar: null });

  const [regsSheet, setRegsSheet] = useState<{
    open: boolean;
    webinarId: string;
    title: string;
  }>({ open: false, webinarId: "", title: "" });

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function loadWebinars() {
    fetch(`${API_URL}/webinars/my-webinars`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setWebinars(Array.isArray(data) ? data : []))
      .catch(() => setWebinars([]))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (!user) return;
    const opts = { credentials: "include" as RequestCredentials };
    Promise.all([
      fetch(`${API_URL}/webinars/my-webinars`, opts).then((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`${API_URL}/courses/?seller_id=${user.id}`, opts).then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([wData, cData]) => {
        setWebinars(Array.isArray(wData) ? wData : []);
        setCourses(
          Array.isArray(cData)
            ? cData.map((c: { id: string; title: string }) => ({
                id: c.id,
                title: c.title,
              }))
            : []
        );
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`${API_URL}/webinars/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok || res.status === 204) {
        setWebinars((prev) => prev.filter((w) => w.id !== id));
        toast.success("Webinar eliminado");
      } else {
        toast.error("Error al eliminar el webinar");
      }
    } catch {
      toast.error("Error al eliminar el webinar");
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webinars</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sesiones en vivo para tus estudiantes
          </p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => setFormSheet({ open: true, webinar: null })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo webinar
        </Button>
      </div>

      {/* Google Auth Status */}
      <GoogleAuthCard />

      {/* Webinar list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : webinars.length === 0 ? (
        <Card className="p-10 flex flex-col items-center gap-3 text-center">
          <Video className="w-14 h-14 text-gray-200" />
          <p className="text-base font-medium text-gray-500">
            No tienes webinars programados.
          </p>
          <p className="text-sm text-gray-400">
            Crea tu primera sesión en vivo con el botón de arriba.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {webinars.map((w) => (
            <WebinarRow
              key={w.id}
              webinar={w}
              onEdit={() => setFormSheet({ open: true, webinar: w })}
              onDelete={() => setConfirmDelete(w.id)}
              onViewRegistrations={() =>
                setRegsSheet({ open: true, webinarId: w.id, title: w.title })
              }
            />
          ))}
        </div>
      )}

      {/* Form Sheet */}
      <WebinarFormSheet
        open={formSheet.open}
        onOpenChange={(v) => setFormSheet((s) => ({ ...s, open: v }))}
        webinar={formSheet.webinar}
        courses={courses}
        googleConnected={connected}
        onSaved={loadWebinars}
      />

      {/* Registrations Sheet */}
      <RegistrationsSheet
        open={regsSheet.open}
        onOpenChange={(v) => setRegsSheet((s) => ({ ...s, open: v }))}
        webinarId={regsSheet.webinarId}
        webinarTitle={regsSheet.title}
      />

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-sm w-full p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">¿Eliminar webinar?</h3>
            <p className="text-sm text-gray-600">
              Esta acción no se puede deshacer. Se cancelará el evento de Google
              Calendar si existe.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleDelete(confirmDelete)}
              >
                Eliminar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
