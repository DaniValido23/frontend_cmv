import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { useRevenueAnalytics } from "@/hooks/useAnalytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { type GroupBy, formatLabel, formatMoney } from "@/utils/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function RevenueChart() {
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const { data, isLoading, error } = useRevenueAnalytics(groupBy);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDataArray = () => {
    if (!data) return null;
    if (groupBy === 'day') return data.daily_revenue;
    if (groupBy === 'week') return data.weekly_revenue;
    if (groupBy === 'month') return data.monthly_revenue;
    if (groupBy === 'year') return data.yearly_revenue;
    return null;
  };

  const dataArray = getDataArray();

  if (error || !dataArray) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Error al cargar datos de ingresos
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: dataArray.map((item) => formatLabel(item, groupBy)),
    datasets: [
      {
        label: "Ingresos ($)",
        data: dataArray.map((item) => item.revenue),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
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
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            return `Ingresos: $${formatMoney(context.parsed.y ?? 0)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        grid: {
          display: false,
        },
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          callback: function (value: number | string) {
            return "$" + formatMoney(Number(value));
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ingresos</CardTitle>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setGroupBy('day')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              groupBy === 'day'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            Día
          </button>
          <button
            onClick={() => setGroupBy('week')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              groupBy === 'week'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setGroupBy('month')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              groupBy === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setGroupBy('year')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              groupBy === 'year'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            Año
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
