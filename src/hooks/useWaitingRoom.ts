import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { WaitingRoomEntry, ActiveConsultationEntry } from "@/types/models";
import { handleError } from "@/lib/errorHandler";
import { QUERY_STALE_TIME } from "@/lib/queryClient";

export function useWaitingRoom(doctorId?: string, status: string = "En espera") {
  return useQuery({
    queryKey: ["waiting-room", doctorId, status],
    queryFn: async () => {
      let url = `/waiting-room?status=${status}`;
      if (doctorId) {
        url += `&doctor_id=${doctorId}`;
      }
      const response = await api.get(url);
      const queue = response.data.data?.queue || [];
      return queue as WaitingRoomEntry[];
    },
    staleTime: QUERY_STALE_TIME.REALTIME, // 30 seconds - data changes frequently
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
    refetchOnWindowFocus: true, // Refetch when returning to window for fresh data
  });
}

// Add patient to waiting room
export function useAddToWaitingRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { patient_id: string; pre_consultation_id: string; priority: string }) => {
      const response = await api.post("/waiting-room", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Error al agregar a sala de espera");
    },
  });
}

export function useCallPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/waiting-room/${id}/call`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Error al llamar paciente");
    },
  });
}

export function useCompleteWaitingRoomEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/waiting-room/${id}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Error al completar entrada");
    },
  });
}

export function useRemoveFromWaitingRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/waiting-room/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Error al remover de sala de espera");
    },
  });
}

export function useChangeWaitingRoomStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/waiting-room/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      queryClient.invalidateQueries({ queryKey: ["active-consultation"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Error al cambiar status del paciente");
    },
  });
}

export function useActiveConsultation() {
  return useQuery<ActiveConsultationEntry | null>({
    queryKey: ["active-consultation"],
    queryFn: async () => {
      const response = await api.get("/waiting-room/active");

      return (response.data.data as ActiveConsultationEntry) || null;
    },
    staleTime: QUERY_STALE_TIME.REALTIME, // 30 seconds - changes frequently
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true, // Refetch when returning for latest consultation state
  });
}

export function useInProgressConsultations() {
  return useQuery<ActiveConsultationEntry[]>({
    queryKey: ["in-progress-consultations"],
    queryFn: async () => {
      const response = await api.get("/waiting-room/in-consultation");

      return (response.data.data as ActiveConsultationEntry[]) || [];
    },
    staleTime: QUERY_STALE_TIME.REALTIME, // 30 seconds - changes frequently
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true, // Refetch when returning for latest consultation state
  });
}
