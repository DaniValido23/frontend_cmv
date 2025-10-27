import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useTopPatients } from "@/hooks/useAnalytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { type ChartTooltipContext } from "@/utils/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Función para truncar nombres a 20 caracteres
const truncateName = (name: string, maxLength: number = 20): string => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

export default function TopPatientsChart() {
  const { data, isLoading, error } = useTopPatients();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Pacientes Frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="flex items-center justify-center h-80">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || !data.patients || data.patients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Pacientes Frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No hay datos de pacientes disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.patients.map((patient) => truncateName(patient.patient_name)),
    datasets: [
      {
        label: "Consultas",
        data: data.patients.map((patient) => patient.total_consultations),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
        barPercentage: 0.7,
        categoryPercentage: 0.9,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (context: ChartTooltipContext[]) {
            const index = context[0].dataIndex;
            return data.patients[index].patient_name;
          },
          label: function (context: ChartTooltipContext) {
            return `Consultas: ${context.parsed.x}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          stepSize: 1,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          autoSkip: false,
          font: {
            size: 13,
            weight: 'bold' as const,
          },
          align: 'start' as const,
          crossAlign: 'far' as const,
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Pacientes Frecuentes</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="h-80">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
