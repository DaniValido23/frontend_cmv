import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { useState } from "react";
import { useTopDiagnoses } from "@/hooks/useAnalytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

ChartJS.register(ArcElement, Tooltip, Legend);

const DIAGNOSIS_COLORS = [
  "rgba(59, 130, 246, 0.8)",   // Azul
  "rgba(16, 185, 129, 0.8)",   // Verde esmeralda
  "rgba(249, 115, 22, 0.8)",   // Naranja
  "rgba(139, 92, 246, 0.8)",   // Violeta
  "rgba(236, 72, 153, 0.8)",   // Rosa
  "rgba(14, 165, 233, 0.8)",   // Azul cielo
  "rgba(34, 197, 94, 0.8)",    // Verde
  "rgba(251, 146, 60, 0.8)",   // Naranja claro
  "rgba(168, 85, 247, 0.8)",   // Púrpura
  "rgba(244, 63, 94, 0.8)",    // Rojo rosa
  "rgba(6, 182, 212, 0.8)",    // Cian
  "rgba(132, 204, 22, 0.8)",   // Lima
  "rgba(251, 191, 36, 0.8)",   // Ámbar
  "rgba(167, 139, 250, 0.8)",  // Índigo claro
  "rgba(248, 113, 113, 0.8)",  // Rojo claro
  "rgba(45, 212, 191, 0.8)",   // Verde azulado
  "rgba(163, 230, 53, 0.8)",   // Verde lima brillante
  "rgba(253, 224, 71, 0.8)",   // Amarillo
  "rgba(196, 181, 253, 0.8)",  // Lavanda
  "rgba(252, 165, 165, 0.8)",  // Rosa salmón
];

export default function TopDiagnosesChart() {
  const [limit, setLimit] = useState(10);
  const { data, isLoading, error } = useTopDiagnoses(limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagnósticos Más Frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="flex items-center justify-center h-80">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || !data.diagnoses || data.diagnoses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagnósticos Más Frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No hay datos de diagnósticos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.diagnoses.map((item) => item.diagnosis),
    datasets: [
      {
        label: "Frecuencia",
        data: data.diagnoses.map((item) => item.count),
        backgroundColor: DIAGNOSIS_COLORS.slice(0, data.diagnoses.length),
        borderColor: DIAGNOSIS_COLORS.slice(0, data.diagnoses.length).map(color =>
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
            const item = data.diagnoses[index];
            return `${item.diagnosis}: ${item.count} (${item.percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Diagnósticos Más Frecuentes</CardTitle>
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
