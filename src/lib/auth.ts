import type { User } from "@/types/auth";

export function getAuthFromStorage(): { token: string; user: User } | null {
  if (typeof window === "undefined") return null;

  const token = sessionStorage.getItem("token");
  const userStr = sessionStorage.getItem("user");

  if (!token || !userStr) return null;

  try {
    const user = JSON.parse(userStr);
    return { token, user };
  } catch {
    return null;
  }
}

export function isDoctor(user: User | null): boolean {
  return user?.role === "doctor";
}

export function isAssistant(user: User | null): boolean {
  return user?.role === "assistant";
}

export function isChemist(user: User | null): boolean {
  return user?.role === "chemist";
}

export function canAccessRoute(user: User | null, route: string): boolean {
  if (!user) return false;

  // Rutas exclusivas para doctor
  const doctorOnlyRoutes = ["/users", "/analytics", "/consultation"];
  const isDoctorRoute = doctorOnlyRoutes.some((r) => route.startsWith(r));

  if (isDoctorRoute) {
    return isDoctor(user);
  }

  // Rutas accesibles para doctor y chemist (pacientes y consultas de pacientes)
  if (route.startsWith("/patients") || route.includes("/consultations")) {
    return isDoctor(user) || isChemist(user);
  }

  // Rutas accesibles para doctor y assistant (sala de espera, pre-consultas)
  const assistantRoutes = ["/waiting-room", "/pre-consultation"];
  const isAssistantRoute = assistantRoutes.some((r) => route.startsWith(r));

  if (isAssistantRoute) {
    return isDoctor(user) || isAssistant(user);
  }

  return true;
}
