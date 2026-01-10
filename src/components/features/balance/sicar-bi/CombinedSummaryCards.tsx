import { Wallet, TrendingUp, TrendingDown, TicketIcon, Stethoscope, FileSearch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import type { BalanceDashboard } from "@/types/balance";

interface CombinedSummaryCardsProps {
  dashboard?: BalanceDashboard;
  isLoading: boolean;
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function CombinedSummaryCards({ dashboard, isLoading }: CombinedSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[120px] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!dashboard) return null;

  const { kpis, income_breakdown, sicar_details } = dashboard;

  const cards = [
    {
      label: "Ingresos Totales",
      value: kpis.total_income,
      breakdown: [
        { label: "SICAR", value: income_breakdown.sicar.amount },
        { label: "Consultas", value: income_breakdown.consultations.amount },
        { label: "Estudios", value: income_breakdown.studies.amount },
      ].filter((item) => item.value > 0),
      icon: Wallet,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      accentColor: "border-l-green-500",
      change: kpis.vs_previous_month?.income_change,
    },
    {
      label: "Tickets SICAR",
      value: sicar_details?.ticket_count ?? 0,
      isCount: true,
      breakdown: sicar_details?.average_ticket ? [
        { label: "Ticket Promedio", value: sicar_details.average_ticket },
      ] : [],
      icon: TicketIcon,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      accentColor: "border-l-blue-500",
    },
    {
      label: "Consultas Totales",
      value: income_breakdown.consultations.count ?? 0,
      isCount: true,
      breakdown: income_breakdown.consultations.amount > 0 ? [
        { label: "Ingresos", value: income_breakdown.consultations.amount },
      ] : [],
      icon: Stethoscope,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      accentColor: "border-l-purple-500",
    },
    {
      label: "Estudios Totales",
      value: income_breakdown.studies.count ?? 0,
      isCount: true,
      breakdown: income_breakdown.studies.amount > 0 ? [
        { label: "Ingresos", value: income_breakdown.studies.amount },
      ] : [],
      icon: FileSearch,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      accentColor: "border-l-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const hasChange = card.change !== undefined && card.change !== 0;
        const changeIsPositive = card.invertChange
          ? (card.change ?? 0) < 0
          : (card.change ?? 0) > 0;

        return (
          <Card key={card.label} className={`border-l-4 ${card.accentColor}`}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground font-medium truncate">
                    {card.label}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold tracking-tight">
                      {card.isCount
                        ? card.value.toLocaleString("es-MX")
                        : formatCurrency(card.value)}
                    </p>
                  </div>
                  {hasChange && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${
                      changeIsPositive ? "text-green-600" : "text-red-600"
                    }`}>
                      {changeIsPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(card.change ?? 0).toFixed(1)}% vs mes anterior
                    </p>
                  )}
                  {card.breakdown && card.breakdown.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {card.breakdown.map((item) => (
                        <div key={item.label} className="flex justify-between text-xs text-muted-foreground">
                          <span>{item.label}</span>
                          <span className="font-medium">
                            {"isCount" in item && item.isCount
                              ? item.value.toLocaleString("es-MX")
                              : formatCurrency(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={`p-2 rounded-xl ${card.iconBg} ml-2 flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
