import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { useState } from "react";
import { useTopSymptoms } from "@/hooks/useAnalytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

ChartJS.register(ArcElement, Tooltip, Legend);

const SYMPTOM_COLORS = [
  "rgba(255, 99, 132, 0.8)",   // Rojo
  "rgba(54, 162, 235, 0.8)",   // Azul
  "rgba(255, 206, 86, 0.8)",   // Amarillo
  "rgba(75, 192, 192, 0.8)",   // Verde azulado
  "rgba(153, 102, 255, 0.8)",  // Púrpura
  "rgba(255, 159, 64, 0.8)",   // Naranja
  "rgba(199, 199, 199, 0.8)",  // Gris
  "rgba(83, 102, 255, 0.8)",   // Azul índigo
  "rgba(255, 99, 255, 0.8)",   // Rosa
  "rgba(99, 255, 132, 0.8)",   // Verde claro
  "rgba(255, 159, 243, 0.8)",  // Rosa claro
  "rgba(159, 226, 191, 0.8)",  // Verde menta
  "rgba(255, 179, 71, 0.8)",   // Naranja dorado
  "rgba(142, 202, 230, 0.8)",  // Azul cielo
  "rgba(255, 105, 180, 0.8)",  // Rosa intenso
  "rgba(144, 238, 144, 0.8)",  // Verde lima
  "rgba(221, 160, 221, 0.8)",  // Ciruela
  "rgba(255, 218, 185, 0.8)",  // Durazno
  "rgba(176, 224, 230, 0.8)",  // Azul polvo
  "rgba(255, 228, 196, 0.8)",  // Beige
];

export default function TopSymptomsChart() {
  const [limit, setLimit] = useState(10);
  const { data, isLoading, error } = useTopSymptoms(limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Síntomas Más Frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="flex items-center justify-center h-80">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || !data.symptoms || data.symptoms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Síntomas Más Frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No hay datos de síntomas disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.symptoms.map((item) => item.symptom),
    datasets: [
      {
        label: "Frecuencia",
        data: data.symptoms.map((item) => item.count),
        backgroundColor: SYMPTOM_COLORS.slice(0, data.symptoms.length),
        borderColor: SYMPTOM_COLORS.slice(0, data.symptoms.length).map(color =>
          color.replace("0.8", "1")
        ),
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
            const index = context.dataIndex;
            const item = data.symptoms[index];
            return `${item.symptom}: ${item.count} (${item.percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Síntomas Más Frecuentes</CardTitle>
          <div className="flex gap-2">
            {[3, 5, 10, 15].map((value) => (
              <button
                key={value}
                onClick={() => setLimit(value)}
                className={`px-3 py-1 text-xs rounded ${
                  limit === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                }`}
              >
                {value}
              </button>
            ))}
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
