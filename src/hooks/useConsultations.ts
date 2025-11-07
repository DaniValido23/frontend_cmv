import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Consultation, VitalSigns, ConsultationsResponse } from "@/types/models";
import { handleError } from "@/lib/errorHandler";

export function useConsultations() {
  return useQuery({
    queryKey: ["consultations"],
    queryFn: async () => {
      const response = await api.get("/consultations");
      return response.data.data as Consultation[];
    },
  });
}

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

export function usePatientConsultations(
  patientId: string,
  page: number = 1,
  pageSize: number = 10,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["consultations", "patient", patientId, page, pageSize],
    queryFn: async () => {
      const response = await api.get("/consultations", {
        params: {
          patient_id: patientId,
          page,
          page_size: pageSize,
        },
      });
      return response.data.data as ConsultationsResponse;
    },
    enabled: !!patientId && enabled,
  });
}

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

export interface CreateConsultationData {
  patient_id: string;
  pre_consultation_id?: string;
  consultation_type: "consultation" | "study";
  symptoms: string[];
  diagnoses: string[];
  medications: Array<{
    name: string;
    dosage: string;
    route: string;
    frequency: string;
    duration: string;
  }>;
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
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Error al guardar consulta");
    },
  });
}

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
    onError: (error: unknown) => {
      handleError(error, "Error al actualizar consulta");
    },
  });
}

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
    onError: (error: unknown) => {
      handleError(error, "Error al completar consulta");
    },
  });
}

export function useAddVitalSigns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ consultationId, data }: { consultationId: string; data: Partial<VitalSigns> }) => {
      const response = await api.post(`/consultations/${consultationId}/vitals`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consultations", variables.consultationId] });
    },
    onError: (error: unknown) => {
      handleError(error, "Error al registrar signos vitales");
    },
  });
}

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
    },
    onError: (error: unknown) => {
      handleError(error, "Error al adjuntar archivo");
    },
  });
}

export function useDeleteConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/consultations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Error al eliminar consulta");
    },
  });
}

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
    onError: (error: unknown) => {
      handleError(error, "Error al generar receta");
    },
  });
}

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

export interface CreateCompleteConsultationData {
  patient_id: string;
  pre_consultation_id?: string;
  symptoms: string[];
  diagnoses: string[];
  medications?: Array<{
    name: string;
    dosage: string;
    route: string;
    frequency: string;
    duration: string;
  }>;
  recommendations?: string;
  pocus_notes?: string;
  price: number;
  attachments?: File[];
}

export interface CreateCompleteConsultationResponse {
  success: boolean;
  message: string;
  data: {
    consultation_id: string;
    prescription_download_url?: string;
  };
}

export function useCreateCompleteConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompleteConsultationData) => {
      const formData = new FormData();

      const consultationData = {
        patient_id: data.patient_id,
        pre_consultation_id: data.pre_consultation_id,
        symptoms: data.symptoms,
        diagnoses: data.diagnoses,
        medications: data.medications,
        recommendations: data.recommendations,
        pocus_notes: data.pocus_notes,
        price: data.price,
      };

      formData.append("data", JSON.stringify(consultationData));

      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const response = await api.post<CreateCompleteConsultationResponse>(
        "/consultations",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      queryClient.invalidateQueries({ queryKey: ["active-consultation"] });
      queryClient.invalidateQueries({ queryKey: ["pre-consultations"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Error al crear consulta");
    },
  });
}
