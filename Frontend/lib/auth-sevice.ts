const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function startGoogleOAuth() {
  const currentPath = window.location.pathname + window.location.search;
  if (currentPath !== '/' && currentPath !== '/login' && currentPath !== '/signup') {
    sessionStorage.setItem('redirectAfterLogin', currentPath);
  }
  window.location.href = `${API_URL}/auth/google`;
}

export const getGoogleOAuthUrl = () => `${API_URL}/auth/google`;

export const authService = {
  // Conexión con @router.post("/login")
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error al iniciar sesión");
    }

    const data = await response.json();
    return data;
  },

  async register(email: string, password: string, fullName: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error en el registro");
    }

    return await response.json();
  },

  async getMe() {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Sesión expirada");
    }

    return await response.json();
  },

  async requestPasswordReset(email: string) {
    const response = await fetch(`${API_URL}/auth/request-password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error al solicitar el código");
    }
    return await response.json();
  },

  async verifyOtp(email: string, code: string) {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, code }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Código incorrecto");
    }
    return await response.json();
  },

  async resetPasswordFinal(email: string, code: string, new_password: string) {
    const response = await fetch(`${API_URL}/auth/reset-password-final`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email, code: code, new_password: new_password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "No se pudo actualizar la contraseña");
    }
    return await response.json();
  },

  async getMeP() {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Sesión expirada");
    }

    // EL BACKEND DEBE DEVOLVER: { id, email, profile_completed: boolean, profile: {...} }
    return await response.json();
  },

  /**
   * NUEVO: Enviar los datos del formulario de perfil profesional al backend
   * Este método es el que hará que el ContentBlocker desaparezca.
   */
  async resendVerification(email: string) {
    const response = await fetch(`${API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  },

  async updateProfessionalProfile(profileData: any) {
    const response = await fetch(`${API_URL}/auth/complete-profile`, {
      method: "POST", // O PUT, según prefieras en tu FastAPI
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error al actualizar el perfil");
    }

    // Retorna el usuario actualizado con profile_completed: true
    return await response.json();
  }

};