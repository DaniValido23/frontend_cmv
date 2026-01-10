import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PieChart } from "lucide-react";
import type { MonthlyBalance } from "@/types/balance";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProfitAnalysisChartProps {
  monthlyBalance?: MonthlyBalance;
  isLoading?: boolean;
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

const COLORS = {
  sicar: "#3b82f6",      // Blue
  consultas: "#10b981",  // Green
  estudios: "#f59e0b",   // Amber
};

export default function ProfitAnalysisChart({
  monthlyBalance,
  isLoading,
}: ProfitAnalysisChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <div className="h-[280px] w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!monthlyBalance) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Distribución de Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay datos disponibles
        </CardContent>
      </Card>
    );
  }

  // Build income sources
  const sources = [
    {
      key: "sicar",
      label: "Sicar",
      value: monthlyBalance.sicar.gross_sales,
      color: COLORS.sicar,
    },
    {
      key: "consultas",
      label: "Consultas",
      value: monthlyBalance.cmv.consultations_income,
      color: COLORS.consultas,
    },
    {
      key: "estudios",
      label: "Estudios",
      value: monthlyBalance.cmv.studies_income,
      color: COLORS.estudios,
    },
  ].filter((s) => s.value > 0);

  const totalIncome = sources.reduce((sum, s) => sum + s.value, 0);

  if (sources.length === 0 || totalIncome === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Distribución de Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay ingresos en este periodo
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: sources.map((s) => s.label),
    datasets: [
      {
        data: sources.map((s) => s.value),
        backgroundColor: sources.map((s) => s.color),
        borderColor: sources.map((s) => s.color),
        borderWidth: 1,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = ((value / totalIncome) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Distribución de Ingresos
          </CardTitle>
          <div className="text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-bold text-foreground">
              {formatCurrency(totalIncome)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <Pie data={chartData} options={options} />
        </div>

        {/* Summary cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sources.map((source) => {
            const percentage = ((source.value / totalIncome) * 100).toFixed(1);
            return (
              <div
                key={source.key}
                className="p-3 rounded-lg border"
                style={{ borderColor: source.color, borderLeftWidth: 4 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{source.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {percentage}%
                  </span>
                </div>
                <p className="text-lg font-bold">
                  {formatCurrency(source.value)}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
