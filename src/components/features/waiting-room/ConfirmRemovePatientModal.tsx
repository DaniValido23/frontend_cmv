import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ConfirmRemovePatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  patientName: string;
  isLoading?: boolean;
}

export default function ConfirmRemovePatientModal({
  open,
  onOpenChange,
  onConfirm,
  patientName,
  isLoading = false,
}: ConfirmRemovePatientModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover Paciente de Sala de Espera</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas remover a <strong>{patientName}</strong> de la sala de espera?
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            No, cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Removiendo..." : "Sí, remover paciente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
