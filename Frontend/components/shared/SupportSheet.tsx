"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SUBJECTS = [
  "Problema técnico",
  "Duda sobre pagos",
  "Problema con mi curso",
  "Sugerencia",
  "Otro",
];

interface SupportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupportSheet({ open, onOpenChange }: SupportSheetProps) {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 20) {
      toast.error("El mensaje debe tener al menos 20 caracteres.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/resources/support`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      if (res.ok) {
        toast.success("Ticket enviado. Te responderemos en 24-48h.");
        setMessage("");
        setSubject(SUBJECTS[0]);
        onOpenChange(false);
      } else {
        toast.error("Error al enviar. Inténtalo de nuevo.");
      }
    } catch {
      toast.error("Error al enviar. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Contactar soporte</SheetTitle>
          <SheetDescription>
            Describe tu problema o sugerencia. Te responderemos en 24-48h.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asunto
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje{" "}
              <span className="text-gray-400 font-normal">(mín. 20 caracteres)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Describe en detalle tu consulta..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {message.length} caracteres
            </p>
          </div>

          <Button
            type="submit"
            disabled={sending}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white"
          >
            {sending ? "Enviando..." : "Enviar ticket"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
