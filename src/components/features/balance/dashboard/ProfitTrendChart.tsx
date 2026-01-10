import { useRef, useState } from "react";
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
import { useBalanceComparison } from "@/hooks/useBalance";
import Spinner from "@/components/ui/Spinner";
import { TrendingUp, Calendar } from "lucide-react";
import type { ComparisonParams } from "@/types/balance";

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
};

interface ProfitTrendChartProps {
  params?: ComparisonParams;
}

export default function ProfitTrendChart({ params }: ProfitTrendChartProps) {
  const chartRef = useRef<any>(null);
  const [groupBy, setGroupBy] = useState<'month' | 'year'>(params?.group_by || 'year');

  // Build query params - empty = full history, backend auto-selects grouping
  const queryParams: ComparisonParams = params ? { ...params, group_by: groupBy } : { group_by: groupBy };
  const { data, isLoading, error } = useBalanceComparison(queryParams);

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
        <CardContent className="py-8 text-center text-muted-foreground">
          Error al cargar datos de tendencia
        </CardContent>
      </Card>
    );
  }

  // Handle both monthly and yearly data
  const isYearlyView = data.group_by === 'year';
  const months = data.months || [];
  const years = data.years || [];

  const hasData = isYearlyView ? years.length > 0 : months.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay datos históricos disponibles
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats based on view type
  let incomeChange = 0;
  if (isYearlyView && years.length > 1) {
    const latestYear = years[years.length - 1];
    const previousYear = years[years.length - 2];
    if (previousYear.income > 0) {
      incomeChange = ((latestYear.income - previousYear.income) / previousYear.income) * 100;
    }
  } else if (!isYearlyView && months.length > 1) {
    const latestMonth = months[months.length - 1];
    const previousMonth = months[months.length - 2];
    if (previousMonth.income > 0) {
      incomeChange = ((latestMonth.income - previousMonth.income) / previousMonth.income) * 100;
    }
  }

  // Build chart data based on view type
  const labels = isYearlyView
    ? years.map((y) => y.year.toString())
    : months.map((m) => formatMonth(m.month));

  const incomeData = isYearlyView
    ? years.map((y) => y.income)
    : months.map((m) => m.income);

  const expensesData = isYearlyView
    ? years.map((y) => y.expenses)
    : months.map((m) => m.expenses);

  const profitData = isYearlyView
    ? years.map((y) => y.profit)
    : months.map((m) => m.profit);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Ingresos",
        data: incomeData,
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
        label: "Gastos",
        data: expensesData,
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
      {
        label: "Utilidad",
        data: profitData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.25)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 7,
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
            if (numValue >= 1000000) {
              return `$${(numValue / 1000000).toFixed(1)}M`;
            }
            if (numValue >= 1000) {
              return `$${(numValue / 1000).toFixed(0)}K`;
            }
            return `$${numValue}`;
          },
        },
      },
    },
  };

  // Build title based on date range
  const fromDate = data.from ? new Date(data.from + "-01") : null;
  const toDate = data.to ? new Date(data.to + "-01") : null;
  const dateRangeLabel = fromDate && toDate
    ? `${fromDate.getFullYear()} - ${toDate.getFullYear()}`
    : "Historial Completo";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendencia Financiera - {dateRangeLabel}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Group By Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setGroupBy('year')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  groupBy === 'year'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Años
              </button>
              <button
                onClick={() => setGroupBy('month')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  groupBy === 'month'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Meses
              </button>
            </div>
            {incomeChange !== 0 && (
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${
                  incomeChange >= 0
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {incomeChange >= 0 ? "+" : ""}
                {incomeChange.toFixed(1)}% vs {isYearlyView ? "año" : "mes"} anterior
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
