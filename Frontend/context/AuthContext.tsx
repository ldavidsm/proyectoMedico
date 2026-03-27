"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { authService } from "@/lib/auth-service";
import { profileService } from "@/lib/profile-service";

export type UserRole = 'medico' | 'enfermeria' | 'fisioterapia' | 'psicologia' | 'farmacia' | 'biologia' | 'nutricion' | 'odontologia' | 'otro';
export type FormationLevel = 'grado' | 'especialista' | 'master' | 'doctorado';
export type ProfessionalStatus = 'ejerciendo' | 'residente' | 'investigador' | 'docente' | 'no_ejerciendo';

export interface ProfessionalProfile {
  country: string;
  role: UserRole;
  roleOther?: string; 
  formationLevel: FormationLevel;
  specialty: string[];
  professionalStatus: ProfessionalStatus;
  collegiated: boolean;
  collegiateNumber?: string;
  acceptTerms?: boolean;
  acceptResponsibleUse?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "seller" | "admin";
  totp_enabled?: boolean;
  profile_completed: boolean;
  profile_image?: string | null;
  profile?: ProfessionalProfile;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfileCompleted: boolean;
  refreshUser: () => Promise<void>;
  completeProfile: (data: ProfessionalProfile) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Esta función es vital para que la UI reaccione
  const refreshUser = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      // Refresh token first to pick up role changes (e.g. after seller approval)
      await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST', credentials: 'include'
      });

      const userData = await authService.getMe();
      setUser({
        ...userData,
        name: userData.full_name || userData.name || '',
        profile_image: userData.profile_image || null,
      });
    } catch (err: any) {
      if (err?.status === 401) {
        try {
          const refreshRes = await fetch(
            `${API_URL}/auth/refresh`,
            { method: 'POST', credentials: 'include' }
          );
          if (refreshRes.ok) {
            const userData = await authService.getMe();
            setUser({
              ...userData,
              name: userData.full_name || userData.name || '',
              profile_image: userData.profile_image || null,
            });
            return;
          }
        } catch {
          // Refresh falló, desloguear
        }
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  const login = async (email: string, pass: string) => {
    await authService.login(email, pass);
    await refreshUser(); 
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const completeProfile = async (data: ProfessionalProfile) => {
    try {
      const updatedUser = await profileService.updateProfessionalProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error("Error al completar perfil:", error);
      throw error;
    }
  };

const logout = () => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  }).finally(() => {
    setUser(null);
    window.location.href = '/';
  });
};

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    isProfileCompleted: !!user?.profile_completed,
    login,
    refreshUser,
    completeProfile,
    logout
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};