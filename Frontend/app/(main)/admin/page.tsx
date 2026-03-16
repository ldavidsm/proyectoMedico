"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SellerRequest {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  bio: string | null;
  education: string | null;
  experience_years: number | null;
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

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [sellerRequests, setSellerRequests] = useState<SellerRequest[]>([]);
  const [courses, setCourses] = useState<CourseReview[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    setLoadingData(true);
    try {
      const [sellerRes, coursesRes] = await Promise.all([
        fetch(`${API}/admin/seller-requests?status=pending`, {
          credentials: "include",
        }),
        fetch(`${API}/admin/courses/review`, {
          credentials: "include",
        }),
      ]);

      if (sellerRes.ok) {
        setSellerRequests(await sellerRes.json());
      }
      if (coursesRes.ok) {
        setCourses(await coursesRes.json());
      }
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
      if (res.ok) {
        setSellerRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (err) {
      console.error("Error updating seller request:", err);
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
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
      }
    } catch (err) {
      console.error("Error reviewing course:", err);
    } finally {
      setActionLoading(null);
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

      {/* Cursos en revisión */}
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

      {/* Solicitudes de sellers */}
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
    </div>
  );
}
