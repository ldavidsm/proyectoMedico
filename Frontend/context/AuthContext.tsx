"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { authService } from "@/lib/auth-sevice";

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
  profile_completed: boolean; 
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
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (err) {
      localStorage.removeItem("token");
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
      const updatedUser = await authService.updateProfessionalProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error("Error al completar perfil:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
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