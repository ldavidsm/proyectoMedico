"use client";

import { useState } from "react";
import { Video, Users, Clock, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface WebinarCardProps {
  id: string;
  title: string;
  seller_name?: string;
  scheduled_at: string;
  duration_minutes: number;
  meet_link?: string;
  recording_url?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  registration_count: number;
  is_registered: boolean;
  is_public: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Programado",
  live: "En directo",
  completed: "Finalizado",
  cancelled: "Cancelado",
};

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  live: "bg-green-100 text-green-700 animate-pulse",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WebinarCard({
  id,
  title,
  seller_name,
  scheduled_at,
  duration_minutes,
  meet_link,
  recording_url,
  status,
  registration_count,
  is_registered: initialIsRegistered,
}: WebinarCardProps) {
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [regCount, setRegCount] = useState(registration_count);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/webinars/${id}/register`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setIsRegistered(true);
        setRegCount((c) => c + 1);
        toast.success("¡Registrado! Recibirás un email de confirmación.");
      } else {
        const err = await res.json();
        toast.error(err.detail || "Error al registrarse");
      }
    } catch {
      toast.error("Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      {/* Banner */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-5 flex items-center justify-between">
        <Video className="w-8 h-8 text-white opacity-80" />
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_BADGE[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {title}
        </h3>

        {seller_name && (
          <p className="text-xs text-gray-500">por {seller_name}</p>
        )}

        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(scheduled_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{regCount} registrados</span>
          </div>
        </div>

        <div className="mt-auto pt-2">
          {isRegistered ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-teal-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                Ya estás registrado
              </div>
              {meet_link && (
                <a
                  href={meet_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver link de Meet
                </a>
              )}
            </div>
          ) : status === "scheduled" ? (
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          ) : status === "completed" && recording_url ? (
            <a
              href={recording_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              Ver grabación
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
