"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useGoogleAuthStatus() {
  const [status, setStatus] = useState<{
    connected: boolean;
    google_email: string | null;
    isLoading: boolean;
  }>({ connected: false, google_email: null, isLoading: true });

  useEffect(() => {
    fetch(`${API_URL}/webinars/auth/status`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { connected: false, google_email: null }))
      .then((data) => setStatus({ ...data, isLoading: false }))
      .catch(() =>
        setStatus({ connected: false, google_email: null, isLoading: false })
      );
  }, []);

  const connect = async () => {
    const res = await fetch(`${API_URL}/webinars/auth/google`, {
      credentials: "include",
    });
    const data = await res.json();
    window.location.href = data.auth_url;
  };

  const disconnect = async () => {
    await fetch(`${API_URL}/webinars/auth/disconnect`, {
      method: "DELETE",
      credentials: "include",
    });
    setStatus({ connected: false, google_email: null, isLoading: false });
  };

  return { ...status, connect, disconnect };
}
