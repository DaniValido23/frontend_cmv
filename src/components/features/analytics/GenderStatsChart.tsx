import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { useGenderStats } from "@/hooks/useAnalytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

ChartJS.register(ArcElement, Tooltip, Legend);

const GENDER_COLORS = [
  "rgba(59, 130, 246, 0.8)",
  "rgba(236, 72, 153, 0.8)",
];

export default function GenderStatsChart() {
  const { data, isLoading, error } = useGenderStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Género</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="flex items-center justify-center h-80">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Género</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No hay datos de género disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: ["Masculino", "Femenino"],
    datasets: [
      {
        label: "Pacientes",
        data: [data.male_count, data.female_count],
        backgroundColor: GENDER_COLORS,
        borderColor: GENDER_COLORS.map(color => color.replace("0.8", "1")),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right" as const,
        labels: {
          boxWidth: 15,
          padding: 10,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"pie">) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = data.total_count > 0
              ? ((value / data.total_count) * 100).toFixed(1)
              : '0.0';
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Distribución por Género</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total: {data.total_count} pacientes
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="h-80">
          <Pie data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
