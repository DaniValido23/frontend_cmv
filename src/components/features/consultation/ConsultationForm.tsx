import { useState, useEffect, useMemo } from "react";
import { useActiveConsultation, useInProgressConsultations, useChangeWaitingRoomStatus } from "@/hooks/useWaitingRoom";
import { useCreateConsultation, useUploadAttachment } from "@/hooks/useConsultations";
import { useUpdatePreConsultation } from "@/hooks/usePreConsultations";
import { useStudyCategories } from "@/hooks/useStudyCategories";
import { useNavigate } from "@/hooks/useNavigate";
import { useAuthStore } from "@/stores/authStore";
import { saveDraft, getDraft, deleteDraft } from "@/stores/consultationDraftStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Autocomplete from "@/components/ui/Autocomplete";
import DateTimePicker from "@/components/ui/DateTimePicker";
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

interface ConsultationFormProps {
  selectedConsultationId: string;
}

export default function ConsultationForm({ selectedConsultationId }: ConsultationFormProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: inProgressConsultations, isLoading } = useInProgressConsultations();
  const changeStatusMutation = useChangeWaitingRoomStatus();
  const createConsultationMutation = useCreateConsultation();
  const updatePreConsultationMutation = useUpdatePreConsultation();
  const uploadAttachmentMutation = useUploadAttachment();
  const { data: studyCategories } = useStudyCategories();

  // Obtener la consulta seleccionada de la lista
  const consultation = useMemo(() => {
    return inProgressConsultations?.find(c => c.id === selectedConsultationId) || null;
  }, [inProgressConsultations, selectedConsultationId]);

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
  const [appointment, setAppointment] = useState("");
  const [price, setPrice] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [studyCategoryId, setStudyCategoryId] = useState<string>("");

  // Nuevos estados para el sistema de citas
  const [createAppointment, setCreateAppointment] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [appointmentTitle, setAppointmentTitle] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");

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

  // ==================== FUNCIONES DE CACHÉ ====================

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

  // Función para obtener datos actuales del formulario
  const getCurrentFormData = () => ({
    symptoms,
    diagnoses,
    medications,
    recommendations,
    pocusNotes,
    price,
    studyCategoryId,
    attachedFileNames: attachedFiles.map(f => f.name),
    appointment: {
      createAppointment,
      date: appointmentDate ? appointmentDate.toISOString() : '',
      title: appointmentTitle,
      notes: appointmentNotes,
    },
    editableVitals: {
      temperature: editableVitals.temperature ? parseFloat(editableVitals.temperature) : null,
      heartRate: editableVitals.heart_rate ? parseInt(editableVitals.heart_rate) : null,
      respiratoryRate: editableVitals.respiratory_rate ? parseInt(editableVitals.respiratory_rate) : null,
      systolicPressure: editableVitals.systolic_pressure ? parseInt(editableVitals.systolic_pressure) : null,
      diastolicPressure: editableVitals.diastolic_pressure ? parseInt(editableVitals.diastolic_pressure) : null,
      oxygenSaturation: editableVitals.oxygen_saturation ? parseFloat(editableVitals.oxygen_saturation) : null,
      bloodGlucose: editableVitals.blood_glucose ? parseFloat(editableVitals.blood_glucose) : null,
      weight: editableVitals.weight ? parseFloat(editableVitals.weight) : null,
      height: editableVitals.height ? parseFloat(editableVitals.height) : null,
      currentMedications,
    },
  });

  // Función para cargar datos desde un borrador
  const loadFromDraft = (draft: any) => {
    setSymptoms(draft.symptoms || []);
    setDiagnoses(draft.diagnoses || []);
    setMedications(draft.medications || []);
    setRecommendations(draft.recommendations || '');
    setPocusNotes(draft.pocusNotes || '');
    setPrice(draft.price || '');
    setStudyCategoryId(draft.studyCategoryId || '');

    if (draft.appointment) {
      setCreateAppointment(draft.appointment.createAppointment || false);
      setAppointmentDate(draft.appointment.date ? new Date(draft.appointment.date) : null);
      setAppointmentTitle(draft.appointment.title || '');
      setAppointmentNotes(draft.appointment.notes || '');
    }

    if (draft.editableVitals) {
      setEditableVitals({
        temperature: draft.editableVitals.temperature?.toString() || '',
        heart_rate: draft.editableVitals.heartRate?.toString() || '',
        respiratory_rate: draft.editableVitals.respiratoryRate?.toString() || '',
        systolic_pressure: draft.editableVitals.systolicPressure?.toString() || '',
        diastolic_pressure: draft.editableVitals.diastolicPressure?.toString() || '',
        oxygen_saturation: draft.editableVitals.oxygenSaturation?.toString() || '',
        blood_glucose: draft.editableVitals.bloodGlucose?.toString() || '',
        weight: draft.editableVitals.weight?.toString() || '',
        height: draft.editableVitals.height?.toString() || '',
      });
      setCurrentMedications(draft.editableVitals.currentMedications || '');
    }
  };

  // Función para resetear formulario a datos originales de consulta
  const resetFormToConsultationData = (consultationData: any) => {
    if (!consultationData) {
      // Limpiar formulario
      setSymptoms([]);
      setDiagnoses([]);
      setMedications([]);
      setRecommendations('');
      setPocusNotes('');
      setPrice('');
      setAttachedFiles([]);
      setCreateAppointment(false);
      setAppointmentDate(null);
      setAppointmentTitle('');
      setAppointmentNotes('');
      setStudyCategoryId('');
      return;
    }

    // Cargar datos de la consulta
    if (consultationData.pre_consultation) {
      setEditableVitals({
        temperature: consultationData.pre_consultation.temperature?.toString() || '',
        heart_rate: consultationData.pre_consultation.heart_rate?.toString() || '',
        respiratory_rate: consultationData.pre_consultation.respiratory_rate?.toString() || '',
        systolic_pressure: consultationData.pre_consultation.systolic_pressure?.toString() || '',
        diastolic_pressure: consultationData.pre_consultation.diastolic_pressure?.toString() || '',
        oxygen_saturation: consultationData.pre_consultation.oxygen_saturation?.toString() || '',
        blood_glucose: consultationData.pre_consultation.blood_glucose?.toString() || '',
        weight: consultationData.pre_consultation.weight?.toString() || '',
        height: consultationData.pre_consultation.height?.toString() || '',
      });
      setCurrentMedications(consultationData.pre_consultation.current_medications || '');
    }

    // Limpiar campos del formulario de consulta
    setSymptoms([]);
    setDiagnoses([]);
    setMedications([]);
    setRecommendations('');
    setPocusNotes('');
    setPrice('');
    setAttachedFiles([]);
    setCreateAppointment(false);
    setAppointmentDate(null);
    setAppointmentTitle('');
    setAppointmentNotes('');
    setStudyCategoryId('');
  };

  // Función para verificar si hay cambios sin guardar
  const hasUnsavedChanges = () => {
    return (
      symptoms.length > 0 ||
      diagnoses.length > 0 ||
      medications.length > 0 ||
      recommendations.trim() !== '' ||
      pocusNotes.trim() !== '' ||
      price.trim() !== '' ||
      attachedFiles.length > 0 ||
      createAppointment ||
      studyCategoryId !== '' ||
      hasVitalSignsChanged()
    );
  };

  // ==================== EFECTO PRINCIPAL DE CACHÉ ====================

  // Efecto para cargar borrador al seleccionar consulta
  useEffect(() => {
    if (!selectedConsultationId || !consultation) return;

    setIsInitialLoad(true);

    // Verificar si hay un borrador guardado
    const draft = getDraft(selectedConsultationId);

    if (draft) {
      // Cargar desde borrador
      loadFromDraft(draft);
    } else {
      // Cargar datos frescos de la consulta
      resetFormToConsultationData(consultation);
    }

    // Marcar que la carga inicial terminó después de un breve delay
    setTimeout(() => setIsInitialLoad(false), 100);
  }, [selectedConsultationId, consultation?.id]); // Solo ejecutar cuando cambie el ID

  // Efecto para auto-guardar borrador cuando cambian los datos
  useEffect(() => {
    if (!selectedConsultationId || isInitialLoad) return;

    setIsSavingDraft(true);

    // Debounce: guardar después de un pequeño delay para evitar guardar en cada keystroke
    const timeoutId = setTimeout(() => {
      if (hasUnsavedChanges()) {
        const formData = getCurrentFormData();
        saveDraft(selectedConsultationId, formData);
      }
      setIsSavingDraft(false);
    }, 1000); // Guardar 1 segundo después del último cambio

    return () => clearTimeout(timeoutId);
  }, [
    symptoms,
    diagnoses,
    medications,
    recommendations,
    pocusNotes,
    price,
    studyCategoryId,
    attachedFiles,
    createAppointment,
    appointmentDate,
    appointmentTitle,
    appointmentNotes,
    editableVitals,
    currentMedications,
    selectedConsultationId,
    isInitialLoad,
  ]);

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
      // Para estudios clínicos, validar categoría seleccionada
      if (!studyCategoryId) {
        toast.error("Debes seleccionar una categoría de estudio");
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

    // Obtener nombre de la categoría para compatibilidad
    const selectedCategory = studyCategories?.find(c => c.id === studyCategoryId);
    const categoryName = selectedCategory?.name || "";

    // Preparar datos para envío según el tipo
    const consultationData: any = recordType === "study"
      ? {
          patient_id: consultation.patient.id,
          pre_consultation_id: consultation.pre_consultation?.id,
          consultation_type: recordType,
          ...(studyCategoryId && { study_category_id: studyCategoryId }), // Solo enviar si tiene valor
          diagnoses: [categoryName], // Nombre de categoría en diagnoses para compatibilidad
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
          appointment: appointment.trim() || undefined,
          price: parseFloat(price),
          // Campos del sistema de citas
          create_appointment: createAppointment,
          appointment_date: createAppointment && appointmentDate ? appointmentDate.toISOString() : undefined,
          appointment_title: createAppointment && appointmentTitle.trim() ? appointmentTitle.trim() : undefined,
          appointment_notes: createAppointment && appointmentNotes.trim() ? appointmentNotes.trim() : undefined,
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

        // Subir archivos adjuntos (si hay)
        if (attachedFiles.length > 0) {
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

        // Eliminar borrador ya que la consulta fue creada exitosamente
        deleteDraft(selectedConsultationId);

        // La consulta ahora sale automáticamente de la lista (el backend cambió status a Completado)
        // El componente padre detectará esto y actualizará la lista
        // Si no hay más consultas, ConsultationPage mostrará mensaje apropiado
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

            // Eliminar borrador al cancelar
            deleteDraft(selectedConsultationId);

            // La consulta sale de la lista automáticamente
            // El componente padre manejará la actualización
            toast.success("Consulta cancelada exitosamente");
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {isStudy ? "Registro de Estudio Clínico" : "Consulta Médica"}
          </h2>
          {isSavingDraft && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>Guardando...</span>
            </div>
          )}
          {!isSavingDraft && hasUnsavedChanges() && (
            <div className="flex items-center gap-2 text-sm text-success">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Guardado</span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isStudy ? (
            /* Para estudios clínicos, mostrar dropdown de categorías */
            <div>
              <label className="block text-sm font-medium mb-2">
                Categoría del Estudio <span className="text-destructive">*</span>
              </label>
              <select
                value={studyCategoryId}
                onChange={(e) => setStudyCategoryId(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                required
              >
                <option value="">Seleccionar categoría...</option>
                {studyCategories?.filter(c => c.is_active).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {studyCategories?.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No hay categorías de estudio configuradas.
                  <a href="/estadisticas/financiero" className="text-primary hover:underline ml-1">
                    Configurar categorías
                  </a>
                </p>
              )}
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

              {/* Sistema de Citas */}
              <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    id="create-appointment"
                    type="checkbox"
                    checked={createAppointment}
                    onChange={(e) => setCreateAppointment(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <label htmlFor="create-appointment" className="text-sm font-medium cursor-pointer">
                    Programar cita de seguimiento
                  </label>
                </div>

                {createAppointment && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                    {/* Fecha y hora de la cita */}
                    <DateTimePicker
                      label="Fecha y Hora de la Cita"
                      value={appointmentDate}
                      onChange={setAppointmentDate}
                      placeholder="Selecciona fecha y hora"
                      showTimeSelect={true}
                      minDate={new Date()}
                      required={createAppointment}
                      dateFormat="dd/MM/yyyy HH:mm"
                      timeIntervals={15}
                    />

                    {/* Título de la cita */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Título de la Cita (Opcional)
                      </label>
                      <input
                        type="text"
                        value={appointmentTitle}
                        onChange={(e) => setAppointmentTitle(e.target.value)}
                        placeholder="Ej: Control de seguimiento, Revisión de exámenes..."
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Si no se especifica, se generará automáticamente
                      </p>
                    </div>

                    {/* Notas de la cita */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Notas de la Cita (Opcional)
                      </label>
                      <textarea
                        value={appointmentNotes}
                        onChange={(e) => setAppointmentNotes(e.target.value)}
                        placeholder="Notas o recordatorios para la cita..."
                        rows={2}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Precio y Archivos Adjuntos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Archivos Adjuntos */}
            <AttachmentsSection
              files={attachedFiles}
              onFilesChange={setAttachedFiles}
            />
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
