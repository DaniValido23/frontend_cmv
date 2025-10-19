import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface DashboardStats {
  consultations_today: number;
  patients_in_waiting_room: number;
  revenue_today: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/analytics/dashboard");
      return response.data.data as DashboardStats;
    },
    refetchInterval: 60000, // Auto-refresh every 60 seconds
  });
}
