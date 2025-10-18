import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import StatCard from "./StatCard";
import { format } from "date-fns";
import { Users, Clock, Calendar, CheckCircle } from "lucide-react";

export default function DashboardStats() {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats", today],
    queryFn: async () => {
      const response = await api.get("/analytics/dashboard", {
        params: {
          from: today,
          to: today,
        },
      });
      return response.data.data;
    },
    retry: 1,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Pacientes Hoy"
        value={data?.unique_patients || 0}
        icon={Users}
        loading={isLoading}
      />

      <StatCard
        title="En Sala de Espera"
        value={data?.waiting_patients || 0}
        icon={Clock}
        loading={isLoading}
      />

      <StatCard
        title="Consultas Hoy"
        value={data?.total_consultations || 0}
        icon={Calendar}
        loading={isLoading}
      />

      <StatCard
        title="Consultas Completadas"
        value={data?.completed_consultations || 0}
        icon={CheckCircle}
        loading={isLoading}
      />
    </div>
  );
}
