"use client";

import { useEffect, useState, useCallback } from "react";
import {
  X, Users, Calendar, Plus, Trash2, Edit, Megaphone,
  ChevronRight, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Offer {
  id: string;
  name_public: string;
  inscription_type: string;
}

interface CohortsPanelProps {
  courseId: string;
  courseTitle: string;
  offers: Offer[];
  onClose: () => void;
}

interface CohortData {
  id: string;
  course_id: string;
  offer_id: string;
  name: string;
  enrollment_start: string | null;
  enrollment_end: string | null;
  course_start: string;
  course_end: string | null;
  max_students: number | null;
  is_active: boolean;
  announcement: string | null;
  created_at: string;
  member_count: number;
  spots_left: number | null;
  enrollment_open: boolean;
  course_started: boolean;
}

interface MemberData {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  joined_at: string;
  progress_percentage: number;
}

function defaultCohortName() {
  const now = new Date();
  const month = now.toLocaleDateString("es-ES", { month: "long" });
  return `Edición ${month.charAt(0).toUpperCase() + month.slice(1)} ${now.getFullYear()}`;
}

export function CohortsPanel({ courseId, courseTitle, offers, onClose }: CohortsPanelProps) {
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Members sheet
  const [membersCohort, setMembersCohort] = useState<CohortData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Announce dialog
  const [announceCohort, setAnnounceCohort] = useState<CohortData | null>(null);
  const [announceMsg, setAnnounceMsg] = useState("");
  const [sendingAnnounce, setSendingAnnounce] = useState(false);

  // Form state
  const convocatoriaOffers = offers.filter(o => o.inscription_type === "convocatoria");
  const [form, setForm] = useState({
    name: defaultCohortName(),
    offer_id: convocatoriaOffers[0]?.id || "",
    enrollment_start: "",
    enrollment_end: "",
    course_start: "",
    course_end: "",
    max_students: "",
  });

  const fetchCohorts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/cohorts/?course_id=${courseId}`,
        { credentials: "include" }
      );
      if (res.ok) setCohorts(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchCohorts(); }, [fetchCohorts]);

  const handleCreate = async () => {
    if (!form.name || !form.offer_id || !form.course_start) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        course_id: courseId,
        offer_id: form.offer_id,
        name: form.name,
        course_start: new Date(form.course_start).toISOString(),
      };
      if (form.enrollment_start) body.enrollment_start = new Date(form.enrollment_start).toISOString();
      if (form.enrollment_end) body.enrollment_end = new Date(form.enrollment_end).toISOString();
      if (form.course_end) body.course_end = new Date(form.course_end).toISOString();
      if (form.max_students) body.max_students = parseInt(form.max_students);

      const res = await fetch(`${API_URL}/cohorts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setShowForm(false);
      setForm({ ...form, name: defaultCohortName() });
      fetchCohorts();
    } catch {
      alert("Error al crear cohort");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta edición?")) return;
    await fetch(`${API_URL}/cohorts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchCohorts();
  };

  const openMembers = async (cohort: CohortData) => {
    setMembersCohort(cohort);
    setLoadingMembers(true);
    try {
      const res = await fetch(
        `${API_URL}/cohorts/${cohort.id}/members`,
        { credentials: "include" }
      );
      if (res.ok) setMembers(await res.json());
    } catch {
      // silent
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAnnounce = async () => {
    if (!announceCohort || !announceMsg.trim()) return;
    setSendingAnnounce(true);
    try {
      const res = await fetch(
        `${API_URL}/cohorts/${announceCohort.id}/announce?message=${encodeURIComponent(announceMsg)}`,
        { method: "POST", credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        alert(`Anuncio enviado a ${data.notified} estudiantes`);
        setAnnounceCohort(null);
        setAnnounceMsg("");
        fetchCohorts();
      }
    } catch {
      alert("Error al enviar anuncio");
    } finally {
      setSendingAnnounce(false);
    }
  };

  return (
    <Sheet open onOpenChange={() => onClose()}>
      <SheetContent side="right" className="w-full max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Cohorts — {courseTitle}
          </SheetTitle>
        </SheetHeader>

        {/* New cohort button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="mb-6 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva edición
          </Button>
        )}

        {/* Create form */}
        {showForm && (
          <Card className="p-5 mb-6 border-purple-200 bg-purple-50/50">
            <h3 className="font-semibold mb-4">Nueva edición</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-gray-600 mb-1 block">Nombre</label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Edición Marzo 2026"
                />
              </div>
              {convocatoriaOffers.length > 1 && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-600 mb-1 block">Oferta</label>
                  <Select value={form.offer_id} onValueChange={v => setForm({ ...form, offer_id: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {convocatoriaOffers.map(o => (
                        <SelectItem key={o.id} value={o.id}>{o.name_public}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Inicio inscripción</label>
                <Input type="date" value={form.enrollment_start}
                  onChange={e => setForm({ ...form, enrollment_start: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Cierre inscripción</label>
                <Input type="date" value={form.enrollment_end}
                  onChange={e => setForm({ ...form, enrollment_end: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Inicio curso *</label>
                <Input type="date" value={form.course_start} required
                  onChange={e => setForm({ ...form, course_start: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Fin curso</label>
                <Input type="date" value={form.course_end}
                  onChange={e => setForm({ ...form, course_end: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Plazas máximas</label>
                <Input type="number" min={1} value={form.max_students}
                  onChange={e => setForm({ ...form, max_students: e.target.value })}
                  placeholder="Sin límite" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreate} disabled={saving || !form.course_start}
                className="bg-purple-600 hover:bg-purple-700">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Crear cohort
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {/* Cohorts list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : cohorts.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No has creado ninguna edición aún
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Crea tu primera convocatoria para gestionar grupos de estudiantes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cohorts.map(cohort => (
              <Card key={cohort.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{cohort.name}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Inicio: {new Date(cohort.course_start).toLocaleDateString("es-ES", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {cohort.is_active ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Finalizado</Badge>
                    )}
                    {cohort.enrollment_open && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        Inscripción abierta
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {cohort.member_count} estudiantes
                  </span>
                  {cohort.spots_left !== null && (
                    <span className={cohort.spots_left <= 3 ? "text-red-600 font-medium" : ""}>
                      {cohort.spots_left} plazas libres
                    </span>
                  )}
                  {cohort.course_end && (
                    <span>
                      Hasta {new Date(cohort.course_end).toLocaleDateString("es-ES", {
                        day: "numeric", month: "short"
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => openMembers(cohort)}
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    Ver estudiantes
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => { setAnnounceCohort(cohort); setAnnounceMsg(cohort.announcement || ""); }}
                  >
                    <Megaphone className="w-3.5 h-3.5 mr-1.5" />
                    Anuncio
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                    onClick={() => handleDelete(cohort.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Members sheet */}
        {membersCohort && (
          <Sheet open onOpenChange={() => setMembersCohort(null)}>
            <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>
                  Estudiantes — {membersCohort.name}
                </SheetTitle>
              </SheetHeader>

              {loadingMembers ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : members.length === 0 ? (
                <p className="text-center text-gray-500 py-12">
                  Aún no hay estudiantes inscritos.
                </p>
              ) : (
                <div className="space-y-3">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm">
                        {(m.student_name?.[0] || "U").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.student_name}</p>
                        <p className="text-xs text-gray-500 truncate">{m.student_email}</p>
                      </div>
                      <div className="text-right w-20">
                        <p className="text-xs font-medium text-gray-700 mb-1">{m.progress_percentage}%</p>
                        <Progress value={m.progress_percentage} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SheetContent>
          </Sheet>
        )}

        {/* Announce dialog */}
        <Dialog open={!!announceCohort} onOpenChange={() => setAnnounceCohort(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar anuncio</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-500 mb-2">
              Se notificará a los {announceCohort?.member_count} estudiantes de{" "}
              <strong>{announceCohort?.name}</strong>.
            </p>
            <Textarea
              value={announceMsg}
              onChange={e => setAnnounceMsg(e.target.value)}
              placeholder="Escribe tu mensaje..."
              rows={4}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setAnnounceCohort(null)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAnnounce}
                disabled={sendingAnnounce || !announceMsg.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {sendingAnnounce ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}
