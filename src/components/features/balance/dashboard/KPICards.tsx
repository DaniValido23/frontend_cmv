import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Wallet,
  Receipt,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface KPICardsProps {
  kpis: {
    total_income: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
    vs_previous_month?: {
      income_change: number;
      expenses_change: number;
      profit_change: number;
    };
  };
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export default function KPICards({ kpis }: KPICardsProps) {
  if (!kpis) return null;

  const vsMonth = kpis.vs_previous_month ?? { income_change: 0, expenses_change: 0, profit_change: 0 };

  const cards = [
    {
      label: "Ingresos Totales",
      value: kpis.total_income ?? 0,
      change: vsMonth.income_change ?? 0,
      format: "currency" as const,
      positiveIsGood: true,
      icon: Wallet,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      accentColor: "border-l-green-500",
    },
    {
      label: "Gastos Totales",
      value: kpis.total_expenses ?? 0,
      change: vsMonth.expenses_change ?? 0,
      format: "currency" as const,
      positiveIsGood: false,
      icon: Receipt,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      accentColor: "border-l-red-500",
    },
    {
      label: "Utilidad Neta",
      value: kpis.net_profit ?? 0,
      change: vsMonth.profit_change ?? 0,
      format: "currency" as const,
      positiveIsGood: true,
      icon: DollarSign,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      accentColor: "border-l-blue-500",
    },
    {
      label: "Margen de Ganancia",
      value: kpis.profit_margin ?? 0,
      change: 0,
      format: "percentage" as const,
      positiveIsGood: true,
      icon: Percent,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      accentColor: "border-l-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const isPositive = card.change > 0;
        const isGood = card.positiveIsGood ? isPositive : !isPositive;
        const Icon = card.icon;

        return (
          <Card key={card.label} className={`border-l-4 ${card.accentColor}`}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold mt-2 tracking-tight">
                    {card.format === "currency"
                      ? formatCurrency(card.value)
                      : formatPercentage(card.value)}
                  </p>
                  {card.change !== 0 && (
                    <div
                      className={`flex items-center text-xs mt-2 font-medium ${
                        isGood
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 mr-1" />
                      )}
                      {Math.abs(card.change).toFixed(1)}% vs anterior
                    </div>
                  )}
                </div>
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
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
