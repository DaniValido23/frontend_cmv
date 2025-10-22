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
    // Limpiar cache de React Query antes de establecer nueva sesión
    // Esto evita que datos del usuario anterior se muestren al nuevo usuario
    queryClient.clear();

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
      // Limpiar cache de React Query para evitar que datos del usuario anterior
      // se muestren al siguiente usuario que inicie sesión
      queryClient.clear();

      // Limpiar estado local sin importar si la llamada al backend falló
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      set({ token: null, user: null, isAuthenticated: false });
      // Usar navigateTo para mantener View Transitions
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

      // Actualizar sessionStorage para persistir los cambios
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      return { user: updatedUser };
    });
  },
}));
