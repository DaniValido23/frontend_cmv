import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface DashboardStats {
  consultations_today: number;
  patients_in_waiting_room: number;
  revenue_today: number;
}

export function useDashboardStats(doctorId?: string) {
  return useQuery({
    queryKey: ["dashboard-stats", doctorId],
    queryFn: async () => {
      let url = "/analytics/dashboard";
      if (doctorId) {
        url += `?doctor_id=${doctorId}`;
      }
      const response = await api.get(url);
      return response.data.data as DashboardStats;
    },
    refetchInterval: 120000, // Auto-refresh every 2 minutes
  });
}
