import { useState } from "react";
import {
  useWaitingRoom,
  useCallPatient,
  useChangeWaitingRoomStatus,
} from "@/hooks/useWaitingRoom";
import { useDashboardStats } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "@/hooks/useNavigate";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Separator from "@/components/ui/Separator";
import ConfirmRemovePatientModal from "@/components/features/waiting-room/ConfirmRemovePatientModal";
import { User, Users, FileText, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function WaitingRoomBoard() {
  const { data: waitingRoom, isLoading } = useWaitingRoom();
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats();
  const user = useAuthStore((state) => state.user);
  const callMutation = useCallPatient();
  const changeStatusMutation = useChangeWaitingRoomStatus();

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);

  const getPriorityColor = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === "urgente" || priorityLower === "urgent") {
      return "bg-destructive/5 border-destructive/20 hover:shadow-destructive/10";
    }
    return "bg-primary/5 border-primary/20 hover:shadow-primary/10";
  };

  const getGenderLabel = (gender?: string) => {
    if (!gender) return "No especificado";
    const genderLower = gender.toLowerCase();
    if (genderLower === "male" || genderLower === "masculino" || genderLower === "m") {
      return "Masculino";
    }
    if (genderLower === "female" || genderLower === "femenino" || genderLower === "f") {
      return "Femenino";
    }
    return gender;
  };

  const formatArrivalTime = (arrivalTime: string) => {
    const date = new Date(arrivalTime);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleAttend = async (id: string) => {
    changeStatusMutation.mutate(
      { id, status: "En consulta" },
      {
        onSuccess: () => {
          navigate("/consultation");
        },
      }
    );
  };

  const handleRemove = (id: string, name: string) => {
    setSelectedPatient({ id, name });
    setShowRemoveModal(true);
  };

  const confirmRemove = () => {
    if (selectedPatient) {
      changeStatusMutation.mutate(
        { id: selectedPatient.id, status: "Cancelado" },
        {
          onSuccess: () => {
            toast.success("Paciente removido de la sala de espera");
            setShowRemoveModal(false);
            setSelectedPatient(null);
          },
          onError: () => {
            setShowRemoveModal(false);
            setSelectedPatient(null);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Sort strictly by arrival time (FIFO - First In First Out)
  // Priority is shown visually but doesn't affect queue order
  const sortedWaitingRoom = [...(waitingRoom || [])].sort((a, b) => {
    return new Date(a.arrival_time).getTime() - new Date(b.arrival_time).getTime();
  });

  const waitingPatients = sortedWaitingRoom;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Consultas del día */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Consultas del Día</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {isLoadingStats ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  dashboardStats?.consultations_today ?? 0
                )}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* Pacientes en espera */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pacientes en Espera</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {isLoadingStats ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  dashboardStats?.patients_in_waiting_room ?? 0
                )}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>

        {/* Ingresos del día - solo para doctores */}
        {user?.role === "doctor" && (
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos del Día</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {isLoadingStats ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    `$${dashboardStats?.revenue_today?.toFixed(2) ?? "0.00"}`
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Lista de pacientes en sala de espera */}
      <Card className="min-h-[400px] lg:h-[calc(100vh-400px)]">
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-2 p-4 pb-3 sm:p-6 sm:pb-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Pacientes en Sala de Espera</h3>
            <Badge variant="secondary">{waitingPatients.length}</Badge>
          </div>
          <Separator />

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {waitingPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground mb-2">
                  No hay pacientes en espera
                </p>
                <p className="text-sm text-muted-foreground">
                  Aquí se visualizarán los pacientes esperando para ser atendidos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {waitingPatients.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow ${getPriorityColor(entry.priority)}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold text-sm sm:text-base">{entry.patient.full_name}</h3>
                          <span className="text-xs text-muted-foreground">({entry.patient.age} años)</span>
                        </div>
                        <div className="flex flex-col gap-1 sm:ml-6 text-xs text-muted-foreground">
                          <p>
                            <strong>Sexo:</strong> {getGenderLabel(entry.patient.gender)}
                          </p>
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <strong>Llegada:</strong> {formatArrivalTime(entry.arrival_time)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 sm:ml-4">
                        {user?.role === "doctor" && (
                          <Button
                            size="sm"
                            onClick={() => handleAttend(entry.id)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                          >
                            Atender
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleRemove(entry.id, entry.patient.full_name)}>
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modal de Confirmación de Remoción */}
      <ConfirmRemovePatientModal
        open={showRemoveModal}
        onOpenChange={setShowRemoveModal}
        onConfirm={confirmRemove}
        patientName={selectedPatient?.name || ""}
        isLoading={changeStatusMutation.isPending}
      />
    </div>
  );
}
