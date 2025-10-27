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
} from "chart.js";
import { usePatientWeightHistory } from "@/hooks/useAnalytics";
import { useAllPatients } from "@/hooks/usePatients";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { formatDateLabel, type ChartTooltipContext } from "@/utils/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function WeightEvolutionChart() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { data: patients, isLoading: loadingPatients } = useAllPatients();
  const { data: weightHistory, isLoading: loadingHistory } = usePatientWeightHistory(selectedPatientId);

  const handlePatientChange = (value: string) => {
    setSelectedPatientId(value);
  };

  // Obtener el nombre del paciente seleccionado
  const selectedPatientName = selectedPatientId && patients
    ? patients.find(p => p.id === selectedPatientId)?.full_name || ''
    : '';

  if (loadingPatients) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolución del Peso del Paciente</CardTitle>
          <CardDescription>Historial de peso e IMC</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolución del Peso del Paciente</CardTitle>
          <CardDescription>Historial de peso e IMC</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No hay pacientes disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = weightHistory?.weight_records
    ? {
        labels: weightHistory.weight_records.map((record) => formatDateLabel(record.date)),
        datasets: [
          {
            label: "Peso (kg)",
            data: weightHistory.weight_records.map((record) => record.weight),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      }
    : null;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: ChartTooltipContext) {
            return `Peso: ${context.parsed.y.toFixed(2)} kg`;
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
        beginAtZero: false,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Peso (kg)",
        },
        ticks: {
          callback: function (value: number | string) {
            return Number(value).toFixed(1) + " kg";
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución del Peso del Paciente</CardTitle>
        <CardDescription className="space-y-3">
          <div className="mt-2">
            <div className="relative">
              <Select onValueChange={handlePatientChange} value={selectedPatientId || ""}>
                <SelectTrigger className="w-full max-w-md bg-background border-border">
                  <SelectValue placeholder="Selecciona un paciente">
                    {selectedPatientName ? (
                      <span className="text-foreground">{selectedPatientName}</span>
                    ) : (
                      <span className="text-muted-foreground">Selecciona un paciente</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {patients.map((patient) => {
                    const displayName = patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
                    return (
                      <SelectItem
                        key={patient.id}
                        value={patient.id}
                        className="text-foreground cursor-pointer hover:bg-accent focus:bg-accent"
                      >
                        {displayName || 'Sin nombre'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          {weightHistory && (
            <div className="text-sm">
              Peso inicial: {weightHistory.initial_weight.toFixed(1)} kg |
              Peso actual: {weightHistory.current_weight.toFixed(1)} kg |
              Cambio: {weightHistory.weight_change > 0 ? "+" : ""}
              {weightHistory.weight_change.toFixed(1)} kg
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingHistory ? (
          <div className="flex items-center justify-center h-80">
            <Spinner />
          </div>
        ) : !selectedPatientId ? (
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            Selecciona un paciente para ver su evolución
          </div>
        ) : !weightHistory || !weightHistory.weight_records || weightHistory.weight_records.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No hay registros de peso para este paciente
          </div>
        ) : (
          <div className="h-80">
            <Line data={chartData!} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
