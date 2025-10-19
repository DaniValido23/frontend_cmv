import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Droplet,
  AlertCircle,
  Activity,
  UserPlus,
  ArrowLeft,
} from "lucide-react";
import type { Patient } from "@/types/models";

const patientSchema = z.object({
  full_name: z.string().min(3, "Mínimo 3 caracteres"),
  birth_date: z.string().min(1, "Fecha de nacimiento requerida"),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Selecciona un género" }),
  }),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  blood_type: z.string().optional(),
  allergies: z.string().optional(),
  chronic_conditions: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  initialData?: Partial<Patient>;
  onSubmit: (data: PatientFormData) => void;
  isLoading?: boolean;
}

export default function PatientForm({
  initialData,
  onSubmit,
  isLoading,
}: PatientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData || {},
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {initialData ? "Editar Paciente" : "Nuevo Paciente"}
          </h1>
          <p className="text-muted-foreground">
            {initialData
              ? "Actualiza la información del paciente"
              : "Registra un nuevo paciente en el sistema"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/patients")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Información Personal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="full_name">
                  Nombre Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  {...register("full_name")}
                  error={errors.full_name?.message}
                  placeholder="Ej: Juan Pérez García"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">
                  Fecha de Nacimiento <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="birth_date"
                    type="date"
                    {...register("birth_date")}
                    error={errors.birth_date?.message}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">
                  Género <span className="text-destructive">*</span>
                </Label>
                <select
                  id="gender"
                  {...register("gender")}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccionar...</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
                {errors.gender && (
                  <p className="text-sm text-destructive">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    error={errors.phone?.message}
                    placeholder="Ej: +34 612 345 678"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    error={errors.email?.message}
                    placeholder="Ej: juan@example.com"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <textarea
                    id="address"
                    {...register("address")}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Calle, número, colonia, ciudad, código postal"
                  />
                </div>
              </div>
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
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="blood_type">Tipo de Sangre</Label>
              <div className="relative">
                <Droplet className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="blood_type"
                  {...register("blood_type")}
                  error={errors.blood_type?.message}
                  placeholder="Ej: O+, A-, AB+, etc."
                  className="pl-9"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="allergies">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Alergias
                </div>
              </Label>
              <textarea
                id="allergies"
                {...register("allergies")}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe cualquier alergia conocida (medicamentos, alimentos, etc.)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chronic_conditions">Condiciones Crónicas</Label>
              <textarea
                id="chronic_conditions"
                {...register("chronic_conditions")}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe cualquier condición médica crónica (diabetes, hipertensión, etc.)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacto de Emergencia */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Contacto de Emergencia</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">
                  Nombre del Contacto
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="emergency_contact_name"
                    {...register("emergency_contact_name")}
                    error={errors.emergency_contact_name?.message}
                    placeholder="Ej: María Pérez"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">
                  Teléfono del Contacto
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="emergency_contact_phone"
                    type="tel"
                    {...register("emergency_contact_phone")}
                    error={errors.emergency_contact_phone?.message}
                    placeholder="Ej: +34 612 345 678"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} size="lg">
            {initialData ? (
              <>
                <User className="mr-2 h-4 w-4" />
                Actualizar Paciente
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Paciente
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
