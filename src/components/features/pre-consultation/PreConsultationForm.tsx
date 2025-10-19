import { useState, useMemo } from "react";
import { useAllPatients } from "@/hooks/usePatients";
import { useCreatePreConsultation } from "@/hooks/usePreConsultations";
import { useAddToWaitingRoom } from "@/hooks/useWaitingRoom";
import { useNavigate } from "@/hooks/useNavigate";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Autocomplete from "@/components/ui/Autocomplete";
import AddPatientModal from "./AddPatientModal";
import { User, Heart, Thermometer, Activity, Weight, Ruler, Droplet, Clock, UserPlus, Wind, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import type { Patient } from "@/types/models";

export default function PreConsultationForm() {
  const navigate = useNavigate();
  const { data: patients = [], isLoading: loadingPatients } = useAllPatients();
  const createPreConsultationMutation = useCreatePreConsultation();
  const addToWaitingRoomMutation = useAddToWaitingRoom();

  // Estados del formulario
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Signos vitales
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [systolicPressure, setSystolicPressure] = useState("");
  const [diastolicPressure, setDiastolicPressure] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  // Prioridad para sala de espera
  const [priority, setPriority] = useState("Normal");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrar pacientes para autocomplete
  const patientSuggestions = useMemo(() => {
    if (!patientSearch.trim() || loadingPatients) return [];
    return patients
      .filter(p =>
        p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.phone?.includes(patientSearch)
      )
      .slice(0, 8)
      .map(p => p.full_name);
  }, [patientSearch, patients, loadingPatients]);

  const handlePatientSelect = (patientName: string) => {
    const patient = patients.find(p => p.full_name === patientName);
    if (patient) {
      setSelectedPatient(patient);
      setSelectedPatientId(patient.id);
      setPatientSearch(patientName);
    }
  };

  const handlePatientCreated = (newPatient: Patient) => {
    // Set the patient data directly from the API response
    setSelectedPatientId(newPatient.id);
    setPatientSearch(newPatient.full_name);
    setSelectedPatient(newPatient);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId) {
      toast.error("Debes seleccionar un paciente");
      return;
    }

    // Preparar datos de pre-consulta
    const preConsultationData = {
      patient_id: selectedPatientId,
      temperature: temperature ? parseFloat(temperature) : undefined,
      heart_rate: heartRate ? parseInt(heartRate) : undefined,
      respiratory_rate: respiratoryRate ? parseInt(respiratoryRate) : undefined,
      systolic_pressure: systolicPressure ? parseInt(systolicPressure) : undefined,
      diastolic_pressure: diastolicPressure ? parseInt(diastolicPressure) : undefined,
      oxygen_saturation: oxygenSaturation ? parseFloat(oxygenSaturation) : undefined,
      blood_glucose: bloodGlucose ? parseFloat(bloodGlucose) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      height: height ? parseFloat(height) : undefined,
    };

    // Paso 1: Crear pre-consulta
    createPreConsultationMutation.mutate(preConsultationData, {
      onSuccess: (response) => {
        const preConsultationId = response.data.id;

        if (!preConsultationId) {
          toast.error("Error: No se recibió el ID de la pre-consulta");
          return;
        }

        // Paso 2: Agregar a sala de espera
        const waitingRoomData = {
          patient_id: selectedPatientId,
          pre_consultation_id: preConsultationId,
          priority: priority,
        };

        addToWaitingRoomMutation.mutate(waitingRoomData, {
          onSuccess: () => {
            // Redirigir directamente a sala de espera sin toast
            navigate("/waiting-room");
          },
          onError: () => {
            toast.error("Pre-consulta creada pero hubo un error al agregar a la sala de espera");
          },
        });
      },
    });
  };

  const isSubmitting = createPreConsultationMutation.isPending || addToWaitingRoomMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pre-Consulta</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registra los signos vitales del paciente y agrégalo a la sala de espera
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Selección de Paciente */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Paciente
              </div>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Autocomplete
                value={patientSearch}
                onChange={setPatientSearch}
                onSelect={handlePatientSelect}
                suggestions={patientSuggestions}
                placeholder="Buscar paciente por nombre o teléfono..."
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-success hover:bg-success/90 text-success-foreground shrink-0 w-full sm:w-auto"
                title="Agregar nuevo paciente"
              >
                <UserPlus className="h-4 w-4 sm:mr-0" />
                <span className="sm:hidden ml-2">Agregar Paciente</span>
              </Button>
            </div>
            {selectedPatient && (
              <div className="mt-3 p-3 bg-accent/50 border border-border rounded-lg">
                <p className="font-semibold text-foreground">{selectedPatient.full_name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  <span>• Edad: {selectedPatient.age} años</span>
                  <span>• Teléfono: {selectedPatient.phone || "No especificado"}</span>
                  <span>• Género: {selectedPatient.gender || "No especificado"}</span>
                  {selectedPatient.allergies && (
                    <span className="text-destructive font-medium">• Alergias: {selectedPatient.allergies}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Signos Vitales */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Signos Vitales</h3>
              <span className="text-xs text-muted-foreground ml-auto">(Opcionales)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Temperatura */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    Temperatura (°C)
                  </div>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="36.5"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Frecuencia Cardíaca */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    Frecuencia Cardíaca (lpm)
                  </div>
                </label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  placeholder="72"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Frecuencia Respiratoria */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    Frecuencia Respiratoria (rpm)
                  </div>
                </label>
                <input
                  type="number"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  placeholder="16"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Presión Sistólica */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    Presión Sistólica (mmHg)
                  </div>
                </label>
                <input
                  type="number"
                  value={systolicPressure}
                  onChange={(e) => setSystolicPressure(e.target.value)}
                  placeholder="120"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Presión Diastólica */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    Presión Diastólica (mmHg)
                  </div>
                </label>
                <input
                  type="number"
                  value={diastolicPressure}
                  onChange={(e) => setDiastolicPressure(e.target.value)}
                  placeholder="80"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Saturación de Oxígeno */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-muted-foreground" />
                    Saturación O₂ (%)
                  </div>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={oxygenSaturation}
                  onChange={(e) => setOxygenSaturation(e.target.value)}
                  placeholder="98"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Glucosa en Sangre */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    Glucosa en Sangre (mg/dL)
                  </div>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bloodGlucose}
                  onChange={(e) => setBloodGlucose(e.target.value)}
                  placeholder="95.0"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Peso */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-muted-foreground" />
                    Peso (kg)
                  </div>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70.5"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Altura */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    Altura (m)
                  </div>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="1.75"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Prioridad en Sala de Espera
              </div>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Normal">Normal</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>

          {/* Botón de envío */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/waiting-room")}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {createPreConsultationMutation.isPending
                ? "Creando pre-consulta..."
                : addToWaitingRoomMutation.isPending
                  ? "Agregando a sala de espera..."
                  : "Registrar y Agregar a Sala de Espera"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Modal para agregar nuevo paciente */}
      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPatientCreated={handlePatientCreated}
        initialName={patientSearch}
      />
    </div>
  );
}
