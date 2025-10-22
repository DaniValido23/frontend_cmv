import { useState } from 'react';
import { useSessions, useRevokeSession } from '@/hooks/useUsers';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Modal';
import { UserX, Shield, Stethoscope, UserCog, FlaskConical, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import type { Session } from '@/types/session';

export default function SessionsTable() {
  const { data: sessions = [], isLoading, refetch } = useSessions();
  const revokeSessionMutation = useRevokeSession();
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRevokeClick = (session: Session) => {
    setSelectedSession(session);
    setShowRevokeModal(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const confirmRevoke = () => {
    if (selectedSession) {
      revokeSessionMutation.mutate(selectedSession.id, {
        onSuccess: () => {
          setShowRevokeModal(false);
          setSelectedSession(null);
        },
        onError: () => {
          setShowRevokeModal(false);
          setSelectedSession(null);
        },
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    // El backend envía formato: DD-MM-YYYY HH:mm:ss
    // Necesitamos convertir a formato que JavaScript pueda parsear
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('-');

    // Crear fecha en formato ISO: YYYY-MM-DDTHH:mm:ss
    const isoDate = `${year}-${month}-${day}T${timePart}`;
    const date = new Date(isoDate);

    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleText = (role: string) => {
    if (role === 'doctor') {
      return 'Doctor';
    } else if (role === 'chemist') {
      return 'Químico';
    } else {
      return 'Asistente';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de acciones */}
      <Card className="p-4">
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={clsx('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            Actualizar
          </Button>
        </div>
      </Card>

      {/* Lista de sesiones */}
      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay sesiones registradas</p>
            </div>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card
              key={session.id}
              className={`p-4 sm:p-5 hover:shadow-md transition-shadow ${
                session.revoked ? 'opacity-60 bg-muted/30' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                {/* Icono según rol */}
                <div className={`p-3 rounded-lg shrink-0 self-start sm:self-center ${
                  session.revoked ? 'bg-muted' : 'bg-primary/10'
                }`}>
                  {session.revoked ? (
                    <Shield className="h-6 w-6 text-muted-foreground" />
                  ) : session.role === 'doctor' ? (
                    <Stethoscope className="h-6 w-6 text-primary" />
                  ) : session.role === 'chemist' ? (
                    <FlaskConical className="h-6 w-6 text-primary" />
                  ) : (
                    <UserCog className="h-6 w-6 text-primary" />
                  )}
                </div>

                {/* Información de la sesión */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Usuario y Rol */}
                  <div className="space-y-1 text-center">
                    <h3 className="font-semibold text-base text-foreground">
                      {session.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getRoleText(session.role)}
                    </p>
                  </div>

                  {/* Dispositivo */}
                  <div className="space-y-1 text-center">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Dispositivo</p>
                    <p className="text-sm font-medium truncate">
                      {session.device_name}
                    </p>
                  </div>

                  {/* Fecha de creación */}
                  <div className="space-y-1 text-center">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Iniciada</p>
                    <p className="text-sm font-medium">
                      {formatDateTime(session.created_at)}
                    </p>
                  </div>

                  {/* IP */}
                  <div className="space-y-1 text-center">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Dirección IP</p>
                    <p className="text-sm font-medium">
                      {session.ip_address}
                    </p>
                  </div>
                </div>

                {/* Botón de acción */}
                {!session.revoked && (
                  <div className="flex shrink-0">
                    <Button
                      onClick={() => handleRevokeClick(session)}
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <UserX className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Revocar</span>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de confirmación */}
      <Dialog open={showRevokeModal} onOpenChange={setShowRevokeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revocar Sesión</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas revocar la sesión de <strong>{selectedSession?.full_name}</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Dispositivo: {selectedSession?.device_name}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRevokeModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmRevoke}
              disabled={revokeSessionMutation.isPending}
            >
              {revokeSessionMutation.isPending ? "Revocando..." : "Sí, revocar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
