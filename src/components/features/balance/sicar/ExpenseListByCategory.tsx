import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { ChevronDown, ChevronRight, Tag, RefreshCw, ListFilter } from "lucide-react";
import { useSicarExpenses } from "@/hooks/useSicarExpenses";
import { useOperationalExpenseCategories } from "@/hooks/useExpenseCategories";
import type { SicarExpense, ExpenseCategory } from "@/types/balance";

interface ExpenseGroup {
  category: ExpenseCategory;
  expenses: SicarExpense[];
  total: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
};

interface CategoryGroupProps {
  group: ExpenseGroup;
  defaultOpen?: boolean;
}

function CategoryGroup({ group, defaultOpen = false }: CategoryGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasExpenses = group.expenses.length > 0;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => hasExpenses && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 bg-muted/30 transition-colors ${
          hasExpenses ? "hover:bg-muted/50 cursor-pointer" : "cursor-default opacity-60"
        }`}
      >
        <div className="flex items-center gap-2">
          {hasExpenses ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}
          <Tag className="h-4 w-4 text-primary" />
          <span className="font-medium">{group.category.name}</span>
          <span className="text-xs text-muted-foreground">
            ({group.expenses.length})
          </span>
        </div>
        <span className={`font-medium ${group.total > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
          {formatCurrency(group.total)}
        </span>
      </button>

      {isOpen && hasExpenses && (
        <div className="divide-y">
          {group.expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/20"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-muted-foreground text-xs w-16 flex-shrink-0">
                  {formatDate(expense.expense_date)}
                </span>
                <span className="truncate">{expense.description}</span>
              </div>
              <span className="text-red-600 dark:text-red-400 flex-shrink-0 ml-2">
                {formatCurrency(expense.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ExpenseListByCategoryProps {
  from?: string;
  to?: string;
  headerAction?: React.ReactNode;
}

export default function ExpenseListByCategory({ from, to, headerAction }: ExpenseListByCategoryProps) {
  // Fetch all operational expense categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useOperationalExpenseCategories();

  // Fetch all classified expenses for the period
  const {
    data: expensesData,
    isLoading: expensesLoading,
    error: expensesError,
    refetch
  } = useSicarExpenses({
    classified: true,
    excluded: false,
    page: 1,
    page_size: 1000,
    from,
    to,
  });

  const isLoading = categoriesLoading || expensesLoading;
  const error = categoriesError || expensesError;

  // Group expenses by category
  const groups = useMemo(() => {
    if (!categories) return [];

    const expensesByCategory = new Map<string, SicarExpense[]>();

    // Initialize all categories with empty arrays
    for (const category of categories) {
      expensesByCategory.set(category.id, []);
    }

    // Assign expenses to their categories
    if (expensesData?.expenses) {
      for (const expense of expensesData.expenses) {
        if (expense.category?.id) {
          const existing = expensesByCategory.get(expense.category.id) || [];
          existing.push(expense);
          expensesByCategory.set(expense.category.id, existing);
        }
      }
    }

    // Build groups with totals
    const result: ExpenseGroup[] = categories.map((category) => {
      const expenses = expensesByCategory.get(category.id) || [];
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      return { category, expenses, total };
    });

    // Sort by total descending (categories with expenses first)
    return result.sort((a, b) => b.total - a.total);
  }, [categories, expensesData?.expenses]);

  const totalAmount = useMemo(() => {
    return groups.reduce((sum, g) => sum + g.total, 0);
  }, [groups]);

  const totalExpenses = useMemo(() => {
    return groups.reduce((sum, g) => sum + g.expenses.length, 0);
  }, [groups]);

  const categoriesWithExpenses = useMemo(() => {
    return groups.filter((g) => g.expenses.length > 0).length;
  }, [groups]);

  // Header component for all states
  const Header = () => (
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <ListFilter className="h-5 w-5" />
            Gastos por Categoría
          </CardTitle>
          {headerAction}
        </div>
        {!isLoading && !error && (
          <div className="text-right">
            <span className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalAmount)}
            </span>
            <p className="text-xs text-muted-foreground">
              {totalExpenses} gastos en {categoriesWithExpenses} de {groups.length} categorías
            </p>
          </div>
        )}
      </div>
    </CardHeader>
  );

  if (isLoading) {
    return (
      <Card>
        <Header />
        <CardContent className="py-8 flex items-center justify-center">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Header />
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">Error al cargar datos</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <Header />
        <CardContent className="py-8 text-center">
          <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No hay categorías de gastos operacionales configuradas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Header />
      <CardContent>
        <div className="space-y-2">
          {groups.map((group, index) => (
            <CategoryGroup
              key={group.category.id}
              group={group}
              defaultOpen={index === 0 && group.expenses.length > 0}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
