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

export function usePreConsultations() {
  return useQuery({
    queryKey: ["pre-consultations"],
    queryFn: async () => {
      const response = await api.get("/pre-consultations");
      return response.data.data as PreConsultation[];
    },
  });
}

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

export interface RegisterAndQueueData {
  patient_id: string;
  doctor_id: string;
  record_type: "consultation" | "study";
  temperature?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  systolic_pressure?: number;
  diastolic_pressure?: number;
  oxygen_saturation?: number;
  blood_glucose?: number;
  weight?: number;
  height?: number;
  current_medications?: string;
  priority?: "Normal" | "Urgente";
}

export interface RegisterAndQueueResponse {
  success: boolean;
  message: string;
  data: {
    pre_consultation: PreConsultation;
    waiting_room_entry: {
      id: string;
      patient: {
        id: string;
        first_name: string;
        last_name: string;
      };
      status: string;
      priority: string;
      position: number;
      arrived_at: string;
    };
    estimated_wait_minutes: number;
  };
}

function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    patient_id: "Paciente",
    doctor_id: "Doctor",
    temperature: "Temperatura",
    heart_rate: "Frecuencia cardíaca",
    respiratory_rate: "Frecuencia respiratoria",
    systolic_pressure: "Presión sistólica",
    diastolic_pressure: "Presión diastólica",
    oxygen_saturation: "Saturación de oxígeno",
    blood_glucose: "Glucosa en sangre",
    weight: "Peso",
    height: "Altura",
    current_medications: "Medicamentos actuales",
    priority: "Prioridad",
  };
  return fieldNames[field] || field;
}

export function useRegisterAndQueuePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterAndQueueData) => {
      const response = await api.post<RegisterAndQueueResponse>(
        "/pre-consultations/register-and-queue",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-consultations"] });
      queryClient.invalidateQueries({ queryKey: ["waiting-room"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Paciente registrado y agregado a la sala de espera exitosamente");
    },
    onError: (error: any) => {
      const backendErrors = error.response?.data?.errors;

      if (backendErrors && typeof backendErrors === 'object') {
        Object.entries(backendErrors).forEach(([field, messages]) => {
          const fieldName = getFieldDisplayName(field);
          const msgArray = Array.isArray(messages) ? messages : [messages];
          msgArray.forEach((msg: string) => {
            toast.error(`${fieldName}: ${msg}`);
          });
        });
      } else {
        toast.error(error.response?.data?.message || "Error al registrar paciente");
      }
    },
  });
}
