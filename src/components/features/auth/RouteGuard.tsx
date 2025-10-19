import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { canAccessRoute } from "@/lib/auth";
import { navigateTo } from "@/hooks/useNavigate";

interface RouteGuardProps {
  requiredRole?: "doctor" | "assistant";
  children: React.ReactNode;
}

export default function RouteGuard({ requiredRole, children }: RouteGuardProps) {
  const { user, isAuthenticated, initAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicializar autenticación primero
    initAuth();

    // Dar tiempo para que el estado de Zustand se actualice
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  useEffect(() => {
    // Solo verificar después de que termine de cargar
    if (isLoading) return;

    // Check authentication
    if (!isAuthenticated) {
      navigateTo("/login");
      return;
    }

    // Check role if required
    if (requiredRole && user?.role !== requiredRole) {
      navigateTo("/waiting-room");
      return;
    }

    // Check route access
    const currentPath = window.location.pathname;
    if (!canAccessRoute(user, currentPath)) {
      navigateTo("/waiting-room");
    }
  }, [isLoading, isAuthenticated, user, requiredRole]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shakespeare-500" />
      </div>
    );
  }

  return <>{children}</>;
}
