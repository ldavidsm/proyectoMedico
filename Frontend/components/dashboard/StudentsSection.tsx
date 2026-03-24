"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Users,
  TrendingUp,
  Award,
  UserPlus,
  GraduationCap,
  Search,
  MessageSquare,
  CheckCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Student {
  student_id: string;
  student_name: string;
  student_email: string;
  course_id: string;
  course_title: string;
  enrolled_at: string;
  progress_percentage: number;
  completed_blocks: number;
  total_blocks: number;
  last_activity: string | null;
  order_price: number;
}

interface StudentSummary {
  total_students: number;
  active_students: number;
  avg_completion: number;
  students_this_month: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "Sin actividad";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months > 1 ? "es" : ""}`;
}

function getInitial(name: string): string {
  return name?.charAt(0).toUpperCase() || "?";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  iconColor = "text-purple-600",
  bgColor = "bg-purple-100",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  iconColor?: string;
  bgColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-3 mb-0.5">{value}</p>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  let barColor = "bg-slate-200";
  let label = "Sin empezar";
  let labelColor = "text-slate-400";

  if (pct === 100) {
    barColor = "bg-emerald-500";
    label = "Completado";
    labelColor = "text-emerald-600";
  } else if (pct >= 50) {
    barColor = "bg-purple-500";
    label = `${pct}%`;
    labelColor = "text-purple-600";
  } else if (pct > 0) {
    barColor = "bg-purple-500";
    label = `${pct}%`;
    labelColor = "text-purple-600";
  }

  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-medium ${labelColor} flex items-center gap-1`}>
          {pct === 100 && <CheckCircle className="w-3 h-3" />}
          {label}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-t border-slate-50">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-slate-100 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StudentsSection() {
  const { user } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [progressFilter, setProgressFilter] = useState<
    "all" | "not_started" | "in_progress" | "completed"
  >("all");

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    const headers = { "Content-Type": "application/json" };
    const opts = { credentials: "include" as RequestCredentials, headers };

    const fetchStudents = fetch(`${API_URL}/seller/students`, opts).then((r) =>
      r.ok ? r.json() : []
    );
    const fetchSummary = fetch(`${API_URL}/seller/students/summary`, opts).then(
      (r) => (r.ok ? r.json() : null)
    );
    const fetchCourses = fetch(
      `${API_URL}/courses/?seller_id=${user.id}`,
      opts
    ).then((r) => (r.ok ? r.json() : []));

    Promise.all([fetchStudents, fetchSummary, fetchCourses])
      .then(([s, sm, c]) => {
        setStudents(Array.isArray(s) ? s : []);
        setSummary(sm);
        const courseList = Array.isArray(c)
          ? c.map((course: { id: string; title: string }) => ({
              id: course.id,
              title: course.title,
            }))
          : [];
        setCourses(courseList);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user]);

  // ─── Filtered list ───────────────────────────────────────────────────────────

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !search ||
        s.student_name.toLowerCase().includes(search.toLowerCase()) ||
        s.student_email.toLowerCase().includes(search.toLowerCase());

      const matchCourse =
        selectedCourse === "all" || s.course_id === selectedCourse;

      const matchProgress =
        progressFilter === "all" ||
        (progressFilter === "not_started" && s.progress_percentage === 0) ||
        (progressFilter === "in_progress" &&
          s.progress_percentage > 0 &&
          s.progress_percentage < 100) ||
        (progressFilter === "completed" && s.progress_percentage === 100);

      return matchSearch && matchCourse && matchProgress;
    });
  }, [students, search, selectedCourse, progressFilter]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Mis Estudiantes</h1>
        <p className="text-sm text-slate-400">
          Gestiona y monitoriza el progreso de tus alumnos
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="Total estudiantes"
          value={summary?.total_students ?? "—"}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
        />
        <KpiCard
          icon={TrendingUp}
          label="Estudiantes activos"
          value={summary?.active_students ?? "—"}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-100"
        />
        <KpiCard
          icon={Award}
          label="Finalización media"
          value={
            summary != null ? `${summary.avg_completion}%` : "—"
          }
          iconColor="text-sky-600"
          bgColor="bg-sky-100"
        />
        <KpiCard
          icon={UserPlus}
          label="Nuevos este mes"
          value={summary?.students_this_month ?? "—"}
          iconColor="text-amber-600"
          bgColor="bg-amber-100"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-3 items-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
          />
        </div>

        {/* Course selector */}
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl text-sm text-slate-700 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
        >
          <option value="all">Todos los cursos</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        {/* Progress filter */}
        <select
          value={progressFilter}
          onChange={(e) =>
            setProgressFilter(
              e.target.value as "all" | "not_started" | "in_progress" | "completed"
            )
          }
          className="bg-white border border-slate-200 rounded-xl text-sm text-slate-700 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
        >
          <option value="all">Todos los progresos</option>
          <option value="not_started">Sin empezar (0%)</option>
          <option value="in_progress">En progreso (1-99%)</option>
          <option value="completed">Completados (100%)</option>
        </select>

        {/* Results badge */}
        <span className="ml-auto text-xs font-medium bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full whitespace-nowrap">
          {filteredStudents.length}{" "}
          {filteredStudents.length === 1 ? "resultado" : "resultados"}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Inscripción
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Última actividad
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {students.length === 0
                          ? "Sin estudiantes aún"
                          : "Sin resultados"}
                      </h3>
                      <p className="text-sm text-slate-400 max-w-xs mx-auto">
                        {students.length === 0
                          ? "Tus estudiantes aparecerán aquí cuando se inscriban en tus cursos."
                          : "Ningún estudiante coincide con los filtros aplicados."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, i) => (
                  <tr
                    key={`${s.student_id}-${s.course_id}-${i}`}
                    className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Avatar + Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {getInitial(s.student_name)}
                        </div>
                        <span className="font-medium text-slate-900 truncate max-w-[140px]">
                          {s.student_name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-sm text-slate-700 truncate max-w-[180px]">
                      {s.student_email}
                    </td>

                    {/* Course */}
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-700 truncate max-w-[160px] block">
                        {s.course_title}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="px-5 py-3.5">
                      <ProgressBar pct={s.progress_percentage} />
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        {s.completed_blocks}/{s.total_blocks} bloques
                      </span>
                    </td>

                    {/* Enrolled at */}
                    <td className="px-5 py-3.5 text-sm text-slate-700 whitespace-nowrap">
                      {s.enrolled_at ? formatDate(s.enrolled_at) : "—"}
                    </td>

                    {/* Last activity */}
                    <td className="px-5 py-3.5 text-sm text-slate-700 whitespace-nowrap">
                      {formatRelative(s.last_activity)}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() =>
                          router.push("/?section=creator-comunication")
                        }
                        className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:border-purple-400 hover:text-purple-600 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
