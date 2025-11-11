import { useEffect } from "react";
import {
  useGoogleCalendarStatus,
  useConnectGoogleCalendar,
  useDisconnectGoogleCalendar,
  useCheckGoogleCalendarConnection,
} from "@/hooks/useGoogleCalendar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Calendar, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { parseApiError } from "@/lib/errorHandler";
import { AxiosError } from "axios";

export function GoogleCalendarSettings() {
  const { data: status, isLoading, error, isError } = useGoogleCalendarStatus();
  const connectMutation = useConnectGoogleCalendar();
  const disconnectMutation = useDisconnectGoogleCalendar();
  const checkConnection = useCheckGoogleCalendarConnection();

  // Check for OAuth callback parameters on component mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleConnect = () => {
    connectMutation.mutate();
  };

  const handleDisconnect = (revokeAccess: boolean = false) => {
    if (
      confirm(
        revokeAccess
          ? "¿Estás seguro de que deseas revocar el acceso a Google Calendar? Tendrás que autorizar nuevamente."
          : "¿Estás seguro de que deseas desconectar Google Calendar? Podrás reconectar en cualquier momento."
      )
    ) {
      disconnectMutation.mutate({ revoke_access: revokeAccess });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Integración con Google Calendar
          </CardTitle>
          <CardDescription>
            Sincroniza tus citas con Google Calendar automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    const apiError = parseApiError(error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Integración con Google Calendar
          </CardTitle>
          <CardDescription>
            Sincroniza tus citas con Google Calendar automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error al cargar el estado de integración</AlertTitle>
            <AlertDescription>
              {apiError.message || "No se pudo verificar el estado de Google Calendar."}
            </AlertDescription>
            {error instanceof AxiosError && error.response && (
              <AlertDescription className="mt-2 text-xs opacity-75">
                Código: {error.response.status} |
                Detalles: {JSON.stringify(error.response.data?.error || error.response.data)}
              </AlertDescription>
            )}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isConnected = status?.connected && status?.enabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Integración con Google Calendar
        </CardTitle>
        <CardDescription>
          Sincroniza tus citas con Google Calendar automáticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Estado:</span>
          {isConnected ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              No conectado
            </Badge>
          )}
        </div>

        {/* Connection Details */}
        {isConnected && (
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Calendario:</span>
              <span className="font-medium">{status.calendar_id || "primary"}</span>
            </div>

            {status.last_sync_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Última sincronización:</span>
                <span className="font-medium">
                  {new Date(status.last_sync_at).toLocaleString("es-HN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Sync Error Alert */}
        {status?.last_sync_error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error de sincronización:</strong>
              <br />
              {status.last_sync_error}
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Instructions */}
        {!isConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Al conectar Google Calendar, las citas que crees en el sistema se sincronizarán
              automáticamente con tu calendario de Google.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              isLoading={connectMutation.isPending}
              className="w-full"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Conectar Google Calendar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleDisconnect(false)}
                isLoading={disconnectMutation.isPending}
                className="flex-1"
              >
                Desconectar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDisconnect(true)}
                isLoading={disconnectMutation.isPending}
                className="flex-1"
              >
                Revocar Acceso
              </Button>
            </>
          )}
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground">
          {isConnected
            ? "Las citas nuevas se sincronizarán automáticamente con Google Calendar. Puedes desconectar en cualquier momento."
            : "Necesitarás autorizar el acceso a tu cuenta de Google. La conexión es segura y puedes revocarla en cualquier momento."}
        </p>
      </CardContent>
    </Card>
  );
}
