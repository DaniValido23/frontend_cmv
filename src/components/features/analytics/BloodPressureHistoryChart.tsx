import { useState } from "react";
import { Scatter } from "react-chartjs-2";
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
  type ChartOptions,
} from "chart.js";
import annotationPlugin from 'chartjs-plugin-annotation';
import { useBloodPressureHistory } from "@/hooks/useAnalytics";
import { useAllPatients } from "@/hooks/usePatients";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { formatDateLabel } from "@/utils/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

export default function BloodPressureHistoryChart() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const { data: patients, isLoading: loadingPatients } = useAllPatients();
  const { data: bpHistory, isLoading: loadingHistory } = useBloodPressureHistory(selectedPatientId);

  const handlePatientChange = (value: string) => {
    setSelectedPatientId(value);
    setSelectedDateIndex(0);
  };

  const getBPCategory = (systolic: number, diastolic: number) => {
    // Crisis Hipertensiva - Sistólica ≥180 O Diastólica ≥120
    if (systolic >= 180 || diastolic >= 120) {
      return { name: "Crisis Hipertensiva", color: "rgb(153, 27, 27)" };
    }
    // Hipertensión Etapa 2 - Sistólica ≥140 O Diastólica ≥90
    else if (systolic >= 140 || diastolic >= 90) {
      return { name: "Hipertensión Etapa 2", color: "rgb(239, 68, 68)" };
    }
    // Hipertensión Etapa 1 - Sistólica 130-139 O Diastólica 80-89
    else if (systolic >= 130 || diastolic >= 80) {
      return { name: "Hipertensión Etapa 1", color: "rgb(249, 115, 22)" };
    }
    // Presión Arterial Elevada - Sistólica 120-129 Y Diastólica <80
    else if (systolic >= 120 && systolic < 130 && diastolic < 80) {
      return { name: "Elevada", color: "rgb(234, 179, 8)" };
    }
    // Normal - Sistólica <120 Y Diastólica <80
    else {
      return { name: "Normal", color: "rgb(34, 197, 94)" };
    }
  };

  const selectedPatientName = selectedPatientId && patients
    ? patients.find(p => p.id === selectedPatientId)?.full_name || ''
    : '';

  if (loadingPatients) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Presión Arterial del Paciente</CardTitle>
          <CardDescription>Evolución de la presión sistólica y diastólica</CardDescription>
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
          <CardTitle>Historial de Presión Arterial del Paciente</CardTitle>
          <CardDescription>Evolución de la presión sistólica y diastólica</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No hay pacientes disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedRecord = bpHistory?.blood_pressure_records?.[selectedDateIndex];

  const chartData = selectedRecord
    ? {
        datasets: [
          {
            label: "Presión Arterial",
            data: [{
              x: selectedRecord.diastolic_pressure,
              y: selectedRecord.systolic_pressure,
            }],
            backgroundColor: getBPCategory(selectedRecord.systolic_pressure, selectedRecord.diastolic_pressure).color,
            borderColor: getBPCategory(selectedRecord.systolic_pressure, selectedRecord.diastolic_pressure).color,
            pointRadius: 8,
            pointHoverRadius: 10,
          },
        ],
      }
    : null;

  const createAnnotations = () => {
    const annotations: any = {
      // === ZONA NORMAL (verde) - Sistólica < 120 Y Diastólica < 80 ===
      normalBox: {
        type: 'box',
        xMin: 30,
        xMax: 80,
        yMin: 50,
        yMax: 120,
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderWidth: 0,
      },

      // === PRESIÓN ELEVADA (amarillo) - Sistólica 120-129 Y Diastólica < 80 ===
      elevatedBox: {
        type: 'box',
        xMin: 30,
        xMax: 80,
        yMin: 120,
        yMax: 130,
        backgroundColor: 'rgba(234, 179, 8, 0.15)',
        borderWidth: 0,
      },

      // === HIPERTENSIÓN ETAPA 1 (naranja) - Sistólica 130-139 O Diastólica 80-89 ===
      htn1Box1: {
        type: 'box',
        xMin: 30,
        xMax: 135,
        yMin: 130,
        yMax: 140,
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        borderWidth: 0,
      },
      htn1Box2: {
        type: 'box',
        xMin: 80,
        xMax: 90,
        yMin: 50,
        yMax: 130,
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        borderWidth: 0,
      },

      // === HIPERTENSIÓN ETAPA 2 (rojo) - Sistólica ≥ 140 O Diastólica ≥ 90 ===
      htn2Box1: {
        type: 'box',
        xMin: 30,
        xMax: 135,
        yMin: 140,
        yMax: 180,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 0,
      },
      htn2Box2: {
        type: 'box',
        xMin: 90,
        xMax: 120,
        yMin: 50,
        yMax: 140,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 0,
      },

      // === CRISIS HIPERTENSIVA (rojo oscuro) - Sistólica ≥ 180 O Diastólica ≥ 120 ===
      crisisBox1: {
        type: 'box',
        xMin: 30,
        xMax: 135,
        yMin: 180,
        yMax: 220,
        backgroundColor: 'rgba(153, 27, 27, 0.15)',
        borderWidth: 0,
      },
      crisisBox2: {
        type: 'box',
        xMin: 120,
        xMax: 135,
        yMin: 50,
        yMax: 180,
        backgroundColor: 'rgba(153, 27, 27, 0.15)',
        borderWidth: 0,
      },
    };

    if (selectedRecord) {
      const diastolica = selectedRecord.diastolic_pressure;
      const sistolica = selectedRecord.systolic_pressure;

      annotations.verticalLine = {
        type: 'line',
        xMin: diastolica,
        xMax: diastolica,
        yMin: 50,
        yMax: sistolica,
        borderColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 2,
        borderDash: [5, 5],
      };

      annotations.horizontalLine = {
        type: 'line',
        xMin: 30,
        xMax: diastolica,
        yMin: sistolica,
        yMax: sistolica,
        borderColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 2,
        borderDash: [5, 5],
      };
    }

    return annotations;
  };

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const diastolica = context.parsed.x;
            const sistolica = context.parsed.y;
            const category = getBPCategory(sistolica, diastolica);
            return [
              `Sistólica: ${sistolica.toFixed(0)} mmHg`,
              `Diastólica: ${diastolica.toFixed(0)} mmHg`,
              `Categoría: ${category.name}`
            ];
          },
        },
      },
      annotation: {
        annotations: createAnnotations(),
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        min: 30,
        max: 135,
        title: {
          display: true,
          text: "Presión Diastólica (mmHg)",
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          drawOnChartArea: true,
        },
        ticks: {
          stepSize: 10,
        },
      },
      y: {
        type: 'linear' as const,
        min: 50,
        max: 220,
        title: {
          display: true,
          text: "Presión Sistólica (mmHg)",
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          drawOnChartArea: true,
        },
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Presión Arterial del Paciente</CardTitle>
        <CardDescription>
          <div className="mt-2 mb-4">
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

          {/* Selector de fecha */}
          {bpHistory && bpHistory.blood_pressure_records && bpHistory.blood_pressure_records.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Seleccionar fecha de registro:</label>
              <Select
                value={selectedDateIndex.toString()}
                onValueChange={(value) => setSelectedDateIndex(parseInt(value))}
              >
                <SelectTrigger className="w-full bg-background border-border">
                  <SelectValue>
                    <span className="text-foreground">
                      {formatDateLabel(bpHistory.blood_pressure_records[selectedDateIndex].date)}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {bpHistory.blood_pressure_records.map((record, index) => (
                    <SelectItem
                      key={index}
                      value={index.toString()}
                      className="text-foreground cursor-pointer hover:bg-accent focus:bg-accent"
                    >
                      {formatDateLabel(record.date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedRecord && (
            <div className="mt-4 text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Categoría:</span>
                <span
                  className="px-2 py-1 rounded text-white font-medium"
                  style={{ backgroundColor: getBPCategory(selectedRecord.systolic_pressure, selectedRecord.diastolic_pressure).color }}
                >
                  {getBPCategory(selectedRecord.systolic_pressure, selectedRecord.diastolic_pressure).name}
                </span>
              </div>
              <div>
                <span className="font-semibold">Sistólica:</span> {selectedRecord.systolic_pressure.toFixed(0)} mmHg
              </div>
              <div>
                <span className="font-semibold">Diastólica:</span> {selectedRecord.diastolic_pressure.toFixed(0)} mmHg
              </div>
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
            Selecciona un paciente para ver su historial de presión arterial
          </div>
        ) : !bpHistory || !bpHistory.blood_pressure_records || bpHistory.blood_pressure_records.length === 0 ? (
          <div className="flex items-center justify-center h-[500px] text-muted-foreground">
            No hay registros de presión arterial para este paciente
          </div>
        ) : (
          <div className="relative h-[500px]">
            {/* Leyenda de rangos AHA/ACC */}
            <div className="absolute top-2 right-2 bg-background/90 border rounded p-2 text-xs space-y-1 z-10">
              <div className="font-semibold mb-1.5">Rangos:</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: "rgb(34, 197, 94)" }}></div>
                  <span>Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: "rgb(234, 179, 8)" }}></div>
                  <span>Elevada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: "rgb(249, 115, 22)" }}></div>
                  <span>Hipertensión Etapa 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: "rgb(239, 68, 68)" }}></div>
                  <span>Hipertensión Etapa 2</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: "rgb(153, 27, 27)" }}></div>
                  <span>Crisis Hipertensiva</span>
                </div>
              </div>
            </div>
            <Scatter data={chartData!} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
