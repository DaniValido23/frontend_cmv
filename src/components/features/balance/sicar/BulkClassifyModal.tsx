import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Modal";
import { useOperationalExpenseCategories } from "@/hooks/useExpenseCategories";
import { useBulkClassifyExpenses } from "@/hooks/useSicarExpenses";

interface BulkClassifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export default function BulkClassifyModal({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
}: BulkClassifyModalProps) {
  const { data: categories } = useOperationalExpenseCategories();
  const bulkClassifyMutation = useBulkClassifyExpenses();

  const [categoryId, setCategoryId] = useState("");

  const handleSubmit = () => {
    if (!categoryId || selectedIds.length === 0) return;

    bulkClassifyMutation.mutate(
      {
        expense_ids: selectedIds,
        category_id: categoryId,
      },
      {
        onSuccess: () => {
          setCategoryId("");
          onSuccess();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clasificar gastos seleccionados</DialogTitle>
          <DialogDescription>
            Vas a clasificar {selectedIds.length} gasto{selectedIds.length !== 1 ? "s" : ""} con la misma categoria.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="category">Categoria</Label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-2"
          >
            <option value="">Selecciona una categoria</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!categoryId}
            isLoading={bulkClassifyMutation.isPending}
          >
            Clasificar {selectedIds.length} gasto{selectedIds.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
