import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import type { User } from "@/types/user";
import type { Session } from "@/types/session";
import { toast } from "sonner";

/**
 * Hook para obtener lista de todos los doctores
 */
export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const response = await usersApi.getDoctors();
      return response.data.users as User[];
    },
  });
}

/**
 * Hook para obtener lista de usuarios con filtros opcionales
 */
export function useUsers(page: number = 1, pageSize: number = 10, role?: string) {
  return useQuery({
    queryKey: ["users", page, pageSize, role],
    queryFn: async () => {
      const response = await usersApi.getUsers(page, pageSize, role);
      return response.data;
    },
  });
}

/**
 * Hook para obtener lista de sesiones activas
 */
export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await usersApi.getSessions();
      return response.data as Session[];
    },
  });
}

/**
 * Hook para revocar una sesión
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await usersApi.revokeSession(sessionId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Sesión revocada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al revocar sesión");
    },
  });
}
