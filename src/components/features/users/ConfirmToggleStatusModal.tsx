import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ConfirmToggleStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName: string;
  isActive: boolean;
  isLoading?: boolean;
}

export default function ConfirmToggleStatusModal({
  open,
  onOpenChange,
  onConfirm,
  userName,
  isActive,
  isLoading = false,
}: ConfirmToggleStatusModalProps) {
  const action = isActive ? 'desactivar' : 'activar';
  const actionCapitalized = isActive ? 'Desactivar' : 'Activar';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actionCapitalized} Usuario</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas {action} al usuario <strong>{userName}</strong>?
            {isActive && " El usuario no podrá acceder al sistema mientras esté desactivado."}
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
            variant={isActive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
            className={!isActive ? "bg-success/70 hover:bg-success/80 text-success-foreground" : ""}
          >
            {isLoading ? `${actionCapitalized}ando...` : `Sí, ${action} usuario`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
