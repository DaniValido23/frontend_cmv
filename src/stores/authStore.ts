import { create } from "zustand";
import type { User } from "@/types/auth";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => Promise<void>;
  initAuth: () => void;
}

// Inicializar el estado desde sessionStorage antes de crear el store
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false };
  }

  const token = sessionStorage.getItem("token");
  const userStr = sessionStorage.getItem("user");

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { token, user, isAuthenticated: true };
    } catch {
      sessionStorage.clear();
      return { user: null, token: null, isAuthenticated: false };
    }
  }

  return { user: null, token: null, isAuthenticated: false };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  setAuth: (token, user) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      // Llamar al endpoint de logout para expirar el token en el backend
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error al cerrar sesión en el backend:", error);
    } finally {
      // Limpiar estado local sin importar si la llamada al backend falló
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      set({ token: null, user: null, isAuthenticated: false });
      window.location.href = "/login";
    }
  },

  initAuth: () => {
    const token = sessionStorage.getItem("token");
    const userStr = sessionStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true });
      } catch {
        sessionStorage.clear();
      }
    }
  },
}));
