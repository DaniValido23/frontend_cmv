import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Modal";
import Label from "@/components/ui/Label";

const forgotPasswordSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);

    try {
      const response = await api.post("/auth/password/forgot", {
        email: data.email,
      });

      if (response.data.success) {
        toast.success(
          response.data.message ||
          "Si el usuario existe, recibirá instrucciones para recuperar su contraseña"
        );
        reset();
        onClose();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error al procesar la solicitud";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">¿Olvidaste tu contraseña?</DialogTitle>
          <DialogDescription className="text-center">
            Ingresa tu correo electrónico y te enviaremos instrucciones para recuperar tu contraseña
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="tu@email.com"
              error={errors.email?.message}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              isLoading={loading}
            >
              {loading ? "Enviando..." : "Enviar instrucciones"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full"
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
