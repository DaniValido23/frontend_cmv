import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { usePatients } from "@/hooks/usePatients";
import { User, Calendar, FileText, Activity } from "lucide-react";
import type { Consultation } from "@/types/models";

const consultationSchema = z.object({
  patient_id: z.string().min(1, "Selecciona un paciente"),
  consultation_date: z.string().min(1, "Fecha y hora requeridas"),
  reason: z.string().min(5, "Mínimo 5 caracteres"),
  symptoms: z.string().optional(),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

interface ConsultationFormProps {
  initialData?: Partial<Consultation>;
  onSubmit: (data: ConsultationFormData) => void;
  isLoading?: boolean;
  defaultPatientId?: string;
}

export default function ConsultationForm({
  initialData,
  onSubmit,
  isLoading,
  defaultPatientId,
}: ConsultationFormProps) {
  const { data: patients } = usePatients();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      ...initialData,
      patient_id: defaultPatientId || initialData?.patient_id,
      consultation_date: initialData?.consultation_date
        ? new Date(initialData.consultation_date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Información General
          </TabsTrigger>
          <TabsTrigger value="symptoms" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Síntomas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="patient_id" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Paciente *
                  </Label>
                  <select
                    id="patient_id"
                    {...register("patient_id")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!!defaultPatientId}
                  >
                    <option value="">Seleccionar paciente...</option>
                    {patients?.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.full_name}
                      </option>
                    ))}
                  </select>
                  {errors.patient_id && (
                    <p className="text-sm text-destructive">{errors.patient_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultation_date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha y Hora *
                  </Label>
                  <Input
                    id="consultation_date"
                    type="datetime-local"
                    {...register("consultation_date")}
                    error={errors.consultation_date?.message}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Motivo de Consulta *
                </Label>
                <textarea
                  id="reason"
                  {...register("reason")}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Ej: Dolor de cabeza persistente"
                />
                {errors.reason && (
                  <p className="text-sm text-destructive">{errors.reason.message}</p>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-6">
          <Card>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Síntomas
                </Label>
                <textarea
                  id="symptoms"
                  {...register("symptoms")}
                  rows={8}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Describa los síntomas del paciente de manera detallada..."
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Actualizar Consulta" : "Crear Consulta"}
        </Button>
      </div>
    </form>
  );
}
