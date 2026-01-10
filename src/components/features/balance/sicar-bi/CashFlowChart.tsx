import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowUpDown } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { useSicarBiCashFlow, getCashFlowData, getCashFlowLabel } from "@/hooks/useSicarBi";
import type { DateRangeParams, SicarBiTrendGroupBy } from "@/types/sicarBi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CashFlowChartProps {
  dateParams?: DateRangeParams;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCompact = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

const GROUP_OPTIONS: { value: SicarBiTrendGroupBy; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

export default function CashFlowChart({ dateParams }: CashFlowChartProps) {
  const [groupBy, setGroupBy] = useState<SicarBiTrendGroupBy>("day");
  const { data, isLoading, error } = useSicarBiCashFlow(groupBy, dateParams);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Flujo de Caja
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay datos de movimientos disponibles
        </CardContent>
      </Card>
    );
  }

  const trendData = getCashFlowData(data);

  if (trendData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Flujo de Caja
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay movimientos en el periodo seleccionado
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: trendData.map((point) => getCashFlowLabel(point, groupBy)),
    datasets: [
      {
        label: "Entradas",
        data: trendData.map((p) => p.total_entradas),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: "Salidas",
        data: trendData.map((p) => p.total_salidas),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          },
          afterBody: (context: any) => {
            const idx = context[0].dataIndex;
            const point = trendData[idx];
            const diferencia = point.total_entradas - point.total_salidas;
            return [
              `Diferencia: ${formatCurrency(diferencia)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: (value: number | string) => {
            const numValue = typeof value === "string" ? parseFloat(value) : value;
            return formatCompact(numValue);
          },
        },
      },
    },
  };

  const diferencia = data.summary?.diferencia ??
    (data.summary ? data.summary.total_entradas - data.summary.total_salidas : 0);
  const isPositive = diferencia >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Flujo de Caja
          </CardTitle>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {GROUP_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setGroupBy(option.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  groupBy === option.value
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <Line data={chartData} options={options} />
        </div>
        {data.summary && (
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Total Entradas</p>
              <p className="font-bold text-green-600">{formatCurrency(data.summary.total_entradas)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Salidas</p>
              <p className="font-bold text-red-600">{formatCurrency(data.summary.total_salidas)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Diferencia</p>
              <p className={`font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive && "+"}{formatCurrency(diferencia)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
