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
import { Calendar } from "lucide-react";
import type { SicarBiWeekdayData } from "@/types/sicarBi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface WeekdayAnalysisChartProps {
  data?: SicarBiWeekdayData[];
  peakDay?: string;
  isLoading?: boolean;
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

// Orden de días de la semana (Lunes a Domingo)
const WEEKDAY_ORDER = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

export default function WeekdayAnalysisChart({
  data,
  peakDay,
  isLoading,
}: WeekdayAnalysisChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <div className="h-[200px] w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Ventas por Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay datos disponibles
        </CardContent>
      </Card>
    );
  }

  // Map data by day name for easy lookup
  const dayMap = new Map(data.map(d => [d.day_name, d]));

  // Find peak day from data if not provided
  const calculatedPeakDay = peakDay ?? data.reduce(
    (max, item) => (item.total_sales > (dayMap.get(max)?.total_sales ?? 0) ? item.day_name : max),
    data[0]?.day_name ?? ""
  );

  // Sort data by weekday order
  const sortedData = WEEKDAY_ORDER
    .map(day => {
      const dayData = dayMap.get(day);
      return {
        day,
        sales: dayData?.total_sales ?? 0,
        tickets: dayData?.ticket_count ?? 0,
        avgTicket: dayData?.avg_ticket ?? 0,
        profit: dayData?.total_profit ?? 0,
      };
    })
    .filter(d => d.sales > 0 || dayMap.has(d.day));

  const chartData = {
    labels: sortedData.map(d => d.day.substring(0, 3)), // Lun, Mar, Mie...
    datasets: [
      {
        label: "Ventas",
        data: sortedData.map(d => d.sales),
        backgroundColor: sortedData.map(d =>
          d.day === calculatedPeakDay
            ? "#10b981"  // Verde para día pico
            : "#8b5cf6"  // Púrpura para el resto
        ),
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
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          title: (context: any) => sortedData[context[0].dataIndex].day,
          label: (context: any) => {
            const idx = context.dataIndex;
            return [
              `Ventas: ${formatCurrency(sortedData[idx].sales)}`,
              `Tickets: ${sortedData[idx].tickets}`,
              `Ticket Promedio: ${formatCurrency(sortedData[idx].avgTicket)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: (value: any) => formatCompact(value),
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  // Find peak day stats
  const peakDayData = dayMap.get(calculatedPeakDay);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Ventas por Dia
          </CardTitle>
          {peakDayData && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
              Mejor: {calculatedPeakDay}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <Bar data={chartData} options={options} />
        </div>
        {peakDayData && (
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Mejor dia</p>
              <p className="font-bold">{calculatedPeakDay}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ventas</p>
              <p className="font-bold">{formatCurrency(peakDayData.total_sales)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tickets</p>
              <p className="font-bold">{peakDayData.ticket_count}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
