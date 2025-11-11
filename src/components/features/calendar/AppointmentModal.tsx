import { useState, useEffect } from "react";
import { useCreateAppointment, useUpdateAppointment } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";
import { useUsers } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/authStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { toast } from "sonner";
import type { AppointmentWithDetails } from "@/types/appointment";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  appointment?: AppointmentWithDetails;
}

export function AppointmentModal({
  isOpen,
  onClose,
  initialDate,
  appointment,
}: AppointmentModalProps) {
  const user = useAuthStore((state) => state.user);
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const { data: patientsData } = usePatients(1, 1000); // Get all patients for selection
  const { data: doctorsData } = useUsers({ role: "doctor" });

  const isEditing = !!appointment;

  // Form state
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState(user?.role === "doctor" ? user.id : "");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [syncToGoogle, setSyncToGoogle] = useState(true);

  // Initialize form with appointment data or initial date
  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        // Editing existing appointment
        setPatientId(appointment.patient_id);
        setDoctorId(appointment.doctor_id);
        // Convert ISO to datetime-local format
        setAppointmentDate(new Date(appointment.appointment_date).toISOString().slice(0, 16));
        setDurationMinutes(appointment.duration_minutes);
        setTitle(appointment.title);
        setNotes(appointment.notes || "");
        setSyncToGoogle(false); // Don't re-sync when updating
      } else if (initialDate) {
        // Creating new appointment with initial date
        setAppointmentDate(initialDate.toISOString().slice(0, 16));
        setTitle("");
        setNotes("");
        setDurationMinutes(30);
        setSyncToGoogle(true);
      } else {
        // Creating new appointment without date
        setAppointmentDate(new Date().toISOString().slice(0, 16));
        setTitle("");
        setNotes("");
        setDurationMinutes(30);
        setSyncToGoogle(true);
      }
    }
  }, [isOpen, appointment, initialDate]);

  const handleClose = () => {
    setPatientId("");
    setTitle("");
    setNotes("");
    setAppointmentDate("");
    setDurationMinutes(30);
    setSyncToGoogle(true);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId || !doctorId || !appointmentDate || !title) {
      return;
    }

    // Validate appointment date is not in the past
    const selectedDate = new Date(appointmentDate);
    const now = new Date();
    if (selectedDate < now) {
      toast.error("La fecha de la cita debe ser en el futuro");
      return;
    }

    try {
      if (isEditing) {
        // Update existing appointment
        await updateMutation.mutateAsync({
          id: appointment.id,
          data: {
            appointment_date: new Date(appointmentDate).toISOString(),
            duration_minutes: durationMinutes,
            title,
            notes: notes || undefined,
          },
        });
      } else {
        // Create new appointment
        await createMutation.mutateAsync({
          patient_id: patientId,
          doctor_id: doctorId,
          appointment_date: new Date(appointmentDate).toISOString(),
          duration_minutes: durationMinutes,
          title,
          notes: notes || undefined,
          sync_to_google: syncToGoogle,
        });
      }

      handleClose();
    } catch (error) {
      // Error handled by mutation
      console.error("Error saving appointment:", error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cita" : "Nueva Cita"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los detalles de la cita"
              : "Programa una nueva cita para un paciente"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient">
              <User className="mr-2 inline h-4 w-4" />
              Paciente *
            </Label>
            {isEditing && appointment ? (
              <Input
                id="patient"
                value={appointment.patient?.full_name || "N/A"}
                disabled
                className="bg-muted"
              />
            ) : (
              <Select
                value={patientId}
                onValueChange={setPatientId}
                required
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Selecciona un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patientsData?.patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Doctor Selection (if user is not a doctor) */}
          {user?.role !== "doctor" && (
            <div className="space-y-2">
              <Label htmlFor="doctor">
                <User className="mr-2 inline h-4 w-4" />
                Doctor *
              </Label>
              <Select value={doctorId} onValueChange={setDoctorId} required>
                <SelectTrigger id="doctor">
                  <SelectValue placeholder="Selecciona un doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctorsData?.users.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.first_name} {doctor.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="datetime">
                <Calendar className="mr-2 inline h-4 w-4" />
                Fecha y Hora *
              </Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">
                <Clock className="mr-2 inline h-4 w-4" />
                Duración (minutos)
              </Label>
              <Select
                value={durationMinutes.toString()}
                onValueChange={(value) => setDurationMinutes(parseInt(value))}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1.5 horas</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              <FileText className="mr-2 inline h-4 w-4" />
              Título de la Cita *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Control general, Seguimiento de tratamiento..."
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales sobre la cita..."
              rows={3}
            />
          </div>

          {/* Sync to Google Calendar */}
          {!isEditing && (
            <div className="flex items-center space-x-2 rounded-lg border p-4">
              <Switch
                id="sync-google"
                checked={syncToGoogle}
                onCheckedChange={setSyncToGoogle}
              />
              <Label htmlFor="sync-google" className="cursor-pointer">
                Sincronizar con Google Calendar
              </Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? "Guardar Cambios" : "Crear Cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
