import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface PreConsultation {
  id: string;
  patient_id: string;
  temperature?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  systolic_pressure?: number;
  diastolic_pressure?: number;
  oxygen_saturation?: number;
  blood_glucose?: number;
  weight?: number;
  height?: number;
  created_at: string;
}

export interface CreatePreConsultationData {
  patient_id: string;
  temperature?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  systolic_pressure?: number;
  diastolic_pressure?: number;
  oxygen_saturation?: number;
  blood_glucose?: number;
  weight?: number;
  height?: number;
}

export interface CreatePreConsultationResponse {
  success: boolean;
  message: string;
  data: PreConsultation;
}

// Get all pre-consultations
export function usePreConsultations() {
  return useQuery({
    queryKey: ["pre-consultations"],
    queryFn: async () => {
      const response = await api.get("/pre-consultations");
      return response.data.data as PreConsultation[];
    },
  });
}

// Get single pre-consultation
export function usePreConsultation(id: string) {
  return useQuery({
    queryKey: ["pre-consultations", id],
    queryFn: async () => {
      const response = await api.get(`/pre-consultations/${id}`);
      return response.data.data as PreConsultation;
    },
    enabled: !!id,
  });
}

// Create pre-consultation
export function useCreatePreConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePreConsultationData) => {
      const response = await api.post<CreatePreConsultationResponse>("/pre-consultations", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-consultations"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al crear pre-consulta");
    },
  });
}

// Update pre-consultation
export function useUpdatePreConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePreConsultationData> }) => {
      const response = await api.put(`/pre-consultations/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pre-consultations"] });
      queryClient.invalidateQueries({ queryKey: ["pre-consultations", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      queryClient.invalidateQueries({ queryKey: ["active-consultation"] });
      toast.success("Signos vitales actualizados exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar signos vitales");
    },
  });
}

// Delete pre-consultation
export function useDeletePreConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/pre-consultations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-consultations"] });
      toast.success("Pre-consulta eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar pre-consulta");
    },
  });
}
