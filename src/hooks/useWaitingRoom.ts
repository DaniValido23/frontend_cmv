import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { WaitingRoomEntry } from "@/types/models";
import { toast } from "sonner";

// Get waiting room queue
export function useWaitingRoom() {
  return useQuery({
    queryKey: ["waiting-room"],
    queryFn: async () => {
      const response = await api.get("/waiting-room");
      // La respuesta tiene estructura: {data: {queue: [], total_count: number}}
      const queue = response.data.data?.queue || [];
      return queue as WaitingRoomEntry[];
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
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
      // No mostramos toast aquí porque el formulario redirige inmediatamente
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al agregar a sala de espera");
    },
  });
}

// Call patient (change status to 'in_consultation')
export function useCallPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/waiting-room/${id}/call`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      toast.success("Paciente llamado a consulta");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al llamar paciente");
    },
  });
}

// Complete waiting room entry (remove from queue)
export function useCompleteWaitingRoomEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/waiting-room/${id}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      toast.success("Entrada de sala de espera completada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al completar entrada");
    },
  });
}

// Remove from waiting room
export function useRemoveFromWaitingRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/waiting-room/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      toast.success("Paciente removido de la sala de espera");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al remover de sala de espera");
    },
  });
}

// Change patient status in waiting room
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
      // No mostramos toast aquí porque las acciones que usan este hook redirigen inmediatamente
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al cambiar status del paciente");
    },
  });
}

// Get active consultation
export function useActiveConsultation() {
  return useQuery({
    queryKey: ["active-consultation"],
    queryFn: async () => {
      const response = await api.get("/waiting-room/active");
      const queue = response.data.data?.queue || [];
      return queue.length > 0 ? queue[0] : null;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}
