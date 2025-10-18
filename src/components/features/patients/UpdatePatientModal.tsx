import { useState, useEffect } from "react";
import { usePatient, useUpdatePatient } from "@/hooks/usePatients";
import Button from "@/components/ui/Button";
import { X, User, Phone, Calendar, Users, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface UpdatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export default function UpdatePatientModal({
  isOpen,
  onClose,
  patientId,
}: UpdatePatientModalProps) {
  const { data: patient, isLoading, refetch } = usePatient(patientId);
  const updatePatientMutation = useUpdatePatient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [allergies, setAllergies] = useState("");

  // Refetch cuando el modal se abre
  useEffect(() => {
    if (isOpen && patientId) {
      refetch();
    }
  }, [isOpen, patientId, refetch]);

  // Llenar el formulario cuando se cargue el paciente
  useEffect(() => {
    if (patient) {
      setFirstName(patient.first_name || "");
      setLastName(patient.last_name || "");

      // Convertir la fecha al formato YYYY-MM-DD para el input
      if (patient.birth_date) {
        const date = new Date(patient.birth_date);
        const formattedDate = date.toISOString().split('T')[0];
        setBirthDate(formattedDate);
      }

      setPhone(patient.phone || "");
      setGender(patient.gender || "");
      setAllergies(patient.allergies || "");
    }
  }, [patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convertir fecha de YYYY-MM-DD a DD-MM-YYYY
    const formatBirthDate = (dateString: string) => {
      if (!dateString) return "";
      const [year, month, day] = dateString.split('-');
      return `${day}-${month}-${year}`;
    };

    const updateData = {
      first_name: firstName,
      last_name: lastName,
      birth_date: formatBirthDate(birthDate),
      phone,
      gender,
      allergies,
    };

    updatePatientMutation.mutate(
      {
        id: patientId,
        data: updateData,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Actualizar Información del Paciente
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : patient ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombres */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Nombres *
                  </div>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nombres del paciente"
                />
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Apellidos *
                  </div>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Apellidos del paciente"
                />
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Fecha de Nacimiento *
                  </div>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Teléfono
                  </div>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Número de teléfono"
                />
              </div>

              {/* Género */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Género *
                  </div>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Seleccionar género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Alergias */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    Alergias
                  </div>
                </label>
                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none"
                  placeholder="Alergias conocidas del paciente (opcional)"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={updatePatientMutation.isPending}
                >
                  {updatePatientMutation.isPending ? "Actualizando..." : "Actualizar Paciente"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={updatePatientMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se pudo cargar la información del paciente
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
