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
import { TrendingUp } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { useSicarBiTrends, getTrendData, getTrendLabel } from "@/hooks/useSicarBi";
import type { SicarBiTrendGroupBy, DateRangeParams } from "@/types/sicarBi";

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

interface SicarTrendsChartProps {
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
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

const GROUP_OPTIONS: { value: SicarBiTrendGroupBy; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

export default function SicarTrendsChart({ dateParams }: SicarTrendsChartProps) {
  const [groupBy, setGroupBy] = useState<SicarBiTrendGroupBy>("day");
  const { data, isLoading, error } = useSicarBiTrends(groupBy, dateParams);

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
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendencia de Ventas SICAR
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          Error al cargar datos de tendencia
        </CardContent>
      </Card>
    );
  }

  const trendData = getTrendData(data);

  if (trendData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendencia de Ventas SICAR
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay datos de tendencia disponibles
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: trendData.map((point) => getTrendLabel(point, groupBy)),
    datasets: [
      {
        label: "Ventas",
        data: trendData.map((p) => p.total_ventas),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: "Utilidad",
        data: trendData.map((p) => p.total_utilidad),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "#10b981",
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
            return [
              `Tickets: ${point.ticket_count}`,
              `Ticket Promedio: ${formatCurrency(point.ticket_promedio)}`,
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendencia de Ventas SICAR
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
        {/* Summary stats */}
        {data.summary && (
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Total Ventas</p>
              <p className="font-bold text-blue-600">{formatCurrency(data.summary.total_ventas)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Tickets</p>
              <p className="font-bold">{data.summary.total_tickets.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Utilidad Total</p>
              <p className="font-bold text-green-600">{formatCurrency(data.summary.total_utilidad)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
