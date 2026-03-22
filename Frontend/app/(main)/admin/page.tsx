"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SellerRequest {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  bio: string | null;
  education: string | null;
  experience_years: number | null;
  document_url?: string | null;
  status: string;
  created_at: string | null;
}

interface CourseReview {
  id: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  level: string | null;
  short_description: string | null;
  status: string;
  seller_name: string | null;
  seller_email: string | null;
  created_at: string | null;
}

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
  is_active: boolean;
  order: number;
}

interface SupportTicket {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const map: Record<string, string> = {
    open: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
  };
  const labels: Record<string, string> = {
    open: "Abierto",
    in_progress: "En progreso",
    resolved: "Resuelto",
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [sellerRequests, setSellerRequests] = useState<SellerRequest[]>([]);
  const [courses, setCourses] = useState<CourseReview[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Resource/FAQ sheet state
  const [resourceSheet, setResourceSheet] = useState<{
    open: boolean;
    mode: "create" | "edit";
    item: Partial<Resource>;
  }>({ open: false, mode: "create", item: {} });

  const [faqSheet, setFaqSheet] = useState<{
    open: boolean;
    mode: "create" | "edit";
    item: Partial<FAQ>;
  }>({ open: false, mode: "create", item: {} });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") fetchData();
  }, [user]);

  async function fetchData() {
    setLoadingData(true);
    try {
      const opts = { credentials: "include" as RequestCredentials };
      const [sellerRes, coursesRes, resourcesRes, faqsRes, ticketsRes] =
        await Promise.all([
          fetch(`${API}/admin/seller-requests?status=pending`, opts),
          fetch(`${API}/admin/courses/review`, opts),
          fetch(`${API}/resources/`, opts),
          fetch(`${API}/resources/faqs`, opts),
          fetch(`${API}/resources/support`, opts),
        ]);

      if (sellerRes.ok) setSellerRequests(await sellerRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (resourcesRes.ok) setResources(await resourcesRes.json());
      if (faqsRes.ok) setFaqs(await faqsRes.json());
      if (ticketsRes.ok) setTickets(await ticketsRes.json());
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoadingData(false);
    }
  }

  async function handleSellerRequest(requestId: string, status: "approved" | "rejected") {
    setActionLoading(requestId);
    try {
      const res = await fetch(
        `${API}/admin/seller-requests/${requestId}?status=${status}`,
        { method: "PATCH", credentials: "include" }
      );
      if (res.ok) setSellerRequests((prev) => prev.filter((r) => r.id !== requestId));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCourseReview(courseId: string, action: "approve" | "reject") {
    setActionLoading(courseId);
    try {
      const res = await fetch(
        `${API}/admin/courses/${courseId}/review?action=${action}`,
        { method: "PATCH", credentials: "include" }
      );
      if (res.ok) setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } finally {
      setActionLoading(null);
    }
  }

  // ── Resources CRUD ──────────────────────────────────────────────────────────

  async function saveResource() {
    const { mode, item } = resourceSheet;
    const url =
      mode === "create"
        ? `${API}/resources/`
        : `${API}/resources/${item.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      setResourceSheet({ open: false, mode: "create", item: {} });
      const updated = await fetch(`${API}/resources/`, {
        credentials: "include",
      });
      if (updated.ok) setResources(await updated.json());
    }
  }

  async function deleteResource(id: string) {
    await fetch(`${API}/resources/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setResources((prev) => prev.filter((r) => r.id !== id));
  }

  // ── FAQ CRUD ────────────────────────────────────────────────────────────────

  async function saveFaq() {
    const { mode, item } = faqSheet;
    const url =
      mode === "create" ? `${API}/resources/faqs` : `${API}/resources/faqs/${item.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      setFaqSheet({ open: false, mode: "create", item: {} });
      const updated = await fetch(`${API}/resources/faqs`, {
        credentials: "include",
      });
      if (updated.ok) setFaqs(await updated.json());
    }
  }

  async function deleteFaq(id: string) {
    await fetch(`${API}/resources/faqs/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  }

  // ── Ticket status ───────────────────────────────────────────────────────────

  async function updateTicketStatus(id: string, status: string) {
    const res = await fetch(`${API}/resources/support/${id}?status=${status}`, {
      method: "PATCH",
      credentials: "include",
    });
    if (res.ok) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
    }
  }

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>

      {/* ── Cursos en revisión ────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Cursos en revisión ({courses.length})
        </h2>
        {loadingData ? (
          <p className="text-gray-500">Cargando cursos...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-500">No hay cursos pendientes de revisión.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium">{course.title}</div>
                      {course.short_description && (
                        <div className="text-gray-500 text-xs mt-1 line-clamp-2">
                          {course.short_description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{course.category || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{course.level || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{course.seller_name || "—"}</div>
                      <div className="text-xs text-gray-400">{course.seller_email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {course.created_at ? new Date(course.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleCourseReview(course.id, "approve")}
                        disabled={actionLoading === course.id}
                        className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50 text-xs font-medium"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleCourseReview(course.id, "reject")}
                        disabled={actionLoading === course.id}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-xs font-medium"
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Solicitudes de sellers ────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Solicitudes de sellers ({sellerRequests.length})
        </h2>
        {loadingData ? (
          <p className="text-gray-500">Cargando solicitudes...</p>
        ) : sellerRequests.length === 0 ? (
          <p className="text-gray-500">No hay solicitudes pendientes.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experiencia</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Educación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doc.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sellerRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{req.user_name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{req.user_email || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {req.experience_years != null ? `${req.experience_years} años` : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {req.education || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {req.document_url ? (
                        <a
                          href={req.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Ver documento
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleSellerRequest(req.id, "approved")}
                        disabled={actionLoading === req.id}
                        className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50 text-xs font-medium"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleSellerRequest(req.id, "rejected")}
                        disabled={actionLoading === req.id}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-xs font-medium"
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Recursos ─────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Recursos ({resources.length})
          </h2>
          <Button
            size="sm"
            className="bg-teal-500 hover:bg-teal-600 text-white"
            onClick={() =>
              setResourceSheet({ open: true, mode: "create", item: { order: 0 } })
            }
          >
            Añadir recurso
          </Button>
        </div>
        {resources.length === 0 ? (
          <p className="text-gray-500">No hay recursos publicados.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                        {r.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${r.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {r.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() =>
                          setResourceSheet({ open: true, mode: "edit", item: { ...r } })
                        }
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteResource(r.id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── FAQs ─────────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">FAQs ({faqs.length})</h2>
          <Button
            size="sm"
            className="bg-teal-500 hover:bg-teal-600 text-white"
            onClick={() =>
              setFaqSheet({ open: true, mode: "create", item: { order: 0 } })
            }
          >
            Añadir FAQ
          </Button>
        </div>
        {faqs.length === 0 ? (
          <p className="text-gray-500">No hay FAQs publicadas.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pregunta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {faqs.map((f) => (
                  <tr key={f.id}>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-sm truncate">{f.question}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{f.order}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${f.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {f.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() =>
                          setFaqSheet({ open: true, mode: "edit", item: { ...f } })
                        }
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteFaq(f.id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Soporte ──────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Tickets de soporte ({tickets.length})
        </h2>
        {tickets.length === 0 ? (
          <p className="text-gray-500">No hay tickets de soporte.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asunto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cambiar estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium">{t.subject}</div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">{t.message}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">{statusBadge(t.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={t.status}
                        onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-400"
                      >
                        <option value="open">Abierto</option>
                        <option value="in_progress">En progreso</option>
                        <option value="resolved">Resuelto</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Resource Sheet ─────────────────────────────────────────────────── */}
      <Sheet
        open={resourceSheet.open}
        onOpenChange={(v) =>
          setResourceSheet((s) => ({ ...s, open: v }))
        }
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {resourceSheet.mode === "create" ? "Nuevo recurso" : "Editar recurso"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {(
              [
                { key: "title", label: "Título", required: true },
                { key: "url", label: "URL", required: true },
                { key: "description", label: "Descripción" },
                { key: "duration", label: "Duración (ej. 45 min)" },
              ] as { key: keyof Resource; label: string; required?: boolean }[]
            ).map(({ key, label, required }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={(resourceSheet.item[key] as string) ?? ""}
                  onChange={(e) =>
                    setResourceSheet((s) => ({
                      ...s,
                      item: { ...s.item, [key]: e.target.value },
                    }))
                  }
                  required={required}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={resourceSheet.item.type ?? "PDF"}
                onChange={(e) =>
                  setResourceSheet((s) => ({
                    ...s,
                    item: { ...s.item, type: e.target.value },
                  }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {["PDF", "Video", "Plantilla", "Curso", "Enlace"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input
                type="number"
                value={resourceSheet.item.order ?? 0}
                onChange={(e) =>
                  setResourceSheet((s) => ({
                    ...s,
                    item: { ...s.item, order: Number(e.target.value) },
                  }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <Button
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              onClick={saveResource}
            >
              Guardar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── FAQ Sheet ─────────────────────────────────────────────────────── */}
      <Sheet
        open={faqSheet.open}
        onOpenChange={(v) => setFaqSheet((s) => ({ ...s, open: v }))}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {faqSheet.mode === "create" ? "Nueva FAQ" : "Editar FAQ"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pregunta</label>
              <input
                type="text"
                value={faqSheet.item.question ?? ""}
                onChange={(e) =>
                  setFaqSheet((s) => ({
                    ...s,
                    item: { ...s.item, question: e.target.value },
                  }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta</label>
              <textarea
                value={faqSheet.item.answer ?? ""}
                onChange={(e) =>
                  setFaqSheet((s) => ({
                    ...s,
                    item: { ...s.item, answer: e.target.value },
                  }))
                }
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input
                type="number"
                value={faqSheet.item.order ?? 0}
                onChange={(e) =>
                  setFaqSheet((s) => ({
                    ...s,
                    item: { ...s.item, order: Number(e.target.value) },
                  }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <Button
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              onClick={saveFaq}
            >
              Guardar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
