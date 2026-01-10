import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import {
  useFixedExpenses,
  useCreateFixedExpense,
  useUpdateFixedExpense,
  useDeleteFixedExpense,
  useMarkFixedExpensePaid,
} from "@/hooks/useFixedExpenses";
import { useCurrentMonth } from "@/hooks/useBalance";
import type { FixedExpense, CreateFixedExpenseRequest, UpdateFixedExpenseRequest } from "@/types/balance";
import MonthSelector from "./MonthSelector";
import FixedExpenseForm from "./FixedExpenseForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Modal";

export default function FixedExpenseList() {
  const currentMonth = useCurrentMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { data, isLoading, error } = useFixedExpenses(selectedMonth);
  const createMutation = useCreateFixedExpense();
  const updateMutation = useUpdateFixedExpense();
  const deleteMutation = useDeleteFixedExpense();
  const markPaidMutation = useMarkFixedExpensePaid();

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<FixedExpense | null>(null);

  const handleCreate = (formData: CreateFixedExpenseRequest) => {
    createMutation.mutate(formData, {
      onSuccess: () => setFormOpen(false),
    });
  };

  const handleUpdate = (formData: CreateFixedExpenseRequest) => {
    if (!editingExpense) return;
    const updateData: UpdateFixedExpenseRequest = {
      category_id: formData.category_id,
      amount: formData.amount,
      notes: formData.notes,
    };
    updateMutation.mutate(
      { id: editingExpense.id, data: updateData },
      { onSuccess: () => setEditingExpense(null) }
    );
  };

  const handleDelete = () => {
    if (!deleteExpense) return;
    deleteMutation.mutate(deleteExpense.id, {
      onSuccess: () => setDeleteExpense(null),
    });
  };

  const handleTogglePaid = (expense: FixedExpense) => {
    markPaidMutation.mutate({
      id: expense.id,
      data: {
        is_paid: !expense.is_paid,
        paid_at: !expense.is_paid ? new Date().toISOString().split('T')[0] : undefined,
      },
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Error al cargar gastos fijos
        </CardContent>
      </Card>
    );
  }

  const expenses = data?.expenses || [];
  const summary = data?.summary;

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <MonthSelector month={selectedMonth} onChange={setSelectedMonth} />
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar gasto
          </Button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total del mes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.total_amount)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pagados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.total_paid)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(summary.total_pending)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            {expenses.length > 0 ? (
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      expense.is_paid
                        ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                        : "bg-card hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleTogglePaid(expense)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          expense.is_paid
                            ? "bg-green-600 border-green-600 text-white"
                            : "border-muted-foreground hover:border-green-600"
                        }`}
                        disabled={markPaidMutation.isPending}
                      >
                        {expense.is_paid && <Check className="h-4 w-4" />}
                      </button>
                      <div>
                        <p className={`font-medium ${expense.is_paid ? "line-through text-muted-foreground" : ""}`}>
                          {expense.category.name}
                        </p>
                        {expense.notes && (
                          <p className="text-sm text-muted-foreground">
                            {expense.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-semibold ${expense.is_paid ? "text-muted-foreground" : ""}`}>
                        {formatCurrency(expense.amount)}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingExpense(expense)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteExpense(expense)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No hay gastos fijos registrados para este mes.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <FixedExpenseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
        month={selectedMonth}
      />

      <FixedExpenseForm
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
        month={selectedMonth}
        initialData={editingExpense || undefined}
      />

      <Dialog open={!!deleteExpense} onOpenChange={(open) => !open && setDeleteExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar gasto</DialogTitle>
            <DialogDescription>
              ¿Estas seguro de eliminar este gasto de "{deleteExpense?.category.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteExpense(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
