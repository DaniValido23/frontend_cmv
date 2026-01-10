import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Stethoscope } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { useStudyCategoryBreakdown, type DateRangeParams } from "@/hooks/useBalance";

ChartJS.register(ArcElement, Tooltip, Legend);

interface StudyCategoryPieChartProps {
  dateParams: DateRangeParams;
}

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#ef4444", // red
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

export default function StudyCategoryPieChart({ dateParams }: StudyCategoryPieChartProps) {
  const { data, isLoading, error } = useStudyCategoryBreakdown(dateParams);

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
          Error al cargar estudios por categoria
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.study_categories || data.study_categories.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Estudios por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay estudios registrados para este mes
        </CardContent>
      </Card>
    );
  }

  const categories = data.study_categories.map((cat, i) => ({
    ...cat,
    color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  // Sort by income descending
  const sortedCategories = [...categories].sort((a, b) => b.income - a.income);

  // Calculate total income
  const totalIncome = sortedCategories.reduce((sum, cat) => sum + cat.income, 0);
  const totalCount = sortedCategories.reduce((sum, cat) => sum + cat.count, 0);

  const chartData = {
    labels: sortedCategories.map((c) => c.category),
    datasets: [
      {
        data: sortedCategories.map((c) => c.income),
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
            const idx = context.dataIndex;
            const cat = sortedCategories[idx];
            return `${formatCurrency(cat.income)} (${cat.percentage.toFixed(1)}%)`;
          },
          afterLabel: (context: any) => {
            const idx = context.dataIndex;
            const cat = sortedCategories[idx];
            return `${cat.count} estudios - Prom: ${formatCurrency(cat.average_price)}`;
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
            <Stethoscope className="h-5 w-5 text-primary" />
            Estudios por Categoria
          </CardTitle>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(totalIncome)}
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
                <p className="text-sm font-bold">{totalCount}</p>
                <p className="text-xs text-muted-foreground">estudios</p>
              </div>
            </div>
          </div>

          {/* Legend with categories */}
          <div className="flex-1 space-y-2 max-h-[160px] overflow-y-auto">
            {sortedCategories.slice(0, 6).map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 truncate">{cat.category}</span>
                <span className="text-xs text-muted-foreground">
                  {cat.count}
                </span>
                <span className="font-medium text-xs">
                  {formatCurrency(cat.income)}
                </span>
              </div>
            ))}
            {sortedCategories.length > 6 && (
              <p className="text-xs text-muted-foreground text-center">
                +{sortedCategories.length - 6} categorias mas
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded">
            <p className="text-xs text-muted-foreground">Total Estudios</p>
            <p className="font-bold text-foreground text-sm">
              {totalCount}
            </p>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <p className="text-xs text-muted-foreground">Promedio</p>
            <p className="font-bold text-foreground text-sm">
              {formatCurrency(totalCount > 0 ? totalIncome / totalCount : 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
