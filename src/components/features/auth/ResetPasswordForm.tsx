import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { useResetPassword } from "@/hooks/useAuth";
import { useNavigate } from "@/hooks/useNavigate";
import { validatePassword, getPasswordRequirements } from "@/utils/validation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Label from "@/components/ui/Label";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string().min(8, "Mínimo 8 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const resetPasswordMutation = useResetPassword();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token');

      if (!tokenParam) {
        toast.error("Token inválido o faltante");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setToken(tokenParam);
      }
    }
  }, [navigate]);

  const newPassword = watch("newPassword", "");

  useEffect(() => {
    setPasswordValue(newPassword);
  }, [newPassword]);

  const onSubmit = async (data: ResetPasswordForm) => {
    const validationError = validatePassword(data.newPassword);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({
        token: token,
        new_password: data.newPassword,
      });

      if (response.success) {
        setSuccess(true);
        toast.success("Contraseña restablecida exitosamente");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;

      if (errorMessage?.includes("Token inválido") || errorMessage?.includes("expirado")) {
        toast.error("El enlace ha expirado o es inválido. Por favor solicita uno nuevo.");
      } else if (errorMessage?.includes("requisitos de seguridad")) {
        toast.error("La contraseña no cumple con los requisitos de seguridad");
      } else {
        toast.error(errorMessage || "Error al restablecer la contraseña");
      }
    }
  };

  const getRequirementStatus = (requirement: string): boolean => {
    if (!passwordValue) return false;

    switch (requirement) {
      case 'Mínimo 8 caracteres':
        return passwordValue.length >= 8;
      case 'Máximo 72 caracteres':
        return passwordValue.length <= 72;
      case 'Al menos una mayúscula':
        return /[A-Z]/.test(passwordValue);
      case 'Al menos una minúscula':
        return /[a-z]/.test(passwordValue);
      case 'Al menos un número':
        return /[0-9]/.test(passwordValue);
      case 'Al menos un carácter especial (!@#$%^&*)':
        return /[^A-Za-z0-9]/.test(passwordValue);
      default:
        return false;
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">¡Contraseña restablecida!</h3>
              <p className="text-sm text-muted-foreground">
                Tu contraseña ha sido actualizada exitosamente.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirigiendo al inicio de sesión...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <CardTitle>Restablecer Contraseña</CardTitle>
        </div>
        <CardDescription>
          Ingresa tu nueva contraseña
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="newPassword"
                {...register("newPassword")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                error={errors.newPassword?.message}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm font-medium mb-3">La contraseña debe contener:</p>
            <ul className="space-y-2">
              {getPasswordRequirements().map((requirement) => {
                const isMet = getRequirementStatus(requirement);
                return (
                  <li
                    key={requirement}
                    className={`text-xs flex items-center gap-2 ${
                      passwordValue
                        ? isMet
                          ? "text-success"
                          : "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {passwordValue && (
                      isMet ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5" />
                      )
                    )}
                    {requirement}
                  </li>
                );
              })}
            </ul>
          </div>

          <Button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full"
            isLoading={resetPasswordMutation.isPending}
          >
            <Lock className="w-4 h-4 mr-2" />
            {resetPasswordMutation.isPending ? "Procesando..." : "Restablecer Contraseña"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
