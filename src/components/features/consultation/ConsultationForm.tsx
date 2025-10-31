import { useState, useEffect, useMemo } from "react";
import { useActiveConsultation, useChangeWaitingRoomStatus } from "@/hooks/useWaitingRoom";
import { useCreateConsultation, useUploadAttachment } from "@/hooks/useConsultations";
import { useUpdatePreConsultation } from "@/hooks/usePreConsultations";
import { useNavigate } from "@/hooks/useNavigate";
import { useAuthStore } from "@/stores/authStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Autocomplete from "@/components/ui/Autocomplete";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Modal";
import { User, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { handleError } from "@/lib/errorHandler";
import PatientInfoSection from "./PatientInfoSection";
import VitalSignsSection from "./VitalSignsSection";
import SymptomsAndDiagnosisSection from "./SymptomsAndDiagnosisSection";
import MedicationsSection, { type Medication } from "./MedicationsSection";
import AttachmentsSection from "./AttachmentsSection";

export default function ConsultationForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: consultation, isLoading } = useActiveConsultation();
  const changeStatusMutation = useChangeWaitingRoomStatus();
  const createConsultationMutation = useCreateConsultation();
  const updatePreConsultationMutation = useUpdatePreConsultation();
  const uploadAttachmentMutation = useUploadAttachment();

  // Determinar si se debe mostrar el campo POCUS
  const shouldShowPocusField = user?.username !== "doctora";

  // Determinar el tipo de registro
  const recordType = consultation?.pre_consultation?.record_type || "consultation";
  const isStudy = recordType === "study";

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

  // Memoizar sugerencias de diagnósticos para evitar re-cálculos innecesarios
  // Para estudios clínicos, no hay sugerencias predefinidas
  const diagnosisSuggestions = useMemo(() => {
    if (isStudy || !currentDiagnosis.trim()) return [];
    try {
      const { frequentDiagnoses } = require("@/data/diagnosis_frecuent");
      return frequentDiagnoses.filter((d: string) =>
        d.toLowerCase().includes(currentDiagnosis.toLowerCase())
      ).slice(0, 5);
    } catch (error) {
      console.error("Error loading diagnosis suggestions:", error);
      return [];
    }
  }, [currentDiagnosis, isStudy]);

  const addSymptom = () => {
    const trimmedSymptom = currentSymptom.trim();
    if (trimmedSymptom) {
      // Verificar si el síntoma ya existe (case-insensitive)
      const exists = symptoms.some(s => s.toLowerCase() === trimmedSymptom.toLowerCase());
      if (exists) {
        toast.error("Este síntoma ya ha sido agregado");
        return;
      }
      setSymptoms([...symptoms, trimmedSymptom]);
      setCurrentSymptom("");
    }
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const addDiagnosis = () => {
    const trimmedDiagnosis = currentDiagnosis.trim();
    if (trimmedDiagnosis) {
      // Verificar si el diagnóstico ya existe (case-insensitive)
      const exists = diagnoses.some(d => d.toLowerCase() === trimmedDiagnosis.toLowerCase());
      if (exists) {
        toast.error("Este diagnóstico ya ha sido agregado");
        return;
      }
      setDiagnoses([...diagnoses, trimmedDiagnosis]);
      setCurrentDiagnosis("");
    }
  };

  const removeDiagnosis = (index: number) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index));
  };

  const addMedication = () => {
    const trimmedName = currentMedication.name.trim();
    if (trimmedName) {
      // Verificar si el medicamento ya existe (case-insensitive, solo por nombre)
      const exists = medications.some(m => m.name.toLowerCase() === trimmedName.toLowerCase());
      if (exists) {
        toast.error("Este medicamento ya ha sido agregado");
        return;
      }
      setMedications([...medications, { ...currentMedication, name: trimmedName }]);
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
      } catch (error: unknown) {
        handleError(error, `Error al subir "${file.name}"`);
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
    const updateData: Partial<{
      temperature: number;
      heart_rate: number;
      respiratory_rate: number;
      systolic_pressure: number;
      diastolic_pressure: number;
      oxygen_saturation: number;
      blood_glucose: number;
      weight: number;
      height: number;
      current_medications: string;
    }> = {};

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

    // Obtener el tipo de registro de la pre-consulta
    const recordType = consultation.pre_consultation?.record_type || "consultation";

    // Validaciones según el tipo de registro
    if (recordType === "study") {
      // Para estudios clínicos, solo validar nombre del estudio
      if (diagnoses.length === 0) {
        toast.error("Debes agregar al menos el nombre de un estudio clínico");
        return;
      }
      if (!price || parseFloat(price) <= 0) {
        toast.error("Debes ingresar un precio válido");
        return;
      }
    } else {
      // Para consultas médicas, validar todos los campos
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
    }

    // Preparar datos para envío según el tipo
    const consultationData: any = recordType === "study"
      ? {
          patient_id: consultation.patient.id,
          pre_consultation_id: consultation.pre_consultation?.id,
          consultation_type: recordType,
          diagnoses: diagnoses,
          price: parseFloat(price),
        }
      : {
          patient_id: consultation.patient.id,
          pre_consultation_id: consultation.pre_consultation?.id,
          consultation_type: recordType,
          symptoms: symptoms,
          diagnoses: diagnoses,
          medications: medications,
          recommendations: recommendations.trim() || undefined,
          pocus_notes: pocusNotes.trim() || undefined,
          price: parseFloat(price),
        };

    // Crear la consulta y generar la receta automáticamente
    createConsultationMutation.mutate(consultationData, {
      onSuccess: async (response) => {
        // Extraer el consultation_id de la respuesta
        const consultationId = response.data?.id || response.data?.consultation_id;
        const prescriptionUrl = response.data?.prescription_download_url;

        if (!consultationId) {
          toast.error(`Error: No se recibió el ID ${recordType === "study" ? "del estudio" : "de la consulta"}`);
          return;
        }

        // Subir archivos adjuntos (si hay y no es estudio)
        if (attachedFiles.length > 0 && recordType !== "study") {
          await uploadAttachments(consultationId);
        }

        // Para estudios clínicos, no hay receta
        if (recordType === "study") {
          toast.success("Estudio clínico registrado exitosamente");
        } else {
          // Abrir la URL de la receta en una nueva pestaña si existe
          if (prescriptionUrl) {
            window.open(prescriptionUrl, '_blank');
            toast.success("Consulta completada y receta generada exitosamente");
          } else {
            toast.success("Consulta completada exitosamente");
          }
        }

        // Redirigir a la sala de espera después de completar
        navigate("/waiting-room");
      },
      onError: (error: unknown) => {
        // El error ya se muestra en el hook useCreateConsultation mediante handleError
        if (import.meta.env.DEV) {
          console.error("Error al crear consulta:", error);
        }
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

  return (
    <div className="space-y-6">
      {/* Información del Paciente */}
      <PatientInfoSection
        patient={consultation.patient}
        recordType={consultation.pre_consultation?.record_type}
      />

      {/* Preconsulta - Solo mostrar para consultas médicas */}
      {!isStudy && (
        <VitalSignsSection
          preConsultation={consultation.pre_consultation}
          recordType={consultation.pre_consultation?.record_type}
          vitals={editableVitals}
          currentMedications={currentMedications}
          onVitalsChange={setEditableVitals}
          onMedicationsChange={setCurrentMedications}
          onUpdate={handleUpdateVitalSigns}
          isUpdating={updatePreConsultationMutation.isPending}
          hasChanges={hasVitalSignsChanged()}
        />
      )}

      {/* Formulario de Consulta */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">
          {isStudy ? "Registro de Estudio Clínico" : "Consulta Médica"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isStudy ? (
            /* Para estudios clínicos, solo mostrar nombre del estudio */
            <div>
              <label className="block text-sm font-medium mb-2">Nombre del Estudio Clínico</label>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <Autocomplete
                    value={currentDiagnosis}
                    onChange={setCurrentDiagnosis}
                    onSelect={(value) => {
                      const exists = diagnoses.some(d => d.toLowerCase() === value.toLowerCase());
                      if (exists) {
                        toast.error("Este estudio ya ha sido agregado");
                        setCurrentDiagnosis("");
                        return;
                      }
                      setDiagnoses([...diagnoses, value]);
                      setCurrentDiagnosis("");
                    }}
                    suggestions={diagnosisSuggestions}
                    placeholder="Ej: Ultrasonido, Electrocardiograma, Rayos X..."
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
          ) : (
            <>
              {/* Síntomas y Diagnóstico */}
              <SymptomsAndDiagnosisSection
                symptoms={symptoms}
                currentSymptom={currentSymptom}
                onCurrentSymptomChange={setCurrentSymptom}
                onAddSymptom={addSymptom}
                onRemoveSymptom={removeSymptom}
                onSymptomsChange={setSymptoms}
                diagnoses={diagnoses}
                currentDiagnosis={currentDiagnosis}
                onCurrentDiagnosisChange={setCurrentDiagnosis}
                onAddDiagnosis={addDiagnosis}
                onRemoveDiagnosis={removeDiagnosis}
                onDiagnosesChange={setDiagnoses}
              />

              {/* Medicamentos */}
              <MedicationsSection
                medications={medications}
                currentMedication={currentMedication}
                onCurrentMedicationChange={setCurrentMedication}
                onAdd={addMedication}
                onRemove={removeMedication}
              />

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
              {shouldShowPocusField && (
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
              )}
            </>
          )}

          {/* Precio y Archivos Adjuntos */}
          <div className={`grid grid-cols-1 ${isStudy ? '' : 'md:grid-cols-2'} gap-6`}>
            {/* Precio */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {isStudy ? "Precio del Estudio" : "Precio de la Consulta"}
              </label>
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

            {/* Archivos Adjuntos - solo para consultas médicas */}
            {!isStudy && (
              <AttachmentsSection
                files={attachedFiles}
                onFilesChange={setAttachedFiles}
              />
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={createConsultationMutation.isPending}
            >
              {createConsultationMutation.isPending
                ? (isStudy ? "Registrando estudio..." : "Guardando consulta y generando receta...")
                : (isStudy ? "Registrar Estudio" : "Guardar Consulta")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowCancelModal(true)}
              disabled={createConsultationMutation.isPending}
            >
              {isStudy ? "Cancelar Estudio" : "Cancelar Consulta"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Modal de Cancelación */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isStudy ? "Cancelar Estudio" : "Cancelar Consulta"}</DialogTitle>
            <DialogDescription>
              {isStudy
                ? "¿Estás seguro de que deseas cancelar este estudio clínico?"
                : "¿Estás seguro de que deseas cancelar esta consulta?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              {isStudy ? "No, continuar estudio" : "No, continuar consulta"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelConsultation}
              disabled={changeStatusMutation.isPending}
            >
              {changeStatusMutation.isPending
                ? "Cancelando..."
                : (isStudy ? "Sí, cancelar estudio" : "Sí, cancelar consulta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
