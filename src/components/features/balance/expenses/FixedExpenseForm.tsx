import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Modal";
import { useFixedExpenseCategories } from "@/hooks/useExpenseCategories";
import type { FixedExpense, CreateFixedExpenseRequest } from "@/types/balance";

interface FixedExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateFixedExpenseRequest) => void;
  isLoading?: boolean;
  month: string;
  initialData?: FixedExpense;
}

export default function FixedExpenseForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  month,
  initialData,
}: FixedExpenseFormProps) {
  const { data: categories } = useFixedExpenseCategories();

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.category.id);
      setAmount(initialData.amount.toString());
      setNotes(initialData.notes || "");
    } else {
      setCategoryId(categories?.[0]?.id || "");
      setAmount("");
      setNotes("");
    }
  }, [initialData, open, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) return;

    onSubmit({
      category_id: categoryId,
      month,
      amount: parseFloat(amount),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar gasto fijo" : "Registrar gasto fijo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">Selecciona una categoria</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="amount">Monto</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-7"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {initialData ? "Guardar cambios" : "Registrar gasto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
