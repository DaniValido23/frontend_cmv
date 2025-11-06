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
  type TooltipItem,
} from "chart.js";
import { useGlucoseHistory, useDoctorPatients } from "@/hooks/useAnalytics";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { formatDateLabel } from "@/utils/formatters";
import { useAuthStore } from "@/stores/authStore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function GlucoseHistoryChart() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { data: patients, isLoading: loadingPatients } = useDoctorPatients(user?.id);
  const { data: glucoseHistory, isLoading: loadingHistory } = useGlucoseHistory(selectedPatientId);

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
          <CardTitle>Historial de Glucosa del Paciente</CardTitle>
          <CardDescription>Evolución de los niveles de glucosa en sangre</CardDescription>
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
          <CardTitle>Historial de Glucosa del Paciente</CardTitle>
          <CardDescription>Evolución de los niveles de glucosa en sangre</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No hay pacientes disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = glucoseHistory?.glucose_records
    ? {
        labels: glucoseHistory.glucose_records.map((record) => formatDateLabel(record.date)),
        datasets: [
          {
            label: "Glucosa (mg/dL)",
            data: glucoseHistory.glucose_records.map((record) => record.blood_glucose),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
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
          label: function (context: TooltipItem<"line">) {
            return `Glucosa: ${(context.parsed.y ?? 0).toFixed(1)} mg/dL`;
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
          text: "Glucosa (mg/dL)",
        },
        ticks: {
          callback: function (value: number | string) {
            return Number(value).toFixed(0) + " mg/dL";
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Glucosa del Paciente</CardTitle>
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
          {glucoseHistory && (
            <div className="text-sm">
              Glucosa inicial: {glucoseHistory.initial_glucose.toFixed(1)} mg/dL |
              Glucosa actual: {glucoseHistory.current_glucose.toFixed(1)} mg/dL |
              Cambio: {glucoseHistory.glucose_change > 0 ? "+" : ""}
              {glucoseHistory.glucose_change.toFixed(1)} mg/dL |
              Promedio: {glucoseHistory.average_glucose.toFixed(1)} mg/dL
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingHistory ? (
          <div className="flex items-center justify-center h-[500px]">
            <Spinner />
          </div>
        ) : !selectedPatientId ? (
          <div className="flex items-center justify-center h-[500px] text-muted-foreground">
            Selecciona un paciente para ver su historial de glucosa
          </div>
        ) : !glucoseHistory || !glucoseHistory.glucose_records || glucoseHistory.glucose_records.length === 0 ? (
          <div className="flex items-center justify-center h-[500px] text-muted-foreground">
            No hay registros de glucosa para este paciente
          </div>
        ) : (
          <div className="h-[500px]">
            <Line data={chartData!} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
