import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { Shield, Check, Copy, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Modal from "@/components/ui/Modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

export default function TwoFactorSetup() {
  const [isOpen, setIsOpen] = useState(false);
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [step, setStep] = useState<"setup" | "verify" | "complete">("setup");

  const setupMutation = useMutation({
    mutationFn: () => api.post("/auth/2fa/setup"),
    onSuccess: (response) => {
      setSecret(response.data.data.secret);
      setQrCode(response.data.data.qr_code);
      setBackupCodes(response.data.data.backup_codes);
      setStep("verify");
      toast.success("Escanea el código QR con tu app autenticadora");
    },
    onError: () => toast.error("Error al configurar 2FA"),
  });

  const verifyMutation = useMutation({
    mutationFn: (code: string) => api.post("/auth/2fa/verify", { code }),
    onSuccess: () => {
      setStep("complete");
      toast.success("2FA activado correctamente");
    },
    onError: () => toast.error("Código inválido"),
  });

  const handleSetup = () => {
    setIsOpen(true);
    setupMutation.mutate();
  };

  const handleVerify = () => {
    if (verifyCode.length === 6) {
      verifyMutation.mutate(verifyCode);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success("Clave secreta copiada al portapapeles");
  };

  return (
    <>
      <Button onClick={handleSetup}>
        <Shield className="w-4 h-4 mr-2" />
        Configurar Autenticación 2FA
      </Button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        {step === "setup" && (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-4">Configurando 2FA...</h3>
            <Spinner className="mx-auto" />
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">
                Configurar autenticación 2FA
              </h3>
              <p className="text-sm text-muted-foreground">
                Escanea el código QR con tu aplicación autenticadora
              </p>
            </div>

            <Card>
              <CardContent className="flex justify-center p-6">
                <div className="bg-card p-4 rounded-lg border">
                  <div className="w-full max-w-[200px] sm:max-w-[250px] mx-auto">
                    <QRCode value={qrCode} size={200} className="w-full h-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configuración manual</CardTitle>
                <CardDescription>
                  Si no puedes escanear el QR, usa esta clave secreta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-muted p-2 rounded break-all">
                    {secret}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copySecret}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="verify-code">Código de verificación</Label>
              <Input
                id="verify-code"
                type="text"
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-muted-foreground text-center">
                Ingresa el código de 6 dígitos de tu app autenticadora
              </p>
            </div>

            <Button
              onClick={handleVerify}
              disabled={verifyCode.length !== 6 || verifyMutation.isPending}
              className="w-full"
              isLoading={verifyMutation.isPending}
            >
              Verificar y activar
            </Button>
          </div>
        )}

        {step === "complete" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Autenticación 2FA activada</h3>
              <p className="text-sm text-muted-foreground">
                Tu cuenta ahora está protegida con autenticación de dos factores
              </p>
            </div>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <CardTitle className="text-base text-amber-900">
                      Códigos de respaldo
                    </CardTitle>
                    <CardDescription className="text-amber-800">
                      Guarda estos códigos en un lugar seguro. Puedes usarlos si
                      pierdes acceso a tu aplicación autenticadora.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {backupCodes.map((code, i) => (
                    <div
                      key={i}
                      className="bg-card border p-2.5 rounded-md text-center font-mono text-sm"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => setIsOpen(false)} className="w-full">
              Entendido
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
