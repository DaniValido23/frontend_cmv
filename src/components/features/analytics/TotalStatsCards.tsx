import { useTotalStats } from "@/hooks/useAnalytics";
import StatCard from "@/components/features/dashboard/StatCard";
import { Calendar, DollarSign } from "lucide-react";
import { formatMoney } from "@/utils/formatters";

export default function TotalStatsCards() {
  const { data, isLoading } = useTotalStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        title="Consultas Totales"
        value={data?.total_consultations || 0}
        icon={Calendar}
        loading={isLoading}
      />

      <StatCard
        title="Ingresos Totales"
        value={data ? `$${formatMoney(data.total_revenue)}` : "$0"}
        icon={DollarSign}
        loading={isLoading}
      />
    </div>
  );
}
