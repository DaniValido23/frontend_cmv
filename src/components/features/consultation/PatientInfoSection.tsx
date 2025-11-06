import { memo } from "react";
import { User, Stethoscope, Microscope } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { ConsultationPatient, RecordType } from "@/types/models";

interface PatientInfoSectionProps {
  patient: ConsultationPatient;
  recordType?: RecordType;
}

function PatientInfoSection({ patient, recordType }: PatientInfoSectionProps) {

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <User className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Información del Paciente</h2>
        {recordType && (
          recordType === "study" ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Microscope className="h-3 w-3" />
              <span>Estudio Clínico</span>
            </Badge>
          ) : (
            <Badge variant="default" className="flex items-center gap-1">
              <Stethoscope className="h-3 w-3" />
              <span>Consulta Médica</span>
            </Badge>
          )
        )}
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
          <label className="text-sm font-medium text-muted-foreground">Antecedentes personales patológicos y no patológicos</label>
          <p className="text-base mt-1.5 whitespace-pre-wrap">{patient.personal_background || "No registrado"}</p>
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-muted-foreground">Antecedentes ginecobstetricos sí aplica</label>
          <p className="text-base mt-1.5 whitespace-pre-wrap">{patient.obstetric_gynecological_background || "No registrado"}</p>
        </div>
      </div>
    </Card>
  );
}

// Memoize component to prevent re-renders when props don't change
export default memo(PatientInfoSection);
