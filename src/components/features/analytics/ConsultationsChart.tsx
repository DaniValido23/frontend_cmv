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
  type TooltipItem,
} from "chart.js";
import { useConsultationsAnalytics } from "@/hooks/useAnalytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { type GroupBy, formatLabel } from "@/utils/formatters";

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

export default function ConsultationsChart() {
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const { data, isLoading, error } = useConsultationsAnalytics(groupBy);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Obtener el array correcto según el tipo de agrupación
  const getDataArray = () => {
    if (!data) return null;
    if (groupBy === 'day') return data.daily_consultations;
    if (groupBy === 'week') return data.weekly_consultations;
    if (groupBy === 'month') return data.monthly_consultations;
    if (groupBy === 'year') return data.yearly_consultations;
    return null;
  };

  const dataArray = getDataArray();

  if (error || !dataArray) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Error al cargar datos de consultas
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: dataArray.map((item) => formatLabel(item, groupBy)),
    datasets: [
      {
        label: "Consultas",
        data: dataArray.map((item) => item.consultations),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        fill: true,
        tension: 0.4,
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
          label: function (context: TooltipItem<"line">) {
            return `Consultas: ${context.parsed.y}`;
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
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Consultas</CardTitle>
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
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
