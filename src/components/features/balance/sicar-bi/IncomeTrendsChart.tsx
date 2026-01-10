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
import {
  useIncomeTrends,
  getIncomeTrendData,
  getIncomeTrendLabel,
  type DateRangeParams,
} from "@/hooks/useBalance";
import type { IncomeTrendGroupBy } from "@/types/balance";

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

interface IncomeTrendsChartProps {
  dateParams?: DateRangeParams;
}

const COLORS = {
  sicar: { border: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)" },
  consultations: { border: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
  studies: { border: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
};

const GROUP_OPTIONS: { value: IncomeTrendGroupBy; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function IncomeTrendsChart({ dateParams }: IncomeTrendsChartProps) {
  const [groupBy, setGroupBy] = useState<IncomeTrendGroupBy>("day");
  const { data, isLoading, error } = useIncomeTrends(groupBy, dateParams);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="py-12 flex items-center justify-center">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="py-8 text-center text-destructive">
          Error al cargar tendencias de ingresos
        </CardContent>
      </Card>
    );
  }

  const trendData = getIncomeTrendData(data);

  if (trendData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendencias de Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay datos de ingresos para el periodo seleccionado
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: trendData.map((point) => getIncomeTrendLabel(point, groupBy)),
    datasets: [
      {
        label: "SICAR",
        data: trendData.map((p) => p.sicar_sales),
        borderColor: COLORS.sicar.border,
        backgroundColor: COLORS.sicar.bg,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: COLORS.sicar.border,
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
      },
      {
        label: "Consultas",
        data: trendData.map((p) => p.consultations),
        borderColor: COLORS.consultations.border,
        backgroundColor: COLORS.consultations.bg,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: COLORS.consultations.border,
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
      },
      {
        label: "Estudios",
        data: trendData.map((p) => p.studies),
        borderColor: COLORS.studies.border,
        backgroundColor: COLORS.studies.bg,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: COLORS.studies.border,
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
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
          padding: 15,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          },
          afterBody: (context: any) => {
            const idx = context[0].dataIndex;
            const point = trendData[idx];
            return [`Total: ${formatCurrency(point.total)}`];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10 },
          maxRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: {
          font: { size: 10 },
          callback: (value: number | string) => formatCurrency(Number(value)),
        },
      },
    },
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendencias de Ingresos
          </CardTitle>
          <div className="flex gap-1">
            {GROUP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGroupBy(opt.value)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  groupBy === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <Line data={chartData} options={options} />
        </div>

        {data?.summary && (
          <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">SICAR</p>
              <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                {formatCurrency(data.summary.total_sicar)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Consultas</p>
              <p className="font-bold text-green-600 dark:text-green-400 text-sm">
                {formatCurrency(data.summary.total_consultations)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estudios</p>
              <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                {formatCurrency(data.summary.total_studies)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-bold text-sm">
                {formatCurrency(data.summary.grand_total)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
