import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Pill, Stethoscope, Microscope } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface IncomeBreakdownProps {
  data: {
    sicar: { amount: number; count?: number; percentage: number };
    consultations: { amount: number; count: number; percentage: number };
    studies: { amount: number; count: number; percentage: number };
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

export default function IncomeBreakdownChart({ data }: IncomeBreakdownProps) {
  if (!data) return null;

  const sicarAmount = data.sicar?.amount ?? 0;
  const consultationsAmount = data.consultations?.amount ?? 0;
  const studiesAmount = data.studies?.amount ?? 0;
  const total = sicarAmount + consultationsAmount + studiesAmount;

  const chartData = {
    labels: ["Farmacia", "Consultas", "Estudios"],
    datasets: [
      {
        data: [sicarAmount, consultationsAmount, studiesAmount],
        backgroundColor: ["#3b82f6", "#10b981", "#8b5cf6"],
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
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const sources = [
    {
      label: "Farmacia",
      amount: sicarAmount,
      icon: Pill,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      label: "Consultas",
      amount: consultationsAmount,
      count: data.consultations?.count,
      icon: Stethoscope,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      label: "Estudios",
      amount: studiesAmount,
      count: data.studies?.count,
      icon: Microscope,
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Ingresos por Fuente</CardTitle>
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
          <div className="flex-1 space-y-3">
            {sources.map((source) => (
              <div key={source.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <source.icon className={`h-4 w-4 ${source.textColor}`} />
                    <span className="text-sm font-medium">{source.label}</span>
                    {source.count !== undefined && source.count > 0 && (
                      <span className="text-xs text-muted-foreground">({source.count})</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(source.amount)}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {total > 0 ? ((source.amount / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
