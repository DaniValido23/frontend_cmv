import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { MonthlyBalance } from "@/types/balance";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface ExpensesByCategoryChartProps {
  expenses?: MonthlyBalance["expenses"];
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const DEFAULT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
];

export default function ExpensesByCategoryChart({
  expenses,
  isLoading,
}: ExpensesByCategoryChartProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="py-12 flex items-center justify-center">
          <div className="h-[200px] w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!expenses || expenses.total === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay gastos en este periodo
        </CardContent>
      </Card>
    );
  }

  // Transform by_category to chart format (colors assigned automatically from pool)
  const categories = expenses.by_category.map((cat, i) => ({
    name: cat.category,
    amount: cat.amount,
    color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  // Add fixed and operational if no categories but have totals
  if (categories.length === 0) {
    if (expenses.fixed > 0) {
      categories.push({
        name: "Gastos Fijos",
        amount: expenses.fixed,
        color: "#ef4444",
      });
    }
    if (expenses.operational > 0) {
      categories.push({
        name: "Gastos Operativos",
        amount: expenses.operational,
        color: "#f97316",
      });
    }
  }

  // Sort by amount descending
  const sortedCategories = categories.sort((a, b) => b.amount - a.amount);

  if (sortedCategories.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay gastos categorizados
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: sortedCategories.map((c) => c.name),
    datasets: [
      {
        data: sortedCategories.map((c) => c.amount),
        backgroundColor: sortedCategories.map((c) => c.color),
        borderRadius: 4,
        barThickness: 24,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = expenses.total > 0 ? ((value / expenses.total) * 100).toFixed(1) : 0;
            return `${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          callback: (value: any) => formatCurrency(value),
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            Gastos por Categoria
          </CardTitle>
          <span className="text-lg font-bold text-red-600 dark:text-red-400">
            {formatCurrency(expenses.total)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: Math.max(180, sortedCategories.length * 40) }}>
          <Bar data={chartData} options={options} />
        </div>

        {/* Summary of fixed vs operational */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-muted/50 rounded">
            <span className="text-muted-foreground">Fijos:</span>
            <span className="ml-2 font-medium">{formatCurrency(expenses.fixed)}</span>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <span className="text-muted-foreground">Operativos:</span>
            <span className="ml-2 font-medium">{formatCurrency(expenses.operational)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
