import { useState } from "react";
import {
  useConsultation,
  useUpdateConsultation,
  useCompleteConsultation,
  useAddVitalSigns,
  useAddAttachment,
} from "@/hooks/useConsultations";
import { usePatient } from "@/hooks/usePatients";
import { useNavigate } from "@/hooks/useNavigate";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import Label from "@/components/ui/Label";
import Separator from "@/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import VitalSignsForm from "./VitalSignsForm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import {
  Stethoscope,
  FileText,
  Activity,
  User,
  Calendar,
  Phone,
  AlertCircle,
  Heart,
  ClipboardList,
  Pill,
  DollarSign,
  Upload,
  Download,
  Play,
  CheckCircle,
} from "lucide-react";

interface ConsultationDetailProps {
  consultationId: string;
}

const completeSchema = z.object({
  diagnosis: z.string().min(10, "Mínimo 10 caracteres"),
  treatment: z.string().min(10, "Mínimo 10 caracteres"),
  notes: z.string().optional(),
  cost: z.coerce.number().min(0, "El costo debe ser mayor a 0"),
});

type CompleteFormData = z.infer<typeof completeSchema>;

export default function ConsultationDetail({ consultationId }: ConsultationDetailProps) {
  const { data: consultation, isLoading } = useConsultation(consultationId);
  const { data: patient } = usePatient(consultation?.patient_id || "");
  const updateMutation = useUpdateConsultation();
  const completeMutation = useCompleteConsultation();
  const addVitalsMutation = useAddVitalSigns();
  const addAttachmentMutation = useAddAttachment();
  const navigator = useNavigate();

  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteFormData>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      diagnosis: consultation?.diagnosis || "",
      treatment: consultation?.treatment || "",
      notes: consultation?.notes || "",
      cost: consultation?.cost || 0,
    },
  });

  const handleVitalsSubmit = (data: any) => {
    addVitalsMutation.mutate(
      { consultationId, data },
      {
        onSuccess: () => setShowVitalsModal(false),
      }
    );
  };

  const handleCompleteSubmit = (data: CompleteFormData) => {
    completeMutation.mutate(
      { id: consultationId, data },
      {
        onSuccess: () => {
          setShowCompleteModal(false);
          navigator.navigate("/consultations");
        },
      }
    );
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      addAttachmentMutation.mutate(
        { consultationId, file: selectedFile },
        {
          onSuccess: () => setSelectedFile(null),
        }
      );
    }
  };

  const handleStatusChange = (newStatus: "pending" | "in_progress" | "completed" | "cancelled") => {
    updateMutation.mutate({
      id: consultationId,
      data: { status: newStatus },
    });
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
      <div className="text-center py-12">
        <p className="text-red-600">Consulta no encontrada</p>
        <Button onClick={() => navigator.navigate("/consultations")} className="mt-4">
          Volver a la lista
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">Sin estado</Badge>;

    const statusMap = {
      pending: { variant: "warning" as const, label: "Pendiente" },
      in_progress: { variant: "default" as const, label: "En Progreso" },
      completed: { variant: "success" as const, label: "Completada" },
      cancelled: { variant: "destructive" as const, label: "Cancelada" },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      variant: "secondary" as const,
      label: status,
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Stethoscope className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Consulta Médica</h2>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">{patient?.full_name}</span>
                <span>•</span>
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(consultation.consultation_date), "dd 'de' MMMM 'de' yyyy, HH:mm", {
                    locale: es,
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(consultation.status)}
              {consultation.status === "pending" && (
                <Button onClick={() => handleStatusChange("in_progress")}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Consulta
                </Button>
              )}
              {consultation.status === "in_progress" && (
                <Button onClick={() => setShowCompleteModal(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar Consulta
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Información
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Signos Vitales
          </TabsTrigger>
          <TabsTrigger value="diagnosis" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Diagnóstico
          </TabsTrigger>
          <TabsTrigger value="attachments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Archivos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Información del Paciente</h3>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Nombre</Label>
                    <p className="font-medium">{patient?.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Edad</Label>
                    <p className="font-medium">
                      {patient?.birth_date
                        ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear()
                        : "N/A"}{" "}
                      años
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Género</Label>
                    <p className="font-medium">
                      {patient?.gender ?? "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{patient?.phone || "N/A"}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive mt-1" />
                    <div>
                      <Label className="text-muted-foreground">Alergias</Label>
                      <p className="font-medium">{patient?.allergies || "Ninguna"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-primary mt-1" />
                    <div>
                      <Label className="text-muted-foreground">Condiciones Crónicas</Label>
                      <p className="font-medium">{patient?.chronic_conditions || "Ninguna"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Información de la Consulta</h3>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Motivo de Consulta</Label>
                    <p className="font-medium">{consultation.reason}</p>
                  </div>
                  {consultation.symptoms && (
                    <div>
                      <Label className="text-muted-foreground">Síntomas</Label>
                      <p className="font-medium">{consultation.symptoms}</p>
                    </div>
                  )}
                  {consultation.cost && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-muted-foreground">Costo</Label>
                        <p className="font-medium">${consultation.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          <Card>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Signos Vitales</h3>
                </div>
                {consultation.status !== "completed" && (
                  <Button variant="outline" onClick={() => setShowVitalsModal(true)}>
                    {consultation.vital_signs ? "Actualizar" : "Agregar"} Signos Vitales
                  </Button>
                )}
              </div>
              <Separator />
              {consultation.vital_signs ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {consultation.vital_signs.blood_pressure && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Presión Arterial
                      </Label>
                      <p className="text-2xl font-bold">{consultation.vital_signs.blood_pressure}</p>
                      <p className="text-xs text-muted-foreground">mmHg</p>
                    </div>
                  )}
                  {consultation.vital_signs.heart_rate && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Frecuencia Cardíaca
                      </Label>
                      <p className="text-2xl font-bold">{consultation.vital_signs.heart_rate}</p>
                      <p className="text-xs text-muted-foreground">lpm</p>
                    </div>
                  )}
                  {consultation.vital_signs.temperature && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Temperatura</Label>
                      <p className="text-2xl font-bold">{consultation.vital_signs.temperature}°C</p>
                    </div>
                  )}
                  {consultation.vital_signs.respiratory_rate && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Frecuencia Respiratoria</Label>
                      <p className="text-2xl font-bold">{consultation.vital_signs.respiratory_rate}</p>
                      <p className="text-xs text-muted-foreground">rpm</p>
                    </div>
                  )}
                  {consultation.vital_signs.oxygen_saturation && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Saturación de Oxígeno</Label>
                      <p className="text-2xl font-bold">{consultation.vital_signs.oxygen_saturation}%</p>
                    </div>
                  )}
                  {consultation.vital_signs.weight && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Peso</Label>
                      <p className="text-2xl font-bold">{consultation.vital_signs.weight}</p>
                      <p className="text-xs text-muted-foreground">kg</p>
                    </div>
                  )}
                  {consultation.vital_signs.height && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Altura</Label>
                      <p className="text-2xl font-bold">{consultation.vital_signs.height}</p>
                      <p className="text-xs text-muted-foreground">cm</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No se han registrado signos vitales</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="diagnosis" className="space-y-6">
          <Card>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Diagnóstico y Tratamiento</h3>
              </div>
              <Separator />
              {consultation.diagnosis || consultation.treatment || consultation.notes ? (
                <div className="space-y-6">
                  {consultation.diagnosis && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Diagnóstico</Label>
                      <p className="font-medium">{consultation.diagnosis}</p>
                    </div>
                  )}
                  {consultation.treatment && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Tratamiento
                      </Label>
                      <p className="font-medium">{consultation.treatment}</p>
                    </div>
                  )}
                  {consultation.notes && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Notas Adicionales</Label>
                      <p className="font-medium">{consultation.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No se ha registrado diagnóstico ni tratamiento
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-6">
          <Card>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Archivos Adjuntos</h3>
                </div>
              </div>
              <Separator />
              {consultation.attachments && consultation.attachments.length > 0 ? (
                <ul className="space-y-3">
                  {consultation.attachments.map((attachment) => (
                    <li
                      key={attachment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{attachment.file_name}</span>
                      </div>
                      <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay archivos adjuntos</p>
                </div>
              )}
              {consultation.status !== "completed" && (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <Button
                      onClick={handleFileUpload}
                      disabled={!selectedFile}
                      isLoading={addAttachmentMutation.isPending}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Archivo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal isOpen={showVitalsModal} onClose={() => setShowVitalsModal(false)} title="Signos Vitales">
        <VitalSignsForm
          initialData={consultation.vital_signs || {}}
          onSubmit={handleVitalsSubmit}
          onCancel={() => setShowVitalsModal(false)}
          isLoading={addVitalsMutation.isPending}
        />
      </Modal>

      <Modal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)} title="Completar Consulta">
        <form onSubmit={handleSubmit(handleCompleteSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Diagnóstico *
              </Label>
              <textarea
                id="diagnosis"
                {...register("diagnosis")}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Describa el diagnóstico..."
              />
              {errors.diagnosis && (
                <p className="text-sm text-destructive">{errors.diagnosis.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Tratamiento *
              </Label>
              <textarea
                id="treatment"
                {...register("treatment")}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Describa el tratamiento..."
              />
              {errors.treatment && (
                <p className="text-sm text-destructive">{errors.treatment.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notas Adicionales
              </Label>
              <textarea
                id="notes"
                {...register("notes")}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Notas adicionales..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Costo *
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                {...register("cost")}
                error={errors.cost?.message}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowCompleteModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={completeMutation.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Completar Consulta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
