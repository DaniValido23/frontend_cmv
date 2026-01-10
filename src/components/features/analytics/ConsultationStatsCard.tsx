import { useTotalStats } from "@/hooks/useAnalytics";
import StatCard from "@/components/features/dashboard/StatCard";
import { Calendar } from "lucide-react";

export default function ConsultationStatsCard() {
  const { data, isLoading } = useTotalStats();

  return (
    <StatCard
      title="Consultas Totales"
      value={data?.total_consultations || 0}
      icon={Calendar}
      loading={isLoading}
    />
  );
}
