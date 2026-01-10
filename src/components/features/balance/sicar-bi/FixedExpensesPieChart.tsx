import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Wallet, CheckCircle, Clock } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { useFixedExpensesByCategory } from "@/hooks/useBalance";

ChartJS.register(ArcElement, Tooltip, Legend);

interface FixedExpensesPieChartProps {
  month: string; // YYYY-MM format
}

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
];

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function FixedExpensesPieChart({ month }: FixedExpensesPieChartProps) {
  const { data, isLoading, error } = useFixedExpensesByCategory(month);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="py-12 flex items-center justify-center">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="py-8 text-center text-destructive">
          Error al cargar gastos fijos
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Gastos Fijos por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay gastos fijos registrados para este mes
        </CardContent>
      </Card>
    );
  }

  const categories = data.categories.map((cat, i) => ({
    ...cat,
    color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  // Sort by amount descending
  const sortedCategories = [...categories].sort((a, b) => b.amount - a.amount);

  const chartData = {
    labels: sortedCategories.map((c) => c.category_name),
    datasets: [
      {
        data: sortedCategories.map((c) => c.amount),
        backgroundColor: sortedCategories.map((c) => c.color),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = data.summary.total > 0
              ? ((value / data.summary.total) * 100).toFixed(1)
              : 0;
            return `${formatCurrency(value)} (${percentage}%)`;
          },
          afterLabel: (context: any) => {
            const cat = sortedCategories[context.dataIndex];
            return cat.is_paid ? "Pagado" : "Pendiente";
          },
        },
      },
    },
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Gastos Fijos por Categoria
          </CardTitle>
          <span className="text-lg font-bold text-red-600 dark:text-red-400">
            {formatCurrency(data.summary.total)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          {/* Doughnut Chart */}
          <div className="h-[160px] w-[160px] relative flex-shrink-0">
            <Doughnut data={chartData} options={options} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-sm font-bold">{sortedCategories.length}</p>
                <p className="text-xs text-muted-foreground">categorias</p>
              </div>
            </div>
          </div>

          {/* Legend with categories */}
          <div className="flex-1 space-y-2 max-h-[160px] overflow-y-auto">
            {sortedCategories.slice(0, 6).map((cat) => (
              <div key={cat.category_id} className="flex items-center gap-2 text-sm">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 truncate">{cat.category_name}</span>
                <span className="font-medium text-xs">
                  {formatCurrency(cat.amount)}
                </span>
                {cat.is_paid ? (
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                ) : (
                  <Clock className="h-3 w-3 text-amber-500 flex-shrink-0" />
                )}
              </div>
            ))}
            {sortedCategories.length > 6 && (
              <p className="text-xs text-muted-foreground text-center">
                +{sortedCategories.length - 6} categorias mas
              </p>
            )}
          </div>
        </div>

        {/* Summary: Paid vs Pending */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-center">
          <div className="flex items-center justify-center gap-2 p-2 bg-muted/50 rounded">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Pagado</p>
              <p className="font-bold text-foreground text-sm">
                {formatCurrency(data.summary.paid)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 p-2 bg-muted/50 rounded">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Pendiente</p>
              <p className="font-bold text-foreground text-sm">
                {formatCurrency(data.summary.pending)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
