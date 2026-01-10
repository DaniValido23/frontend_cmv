import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { AlertCircle, CheckCircle2, Tag, Save, Undo2 } from "lucide-react";
import { useUnclassifiedExpenses, useSicarExpensesSummary, useBulkClassifyExpenses } from "@/hooks/useSicarExpenses";
import ExpenseClassifierTable from "./ExpenseClassifierTable";
import BulkClassifyModal from "./BulkClassifyModal";

// Map de clasificaciones pendientes: expenseId -> categoryId
type PendingClassifications = Map<string, string>;

export default function ExpenseClassifier() {
  const { data, isLoading, error } = useUnclassifiedExpenses();
  const { data: summary } = useSicarExpensesSummary();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [pendingClassifications, setPendingClassifications] = useState<PendingClassifications>(new Map());

  const bulkClassifyMutation = useBulkClassifyExpenses();

  const handleBulkSuccess = () => {
    setSelectedIds([]);
  };

  // Handler cuando usuario selecciona categoría para un gasto
  const handlePendingClassification = useCallback((expenseId: string, categoryId: string) => {
    setPendingClassifications((prev) => {
      const next = new Map(prev);
      next.set(expenseId, categoryId);
      return next;
    });
  }, []);

  // Descartar cambios pendientes
  const handleDiscardChanges = useCallback(() => {
    setPendingClassifications(new Map());
  }, []);

  // Guardar todos los cambios pendientes
  const handleSaveChanges = useCallback(async () => {
    if (pendingClassifications.size === 0) return;

    // Agrupar por categoría para hacer llamadas bulk eficientes
    const byCategory = new Map<string, string[]>();
    pendingClassifications.forEach((categoryId, expenseId) => {
      const existing = byCategory.get(categoryId) || [];
      existing.push(expenseId);
      byCategory.set(categoryId, existing);
    });

    // Ejecutar todas las clasificaciones bulk en paralelo
    const promises: Promise<unknown>[] = [];
    byCategory.forEach((expenseIds, categoryId) => {
      promises.push(
        bulkClassifyMutation.mutateAsync({
          expense_ids: expenseIds,
          category_id: categoryId,
        })
      );
    });

    try {
      await Promise.all(promises);
      setPendingClassifications(new Map());
    } catch {
      // El error ya se maneja en el hook con toast
    }
  }, [pendingClassifications, bulkClassifyMutation]);

  const hasPendingChanges = pendingClassifications.size > 0;

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
          Error al cargar gastos pendientes de clasificar
        </CardContent>
      </Card>
    );
  }

  const expenses = data?.expenses || [];

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
          <p className="text-lg font-medium mb-2">Todos los gastos estan clasificados</p>
          <p className="text-muted-foreground">
            No hay gastos pendientes de clasificar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {summary && summary.total_unclassified > 0 && (
          <Card className="bg-muted">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    {summary.total_unclassified} gastos sin clasificar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total: {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    }).format(summary.total_amount_unclassified)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <CardTitle>Gastos pendientes</CardTitle>
                {hasPendingChanges && (
                  <span className="text-sm bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {pendingClassifications.size} cambios sin guardar
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasPendingChanges && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleDiscardChanges}
                      disabled={bulkClassifyMutation.isPending}
                    >
                      <Undo2 className="h-4 w-4 mr-2" />
                      Descartar
                    </Button>
                    <Button
                      onClick={handleSaveChanges}
                      disabled={bulkClassifyMutation.isPending}
                    >
                      {bulkClassifyMutation.isPending ? (
                        <Spinner className="h-4 w-4 mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Guardar cambios ({pendingClassifications.size})
                    </Button>
                  </>
                )}
                {selectedIds.length > 0 && !hasPendingChanges && (
                  <Button onClick={() => setBulkModalOpen(true)}>
                    <Tag className="h-4 w-4 mr-2" />
                    Clasificar seleccionados ({selectedIds.length})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ExpenseClassifierTable
              expenses={expenses}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              pendingClassifications={pendingClassifications}
              onClassify={handlePendingClassification}
            />
          </CardContent>
        </Card>
      </div>

      <BulkClassifyModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        selectedIds={selectedIds}
        onSuccess={handleBulkSuccess}
      />
    </>
  );
}
