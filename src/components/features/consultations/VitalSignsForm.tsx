import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Label from "@/components/ui/Label";
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplet,
  Weight,
  Ruler,
} from "lucide-react";
import type { VitalSigns } from "@/types/models";

const vitalSignsSchema = z.object({
  blood_pressure: z.string().optional(),
  heart_rate: z.coerce
    .number({ invalid_type_error: "Frecuencia cardíaca debe ser un número" })
    .min(30, "Frecuencia cardíaca debe ser mayor a 30 lpm")
    .max(250, "Frecuencia cardíaca debe ser menor a 250 lpm")
    .optional()
    .or(z.literal("")),
  temperature: z.coerce
    .number({ invalid_type_error: "Temperatura debe ser un número" })
    .min(30, "Temperatura debe ser mayor a 30°C")
    .max(45, "Temperatura debe ser menor a 45°C")
    .optional()
    .or(z.literal("")),
  respiratory_rate: z.coerce
    .number({ invalid_type_error: "Frecuencia respiratoria debe ser un número" })
    .min(5, "Frecuencia respiratoria debe ser mayor a 5 rpm")
    .max(60, "Frecuencia respiratoria debe ser menor a 60 rpm")
    .optional()
    .or(z.literal("")),
  oxygen_saturation: z.coerce
    .number({ invalid_type_error: "Saturación de oxígeno debe ser un número" })
    .min(0, "Saturación de oxígeno debe ser mayor a 0%")
    .max(100, "Saturación de oxígeno debe ser menor o igual a 100%")
    .optional()
    .or(z.literal("")),
  weight: z.coerce
    .number({ invalid_type_error: "Peso debe ser un número" })
    .min(0, "Peso debe ser mayor a 0 kg")
    .max(500, "Peso debe ser menor a 500 kg")
    .optional()
    .or(z.literal("")),
  height: z.coerce
    .number({ invalid_type_error: "Altura debe ser un número" })
    .min(0, "Altura debe ser mayor a 0 cm")
    .max(300, "Altura debe ser menor a 300 cm")
    .optional()
    .or(z.literal("")),
});

type VitalSignsFormData = z.infer<typeof vitalSignsSchema>;

interface VitalSignsFormProps {
  initialData?: Partial<VitalSigns>;
  onSubmit: (data: VitalSignsFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function VitalSignsForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: VitalSignsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VitalSignsFormData>({
    resolver: zodResolver(vitalSignsSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Presión Arterial</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood_pressure">Presión Arterial</Label>
              <Input
                id="blood_pressure"
                {...register("blood_pressure")}
                error={errors.blood_pressure?.message}
                placeholder="120/80"
              />
              <p className="text-xs text-muted-foreground">mmHg</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Frecuencia Cardíaca</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="heart_rate">Frecuencia Cardíaca</Label>
              <Input
                id="heart_rate"
                type="number"
                {...register("heart_rate")}
                error={errors.heart_rate?.message}
                placeholder="70"
              />
              <p className="text-xs text-muted-foreground">latidos por minuto</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Thermometer className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Temperatura</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperatura</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                {...register("temperature")}
                error={errors.temperature?.message}
                placeholder="36.5"
              />
              <p className="text-xs text-muted-foreground">grados Celsius</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Wind className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Frecuencia Respiratoria</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="respiratory_rate">Frecuencia Respiratoria</Label>
              <Input
                id="respiratory_rate"
                type="number"
                {...register("respiratory_rate")}
                error={errors.respiratory_rate?.message}
                placeholder="16"
              />
              <p className="text-xs text-muted-foreground">respiraciones por minuto</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Saturación de Oxígeno</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="oxygen_saturation">Saturación de Oxígeno</Label>
              <Input
                id="oxygen_saturation"
                type="number"
                {...register("oxygen_saturation")}
                error={errors.oxygen_saturation?.message}
                placeholder="98"
              />
              <p className="text-xs text-muted-foreground">porcentaje</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Weight className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Peso</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...register("weight")}
                error={errors.weight?.message}
                placeholder="70.5"
              />
              <p className="text-xs text-muted-foreground">kilogramos</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Altura</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Altura</Label>
              <Input
                id="height"
                type="number"
                {...register("height")}
                error={errors.height?.message}
                placeholder="170"
              />
              <p className="text-xs text-muted-foreground">centímetros</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          Guardar Signos Vitales
        </Button>
      </div>
    </form>
  );
}
