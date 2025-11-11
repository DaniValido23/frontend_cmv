import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type {
  GoogleCalendarStatus,
  GoogleCalendarConnectResponse,
  GoogleCalendarDisconnectRequest,
} from "@/types/calendar";
import { handleError } from "@/lib/errorHandler";

/**
 * Get Google Calendar integration status for the current doctor
 */
export function useGoogleCalendarStatus() {
  return useQuery({
    queryKey: ["google-calendar", "status"],
    queryFn: async () => {
      const response = await api.get("/calendar/status");
      return response.data.data as GoogleCalendarStatus;
    },
    // Refetch every 5 minutes to check for sync errors
    refetchInterval: 5 * 60 * 1000,
  });
}

/**
 * Initiate Google Calendar OAuth connection
 * This returns the authorization URL to redirect the user to
 */
export function useConnectGoogleCalendar() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get("/calendar/connect");
      return response.data.data as GoogleCalendarConnectResponse;
    },
    onSuccess: (data) => {
      // Redirect user to Google's authorization page
      window.location.href = data.authorization_url;
    },
    onError: (error) => {
      handleError(error, "Error al conectar con Google Calendar");
    },
  });
}

/**
 * Disconnect Google Calendar integration
 */
export function useDisconnectGoogleCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request?: GoogleCalendarDisconnectRequest) => {
      const response = await api.post("/calendar/disconnect", request || {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-calendar"] });
      toast.success("Google Calendar desconectado exitosamente");
    },
    onError: (error) => {
      handleError(error, "Error al desconectar Google Calendar");
    },
  });
}

/**
 * Check if Google Calendar connection was successful
 * Call this after OAuth callback redirect
 */
export function useCheckGoogleCalendarConnection() {
  const queryClient = useQueryClient();

  return () => {
    // Check URL parameters for success/error
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");

    if (success === "true" || success === "google_calendar_connected") {
      toast.success("Google Calendar conectado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["google-calendar"] });

      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (error) {
      let errorMessage = "Error al conectar Google Calendar";

      switch (error) {
        case "missing_parameters":
          errorMessage = "Parámetros faltantes en la respuesta de Google";
          break;
        case "invalid_state":
          errorMessage = "Estado de autenticación inválido";
          break;
        case "exchange_failed":
          errorMessage = "Error al intercambiar el código de autorización";
          break;
        case "save_failed":
          errorMessage = "Error al guardar la integración";
          break;
      }

      toast.error(errorMessage);

      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  };
}
