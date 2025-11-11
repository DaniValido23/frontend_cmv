import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useWaitingRoom,
  useCallPatient,
  useChangeWaitingRoomStatus,
} from "@/hooks/useWaitingRoom";
import { useDashboardStats } from "@/hooks/useAnalytics";
import { useDoctors } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "@/hooks/useNavigate";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Separator from "@/components/ui/Separator";
import ConfirmRemovePatientModal from "@/components/features/waiting-room/ConfirmRemovePatientModal";
import { User, Users, FileText, DollarSign, Calendar, Clock, UserCog, Stethoscope, Microscope } from "lucide-react";
import { toast } from "sonner";

export default function WaitingRoomBoard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Estado para filtro de doctor (solo para asistentes)
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>("");

  const { data: waitingRoom, isLoading } = useWaitingRoom(selectedDoctorFilter || undefined);
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats(selectedDoctorFilter || undefined);
  const { data: doctorsList = [], isLoading: loadingDoctors } = useDoctors();
  const callMutation = useCallPatient();
  const changeStatusMutation = useChangeWaitingRoomStatus();

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isAssistant = user?.role === "assistant";

  // Actualizar el tiempo actual cada minuto para recalcular los semáforos y tiempo de espera
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualizar cada 1 minuto (60 segundos)

    return () => clearInterval(interval);
  }, []);

  // Memoize helper function for parsing arrival time
  const parseArrivalTime = useCallback((arrivalTime: string): Date => {
    console.log('🔍 DEBUG - arrivalTime raw:', arrivalTime);
    if (arrivalTime.includes('-') && arrivalTime.split('-')[0].length <= 2) {
      const [datePart, timePart] = arrivalTime.split(' ');
      const [day, month, year] = datePart.split('-');
      const isoDate = `${year}-${month}-${day}T${timePart || '00:00:00'}`;
      return new Date(isoDate);
    }
    const parsed = new Date(arrivalTime);
    console.log('🔍 DEBUG - parsed date:', parsed, 'current time:', new Date());
    return parsed;
  }, []);

  // Memoize waiting minutes calculation
  const getWaitingMinutes = useCallback((arrivalTime: string): number => {
    const arrivalDate = parseArrivalTime(arrivalTime);
    const diffMs = currentTime.getTime() - arrivalDate.getTime();
    return Math.floor(diffMs / 60000);
  }, [currentTime, parseArrivalTime]);

  // Memoize traffic light state calculation
  const getTrafficLightState = useCallback((arrivalTime: string): 'green' | 'orange' | 'red' => {
    const minutes = getWaitingMinutes(arrivalTime);

    if (minutes >= 40) {
      return 'red'; // Rojo: más de 40 minutos
    } else if (minutes >= 20) {
      return 'orange'; // Naranja: 20-39 minutos
    } else {
      return 'green'; // Verde: 0-19 minutos
    }
  }, [getWaitingMinutes]);

  // Memoize waiting time formatting
  const formatWaitingTime = useCallback((arrivalTime: string): string => {
    const minutes = getWaitingMinutes(arrivalTime);

    if (minutes < 1) {
      return "Recién llegado";
    } else if (minutes === 1) {
      return "1 minuto";
    } else if (minutes < 60) {
      return `${minutes} minutos`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return hours === 1 ? "1 hora" : `${hours} horas`;
      }
      return `${hours}h ${remainingMinutes}m`;
    }
  }, [getWaitingMinutes]);

  // Memoize priority color function
  const getPriorityColor = useCallback((priority: string) => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === "urgente" || priorityLower === "urgent") {
      return "bg-destructive/5 border-destructive/20 hover:shadow-destructive/10";
    }
    return "bg-primary/5 border-primary/20 hover:shadow-primary/10";
  }, []);

  // Render record type badge
  const renderRecordTypeBadge = useCallback((recordType?: string) => {
    if (recordType === "study") {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Microscope className="h-3 w-3" />
          <span>Estudio</span>
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Stethoscope className="h-3 w-3" />
        <span>Consulta</span>
      </Badge>
    );
  }, []);

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

  // Memoize sorted waiting room to avoid re-sorting on every render
  // IMPORTANT: This must be called before any conditional returns to follow Rules of Hooks
  const waitingPatients = useMemo(() => {
    if (!waitingRoom) return [];

    // Sort strictly by arrival time (FIFO - First In First Out)
    // Priority is shown visually but doesn't affect queue order
    return [...waitingRoom].sort((a, b) => {
      return parseArrivalTime(a.arrival_time).getTime() - parseArrivalTime(b.arrival_time).getTime();
    });
  }, [waitingRoom, parseArrivalTime]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-full space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-shrink-0">
        {/* Consultas y Análisis del día */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Consultas y Análisis del Día</p>
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
      <Card className="flex-1 min-h-0">
        <div className="h-full flex flex-col">
          <div className="p-4 pb-3 sm:p-6 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Pacientes en Sala de Espera</h3>
                <Badge variant="secondary">{waitingPatients.length}</Badge>
              </div>

              {/* Filtro de Doctor - Solo para Asistentes */}
              {isAssistant && (
                <div className="flex items-center gap-2 sm:ml-auto">
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={selectedDoctorFilter}
                    onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={loadingDoctors}
                  >
                    <option value="">Todos los doctores</option>
                    {doctorsList.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.first_name} {doctor.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
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
                {waitingPatients.map((entry) => {
                  const trafficLightState = getTrafficLightState(entry.arrival_time);

                  return (
                    <div
                      key={entry.id}
                      className={`p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow ${getPriorityColor(entry.priority)}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          {/* Nombre, edad y tipo de registro */}
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm sm:text-base">{entry.patient.full_name}</h3>
                            <span className="text-xs text-muted-foreground">({entry.patient.age} años)</span>
                            {renderRecordTypeBadge(entry.record_type)}
                          </div>

                          {/* Información del paciente */}
                          <div className="flex flex-col gap-2 sm:ml-6">
                            {/* Semáforo de 3 círculos */}
                            <div className="flex items-center gap-2">
                              {/* Círculo Verde */}
                              <div
                                className={`w-5 h-5 rounded-full border-2 ${
                                  trafficLightState === 'green'
                                    ? 'bg-green-500 border-green-600 shadow-md'
                                    : 'bg-gray-200 border-gray-300'
                                }`}
                                title="0-20 minutos"
                              />
                              {/* Círculo Naranja */}
                              <div
                                className={`w-5 h-5 rounded-full border-2 ${
                                  trafficLightState === 'orange'
                                    ? 'bg-orange-500 border-orange-600 shadow-md'
                                    : 'bg-gray-200 border-gray-300'
                                }`}
                                title="20-40 minutos"
                              />
                              {/* Círculo Rojo */}
                              <div
                                className={`w-5 h-5 rounded-full border-2 ${
                                  trafficLightState === 'red'
                                    ? 'bg-red-500 border-red-600 shadow-md'
                                    : 'bg-gray-200 border-gray-300'
                                }`}
                                title="40+ minutos"
                              />
                            </div>

                            {/* Tiempo de espera con ícono de reloj */}
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <strong>Tiempo de espera:</strong> {formatWaitingTime(entry.arrival_time)}
                            </p>
                          </div>
                        </div>

                        {/* Botones de acción */}
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
                  );
                })}
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
