import { useState, useEffect } from "react";
import { useCreatePatient } from "@/hooks/usePatients";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { User, Phone, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patient: any) => void;
  initialName?: string;
}

// Función para parsear el nombre completo
function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const words = fullName.trim().split(/\s+/).filter(w => w.length > 0);

  if (words.length === 0) {
    return { firstName: "", lastName: "" };
  } else if (words.length === 1) {
    return { firstName: words[0], lastName: "" };
  } else if (words.length === 2) {
    return { firstName: words[0], lastName: words[1] };
  } else if (words.length === 3) {
    return { firstName: words[0], lastName: `${words[1]} ${words[2]}` };
  } else {
    // 4 o más palabras: mitad para first_name, mitad para last_name
    const mid = Math.floor(words.length / 2);
    return {
      firstName: words.slice(0, mid).join(" "),
      lastName: words.slice(mid).join(" "),
    };
  }
}

// Función para convertir fecha de YYYY-MM-DD a DD-MM-YYYY
function formatDateForAPI(dateString: string): string {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
}

export default function AddPatientModal({
  isOpen,
  onClose,
  onPatientCreated,
  initialName = "",
}: AddPatientModalProps) {
  const createPatientMutation = useCreatePatient();

  // Parse initial name
  const parsedName = parseFullName(initialName);

  // Form states
  const [firstName, setFirstName] = useState(parsedName.firstName);
  const [lastName, setLastName] = useState(parsedName.lastName);
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [allergies, setAllergies] = useState("");

  // Update names when initialName changes
  useEffect(() => {
    const parsed = parseFullName(initialName);
    setFirstName(parsed.firstName);
    setLastName(parsed.lastName);
  }, [initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!firstName.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    if (!lastName.trim()) {
      toast.error("El apellido es requerido");
      return;
    }
    if (!birthDate) {
      toast.error("La fecha de nacimiento es requerida");
      return;
    }
    if (!gender) {
      toast.error("El género es requerido");
      return;
    }

    // Preparar datos para la API
    const patientData = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      birth_date: formatDateForAPI(birthDate),
      phone: phone.trim() || undefined,
      gender: gender,
      allergies: allergies.trim() || "Ninguna",
    };

    createPatientMutation.mutate(patientData, {
      onSuccess: (response) => {
        const newPatient = response.data;

        if (newPatient?.id) {
          onPatientCreated(newPatient);
          handleClose();
        } else {
          toast.error("Error: No se recibió el ID del paciente");
        }
      },
    });
  };

  const handleClose = () => {
    // Reset form
    setFirstName("");
    setLastName("");
    setBirthDate("");
    setPhone("");
    setGender("");
    setAllergies("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
          <DialogDescription>
            Completa la información del paciente para registrarlo en el sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Nombre(s) <span className="text-destructive">*</span>
                </div>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jorge"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Apellido(s) <span className="text-destructive">*</span>
                </div>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="García"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Fecha de Nacimiento <span className="text-destructive">*</span>
              </div>
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Formato: DD-MM-YYYY
            </p>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Teléfono <span className="text-muted-foreground text-xs">(Opcional)</span>
              </div>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="1251234567"
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Género */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Género <span className="text-destructive">*</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              required
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
                <AlertCircle className="h-4 w-4 text-destructive" />
                Alergias
              </div>
            </label>
            <textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Penicilina, Polen, etc. (Opcional)"
              rows={2}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Buttons */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createPatientMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={createPatientMutation.isPending}
            >
              {createPatientMutation.isPending ? "Guardando..." : "Guardar Paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
