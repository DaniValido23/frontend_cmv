import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Consultation, VitalSigns } from "@/types/models";
import { toast } from "sonner";

// Get all consultations
export function useConsultations() {
  return useQuery({
    queryKey: ["consultations"],
    queryFn: async () => {
      const response = await api.get("/consultations");
      return response.data.data as Consultation[];
    },
  });
}

// Get single consultation
export function useConsultation(id: string) {
  return useQuery({
    queryKey: ["consultations", id],
    queryFn: async () => {
      const response = await api.get(`/consultations/${id}`);
      return response.data.data as Consultation;
    },
    enabled: !!id,
  });
}

// Get consultations by patient
export function usePatientConsultations(patientId: string) {
  return useQuery({
    queryKey: ["consultations", "patient", patientId],
    queryFn: async () => {
      const response = await api.get("/consultations", {
        params: { patient_id: patientId },
      });
      return response.data.data.consultations as Consultation[];
    },
    enabled: !!patientId,
  });
}

// Get consultations by date range
export function useConsultationsByDate(from: string, to: string) {
  return useQuery({
    queryKey: ["consultations", "date", from, to],
    queryFn: async () => {
      const response = await api.get("/consultations", {
        params: { from, to },
      });
      return response.data.data as Consultation[];
    },
    enabled: !!from && !!to,
  });
}

// Create consultation
export interface CreateConsultationData {
  patient_id: string;
  pre_consultation_id?: string;
  symptoms: string[];
  diagnoses: string[];
  prescribed_medications: string[];
  recommendations?: string;
  pocus_notes?: string;
  price: number;
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateConsultationData) => {
      const response = await api.post("/consultations", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      queryClient.invalidateQueries({ queryKey: ["active-consultation"] });
      // No mostramos toast aquí, el formulario maneja el flujo completo
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Error al guardar consulta";
      toast.error(errorMessage);
    },
  });
}

// Update consultation
export function useUpdateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Consultation> }) => {
      const response = await api.put(`/consultations/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["consultations", variables.id] });
      toast.success("Consulta actualizada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar consulta");
    },
  });
}

// Complete consultation
export function useCompleteConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { diagnosis: string; treatment: string; notes?: string; cost: number } }) => {
      const response = await api.put(`/consultations/${id}/complete`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["consultations", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      toast.success("Consulta completada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al completar consulta");
    },
  });
}

// Add vital signs
export function useAddVitalSigns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ consultationId, data }: { consultationId: string; data: Partial<VitalSigns> }) => {
      const response = await api.post(`/consultations/${consultationId}/vitals`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consultations", variables.consultationId] });
      toast.success("Signos vitales registrados exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al registrar signos vitales");
    },
  });
}

// Add attachment
export function useAddAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ consultationId, file, description }: { consultationId: string; file: File; description?: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (description) {
        formData.append("description", description);
      }

      const response = await api.post(`/consultations/${consultationId}/attachments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consultations", variables.consultationId] });
      toast.success("Archivo adjuntado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al adjuntar archivo");
    },
  });
}

// Delete consultation
export function useDeleteConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/consultations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast.success("Consulta eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar consulta");
    },
  });
}

// Generate prescription
export interface GeneratePrescriptionData {
  consultation_id: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

export interface GeneratePrescriptionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    consultation_id: string;
    download_url: string;
    file_name: string;
    file_size: number;
    file_size_format: string;
    generated_at: string;
    generated_by: string;
  };
  timestamp: string;
}

export function useGeneratePrescription() {
  return useMutation({
    mutationFn: async (data: GeneratePrescriptionData) => {
      const response = await api.post<GeneratePrescriptionResponse>("/prescriptions/generate", data);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al generar receta");
    },
  });
}

// Upload attachment
export interface UploadAttachmentData {
  consultation_id: string;
  file: File;
}

export function useUploadAttachment() {
  return useMutation({
    mutationFn: async ({ consultation_id, file }: UploadAttachmentData) => {
      const formData = new FormData();
      formData.append("consultation_id", consultation_id);
      formData.append("file", file);

      const response = await api.post("/attachments/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
  });
}

// Get consultation attachments
export interface ConsultationAttachment {
  id: string;
  consultation_id: string;
  attachment_type: "prescription" | "general";
  file_name: string;
  file_size: number;
  file_size_format: string;
  mime_type: string;
  uploaded_at: string;
  download_url: string;
}

export interface ConsultationAttachmentsResponse {
  success: boolean;
  message: string;
  data: {
    attachments: ConsultationAttachment[];
    total_count: number;
  };
  timestamp: string;
}

export function useConsultationAttachments(consultationId: string) {
  return useQuery({
    queryKey: ["consultation-attachments", consultationId],
    queryFn: async () => {
      const response = await api.get<ConsultationAttachmentsResponse>(`/consultations/${consultationId}/attachments`);
      return response.data.data;
    },
    enabled: !!consultationId,
  });
}
