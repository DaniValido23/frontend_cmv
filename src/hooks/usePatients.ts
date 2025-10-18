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
      return response.data.data as Patient[];
    },
    enabled: query.length > 0,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Patient>) => {
      const response = await api.post("/patients", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Paciente creado exitosamente");
    },
    onError: (error: any) => {
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
