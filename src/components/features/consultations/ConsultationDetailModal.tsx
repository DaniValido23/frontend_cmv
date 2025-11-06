import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Modal";
import { useConsultationAttachments, useUploadAttachment } from "@/hooks/useConsultations";
import { useQueryClient } from "@tanstack/react-query";
import type { Consultation } from "@/types/models";
import { User, Heart, Thermometer, Activity, Weight, Ruler, Droplet, Calendar, DollarSign, FileText, Pill, Wind, Stethoscope, Paperclip, Upload, Download, Trash2, FileIcon, ClipboardList, FlaskConical } from "lucide-react";
import Button from "@/components/ui/Button";
import { toast } from "sonner";

interface ConsultationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: Consultation | null;
}

export default function ConsultationDetailModal({
  open,
  onOpenChange,
  consultation,
}: ConsultationDetailModalProps) {
  const queryClient = useQueryClient();
  const uploadAttachmentMutation = useUploadAttachment();
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // Obtener archivos adjuntos de la consulta
  const { data: attachmentsData, isLoading: isLoadingAttachments } = useConsultationAttachments(
    consultation?.id || ""
  );

  if (!consultation) return null;

  const formatDate = (dateString: string) => {
    // El backend puede enviar formato: DD-MM-YYYY HH:mm:ss
    // Necesitamos convertir a formato que JavaScript pueda parsear
    if (dateString.includes('-') && dateString.split('-')[0].length <= 2) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      // Crear fecha en formato ISO: YYYY-MM-DDTHH:mm:ss
      const isoDate = `${year}-${month}-${day}T${timePart || '00:00:00'}`;
      const date = new Date(isoDate);
      return date.toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Si ya está en formato ISO o reconocible
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGenderLabel = (gender?: string) => {
    if (!gender) return "No especificado";
    const genderLower = gender.toLowerCase();
    if (genderLower === "male" || genderLower === "masculino" || genderLower === "m") {
      return "Masculino";
    }
    if (genderLower === "female" || genderLower === "femenino" || genderLower === "f") {
      return "Femenino";
    }
    return gender;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      const maxSize = 20 * 1024 * 1024; // 20MB

      const validFiles = filesArray.filter(file => {
        if (file.size > maxSize) {
          toast.error(`El archivo "${file.name}" excede el tamaño máximo de 20MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setNewFiles([...newFiles, ...validFiles]);
      }
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (newFiles.length === 0) {
      toast.error("No hay archivos para subir");
      return;
    }

    setIsUploadingFiles(true);

    const uploadPromises = newFiles.map(async (file) => {
      try {
        await uploadAttachmentMutation.mutateAsync({
          consultation_id: consultation.id,
          file: file,
        });
        toast.success(`Archivo "${file.name}" subido exitosamente`);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Error desconocido";
        toast.error(`Error al subir "${file.name}": ${errorMessage}`);
      }
    });

    await Promise.all(uploadPromises);

    // Limpiar los archivos nuevos y refrescar la lista
    setNewFiles([]);
    setIsUploadingFiles(false);
    queryClient.invalidateQueries({ queryKey: ["consultation-attachments", consultation.id] });
  };

  const handleDownload = (downloadUrl: string, fileName: string) => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <DialogTitle>Detalle de Consulta</DialogTitle>
            {consultation.consultation_type === "consultation" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <ClipboardList className="h-3.5 w-3.5" />
                Consulta
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-900 text-white dark:bg-gray-800 dark:text-gray-100">
                <FlaskConical className="h-3.5 w-3.5" />
                Estudio
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6 py-4">
          {/* Pre-consulta */}
          {consultation.consultation_type === "consultation" && consultation.vital_signs && (
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Pre-consulta</h3>
                {consultation.recorded_by && (
                  <span className="text-sm text-muted-foreground ml-2">
                    • Registrado por: <span className="font-medium text-foreground">{consultation.recorded_by.name}</span>
                  </span>
                )}
              </div>

              {/* Signos Vitales */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm mb-4">
                {consultation.vital_signs.temperature && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Temperatura</p>
                      <p className="font-semibold">{consultation.vital_signs.temperature}°C</p>
                    </div>
                  </div>
                )}
                {consultation.vital_signs.heart_rate && (
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Frecuencia Cardíaca</p>
                      <p className="font-semibold">{consultation.vital_signs.heart_rate} lpm</p>
                    </div>
                  </div>
                )}
                {consultation.vital_signs.respiratory_rate && (
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-cyan-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Frecuencia Respiratoria</p>
                      <p className="font-semibold">{consultation.vital_signs.respiratory_rate} rpm</p>
                    </div>
                  </div>
                )}
                {consultation.vital_signs.systolic_pressure && consultation.vital_signs.diastolic_pressure && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Presión Arterial</p>
                      <p className="font-semibold">
                        {consultation.vital_signs.systolic_pressure}/{consultation.vital_signs.diastolic_pressure} mmHg
                      </p>
                    </div>
                  </div>
                )}
                {consultation.vital_signs.oxygen_saturation && (
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Saturación O₂</p>
                      <p className="font-semibold">{consultation.vital_signs.oxygen_saturation}%</p>
                    </div>
                  </div>
                )}
                {consultation.vital_signs.blood_glucose && (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Glucosa en Sangre</p>
                      <p className="font-semibold">{consultation.vital_signs.blood_glucose} mg/dL</p>
                    </div>
                  </div>
                )}
                {consultation.vital_signs.weight && (
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Peso</p>
                      <p className="font-semibold">{consultation.vital_signs.weight} kg</p>
                    </div>
                  </div>
                )}
                {consultation.vital_signs.height && (
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Altura</p>
                      <p className="font-semibold">{consultation.vital_signs.height} m</p>
                    </div>
                  </div>
                )}
                {consultation.vital_signs.imc && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">IMC</p>
                      <p className="font-semibold">{consultation.vital_signs.imc.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Medicamentos Actuales */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-sm">Medicamentos que toma actualmente</h4>
                </div>
                <p className="text-sm text-foreground p-2 bg-muted rounded">
                  {consultation.vital_signs.current_medications || 'No especificado'}
                </p>
              </div>
            </div>
          )}

          {/* Síntomas */}
          {consultation.consultation_type === "consultation" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Síntomas</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {consultation.symptoms && consultation.symptoms.length > 0 ? (
                  consultation.symptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 border border-border bg-muted rounded-full text-sm text-foreground"
                    >
                      {symptom}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No se registraron síntomas</p>
                )}
              </div>
            </div>
          )}

          {/* Diagnósticos */}
          {consultation.consultation_type === "consultation" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Diagnósticos</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {consultation.diagnoses && consultation.diagnoses.length > 0 ? (
                  consultation.diagnoses.map((diagnosis, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 border border-border bg-muted rounded-full text-sm text-foreground"
                    >
                      {diagnosis}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No se registraron diagnósticos</p>
                )}
              </div>
            </div>
          )}

          {/* Medicamentos Recetados */}
          {consultation.consultation_type === "consultation" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pill className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Medicamentos Recetados</h3>
              </div>
              <div className="space-y-2">
                {consultation.prescribed_medications && consultation.prescribed_medications.length > 0 ? (
                  consultation.prescribed_medications.map((medication, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg"
                    >
                      <p className="text-sm font-medium">{medication}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No se recetaron medicamentos</p>
                )}
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          {consultation.consultation_type === "consultation" && consultation.recommendations && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Recomendaciones</h3>
              </div>
              <p className="text-sm p-3 rounded-lg border">
                {consultation.recommendations}
              </p>
            </div>
          )}

          {/* Notas POCUS */}
          {consultation.consultation_type === "consultation" && consultation.pocus_notes && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Notas POCUS</h3>
              </div>
              <p className="text-sm p-3 rounded-lg border">
                {consultation.pocus_notes}
              </p>
            </div>
          )}

          {/* Información de la Consulta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha de Consulta</p>
                <p className="font-semibold">{formatDate(consultation.consultation_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Precio</p>
                <p className="font-semibold text-green-600">${consultation.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Archivos Adjuntos */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Archivos Adjuntos</h3>
                {attachmentsData && (
                  <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {attachmentsData.total_count}
                  </span>
                )}
              </div>
            </div>

            {/* Lista de archivos existentes */}
            {isLoadingAttachments ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : attachmentsData && attachmentsData.attachments.length > 0 ? (
              <div className="space-y-2 mb-4">
                {attachmentsData.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg hover:bg-muted/90 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {attachment.file_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{attachment.file_size_format}</span>
                          <span>•</span>
                          <span>{attachment.attachment_type === 'prescription' ? 'Receta' : 'General'}</span>
                          <span>•</span>
                          <span>{new Date(attachment.uploaded_at).toLocaleDateString('es-MX')}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleDownload(attachment.download_url, attachment.file_name)}
                      className="ml-3 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">No hay archivos adjuntos</p>
            )}

            {/* Sección para agregar nuevos archivos */}
            <div className="p-4 border border-dashed rounded-lg bg-muted/30">
              <p className="text-sm font-medium mb-3">Agregar más archivos</p>

              {/* Input de archivos */}
              <div className="mb-3">
                <input
                  type="file"
                  id="modal-file-upload"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label
                  htmlFor="modal-file-upload"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-input rounded-md hover:border-primary cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Seleccionar archivos (PDF, JPG, PNG, DOC, DOCX - máx. 20MB)
                  </span>
                </label>
              </div>

              {/* Lista de archivos nuevos pendientes de subir */}
              {newFiles.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs font-medium text-muted-foreground">Archivos pendientes:</p>
                  {newFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-card border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        className="ml-2 p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                        title="Eliminar archivo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón para subir archivos */}
              {newFiles.length > 0 && (
                <Button
                  type="button"
                  onClick={handleUploadFiles}
                  disabled={isUploadingFiles}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isUploadingFiles ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Subiendo archivos...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir {newFiles.length} archivo{newFiles.length > 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
