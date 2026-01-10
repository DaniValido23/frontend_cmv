import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Tag, Check } from "lucide-react";
import type { SicarExpense } from "@/types/balance";
import { useOperationalExpenseCategories } from "@/hooks/useExpenseCategories";

interface ExpenseClassifierTableProps {
  expenses: SicarExpense[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  pendingClassifications: Map<string, string>;
  onClassify: (expenseId: string, categoryId: string) => void;
}

export default function ExpenseClassifierTable({
  expenses,
  selectedIds,
  onSelectionChange,
  pendingClassifications,
  onClassify,
}: ExpenseClassifierTableProps) {
  const { data: categories } = useOperationalExpenseCategories();

  const [classifyingId, setClassifyingId] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(expenses.map((e) => e.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    }
  };

  const handleClassify = (expenseId: string, categoryId: string) => {
    onClassify(expenseId, categoryId);
    setClassifyingId(null);
  };

  // Obtener nombre de categoría pendiente para mostrar
  const getPendingCategoryName = (expenseId: string) => {
    const categoryId = pendingClassifications.get(expenseId);
    if (!categoryId || !categories) return null;
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || null;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
    });
  };

  const allSelected = expenses.length > 0 && selectedIds.length === expenses.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-input"
              />
            </th>
            <th className="p-3 text-left text-sm font-medium text-muted-foreground">
              Fecha
            </th>
            <th className="p-3 text-left text-sm font-medium text-muted-foreground">
              Descripcion
            </th>
            <th className="p-3 text-right text-sm font-medium text-muted-foreground">
              Monto
            </th>
            <th className="p-3 text-center text-sm font-medium text-muted-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => {
            const pendingCategory = getPendingCategoryName(expense.id);
            const hasPending = pendingCategory !== null;

            return (
              <tr
                key={expense.id}
                className={`border-b transition-colors ${
                  hasPending
                    ? "bg-amber-50 hover:bg-amber-100"
                    : "hover:bg-accent/50"
                }`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(expense.id)}
                    onChange={(e) => handleSelectOne(expense.id, e.target.checked)}
                    className="w-4 h-4 rounded border-input"
                  />
                </td>
                <td className="p-3 text-sm">
                  <div>{formatDate(expense.expense_date)}</div>
                  {expense.expense_time && (
                    <div className="text-xs text-muted-foreground">
                      {expense.expense_time}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <div className="font-medium">{expense.description}</div>
                  {expense.original_comment && (
                    <div className="text-xs text-muted-foreground">
                      {expense.original_comment}
                    </div>
                  )}
                </td>
                <td className="p-3 text-right font-medium">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-2">
                    {classifyingId === expense.id ? (
                      <select
                        autoFocus
                        defaultValue={pendingClassifications.get(expense.id) || ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleClassify(expense.id, e.target.value);
                          }
                        }}
                        onBlur={() => setClassifyingId(null)}
                        className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:border-primary/50 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat pr-8"
                      >
                        <option value="" disabled>Seleccionar categoria...</option>
                        {categories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : hasPending ? (
                      <button
                        onClick={() => setClassifyingId(expense.id)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-200 text-amber-900 text-sm font-medium hover:bg-amber-300 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {pendingCategory}
                      </button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setClassifyingId(expense.id)}
                      >
                        <Tag className="h-3.5 w-3.5 mr-1" />
                        Clasificar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
