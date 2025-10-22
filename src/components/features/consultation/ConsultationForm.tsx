import { useState, useMemo, useEffect } from "react";
import { useActiveConsultation, useChangeWaitingRoomStatus } from "@/hooks/useWaitingRoom";
import { useCreateConsultation, useGeneratePrescription, useUploadAttachment } from "@/hooks/useConsultations";
import { useUpdatePreConsultation } from "@/hooks/usePreConsultations";
import { useNavigate } from "@/hooks/useNavigate";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Modal";
import { User, Heart, Thermometer, Activity, Weight, Ruler, Droplet, X, Plus, Wind, Stethoscope, Upload, FileIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { frequentSymptoms } from "@/data/symp_frecuent";
import { frequentDiagnoses } from "@/data/diagnosis_frecuent";
import { frequentMedicaments } from "@/data/prescribed_medicaments";
import { frequentDosages } from "@/data/dosage_frecuent";
import { frequentRoutes } from "@/data/route_frecuent";
import { frequentFrequencies } from "@/data/frequency_frecuent";
import { frequentDurations } from "@/data/duration_frecuent";
import Autocomplete from "@/components/ui/Autocomplete";

interface Medication {
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
}

export default function ConsultationForm() {
  const navigate = useNavigate();
  const { data: consultation, isLoading } = useActiveConsultation();
  const changeStatusMutation = useChangeWaitingRoomStatus();
  const createConsultationMutation = useCreateConsultation();
  const generatePrescriptionMutation = useGeneratePrescription();
  const updatePreConsultationMutation = useUpdatePreConsultation();
  const uploadAttachmentMutation = useUploadAttachment();

  // Estados para signos vitales editables
  const [editableVitals, setEditableVitals] = useState({
    temperature: "",
    heart_rate: "",
    respiratory_rate: "",
    systolic_pressure: "",
    diastolic_pressure: "",
    oxygen_saturation: "",
    blood_glucose: "",
    weight: "",
    height: "",
  });

  const [currentMedications, setCurrentMedications] = useState("");

  // Estados para los campos de la consulta
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState("");
  const [diagnoses, setDiagnoses] = useState<string[]>([]);
  const [currentDiagnosis, setCurrentDiagnosis] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [currentMedication, setCurrentMedication] = useState<Medication>({
    name: "",
    dosage: "",
    route: "",
    frequency: "",
    duration: "",
  });
  const [recommendations, setRecommendations] = useState("");
  const [pocusNotes, setPocusNotes] = useState("");
  const [price, setPrice] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Filtrar sugerencias
  const symptomSuggestions = useMemo(() => {
    if (!currentSymptom.trim()) return [];
    return frequentSymptoms.filter(s =>
      s.toLowerCase().includes(currentSymptom.toLowerCase())
    ).slice(0, 5);
  }, [currentSymptom]);

  const diagnosisSuggestions = useMemo(() => {
    if (!currentDiagnosis.trim()) return [];
    return frequentDiagnoses.filter(d =>
      d.toLowerCase().includes(currentDiagnosis.toLowerCase())
    ).slice(0, 5);
  }, [currentDiagnosis]);

  const medicamentSuggestions = useMemo(() => {
    if (!currentMedication.name.trim()) return [];
    return frequentMedicaments.filter(m =>
      m.toLowerCase().includes(currentMedication.name.toLowerCase())
    ).slice(0, 5);
  }, [currentMedication.name]);

  const dosageSuggestions = useMemo(() => {
    if (!currentMedication.dosage.trim()) return [];
    return frequentDosages.filter(d =>
      d.toLowerCase().includes(currentMedication.dosage.toLowerCase())
    ).slice(0, 5);
  }, [currentMedication.dosage]);

  const routeSuggestions = useMemo(() => {
    if (!currentMedication.route.trim()) return [];
    return frequentRoutes.filter(r =>
      r.toLowerCase().includes(currentMedication.route.toLowerCase())
    ).slice(0, 5);
  }, [currentMedication.route]);

  const frequencySuggestions = useMemo(() => {
    if (!currentMedication.frequency.trim()) return [];
    return frequentFrequencies.filter(f =>
      f.toLowerCase().includes(currentMedication.frequency.toLowerCase())
    ).slice(0, 5);
  }, [currentMedication.frequency]);

  const durationSuggestions = useMemo(() => {
    if (!currentMedication.duration.trim()) return [];
    return frequentDurations.filter(d =>
      d.toLowerCase().includes(currentMedication.duration.toLowerCase())
    ).slice(0, 5);
  }, [currentMedication.duration]);

  const addSymptom = () => {
    if (currentSymptom.trim()) {
      setSymptoms([...symptoms, currentSymptom.trim()]);
      setCurrentSymptom("");
    }
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const addDiagnosis = () => {
    if (currentDiagnosis.trim()) {
      setDiagnoses([...diagnoses, currentDiagnosis.trim()]);
      setCurrentDiagnosis("");
    }
  };

  const removeDiagnosis = (index: number) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index));
  };

  const addMedication = () => {
    if (currentMedication.name.trim()) {
      setMedications([...medications, { ...currentMedication }]);
      setCurrentMedication({
        name: "",
        dosage: "",
        route: "",
        frequency: "",
        duration: "",
      });
    }
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const maxSize = 20 * 1024 * 1024; // 20MB en bytes

      // Validar tamaño de cada archivo
      const validFiles = newFiles.filter(file => {
        if (file.size > maxSize) {
          toast.error(`El archivo "${file.name}" excede el tamaño máximo de 20MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setAttachedFiles([...attachedFiles, ...validFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Función para subir archivos adjuntos
  const uploadAttachments = async (consultationId: string) => {
    if (attachedFiles.length === 0) return;

    const uploadPromises = attachedFiles.map(async (file) => {
      try {
        await uploadAttachmentMutation.mutateAsync({
          consultation_id: consultationId,
          file: file,
        });
        toast.success(`Archivo "${file.name}" subido exitosamente`);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Error desconocido";
        toast.error(`Error al subir "${file.name}": ${errorMessage}`);
      }
    });

    // Ejecutar todas las subidas en paralelo
    await Promise.all(uploadPromises);
  };

  // Inicializar signos vitales editables cuando se carga la consulta
  useEffect(() => {
    if (consultation?.pre_consultation) {
      setEditableVitals({
        temperature: consultation.pre_consultation.temperature?.toString() || "",
        heart_rate: consultation.pre_consultation.heart_rate?.toString() || "",
        respiratory_rate: consultation.pre_consultation.respiratory_rate?.toString() || "",
        systolic_pressure: consultation.pre_consultation.systolic_pressure?.toString() || "",
        diastolic_pressure: consultation.pre_consultation.diastolic_pressure?.toString() || "",
        oxygen_saturation: consultation.pre_consultation.oxygen_saturation?.toString() || "",
        blood_glucose: consultation.pre_consultation.blood_glucose?.toString() || "",
        weight: consultation.pre_consultation.weight?.toString() || "",
        height: consultation.pre_consultation.height?.toString() || "",
      });
      setCurrentMedications(consultation.pre_consultation.current_medications || "");
    }
  }, [consultation]);

  // Función para verificar si los signos vitales han cambiado
  const hasVitalSignsChanged = (): boolean => {
    if (!consultation?.pre_consultation) return false;

    const original = consultation.pre_consultation;

    return (
      editableVitals.temperature !== (original.temperature?.toString() || "") ||
      editableVitals.heart_rate !== (original.heart_rate?.toString() || "") ||
      editableVitals.respiratory_rate !== (original.respiratory_rate?.toString() || "") ||
      editableVitals.systolic_pressure !== (original.systolic_pressure?.toString() || "") ||
      editableVitals.diastolic_pressure !== (original.diastolic_pressure?.toString() || "") ||
      editableVitals.oxygen_saturation !== (original.oxygen_saturation?.toString() || "") ||
      editableVitals.blood_glucose !== (original.blood_glucose?.toString() || "") ||
      editableVitals.weight !== (original.weight?.toString() || "") ||
      editableVitals.height !== (original.height?.toString() || "") ||
      currentMedications !== (original.current_medications || "")
    );
  };

  const handleUpdateVitalSigns = () => {
    if (!consultation?.pre_consultation?.id) {
      toast.error("No hay una pre-consulta asociada para actualizar");
      return;
    }

    // Preparar solo los campos que tienen valor
    const updateData: any = {};
    if (editableVitals.temperature) updateData.temperature = parseFloat(editableVitals.temperature);
    if (editableVitals.heart_rate) updateData.heart_rate = parseInt(editableVitals.heart_rate);
    if (editableVitals.respiratory_rate) updateData.respiratory_rate = parseInt(editableVitals.respiratory_rate);
    if (editableVitals.systolic_pressure) updateData.systolic_pressure = parseInt(editableVitals.systolic_pressure);
    if (editableVitals.diastolic_pressure) updateData.diastolic_pressure = parseInt(editableVitals.diastolic_pressure);
    if (editableVitals.oxygen_saturation) updateData.oxygen_saturation = parseFloat(editableVitals.oxygen_saturation);
    if (editableVitals.blood_glucose) updateData.blood_glucose = parseInt(editableVitals.blood_glucose);
    if (editableVitals.weight) updateData.weight = parseFloat(editableVitals.weight);
    if (editableVitals.height) updateData.height = parseFloat(editableVitals.height);
    if (currentMedications.trim()) updateData.current_medications = currentMedications.trim();

    updatePreConsultationMutation.mutate({
      id: consultation.pre_consultation.id,
      data: updateData,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!consultation) return;

    // Validaciones
    if (symptoms.length === 0) {
      toast.error("Debes agregar al menos un síntoma");
      return;
    }
    if (diagnoses.length === 0) {
      toast.error("Debes agregar al menos un diagnóstico");
      return;
    }
    if (medications.length === 0) {
      toast.error("Debes agregar al menos un medicamento");
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error("Debes ingresar un precio válido");
      return;
    }

    // Preparar datos para envío
    // Concatenar información completa de medicamentos
    const prescribedMedicationsStrings = medications.map(med => {
      const parts = [med.name];
      if (med.dosage) parts.push(med.dosage);
      if (med.route) parts.push(`Vía ${med.route}`);
      if (med.frequency) parts.push(med.frequency);
      if (med.duration) parts.push(`Durante ${med.duration}`);
      return parts.join(' ');
    });

    const consultationData = {
      patient_id: consultation.patient.id,
      pre_consultation_id: consultation.pre_consultation?.id,
      symptoms: symptoms,
      diagnoses: diagnoses,
      prescribed_medications: prescribedMedicationsStrings,
      recommendations: recommendations.trim() || undefined,
      pocus_notes: pocusNotes.trim() || undefined,
      price: parseFloat(price),
    };

    // Paso 1: Crear la consulta
    // IMPORTANTE: POST /consultations automáticamente cambia el estado a "Completado"
    // No necesitamos llamar a PATCH /waiting-room/{id}/status
    createConsultationMutation.mutate(consultationData, {
      onSuccess: async (response) => {
        // Extraer el consultation_id de la respuesta
        const consultationId = response.data?.id || response.data?.consultation_id;

        if (!consultationId) {
          toast.error("Error: No se recibió el ID de la consulta");
          return;
        }

        // Paso 2: Subir archivos adjuntos (si hay)
        if (attachedFiles.length > 0) {
          await uploadAttachments(consultationId);
        }

        // Paso 3: Generar la receta con el consultation_id
        // (El backend ya cambió el estado a "Completado" automáticamente)
        const prescriptionData = {
          consultation_id: consultationId,
          medications: medications,
        };

        generatePrescriptionMutation.mutate(prescriptionData, {
          onSuccess: (prescriptionResponse) => {
            // Paso 4: Abrir la URL de la receta en una nueva pestaña
            const prescriptionUrl = prescriptionResponse.data?.download_url;

            if (prescriptionUrl) {
              window.open(prescriptionUrl, '_blank');
              toast.success("Consulta completada y receta generada exitosamente");
            } else {
              toast.success("Consulta completada exitosamente");
            }

            // Redirigir a la sala de espera después de completar
            navigate("/waiting-room");
          },
          onError: () => {
            toast.warning("Consulta completada, pero hubo un error al generar la receta");
            // Redirigir incluso si falla la receta (la consulta ya está guardada)
            navigate("/waiting-room");
          },
        });
      },
    });
  };

  const handleCancelConsultation = () => {
    if (consultation) {
      changeStatusMutation.mutate(
        { id: consultation.id, status: "Cancelado" },
        {
          onSuccess: () => {
            setShowCancelModal(false);
            navigate("/waiting-room");
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground mb-2">
          No hay consulta activa
        </p>
        <p className="text-sm text-muted-foreground">
          Selecciona un paciente de la sala de espera para iniciar una consulta
        </p>
      </div>
    );
  }

  const { patient, pre_consultation, added_by, arrival_time, priority, notes } = consultation;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Información del Paciente */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Información del Paciente</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
            <p className="text-base font-semibold mt-1.5">{patient.full_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Edad</label>
            <p className="text-base font-semibold mt-1.5">{patient.age} años</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Género</label>
            <p className="text-base font-semibold mt-1.5">{patient.gender || "No especificado"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
            <p className="text-base font-semibold mt-1.5">{patient.phone || "No especificado"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Hora de Llegada</label>
            <p className="text-base font-semibold mt-1.5">{formatTime(arrival_time)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Alergias</label>
            <p className="text-base font-semibold mt-1.5 text-red-600">{patient.allergies || "Ninguna"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Religión</label>
            <p className="text-base font-semibold mt-1.5">{patient.religion || "No especificado"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Ocupación</label>
            <p className="text-base font-semibold mt-1.5">{patient.occupation || "No especificado"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Originario de</label>
            <p className="text-base font-semibold mt-1.5">{patient.native_of || "No especificado"}</p>
          </div>
          <div className="md:col-span-3">
            <label className="text-sm font-medium text-muted-foreground">Antecedentes Personales</label>
            <p className="text-base mt-1.5 whitespace-pre-wrap">{patient.personal_background || "No registrado"}</p>
          </div>
          <div className="md:col-span-3">
            <label className="text-sm font-medium text-muted-foreground">Antecedentes Ginecoobstétricos</label>
            <p className="text-base mt-1.5 whitespace-pre-wrap">{patient.obstetric_gynecological_background || "No registrado"}</p>
          </div>
        </div>
      </Card>

      {/* Preconsulta */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Preconsulta</h2>
            {pre_consultation?.recorded_by && (
              <span className="text-sm text-muted-foreground ml-2">
                • Registrado por: <span className="font-medium text-foreground">{pre_consultation.recorded_by.name}</span>
              </span>
            )}
          </div>
          {consultation?.pre_consultation?.id && (
            <Button
              type="button"
              onClick={handleUpdateVitalSigns}
              disabled={updatePreConsultationMutation.isPending || !hasVitalSignsChanged()}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              {updatePreConsultationMutation.isPending ? "Actualizando..." : "Actualizar Preconsulta"}
            </Button>
          )}
        </div>

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
              value={editableVitals.temperature}
              onChange={(e) => setEditableVitals({ ...editableVitals, temperature: e.target.value })}
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
              value={editableVitals.heart_rate}
              onChange={(e) => setEditableVitals({ ...editableVitals, heart_rate: e.target.value })}
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
              value={editableVitals.respiratory_rate}
              onChange={(e) => setEditableVitals({ ...editableVitals, respiratory_rate: e.target.value })}
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
              value={editableVitals.systolic_pressure}
              onChange={(e) => setEditableVitals({ ...editableVitals, systolic_pressure: e.target.value })}
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
              value={editableVitals.diastolic_pressure}
              onChange={(e) => setEditableVitals({ ...editableVitals, diastolic_pressure: e.target.value })}
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
              value={editableVitals.oxygen_saturation}
              onChange={(e) => setEditableVitals({ ...editableVitals, oxygen_saturation: e.target.value })}
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
              value={editableVitals.blood_glucose}
              onChange={(e) => setEditableVitals({ ...editableVitals, blood_glucose: e.target.value })}
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
              value={editableVitals.weight}
              onChange={(e) => setEditableVitals({ ...editableVitals, weight: e.target.value })}
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
              value={editableVitals.height}
              onChange={(e) => setEditableVitals({ ...editableVitals, height: e.target.value })}
              placeholder="1.75"
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* IMC (calculado) */}
          {pre_consultation?.imc && (
            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-500" />
                  IMC (calculado)
                </div>
              </label>
              <div className="w-full px-3 py-2 border border-input rounded-md bg-muted">
                <p className="text-base font-semibold">{pre_consultation.imc.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Medicamentos Actuales */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Medicamentos Actuales
          </label>
          <textarea
            value={currentMedications}
            onChange={(e) => setCurrentMedications(e.target.value)}
            placeholder="Medicamentos que el paciente toma actualmente..."
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
      </Card>

      {/* Formulario de Consulta */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Consulta Médica</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Síntomas */}
          <div>
            <label className="block text-sm font-medium mb-2">Síntomas</label>
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <Autocomplete
                  value={currentSymptom}
                  onChange={setCurrentSymptom}
                  onSelect={(value) => {
                    setSymptoms([...symptoms, value]);
                    setCurrentSymptom("");
                  }}
                  suggestions={symptomSuggestions}
                  placeholder="Agregar síntoma..."
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button type="button" onClick={addSymptom} size="sm" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  <span>{symptom}</span>
                  <button
                    type="button"
                    onClick={() => removeSymptom(index)}
                    className="hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="block text-sm font-medium mb-2">Diagnóstico</label>
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <Autocomplete
                  value={currentDiagnosis}
                  onChange={setCurrentDiagnosis}
                  onSelect={(value) => {
                    setDiagnoses([...diagnoses, value]);
                    setCurrentDiagnosis("");
                  }}
                  suggestions={diagnosisSuggestions}
                  placeholder="Agregar diagnóstico..."
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button type="button" onClick={addDiagnosis} size="sm" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {diagnoses.map((diagnosis, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm"
                >
                  <span>{diagnosis}</span>
                  <button
                    type="button"
                    onClick={() => removeDiagnosis(index)}
                    className="hover:text-success"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Medicamentos */}
          <div>
            <label className="block text-sm font-medium mb-2">Medicamentos Recetados</label>
            <div className="space-y-3 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Autocomplete
                  value={currentMedication.name}
                  onChange={(value) => setCurrentMedication({ ...currentMedication, name: value })}
                  onSelect={(value) => setCurrentMedication({ ...currentMedication, name: value })}
                  suggestions={medicamentSuggestions}
                  placeholder="Nombre del medicamento..."
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Autocomplete
                  value={currentMedication.dosage}
                  onChange={(value) => setCurrentMedication({ ...currentMedication, dosage: value })}
                  onSelect={(value) => setCurrentMedication({ ...currentMedication, dosage: value })}
                  suggestions={dosageSuggestions}
                  placeholder="Dosis (ej: 500mg)..."
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Autocomplete
                  value={currentMedication.route}
                  onChange={(value) => setCurrentMedication({ ...currentMedication, route: value })}
                  onSelect={(value) => setCurrentMedication({ ...currentMedication, route: value })}
                  suggestions={routeSuggestions}
                  placeholder="Vía (ej: Oral)..."
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Autocomplete
                  value={currentMedication.frequency}
                  onChange={(value) => setCurrentMedication({ ...currentMedication, frequency: value })}
                  onSelect={(value) => setCurrentMedication({ ...currentMedication, frequency: value })}
                  suggestions={frequencySuggestions}
                  placeholder="Frecuencia (ej: Cada 8 horas)..."
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <Autocomplete
                    value={currentMedication.duration}
                    onChange={(value) => setCurrentMedication({ ...currentMedication, duration: value })}
                    onSelect={(value) => setCurrentMedication({ ...currentMedication, duration: value })}
                    suggestions={durationSuggestions}
                    placeholder="Duración (ej: 7 días)..."
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button type="button" onClick={addMedication} size="sm" className="shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {medications.map((medication, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 bg-accent/50 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{medication.name}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                      {medication.dosage && <span>• Dosis: {medication.dosage}</span>}
                      {medication.route && <span>• Vía: {medication.route}</span>}
                      {medication.frequency && <span>• Frecuencia: {medication.frequency}</span>}
                      {medication.duration && <span>• Duración: {medication.duration}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="ml-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recomendaciones */}
          <div>
            <label className="block text-sm font-medium mb-2">Recomendaciones (Opcional)</label>
            <textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Recomendaciones para el paciente..."
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Notas POCUS */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Notas POCUS (Opcional)
            </label>
            <textarea
              value={pocusNotes}
              onChange={(e) => setPocusNotes(e.target.value)}
              placeholder="POCUS cardíaco, pulmonar, abdominal, etc..."
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Precio y Archivos Adjuntos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Precio */}
            <div>
              <label className="block text-sm font-medium mb-2">Precio de la Consulta</label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-40 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Archivos Adjuntos */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" />
                    Archivos Adjuntos
                  </div>
                  <span className="text-xs text-muted-foreground font-normal">
                    PDF, JPG, JPEG, PNG, DOC, DOCX (máx. 20MB)
                  </span>
                </div>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-input rounded-md hover:border-primary cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Seleccionar archivos
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Lista de archivos adjuntos */}
          {attachedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Archivos seleccionados:</p>
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-3 p-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded transition-colors"
                    title="Eliminar archivo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={createConsultationMutation.isPending || generatePrescriptionMutation.isPending}
            >
              {createConsultationMutation.isPending
                ? "Guardando consulta..."
                : generatePrescriptionMutation.isPending
                  ? "Generando receta..."
                  : "Guardar Consulta"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowCancelModal(true)}
              disabled={createConsultationMutation.isPending || generatePrescriptionMutation.isPending}
            >
              Cancelar Consulta
            </Button>
          </div>
        </form>
      </Card>

      {/* Modal de Cancelación */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Consulta</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta consulta?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              No, continuar consulta
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelConsultation}
              disabled={changeStatusMutation.isPending}
            >
              {changeStatusMutation.isPending ? "Cancelando..." : "Sí, cancelar consulta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
