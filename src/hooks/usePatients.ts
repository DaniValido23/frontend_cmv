import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Patient } from "@/types/models";

interface PatientsResponse {
  patients: Patient[];
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export function usePatients(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ["patients", page, pageSize],
    queryFn: async () => {
      const response = await api.get("/patients", {
        params: { page, page_size: pageSize },
      });
      return response.data.data as PatientsResponse;
    },
  });
}

export function useAllPatients() {
  return useQuery({
    queryKey: ["patients", "all"],
    queryFn: async () => {
      const response = await api.get("/patients");
      // El backend retorna por defecto todos los pacientes con solo {id, full_name}
      return response.data.data.patients as Patient[];
    },
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: async () => {
      const response = await api.get(`/patients/${id}`);
      return response.data.data as Patient;
    },
    enabled: !!id,
  });
}

export function useSearchPatients(query: string) {
  return useQuery({
    queryKey: ["patients", "search", query],
    queryFn: async () => {
      const response = await api.get("/patients", {
        params: { search: query },
      });
      // Búsqueda del lado del servidor (si el backend la soporta)
      return response.data.data.patients as Patient[];
    },
    enabled: query.length > 0,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Patient>) => {
      console.log("=== CREATING PATIENT - REQUEST DATA ===");
      console.log("Data being sent to backend:", JSON.stringify(data, null, 2));

      try {
        const response = await api.post("/patients", data);
        console.log("=== CREATING PATIENT - RESPONSE SUCCESS ===");
        console.log("Response data:", JSON.stringify(response.data, null, 2));
        return response.data;
      } catch (error: any) {
        console.error("=== CREATING PATIENT - ERROR ===");
        console.error("Full error object:", error);
        console.error("Error response:", error.response);
        console.error("Error response data:", JSON.stringify(error.response?.data, null, 2));
        console.error("Error response status:", error.response?.status);
        console.error("Error response headers:", error.response?.headers);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Paciente creado exitosamente");
    },
    onError: (error: any) => {
      console.error("=== CREATING PATIENT - onError HANDLER ===");
      console.error("Error in onError:", error);
      console.error("Error message:", error.response?.data?.error?.message);
      toast.error(
        error.response?.data?.error?.message || "Error al crear paciente"
      );
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Patient>;
    }) => {
      const response = await api.put(`/patients/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patients", variables.id] });
      toast.success("Paciente actualizado exitosamente"); 
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Error al actualizar paciente"
      );
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Paciente eliminado exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Error al eliminar paciente"
      );
    },
  });
}
