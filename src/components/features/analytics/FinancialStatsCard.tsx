import { useTotalStats } from "@/hooks/useAnalytics";
import StatCard from "@/components/features/dashboard/StatCard";
import { DollarSign } from "lucide-react";
import { formatMoney } from "@/utils/formatters";

export default function FinancialStatsCard() {
  const { data, isLoading } = useTotalStats();

  return (
    <StatCard
      title="Ingresos Totales"
      value={data ? `$${formatMoney(data.total_revenue)}` : "$0"}
      icon={DollarSign}
      loading={isLoading}
    />
  );
}
