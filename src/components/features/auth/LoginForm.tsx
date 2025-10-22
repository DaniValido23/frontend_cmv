import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LogIn, Shield, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { useNavigate } from "@/hooks/useNavigate";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Modal";
import Label from "@/components/ui/Label";
import ForgotPasswordModal from "./ForgotPasswordModal";

const loginSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<LoginForm | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);

    try {
      // Primero verificar credenciales y si requiere 2FA
      const checkResponse = await api.post("/auth/check-role", {
        username: data.username,
        password: data.password,
      });

      if (checkResponse.data.success) {
        setCredentials(data);

        if (checkResponse.data.data.requires_2fa) {
          // Si requiere 2FA, mostrar modal
          setShow2FAModal(true);
        } else {
          // Si no requiere 2FA, hacer login directamente
          await performLogin(data);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;
      toast.error(
        errorMessage === "Invalid email or password"
          ? "Correo o contraseña inválidos"
          : errorMessage || "Credenciales inválidas"
      );
    } finally {
      setLoading(false);
    }
  };

  const performLogin = async (data: LoginForm, twoFactorCodeParam?: string) => {
    try {
      // Construir el body condicionalmente
      const body: any = {
        username: data.username,
        password: data.password,
      };

      // Solo agregar totp_code si existe
      if (twoFactorCodeParam) {
        body.totp_code = twoFactorCodeParam;
      }

      const response = await api.post("/auth/login", body);

      if (response.data.success) {
        setAuth(response.data.data.token, response.data.data.user);

        // Redirección inteligente según el rol del usuario
        const userRole = response.data.data.user.role;
        if (userRole === 'chemist') {
          navigate("/patients");
        } else {
          navigate("/waiting-room");
        }
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handle2FASubmit = async () => {
    if (!credentials || twoFactorCode.length !== 6) return;

    setLoading(true);
    try {
      await performLogin(credentials, twoFactorCode);
      // Si llegamos aquí, el login fue exitoso y ya redirigió
      setShow2FAModal(false);
    } catch (error: any) {
      // Mantener el modal abierto y limpiar el código para permitir reintento
      setTwoFactorCode("");
      toast.error(
        error.response?.data?.error?.totp_code ||
        "El código de autenticación es inválido o ha expirado"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                {...register("username")}
                placeholder="Nombre de usuario"
                error={errors.username?.message}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste la contraseña?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  autoComplete="current-password"
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

            <Button type="submit" disabled={loading} className="w-full" isLoading={loading}>
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Modal 2FA */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Autenticación de dos factores</DialogTitle>
            <DialogDescription className="text-center">
              Ingresa el código de 6 dígitos de tu app autenticadora
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
            </div>

            <Button
              onClick={handle2FASubmit}
              disabled={loading || twoFactorCode.length !== 6}
              className="w-full"
              isLoading={loading}
            >
              {loading ? "Verificando..." : "Verificar código"}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setShow2FAModal(false);
                setTwoFactorCode("");
              }}
              className="w-full"
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Recuperar Contraseña */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </>
  );
}
