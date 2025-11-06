import { memo } from "react";
import { Heart, Thermometer, Activity, Weight, Ruler, Droplet, Wind, Stethoscope, Microscope, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { ConsultationPreConsultation, RecordType } from "@/types/models";

interface VitalSignsState {
  temperature: string;
  heart_rate: string;
  respiratory_rate: string;
  systolic_pressure: string;
  diastolic_pressure: string;
  oxygen_saturation: string;
  blood_glucose: string;
  weight: string;
  height: string;
}

interface VitalSignsSectionProps {
  preConsultation?: ConsultationPreConsultation;
  recordType?: RecordType;
  vitals: VitalSignsState;
  currentMedications: string;
  onVitalsChange: (vitals: VitalSignsState) => void;
  onMedicationsChange: (medications: string) => void;
  onUpdate: () => void;
  isUpdating: boolean;
  hasChanges: boolean;
}

function VitalSignsSection({
  preConsultation,
  recordType,
  vitals,
  currentMedications,
  onVitalsChange,
  onMedicationsChange,
  onUpdate,
  isUpdating,
  hasChanges,
}: VitalSignsSectionProps) {
  // Determinar el tipo de registro desde preConsultation o prop
  const actualRecordType = recordType || preConsultation?.record_type || "consultation";

  // Parsear formato custom DD-MM-YYYY HH:mm:ss del backend
  const parseCustomDateTime = (dateString: string): Date | null => {
    // Formato esperado: DD-MM-YYYY HH:mm:ss
    const regex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
    const match = dateString.match(regex);

    if (!match) return null;

    const [, day, month, year, hours, minutes, seconds] = match;
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // Mes es 0-indexed en JavaScript
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    );
  };

  // Formatear hora de llegada
  const formatArrivalTime = (dateString?: string) => {
    if (!dateString) {
      return "No registrado";
    }

    try {
      // Intentar parsear el formato custom del backend
      const date = parseCustomDateTime(dateString);

      // Verificar si la fecha es válida
      if (!date || isNaN(date.getTime())) {
        console.error('Error parseando fecha:', dateString);
        return "No registrado";
      }

      return date.toLocaleString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formateando hora de llegada:', error, dateString);
      return "No registrado";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Preconsulta</h2>
          {preConsultation?.recorded_by && (
            <span className="text-sm text-muted-foreground ml-2">
              • Registrado por: <span className="font-medium text-foreground">{preConsultation.recorded_by.name}</span>
            </span>
          )}
        </div>
        {preConsultation && actualRecordType === "consultation" && (
          <Button
            type="button"
            onClick={onUpdate}
            disabled={isUpdating || !hasChanges}
            className="bg-success hover:bg-success/90 text-success-foreground"
          >
            {isUpdating ? "Actualizando..." : "Actualizar Preconsulta"}
          </Button>
        )}
      </div>

      {/* Hora de Llegada */}
      {preConsultation && (
        <div className="mb-4 p-4 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <label className="text-sm font-medium">Hora de Llegada</label>
          </div>
          <p className="text-lg font-semibold mt-1.5 ml-6">
            {formatArrivalTime(preConsultation.recorded_at)}
          </p>
        </div>
      )}

      {/* Mensaje para estudios clínicos */}
      {actualRecordType === "study" && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md flex items-start gap-3">
          <Microscope className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              Estudio Clínico
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Los estudios clínicos no requieren registro de signos vitales. Este registro es únicamente para propósitos de estudio o laboratorio.
            </p>
          </div>
        </div>
      )}

      {/* Signos vitales - Solo para consultas */}
      {actualRecordType === "consultation" && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Temperatura */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              Temperatura (°C)
            </div>
          </label>
          <input
            type="number"
            step="0.1"
            value={vitals.temperature}
            onChange={(e) => onVitalsChange({ ...vitals, temperature: e.target.value })}
            placeholder="36.5"
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Frecuencia Cardíaca */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Frecuencia Cardíaca (lpm)
            </div>
          </label>
          <input
            type="number"
            value={vitals.heart_rate}
            onChange={(e) => onVitalsChange({ ...vitals, heart_rate: e.target.value })}
            placeholder="72"
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Frecuencia Respiratoria */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-cyan-500" />
              Frecuencia Respiratoria (rpm)
            </div>
          </label>
          <input
            type="number"
            value={vitals.respiratory_rate}
            onChange={(e) => onVitalsChange({ ...vitals, respiratory_rate: e.target.value })}
            placeholder="16"
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Presión Sistólica */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-500" />
              Presión Sistólica (mmHg)
            </div>
          </label>
          <input
            type="number"
            value={vitals.systolic_pressure}
            onChange={(e) => onVitalsChange({ ...vitals, systolic_pressure: e.target.value })}
            placeholder="120"
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Presión Diastólica */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-500" />
              Presión Diastólica (mmHg)
            </div>
          </label>
          <input
            type="number"
            value={vitals.diastolic_pressure}
            onChange={(e) => onVitalsChange({ ...vitals, diastolic_pressure: e.target.value })}
            placeholder="80"
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Saturación de Oxígeno */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-blue-500" />
              Saturación O₂ (%)
            </div>
          </label>
          <input
            type="number"
            step="0.1"
            value={vitals.oxygen_saturation}
            onChange={(e) => onVitalsChange({ ...vitals, oxygen_saturation: e.target.value })}
            placeholder="98"
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Glucosa en Sangre */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-amber-500" />
              Glucosa en Sangre (mg/dL)
            </div>
          </label>
          <input
            type="number"
            step="0.1"
            value={vitals.blood_glucose}
            onChange={(e) => onVitalsChange({ ...vitals, blood_glucose: e.target.value })}
            placeholder="95.0"
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Peso */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-purple-500" />
              Peso (kg)
            </div>
          </label>
          <input
            type="number"
            step="0.1"
            value={vitals.weight}
            onChange={(e) => onVitalsChange({ ...vitals, weight: e.target.value })}
            placeholder="70.5"
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Altura */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-green-500" />
              Altura (m)
            </div>
          </label>
          <input
            type="number"
            step="0.01"
            value={vitals.height}
            onChange={(e) => onVitalsChange({ ...vitals, height: e.target.value })}
            placeholder="1.75"
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* IMC (calculado) */}
        {preConsultation?.imc && (
          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                IMC (calculado)
              </div>
            </label>
            <div className="w-full px-3 py-2 border border-input rounded-md bg-muted">
              <p className="text-base font-semibold">{preConsultation.imc.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Medicamentos Actuales - Solo para consultas */}
      {actualRecordType === "consultation" && (
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">
          Medicamentos Actuales
        </label>
        <textarea
          value={currentMedications}
          onChange={(e) => onMedicationsChange(e.target.value)}
          placeholder="Medicamentos que el paciente toma actualmente..."
          rows={3}
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>
      )}
    </Card>
  );
}

// Memoize component to prevent re-renders when props don't change
export default memo(VitalSignsSection);
