import { Clock, User, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { hasDraft } from "@/stores/consultationDraftStore";
import type { ActiveConsultationEntry } from "@/hooks/useWaitingRoom";

interface ActiveConsultationsListProps {
  consultations: ActiveConsultationEntry[];
  selectedConsultationId: string | null;
  onSelectConsultation: (id: string) => void;
}

export function ActiveConsultationsList({
  consultations,
  selectedConsultationId,
  onSelectConsultation,
}: ActiveConsultationsListProps) {
  const calculateAge = (birthDate: string | null): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateTimeInConsultation = (arrivalTime: string): string => {
    const now = new Date();
    const arrival = new Date(arrivalTime);
    const diffMs = now.getTime() - arrival.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} min`;
    }

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  if (consultations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No hay consultas activas
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Los pacientes que atiendas aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Consultas Activas</h2>
          <Badge variant="secondary" className="ml-2">
            {consultations.length}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Pacientes en atención
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-2">
          {consultations.map((consultation) => {
            const isSelected = consultation.id === selectedConsultationId;
            const age = calculateAge(consultation.patient.birth_date);
            const timeInConsultation = calculateTimeInConsultation(
              consultation.arrival_time
            );
            const hasUnsavedDraft = hasDraft(consultation.id);

            return (
              <Card
                key={consultation.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isSelected && "ring-2 ring-primary shadow-md bg-primary/5"
                )}
                onClick={() => onSelectConsultation(consultation.id)}
              >
                <CardContent className="p-3">
                  {/* Patient Name and Age */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm leading-tight">
                          {consultation.patient.first_name}{" "}
                          {consultation.patient.last_name}
                        </p>
                        {age && (
                          <p className="text-xs text-muted-foreground">
                            {age} años
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <Badge variant="default" className="text-xs">
                        Activa
                      </Badge>
                    )}
                  </div>

                  {/* Consultation Type and Time */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>
                        {consultation.pre_consultation?.record_type === "consultation"
                          ? "Consulta"
                          : "Estudio"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{timeInConsultation}</span>
                    </div>
                  </div>

                  {/* Unsaved draft indicator */}
                  {hasUnsavedDraft && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>Cambios sin guardar</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
