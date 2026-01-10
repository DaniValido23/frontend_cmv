import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Wallet } from "lucide-react";
import type { SicarBiPaymentMethod } from "@/types/sicarBi";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PaymentMethodsChartProps {
  data?: SicarBiPaymentMethod[];
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

// Normalizar nombres de métodos de pago
const normalizeMethodName = (method: string): string => {
  const normalized = method.toUpperCase().trim();
  if (normalized === "EF" || normalized === "EFECTIVO") return "Efectivo";
  if (normalized === "TA" || normalized === "TARJETA") return "Tarjeta";
  if (normalized === "TR" || normalized === "TRANSFERENCIA") return "Transferencia";
  return method;
};

// Colores por método de pago
const METHOD_COLORS: Record<string, string> = {
  Efectivo: "#10b981",      // Green
  Tarjeta: "#3b82f6",       // Blue
  Transferencia: "#8b5cf6", // Purple
};

export default function PaymentMethodsChart({
  data,
  isLoading,
}: PaymentMethodsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <div className="h-[280px] w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Entradas por Método de Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay datos disponibles
        </CardContent>
      </Card>
    );
  }

  // Normalizar y agrupar datos
  const normalizedData = data.reduce((acc, item) => {
    const name = normalizeMethodName(item.payment_method);
    if (!acc[name]) {
      acc[name] = { amount: 0, count: 0 };
    }
    acc[name].amount += item.total_amount;
    acc[name].count += item.count;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);

  const methods = Object.entries(normalizedData)
    .map(([name, data]) => ({
      key: name.toLowerCase(),
      label: name,
      value: data.amount,
      count: data.count,
      color: METHOD_COLORS[name] || "#6b7280",
    }))
    .filter((m) => m.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = methods.reduce((sum, m) => sum + m.value, 0);

  if (methods.length === 0 || total === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Entradas por Método de Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay entradas en este periodo
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: methods.map((m) => m.label),
    datasets: [
      {
        data: methods.map((m) => m.value),
        backgroundColor: methods.map((m) => m.color),
        borderColor: methods.map((m) => m.color),
        borderWidth: 1,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Entradas por Método de Pago
          </CardTitle>
          <div className="text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-bold text-foreground">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <Pie data={chartData} options={options} />
        </div>

        {/* Summary cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {methods.map((method) => {
            const percentage = ((method.value / total) * 100).toFixed(1);
            return (
              <div
                key={method.key}
                className="p-3 rounded-lg border"
                style={{ borderColor: method.color, borderLeftWidth: 4 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{method.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {percentage}%
                  </span>
                </div>
                <p className="text-lg font-bold">
                  {formatCurrency(method.value)}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
