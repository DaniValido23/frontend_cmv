import { useMemo, memo } from "react";
import { X, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Autocomplete from "@/components/ui/Autocomplete";
import { frequentMedicaments } from "@/data/prescribed_medicaments";
import { frequentDosages } from "@/data/dosage_frecuent";
import { frequentRoutes } from "@/data/route_frecuent";
import { frequentFrequencies } from "@/data/frequency_frecuent";
import { frequentDurations } from "@/data/duration_frecuent";

export interface Medication {
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
}

interface MedicationsSectionProps {
  medications: Medication[];
  currentMedication: Medication;
  onCurrentMedicationChange: (medication: Medication) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

function MedicationsSection({
  medications,
  currentMedication,
  onCurrentMedicationChange,
  onAdd,
  onRemove,
}: MedicationsSectionProps) {
  const medicamentSuggestions = useMemo(() => {
    if (!currentMedication.name.trim()) return [];
    return frequentMedicaments.filter(m =>
      m.toLowerCase().includes(currentMedication.name.toLowerCase())
    ).slice(0, 5);
  }, [currentMedication.name]);

  const dosageSuggestions = useMemo(() => {
    if (!currentMedication.dosage.trim()) return [];
    return frequentDosages.filter(d =>
      d.toLowerCase().includes(currentMedication.dosage.toLowerCase())
    ).slice(0, 5);
  }, [currentMedication.dosage]);

  const routeSuggestions = useMemo(() => {
    if (!currentMedication.route.trim()) return [];
    return frequentRoutes.filter(r =>
      r.toLowerCase().includes(currentMedication.route.toLowerCase())
    ).slice(0, 5);
  }, [currentMedication.route]);

  const frequencySuggestions = useMemo(() => {
    if (!currentMedication.frequency.trim()) return [];
    return frequentFrequencies.filter(f =>
      f.toLowerCase().includes(currentMedication.frequency.toLowerCase())
    ).slice(0, 5);
  }, [currentMedication.frequency]);

  const durationSuggestions = useMemo(() => {
    if (!currentMedication.duration.trim()) return [];
    return frequentDurations.filter(d =>
      d.toLowerCase().includes(currentMedication.duration.toLowerCase())
    ).slice(0, 5);
  }, [currentMedication.duration]);

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Medicamentos Recetados</label>
      <div className="space-y-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Autocomplete
            value={currentMedication.name}
            onChange={(value) => onCurrentMedicationChange({ ...currentMedication, name: value })}
            onSelect={(value) => onCurrentMedicationChange({ ...currentMedication, name: value })}
            suggestions={medicamentSuggestions}
            placeholder="Nombre del medicamento..."
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Autocomplete
            value={currentMedication.dosage}
            onChange={(value) => onCurrentMedicationChange({ ...currentMedication, dosage: value })}
            onSelect={(value) => onCurrentMedicationChange({ ...currentMedication, dosage: value })}
            suggestions={dosageSuggestions}
            placeholder="Dosis (ej: 500mg)..."
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Autocomplete
            value={currentMedication.route}
            onChange={(value) => onCurrentMedicationChange({ ...currentMedication, route: value })}
            onSelect={(value) => onCurrentMedicationChange({ ...currentMedication, route: value })}
            suggestions={routeSuggestions}
            placeholder="Vía (ej: Oral)..."
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Autocomplete
            value={currentMedication.frequency}
            onChange={(value) => onCurrentMedicationChange({ ...currentMedication, frequency: value })}
            onSelect={(value) => onCurrentMedicationChange({ ...currentMedication, frequency: value })}
            suggestions={frequencySuggestions}
            placeholder="Frecuencia (ej: Cada 8 horas)..."
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            <Autocomplete
              value={currentMedication.duration}
              onChange={(value) => onCurrentMedicationChange({ ...currentMedication, duration: value })}
              onSelect={(value) => onCurrentMedicationChange({ ...currentMedication, duration: value })}
              suggestions={durationSuggestions}
              placeholder="Duración (ej: 7 días)..."
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="button" onClick={onAdd} size="sm" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {medications.map((medication, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-3 bg-accent/50 border border-border rounded-lg"
          >
            <div className="flex-1">
              <p className="font-semibold text-foreground">{medication.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                {medication.dosage && <span>• Dosis: {medication.dosage}</span>}
                {medication.route && <span>• Vía: {medication.route}</span>}
                {medication.frequency && <span>• Frecuencia: {medication.frequency}</span>}
                {medication.duration && <span>• Duración: {medication.duration}</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="ml-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Memoize component - already has useMemo for suggestions, now prevent re-renders
export default memo(MedicationsSection);
