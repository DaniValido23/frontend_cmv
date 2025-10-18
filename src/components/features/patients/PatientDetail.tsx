import { useState } from "react";
import { usePatient, useUpdatePatient } from "@/hooks/usePatients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Separator } from "@/components/ui/Separator";
import PatientForm from "./PatientForm";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Droplet,
  AlertCircle,
  Activity,
  Edit,
  ArrowLeft,
  FileText,
  UserCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PatientDetailProps {
  patientId: string;
}

export default function PatientDetail({ patientId }: PatientDetailProps) {
  const { data: patient, isLoading } = usePatient(patientId);
  const updateMutation = useUpdatePatient();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4">
          <UserCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Paciente no encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          El paciente que buscas no existe o fue eliminado
        </p>
        <Button
          onClick={() => (window.location.href = "/patients")}
          className="mt-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <PatientForm
        initialData={patient}
        onSubmit={(data) => {
          updateMutation.mutate(
            { id: patientId, data },
            {
              onSuccess: () => setIsEditing(false),
            }
          );
        }}
        isLoading={updateMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => (window.location.href = "/patients")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {patient.full_name}
            </h1>
            <p className="text-muted-foreground">
              Información detallada del paciente
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            onClick={() =>
              (window.location.href = `/consultations/new?patient_id=${patientId}`)
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            Nueva Consulta
          </Button>
        </div>
      </div>

      {/* Patient Avatar */}
      <Card>
        <CardContent className="flex items-center gap-6 py-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold">{patient.full_name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(patient.birth_date), "dd 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <Badge variant="secondary">
                {patient.gender === "male" ? "Masculino" : "Femenino"}
              </Badge>
              {patient.blood_type && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <Badge variant="outline" className="font-mono">
                    <Droplet className="mr-1 h-3 w-3" />
                    {patient.blood_type}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Información de Contacto</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
              {patient.phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{patient.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No especificado</p>
              )}
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Correo Electrónico
              </p>
              {patient.email ? (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{patient.email}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No especificado</p>
              )}
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Dirección</p>
              {patient.address ? (
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="font-medium">{patient.address}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No especificada</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información Médica */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Información Médica</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Tipo de Sangre
              </p>
              {patient.blood_type ? (
                <Badge variant="outline" className="font-mono">
                  <Droplet className="mr-1 h-3 w-3" />
                  {patient.blood_type}
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground">No especificado</p>
              )}
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Alergias
              </p>
              <p className="text-sm">
                {patient.allergies || (
                  <span className="text-muted-foreground">
                    Ninguna registrada
                  </span>
                )}
              </p>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Condiciones Crónicas
              </p>
              <p className="text-sm">
                {patient.chronic_conditions || (
                  <span className="text-muted-foreground">
                    Ninguna registrada
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacto de Emergencia */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Contacto de Emergencia</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Nombre del Contacto
              </p>
              {patient.emergency_contact_name ? (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{patient.emergency_contact_name}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No especificado</p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Teléfono del Contacto
              </p>
              {patient.emergency_contact_phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{patient.emergency_contact_phone}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No especificado</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Consultas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Historial de Consultas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              Sin consultas registradas
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              El historial de consultas aparecerá aquí una vez que se implemente
              el módulo de consultas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
