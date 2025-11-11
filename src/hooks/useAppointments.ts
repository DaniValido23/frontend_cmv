import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type {
  Appointment,
  AppointmentWithDetails,
  AppointmentListResponse,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  CancelAppointmentRequest,
  AppointmentFilterParams,
} from "@/types/appointment";
import { handleError } from "@/lib/errorHandler";

/**
 * Get all appointments with filters and pagination
 */
export function useAppointments(
  filters?: AppointmentFilterParams,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: ["appointments", filters, page, pageSize],
    queryFn: async () => {
      const response = await api.get("/appointments", {
        params: {
          ...filters,
          page,
          page_size: pageSize,
        },
      });
      return response.data.data as AppointmentListResponse;
    },
  });
}

/**
 * Get a single appointment by ID
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: ["appointments", id],
    queryFn: async () => {
      const response = await api.get(`/appointments/${id}`);
      return response.data.data as AppointmentWithDetails;
    },
    enabled: !!id,
  });
}

/**
 * Get appointments for a specific patient
 */
export function usePatientAppointments(patientId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["appointments", "patient", patientId],
    queryFn: async () => {
      const response = await api.get(`/patients/${patientId}/appointments`);
      return response.data.data as AppointmentWithDetails[];
    },
    enabled: !!patientId && enabled,
  });
}

/**
 * Get upcoming appointments for a specific doctor
 */
export function useDoctorAppointments(doctorId: string, limit: number = 10) {
  return useQuery({
    queryKey: ["appointments", "doctor", doctorId, limit],
    queryFn: async () => {
      const response = await api.get(`/doctors/${doctorId}/appointments`, {
        params: { limit },
      });
      return response.data.data as AppointmentWithDetails[];
    },
    enabled: !!doctorId,
  });
}

/**
 * Get appointments within a date range (for calendar view)
 */
export function useAppointmentsByDateRange(
  fromDate: string,
  toDate: string,
  doctorId?: string
) {
  return useQuery({
    queryKey: ["appointments", "range", fromDate, toDate, doctorId],
    queryFn: async () => {
      const params: any = {
        from_date: fromDate,
        to_date: toDate,
      };

      if (doctorId) {
        params.doctor_id = doctorId;
      }

      console.log('📅 Fetching appointments with params:', params);

      const response = await api.get("/appointments", {
        params,
      });

      console.log('📅 Backend response:', response.data);

      return response.data.data as AppointmentListResponse;
    },
    enabled: !!fromDate && !!toDate,
    retry: 1, // Only retry once
    throwOnError: false, // Don't throw errors globally
  });
}

/**
 * Create a new appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAppointmentRequest) => {
      const response = await api.post("/appointments", data);
      return response.data.data as AppointmentWithDetails;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Cita creada exitosamente");
    },
    onError: (error) => {
      handleError(error, "Error al crear la cita");
    },
  });
}

/**
 * Update an existing appointment
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAppointmentRequest }) => {
      const response = await api.put(`/appointments/${id}`, data);
      return response.data.data as AppointmentWithDetails;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", variables.id] });
      toast.success("Cita actualizada exitosamente");
    },
    onError: (error) => {
      handleError(error, "Error al actualizar la cita");
    },
  });
}

/**
 * Cancel an appointment
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(`/appointments/${id}/cancel`, { reason });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", variables.id] });
      toast.success("Cita cancelada exitosamente");
    },
    onError: (error) => {
      handleError(error, "Error al cancelar la cita");
    },
  });
}
