import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { useState } from "react";
import { useTopMedications } from "@/hooks/useAnalytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

ChartJS.register(ArcElement, Tooltip, Legend);

const MEDICATION_COLORS = [
  "rgba(220, 38, 38, 0.8)",    // Rojo intenso
  "rgba(37, 99, 235, 0.8)",    // Azul
  "rgba(234, 179, 8, 0.8)",    // Amarillo dorado
  "rgba(21, 128, 61, 0.8)",    // Verde oscuro
  "rgba(147, 51, 234, 0.8)",   // Púrpura
  "rgba(234, 88, 12, 0.8)",    // Naranja quemado
  "rgba(79, 70, 229, 0.8)",    // Índigo
  "rgba(190, 18, 60, 0.8)",    // Rosa oscuro
  "rgba(5, 150, 105, 0.8)",    // Verde esmeralda oscuro
  "rgba(202, 138, 4, 0.8)",    // Amarillo mostaza
  "rgba(124, 45, 18, 0.8)",    // Marrón
  "rgba(30, 64, 175, 0.8)",    // Azul oscuro
  "rgba(153, 27, 27, 0.8)",    // Rojo ladrillo
  "rgba(22, 163, 74, 0.8)",    // Verde
  "rgba(194, 65, 12, 0.8)",    // Naranja oscuro
  "rgba(107, 33, 168, 0.8)",   // Púrpura oscuro
  "rgba(17, 94, 89, 0.8)",     // Verde azulado oscuro
  "rgba(161, 98, 7, 0.8)",     // Ámbar oscuro
  "rgba(88, 28, 135, 0.8)",    // Violeta oscuro
  "rgba(136, 19, 55, 0.8)",    // Rosa oscuro intenso
];

export default function TopMedicationsChart() {
  const [limit, setLimit] = useState(10);
  const { data, isLoading, error } = useTopMedications(limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medicamentos Más Frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="flex items-center justify-center h-80">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || !data.medications || data.medications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medicamentos Más Frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No hay datos de medicamentos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.medications.map((item) => item.medication),
    datasets: [
      {
        label: "Frecuencia",
        data: data.medications.map((item) => item.count),
        backgroundColor: MEDICATION_COLORS.slice(0, data.medications.length),
        borderColor: MEDICATION_COLORS.slice(0, data.medications.length).map(color =>
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
            const item = data.medications[index];
            return `${item.medication}: ${item.count} (${item.percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Medicamentos Más Frecuentes</CardTitle>
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
