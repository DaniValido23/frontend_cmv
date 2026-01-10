import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Building, ShoppingCart } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseBreakdownProps {
  data: {
    fixed: { amount: number; percentage: number };
    operational: { amount: number; percentage: number };
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ExpenseBreakdownChart({ data }: ExpenseBreakdownProps) {
  if (!data) return null;

  const fixedAmount = data.fixed?.amount ?? 0;
  const operationalAmount = data.operational?.amount ?? 0;
  const total = fixedAmount + operationalAmount;

  const chartData = {
    labels: ["Fijos", "Operacionales"],
    datasets: [
      {
        data: [fixedAmount, operationalAmount],
        backgroundColor: ["#f59e0b", "#ef4444"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const expenses = [
    {
      label: "Gastos Fijos",
      description: "Renta, servicios, nomina",
      amount: fixedAmount,
      icon: Building,
      color: "bg-amber-500",
      textColor: "text-amber-600",
    },
    {
      label: "Operacionales",
      description: "Costo mercancia + gastos SICAR",
      amount: operationalAmount,
      icon: ShoppingCart,
      color: "bg-red-500",
      textColor: "text-red-600",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Egresos por Tipo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Doughnut Chart */}
          <div className="h-[180px] w-[180px] relative flex-shrink-0">
            <Doughnut data={chartData} options={options} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-lg font-bold">{formatCurrency(total)}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>

          {/* Legend with details */}
          <div className="flex-1 space-y-4">
            {expenses.map((expense) => (
              <div key={expense.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${expense.color}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <expense.icon className={`h-4 w-4 ${expense.textColor}`} />
                    <span className="text-sm font-medium">{expense.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{expense.description}</p>
                  <p className="text-sm font-semibold">{formatCurrency(expense.amount)}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {total > 0 ? ((expense.amount / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
