import { create } from "zustand";
import type { User } from "@/types/auth";
import { api } from "@/lib/api";
import { navigateTo } from "@/hooks/useNavigate";
import { queryClient } from "@/lib/queryClient";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => Promise<void>;
  initAuth: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
}

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
    queryClient.clear();

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error al cerrar sesión en el backend:", error);
      }
    } finally {
      queryClient.clear();

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      set({ token: null, user: null, isAuthenticated: false });
      navigateTo("/login");
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

  updateUser: (updatedFields: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;

      const updatedUser = { ...state.user, ...updatedFields };

      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      return { user: updatedUser };
    });
  },
}));
