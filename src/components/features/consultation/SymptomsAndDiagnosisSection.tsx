import { useMemo, memo } from "react";
import { X, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Autocomplete from "@/components/ui/Autocomplete";
import { frequentSymptoms } from "@/data/symp_frecuent";
import { frequentDiagnoses } from "@/data/diagnosis_frecuent";
import { toast } from "sonner";

interface SymptomsAndDiagnosisSectionProps {
  // Symptoms
  symptoms: string[];
  currentSymptom: string;
  onCurrentSymptomChange: (value: string) => void;
  onAddSymptom: () => void;
  onRemoveSymptom: (index: number) => void;
  onSymptomsChange?: (symptoms: string[]) => void;

  // Diagnoses
  diagnoses: string[];
  currentDiagnosis: string;
  onCurrentDiagnosisChange: (value: string) => void;
  onAddDiagnosis: () => void;
  onRemoveDiagnosis: (index: number) => void;
  onDiagnosesChange?: (diagnoses: string[]) => void;
}

function SymptomsAndDiagnosisSection({
  symptoms,
  currentSymptom,
  onCurrentSymptomChange,
  onAddSymptom,
  onRemoveSymptom,
  onSymptomsChange,
  diagnoses,
  currentDiagnosis,
  onCurrentDiagnosisChange,
  onAddDiagnosis,
  onRemoveDiagnosis,
  onDiagnosesChange,
}: SymptomsAndDiagnosisSectionProps) {
  const symptomSuggestions = useMemo(() => {
    if (!currentSymptom.trim()) return [];
    return frequentSymptoms.filter(s =>
      s.toLowerCase().includes(currentSymptom.toLowerCase())
    ).slice(0, 5);
  }, [currentSymptom]);

  const diagnosisSuggestions = useMemo(() => {
    if (!currentDiagnosis.trim()) return [];
    return frequentDiagnoses.filter(d =>
      d.toLowerCase().includes(currentDiagnosis.toLowerCase())
    ).slice(0, 5);
  }, [currentDiagnosis]);

  return (
    <div className="space-y-6">
      {/* Síntomas */}
      <div>
        <label className="block text-sm font-medium mb-2">Síntomas</label>
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <Autocomplete
              value={currentSymptom}
              onChange={onCurrentSymptomChange}
              onSelect={(value) => {
                // Verificar si el síntoma ya existe (case-insensitive)
                const exists = symptoms.some(s => s.toLowerCase() === value.toLowerCase());
                if (exists) {
                  toast.error("Este síntoma ya ha sido agregado");
                  onCurrentSymptomChange("");
                  return;
                }
                if (onSymptomsChange) {
                  onSymptomsChange([...symptoms, value]);
                }
                onCurrentSymptomChange("");
              }}
              suggestions={symptomSuggestions}
              placeholder="Agregar síntoma..."
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button type="button" onClick={onAddSymptom} size="sm" className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {symptoms.map((symptom, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
            >
              <span>{symptom}</span>
              <button
                type="button"
                onClick={() => onRemoveSymptom(index)}
                className="hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnóstico */}
      <div>
        <label className="block text-sm font-medium mb-2">Diagnóstico</label>
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <Autocomplete
              value={currentDiagnosis}
              onChange={onCurrentDiagnosisChange}
              onSelect={(value) => {
                // Verificar si el diagnóstico ya existe (case-insensitive)
                const exists = diagnoses.some(d => d.toLowerCase() === value.toLowerCase());
                if (exists) {
                  toast.error("Este diagnóstico ya ha sido agregado");
                  onCurrentDiagnosisChange("");
                  return;
                }
                if (onDiagnosesChange) {
                  onDiagnosesChange([...diagnoses, value]);
                }
                onCurrentDiagnosisChange("");
              }}
              suggestions={diagnosisSuggestions}
              placeholder="Agregar diagnóstico..."
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button type="button" onClick={onAddDiagnosis} size="sm" className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {diagnoses.map((diagnosis, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm"
            >
              <span>{diagnosis}</span>
              <button
                type="button"
                onClick={() => onRemoveDiagnosis(index)}
                className="hover:text-success"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Memoize component - already has useMemo for suggestions, now prevent re-renders
export default memo(SymptomsAndDiagnosisSection);
