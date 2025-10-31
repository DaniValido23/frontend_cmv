import { useState, useMemo, useEffect } from "react";
import { useAllPatients, usePatient } from "@/hooks/usePatients";
import { useRegisterAndQueuePatient } from "@/hooks/usePreConsultations";
import { useDoctors } from "@/hooks/useUsers";
import { useNavigate } from "@/hooks/useNavigate";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Autocomplete from "@/components/ui/Autocomplete";
import AddPatientModal from "./AddPatientModal";
import { User, Heart, Thermometer, Activity, Weight, Ruler, Droplet, Clock, UserPlus, Wind, Stethoscope, Pill, UserCog, FileText, Microscope } from "lucide-react";
import { toast } from "sonner";
import type { Patient, RecordType } from "@/types/models";

export default function PreConsultationForm() {
  const navigate = useNavigate();
  const registerAndQueueMutation = useRegisterAndQueuePatient();

  // Estados del formulario
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [recordType, setRecordType] = useState<RecordType>("consultation"); // Nuevo: tipo de registro

  // Cargar lista ligera de pacientes (solo id y full_name)
  const { data: patientsList = [], isLoading: loadingPatients } = useAllPatients();

  // Cargar datos completos del paciente seleccionado
  const { data: selectedPatient, isLoading: loadingPatientDetails } = usePatient(selectedPatientId);

  // Cargar lista de doctores
  const { data: doctorsList = [], isLoading: loadingDoctors } = useDoctors();

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

  // Medicamentos actuales
  const [currentMedications, setCurrentMedications] = useState("");

  // Prioridad para sala de espera
  const [priority, setPriority] = useState("Normal");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrar pacientes para autocomplete (búsqueda local en la lista ligera)
  const patientSuggestions = useMemo(() => {
    if (!patientSearch.trim() || loadingPatients) return [];
    return patientsList
      .filter(p =>
        p.full_name.toLowerCase().includes(patientSearch.toLowerCase())
      )
      .slice(0, 8)
      .map(p => p.full_name);
  }, [patientSearch, patientsList, loadingPatients]);

  const handlePatientSelect = (patientName: string) => {
    // Buscar el paciente en la lista ligera para obtener su ID
    const patient = patientsList.find(p => p.full_name === patientName);
    if (patient) {
      setSelectedPatientId(patient.id); // Esto dispara usePatient(id) para cargar datos completos
      setPatientSearch(patientName);
    }
  };

  const handlePatientCreated = (newPatient: Patient) => {
    // Cuando se crea un paciente nuevo, establecer su ID y nombre
    setSelectedPatientId(newPatient.id);
    setPatientSearch(newPatient.full_name);
    // No es necesario setear selectedPatient porque usePatient(id) lo cargará automáticamente
  };

  // Formateo automático para temperatura (XX.X)
  const handleTwoDigitDecimalInput = (
    value: string,
    setter: (value: string) => void
  ) => {
    // Remover cualquier cosa que no sea número
    const cleaned = value.replace(/[^\d]/g, '');

    if (cleaned.length === 0) {
      setter('');
      return;
    }

    // Limitar a 3 dígitos (XX.X)
    const limited = cleaned.slice(0, 3);

    // Formatear con punto decimal automático
    if (limited.length <= 2) {
      setter(limited);
    } else {
      // Insertar punto después de 2 dígitos: XX.X
      setter(`${limited.slice(0, 2)}.${limited.slice(2)}`);
    }
  };

  // Formateo automático para peso (XXX.X)
  const handleWeightInput = (value: string) => {
    // Remover cualquier cosa que no sea número
    const cleaned = value.replace(/[^\d]/g, '');

    if (cleaned.length === 0) {
      setWeight('');
      return;
    }

    // Limitar a 4 dígitos (XXX.X)
    const limited = cleaned.slice(0, 4);

    // Formatear con punto decimal automático
    if (limited.length <= 3) {
      setWeight(limited);
    } else {
      // Insertar punto después de 3 dígitos: XXX.X
      setWeight(`${limited.slice(0, 3)}.${limited.slice(3)}`);
    }
  };

  // Formateo automático para altura (X.XX)
  const handleHeightInput = (value: string) => {
    // Remover cualquier cosa que no sea número
    const cleaned = value.replace(/[^\d]/g, '');

    if (cleaned.length === 0) {
      setHeight('');
      return;
    }

    // Limitar a 3 dígitos (X.XX)
    const limited = cleaned.slice(0, 3);

    // Formatear con punto decimal automático
    if (limited.length === 1) {
      setHeight(limited);
    } else {
      // Insertar punto después de 1 dígito: X.XX
      setHeight(`${limited.slice(0, 1)}.${limited.slice(1)}`);
    }
  };

  const validateVitalSigns = () => {
    const errors: string[] = [];

    // Validar temperatura (rango: 35.0 - 42.0 °C)
    if (temperature) {
      const temp = parseFloat(temperature);
      if (isNaN(temp)) {
        errors.push("Temperatura debe ser un número válido");
      } else if (temp < 35.0 || temp > 42.0) {
        errors.push("Temperatura fuera de rango (35.0 - 42.0 °C)");
      }
    }

    // Validar frecuencia cardíaca (rango: 30 - 250 lpm)
    if (heartRate) {
      const hr = parseInt(heartRate);
      if (isNaN(hr)) {
        errors.push("Frecuencia cardíaca debe ser un número entero");
      } else if (hr < 30 || hr > 250) {
        errors.push("Frecuencia cardíaca fuera de rango (30 - 250 lpm)");
      }
    }

    // Validar frecuencia respiratoria (rango: 8 - 60 rpm)
    if (respiratoryRate) {
      const rr = parseInt(respiratoryRate);
      if (isNaN(rr)) {
        errors.push("Frecuencia respiratoria debe ser un número entero");
      } else if (rr < 8 || rr > 60) {
        errors.push("Frecuencia respiratoria fuera de rango (8 - 60 rpm)");
      }
    }

    // Validar presión sistólica (rango: 70 - 250 mmHg)
    if (systolicPressure) {
      const sys = parseInt(systolicPressure);
      if (isNaN(sys)) {
        errors.push("Presión sistólica debe ser un número entero");
      } else if (sys < 70 || sys > 250) {
        errors.push("Presión sistólica fuera de rango (70 - 250 mmHg)");
      }
    }

    // Validar presión diastólica (rango: 40 - 150 mmHg)
    if (diastolicPressure) {
      const dia = parseInt(diastolicPressure);
      if (isNaN(dia)) {
        errors.push("Presión diastólica debe ser un número entero");
      } else if (dia < 40 || dia > 150) {
        errors.push("Presión diastólica fuera de rango (40 - 150 mmHg)");
      }
    }

    // Validar coherencia de presiones
    if (systolicPressure && diastolicPressure) {
      const sys = parseInt(systolicPressure);
      const dia = parseInt(diastolicPressure);
      if (!isNaN(sys) && !isNaN(dia) && sys <= dia) {
        errors.push("Presión sistólica debe ser mayor que la diastólica");
      }
    }

    // Validar saturación de oxígeno (rango: 70 - 100%)
    if (oxygenSaturation) {
      const sat = parseFloat(oxygenSaturation);
      if (isNaN(sat)) {
        errors.push("Saturación de oxígeno debe ser un número válido");
      } else if (sat < 70 || sat > 100) {
        errors.push("Saturación de oxígeno fuera de rango (70 - 100%)");
      }
    }

    // Validar glucosa (rango: 20 - 600 mg/dL)
    if (bloodGlucose) {
      const glucose = parseInt(bloodGlucose);
      if (isNaN(glucose)) {
        errors.push("Glucosa debe ser un número entero");
      } else if (glucose < 20 || glucose > 600) {
        errors.push("Glucosa fuera de rango (20 - 600 mg/dL)");
      }
    }

    // Validar peso (rango: 0.5 - 500 kg)
    if (weight) {
      const w = parseFloat(weight);
      if (isNaN(w)) {
        errors.push("Peso debe ser un número válido");
      } else if (w < 0.5 || w > 500) {
        errors.push("Peso fuera de rango (0.5 - 500 kg)");
      }
    }

    // Validar altura (rango: 0.3 - 3.0 m)
    if (height) {
      const h = parseFloat(height);
      if (isNaN(h)) {
        errors.push("Altura debe ser un número válido");
      } else if (h < 0.3 || h > 3.0) {
        errors.push("Altura fuera de rango (0.3 - 3.0 m)");
      }
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación 1: Paciente seleccionado
    if (!selectedPatientId) {
      toast.error("Debes seleccionar un paciente");
      return;
    }

    // Validación 2: Doctor seleccionado
    if (!selectedDoctorId) {
      toast.error("Debes seleccionar un doctor");
      return;
    }

    // Validación 3: Rangos de signos vitales
    const validationErrors = validateVitalSigns();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    // Validación 4: Según tipo de registro
    const hasAnyVitalSign = temperature || heartRate || respiratoryRate ||
      systolicPressure || diastolicPressure || oxygenSaturation ||
      bloodGlucose || weight || height;

    if (recordType === "consultation" && !hasAnyVitalSign) {
      toast.error("Para consultas, debes ingresar al menos un signo vital");
      return;
    }

    // Preparar datos consolidados (pre-consulta + sala de espera)
    const consolidatedData = {
      patient_id: selectedPatientId,
      doctor_id: selectedDoctorId,
      record_type: recordType, // Nuevo campo
      temperature: recordType === "consultation" && temperature ? parseFloat(temperature) : undefined,
      heart_rate: recordType === "consultation" && heartRate ? parseInt(heartRate) : undefined,
      respiratory_rate: recordType === "consultation" && respiratoryRate ? parseInt(respiratoryRate) : undefined,
      systolic_pressure: recordType === "consultation" && systolicPressure ? parseInt(systolicPressure) : undefined,
      diastolic_pressure: recordType === "consultation" && diastolicPressure ? parseInt(diastolicPressure) : undefined,
      oxygen_saturation: recordType === "consultation" && oxygenSaturation ? parseFloat(oxygenSaturation) : undefined,
      blood_glucose: recordType === "consultation" && bloodGlucose ? parseInt(bloodGlucose) : undefined,
      weight: recordType === "consultation" && weight ? parseFloat(weight) : undefined,
      height: recordType === "consultation" && height ? parseFloat(height) : undefined,
      current_medications: currentMedications.trim() || undefined,
      priority: priority as "Normal" | "Urgente",
    };

    // Llamar al endpoint consolidado (1 sola petición)
    registerAndQueueMutation.mutate(consolidatedData, {
      onSuccess: () => {
        // Limpiar el formulario después de registro exitoso
        setSelectedPatientId("");
        setSelectedDoctorId("");
        setPatientSearch("");
        setRecordType("consultation"); // Resetear a consulta por defecto
        setTemperature("");
        setHeartRate("");
        setRespiratoryRate("");
        setSystolicPressure("");
        setDiastolicPressure("");
        setOxygenSaturation("");
        setBloodGlucose("");
        setWeight("");
        setHeight("");
        setCurrentMedications("");
        setPriority("Normal");
      },
    });
  };

  const isSubmitting = registerAndQueueMutation.isPending;

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
                Paciente <span className="text-destructive">*</span>
              </div>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Autocomplete
                value={patientSearch}
                onChange={setPatientSearch}
                onSelect={handlePatientSelect}
                suggestions={patientSuggestions}
                placeholder="Buscar paciente por nombre..."
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
            {selectedPatientId && (
              <div className="mt-3 p-3 bg-accent/50 border border-border rounded-lg">
                {loadingPatientDetails ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Cargando datos del paciente...</span>
                  </div>
                ) : selectedPatient ? (
                  <>
                    <p className="font-semibold text-foreground">{selectedPatient.full_name}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                      <span>• Edad: {selectedPatient.age} años</span>
                      <span>• Teléfono: {selectedPatient.phone || "No especificado"}</span>
                      <span>• Género: {selectedPatient.gender || "No especificado"}</span>
                      {selectedPatient.allergies && (
                        <span className="text-destructive font-medium">• Alergias: {selectedPatient.allergies}</span>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>

          {/* Selección de Doctor */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4 text-primary" />
                Doctor que Atenderá <span className="text-destructive">*</span>
              </div>
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={loadingDoctors}
            >
              <option value="">Seleccionar doctor...</option>
              {doctorsList.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
            {loadingDoctors && (
              <p className="text-xs text-muted-foreground mt-1">Cargando doctores...</p>
            )}
          </div>

          {/* Tipo de Registro */}
          <div>
            <label className="block text-sm font-medium mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Tipo de Registro <span className="text-destructive">*</span>
              </div>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opción: Consulta Médica */}
              <button
                type="button"
                onClick={() => setRecordType("consultation")}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  recordType === "consultation"
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border hover:border-primary/50 bg-background"
                }`}
              >
                <Stethoscope className={`h-6 w-6 ${recordType === "consultation" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <p className={`font-semibold ${recordType === "consultation" ? "text-primary" : "text-foreground"}`}>
                    Consulta Médica
                  </p>
                </div>
              </button>

              {/* Opción: Estudio Clínico */}
              <button
                type="button"
                onClick={() => setRecordType("study")}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  recordType === "study"
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border hover:border-primary/50 bg-background"
                }`}
              >
                <Microscope className={`h-6 w-6 ${recordType === "study" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <p className={`font-semibold ${recordType === "study" ? "text-primary" : "text-foreground"}`}>
                    Estudio Clínico
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Signos Vitales - Solo visible para consultas */}
          {recordType === "consultation" && (
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
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    Temperatura (°C)
                  </div>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={temperature}
                  onChange={(e) => handleTwoDigitDecimalInput(e.target.value, setTemperature)}
                  placeholder="37.5"
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
                    <Wind className="h-4 w-4 text-cyan-500" />
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
                    <Activity className="h-4 w-4 text-red-500" />
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
                    <Activity className="h-4 w-4 text-red-500" />
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
                    <Droplet className="h-4 w-4 text-blue-500" />
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
                    <Stethoscope className="h-4 w-4 text-amber-500" />
                    Glucosa en Sangre (mg/dL)
                  </div>
                </label>
                <input
                  type="number"
                  step="1"
                  value={bloodGlucose}
                  onChange={(e) => setBloodGlucose(e.target.value)}
                  placeholder="95"
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
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => handleWeightInput(e.target.value)}
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
                  type="text"
                  inputMode="decimal"
                  value={height}
                  onChange={(e) => handleHeightInput(e.target.value)}
                  placeholder="1.75"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          )}

          {/* Medicamentos Actuales - Solo visible para consultas */}
          {recordType === "consultation" && (
          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-muted-foreground" />
                Medicamentos Actuales
              </div>
            </label>
            <span className="text-xs text-muted-foreground mb-2 block">
              (Opcional) Medicamentos que el paciente está tomando actualmente
            </span>
            <textarea
              value={currentMedications}
              onChange={(e) => setCurrentMedications(e.target.value)}
              placeholder="Ej: Paracetamol 500mg cada 8 horas, Metformina 850mg..."
              rows={3}
              maxLength={5000}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-muted-foreground">
                {currentMedications.length}/5000
              </span>
            </div>
          </div>
          )}

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
              {isSubmitting
                ? "Registrando paciente..."
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
