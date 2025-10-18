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
  heart_rate: z.coerce.number().min(30).max(250).optional().or(z.literal("")),
  temperature: z.coerce.number().min(30).max(45).optional().or(z.literal("")),
  respiratory_rate: z.coerce.number().min(5).max(60).optional().or(z.literal("")),
  oxygen_saturation: z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  weight: z.coerce.number().min(0).max(500).optional().or(z.literal("")),
  height: z.coerce.number().min(0).max(300).optional().or(z.literal("")),
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 space-y-4">
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
          <div className="p-6 space-y-4">
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
          <div className="p-6 space-y-4">
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
          <div className="p-6 space-y-4">
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
          <div className="p-6 space-y-4">
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
          <div className="p-6 space-y-4">
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
          <div className="p-6 space-y-4">
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

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          Guardar Signos Vitales
        </Button>
      </div>
    </form>
  );
}
