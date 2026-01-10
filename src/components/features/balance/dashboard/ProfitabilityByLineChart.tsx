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
import { TrendingUp } from "lucide-react";
import type { BalanceDashboard } from "@/types/balance";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface ProfitabilityByLineChartProps {
  incomeBreakdown: BalanceDashboard["income_breakdown"];
  sicarDetails: BalanceDashboard["sicar_details"];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCompact = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

export default function ProfitabilityByLineChart({
  incomeBreakdown,
  sicarDetails,
}: ProfitabilityByLineChartProps) {
  if (!incomeBreakdown) return null;

  // Calculate profitability for each line
  const farmaciaIncome = incomeBreakdown.sicar?.amount ?? 0;
  const farmaciaCost = sicarDetails?.total_cost ?? 0;
  const farmaciaProfit = farmaciaIncome - farmaciaCost;
  const farmaciaMargin = farmaciaIncome > 0 ? (farmaciaProfit / farmaciaIncome) * 100 : 0;

  const consultasIncome = incomeBreakdown.consultations?.amount ?? 0;
  const consultasProfit = consultasIncome; // 100% margin (no cost)
  const consultasMargin = 100;

  const estudiosIncome = incomeBreakdown.studies?.amount ?? 0;
  const estudiosProfit = estudiosIncome; // 100% margin (no cost)
  const estudiosMargin = 100;

  const lines = [
    {
      name: "Farmacia",
      income: farmaciaIncome,
      profit: farmaciaProfit,
      cost: farmaciaCost,
      margin: farmaciaMargin,
      color: "#3b82f6",
      costColor: "#f97316",
    },
    {
      name: "Consultas",
      income: consultasIncome,
      profit: consultasProfit,
      cost: 0,
      margin: consultasMargin,
      color: "#10b981",
      costColor: "#f97316",
    },
    {
      name: "Estudios",
      income: estudiosIncome,
      profit: estudiosProfit,
      cost: 0,
      margin: estudiosMargin,
      color: "#8b5cf6",
      costColor: "#f97316",
    },
  ];

  // Find max for scale
  const maxValue = Math.max(...lines.map((l) => l.income));

  const chartData = {
    labels: lines.map((l) => l.name),
    datasets: [
      {
        label: "Utilidad",
        data: lines.map((l) => l.profit),
        backgroundColor: lines.map((l) => l.color),
        borderRadius: 4,
        barPercentage: 0.7,
      },
      {
        label: "Costo",
        data: lines.map((l) => l.cost),
        backgroundColor: "rgba(249, 115, 22, 0.8)",
        borderRadius: 4,
        barPercentage: 0.7,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
        max: maxValue * 1.1,
        grid: {
          display: false,
        },
        ticks: {
          callback: (value: any) => formatCompact(value),
        },
      },
      y: {
        stacked: true,
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Rentabilidad por Linea de Negocio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mb-4">
          <Bar data={chartData} options={options} />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          {lines.map((line) => (
            <div
              key={line.name}
              className="p-3 rounded-lg bg-muted/50 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                <span className="font-medium text-sm">{line.name}</span>
              </div>
              <p className="text-lg font-bold">{formatCompact(line.income)}</p>
              <p className="text-xs text-muted-foreground">
                Utilidad: {formatCompact(line.profit)}
              </p>
              <div
                className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium ${
                  line.margin >= 50
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : line.margin >= 20
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {line.margin.toFixed(1)}% margen
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
