import { useState, useEffect, useMemo } from "react";
import { useCreatePatient, useUpdatePatient } from "@/hooks/usePatients";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Autocomplete from "@/components/ui/Autocomplete";
import { User, Phone, Calendar, AlertCircle, FileText, Heart, Briefcase, Home } from "lucide-react";
import { toast } from "sonner";
import type { Patient } from "@/types/models";
import { frequentReligions } from "@/data/religion_frecuent";
import { frequentOccupations } from "@/data/occupation_frecuent";
import { frequentNativeOf } from "@/data/native_of_frecuent";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patient: any) => void;
  initialName?: string;
  initialPatient?: Patient;
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

// Función para convertir fecha de YYYY-MM-DD a DD-MM-YYYY para la API
function formatDateForAPI(dateString: string): string {
  if (!dateString) return "";
  // El input type="date" devuelve formato YYYY-MM-DD
  // El backend espera formato DD-MM-YYYY
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
}

// Función para convertir fecha de DD-MM-YYYY a YYYY-MM-DD
function formatDateForInput(dateString: string): string {
  if (!dateString) return "";
  // Si ya está en formato YYYY-MM-DD
  if (dateString.includes("-") && dateString.split("-")[0].length === 4) {
    return dateString;
  }
  // Si está en formato DD-MM-YYYY
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
}

export default function AddPatientModal({
  isOpen,
  onClose,
  onPatientCreated,
  initialName = "",
  initialPatient,
}: AddPatientModalProps) {
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();

  const isEditing = !!initialPatient;

  // Parse initial name
  const parsedName = parseFullName(initialName);

  // Form states
  const [firstName, setFirstName] = useState(parsedName.firstName);
  const [lastName, setLastName] = useState(parsedName.lastName);
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"Masculino" | "Femenino" | "">("");
  const [allergies, setAllergies] = useState("");
  const [religion, setReligion] = useState("");
  const [occupation, setOccupation] = useState("");
  const [nativeOf, setNativeOf] = useState("");
  const [personalBackground, setPersonalBackground] = useState("");
  const [obstetricGynecologicalBackground, setObstetricGynecologicalBackground] = useState("");

  // Filtrar sugerencias de religión
  const religionSuggestions = useMemo(() => {
    if (!religion.trim()) return [];
    return frequentReligions.filter(r =>
      r.toLowerCase().includes(religion.toLowerCase())
    ).slice(0, 5);
  }, [religion]);

  // Filtrar sugerencias de ocupación
  const occupationSuggestions = useMemo(() => {
    if (!occupation.trim()) return [];
    return frequentOccupations.filter(o =>
      o.toLowerCase().includes(occupation.toLowerCase())
    ).slice(0, 5);
  }, [occupation]);

  // Filtrar sugerencias de lugar de origen
  const nativeOfSuggestions = useMemo(() => {
    if (!nativeOf.trim()) return [];
    return frequentNativeOf.filter(n =>
      n.toLowerCase().includes(nativeOf.toLowerCase())
    ).slice(0, 5);
  }, [nativeOf]);

  // Update form when initialPatient changes
  useEffect(() => {
    if (initialPatient) {
      const names = parseFullName(initialPatient.full_name);
      setFirstName(names.firstName);
      setLastName(names.lastName);
      setBirthDate(formatDateForInput(initialPatient.birth_date));
      setPhone(initialPatient.phone || "");
      setGender(initialPatient.gender || "");
      setAllergies(initialPatient.allergies || "");
      setReligion(initialPatient.religion || "");
      setOccupation(initialPatient.occupation || "");
      setNativeOf(initialPatient.native_of || "");
      setPersonalBackground(initialPatient.personal_background || "");
      setObstetricGynecologicalBackground(initialPatient.obstetric_gynecological_background || "");
    } else if (initialName) {
      const parsed = parseFullName(initialName);
      setFirstName(parsed.firstName);
      setLastName(parsed.lastName);
    }
  }, [initialName, initialPatient]);

  // Función para verificar si los datos han cambiado
  const hasDataChanged = (): boolean => {
    if (!initialPatient) return true; // Si es nuevo paciente, siempre hay cambios

    const names = parseFullName(initialPatient.full_name);
    const originalData = {
      firstName: names.firstName.trim(),
      lastName: names.lastName.trim(),
      birthDate: formatDateForAPI(formatDateForInput(initialPatient.birth_date)),
      phone: (initialPatient.phone || "").trim(),
      gender: initialPatient.gender || "",
      allergies: (initialPatient.allergies || "").trim(),
      religion: (initialPatient.religion || "").trim(),
      occupation: (initialPatient.occupation || "").trim(),
      nativeOf: (initialPatient.native_of || "").trim(),
      personalBackground: (initialPatient.personal_background || "").trim(),
      obstetricGynecologicalBackground: (initialPatient.obstetric_gynecological_background || "").trim(),
    };

    const currentData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: formatDateForAPI(birthDate),
      phone: phone.trim(),
      gender: gender,
      allergies: allergies.trim(),
      religion: religion.trim(),
      occupation: occupation.trim(),
      nativeOf: nativeOf.trim(),
      personalBackground: personalBackground.trim(),
      obstetricGynecologicalBackground: obstetricGynecologicalBackground.trim(),
    };

    // Comparar cada campo
    return JSON.stringify(originalData) !== JSON.stringify(currentData);
  };

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

    // Preparar datos para la API - Enviar todos los campos según el schema del backend
    const patientData = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      birth_date: formatDateForAPI(birthDate),
      phone: phone.trim(),
      gender: gender as "Masculino" | "Femenino",
      allergies: allergies.trim(),
      personal_background: personalBackground.trim(),
      obstetric_gynecological_background: obstetricGynecologicalBackground.trim(),
      religion: religion.trim(),
      occupation: occupation.trim(),
      native_of: nativeOf.trim(),
    };

    if (isEditing && initialPatient) {
      // Actualizar paciente existente
      updatePatientMutation.mutate(
        { id: initialPatient.id, data: patientData },
        {
          onSuccess: () => {
            onPatientCreated(initialPatient); // Trigger refresh
            handleClose();
          },
        }
      );
    } else {
      // Crear nuevo paciente
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
    }
  };

  const handleClose = () => {
    // Reset form
    setFirstName("");
    setLastName("");
    setBirthDate("");
    setPhone("");
    setGender("");
    setAllergies("");
    setReligion("");
    setOccupation("");
    setNativeOf("");
    setPersonalBackground("");
    setObstetricGynecologicalBackground("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Actualizar Paciente" : "Agregar Nuevo Paciente"}</DialogTitle>
          {!isEditing && (
            <DialogDescription>
              Completa la información del paciente para registrarlo en el sistema
            </DialogDescription>
          )}
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

          {/* Campos adicionales */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Religión */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Religión
                </label>
                <Autocomplete
                  value={religion}
                  onChange={setReligion}
                  onSelect={setReligion}
                  suggestions={religionSuggestions}
                  placeholder="Ej: Católica, Protestante, etc."
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Ocupación */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Ocupación
                  </div>
                </label>
                <Autocomplete
                  value={occupation}
                  onChange={setOccupation}
                  onSelect={setOccupation}
                  suggestions={occupationSuggestions}
                  placeholder="Ej: Ingeniero, Docente, etc."
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Lugar de Origen */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    Lugar de Origen
                  </div>
                </label>
                <Autocomplete
                  value={nativeOf}
                  onChange={setNativeOf}
                  onSelect={setNativeOf}
                  suggestions={nativeOfSuggestions}
                  placeholder="Ej: Valle Nacional, Tuxtepec, etc."
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Antecedentes Personales */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Antecedentes Personales
                </div>
              </label>
              <textarea
                value={personalBackground}
                onChange={(e) => setPersonalBackground(e.target.value)}
                placeholder="Historial médico personal relevante"
                rows={2}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Antecedentes Ginecoobstétricos */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  Antecedentes Ginecoobstétricos
                </div>
              </label>
              <textarea
                value={obstetricGynecologicalBackground}
                onChange={(e) => setObstetricGynecologicalBackground(e.target.value)}
                placeholder="Gestaciones, partos, cesáreas, etc."
                rows={2}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createPatientMutation.isPending || updatePatientMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={
                createPatientMutation.isPending ||
                updatePatientMutation.isPending ||
                (isEditing && !hasDataChanged())
              }
            >
              {(createPatientMutation.isPending || updatePatientMutation.isPending)
                ? "Guardando..."
                : isEditing
                ? "Actualizar Paciente"
                : "Guardar Paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
