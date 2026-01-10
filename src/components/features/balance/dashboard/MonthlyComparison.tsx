import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useMonthlyBalance } from "@/hooks/useBalance";
import { getAdjacentMonth, formatMonthDisplay } from "@/hooks/useBalance";
import Spinner from "@/components/ui/Spinner";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";

interface MonthlyComparisonProps {
  currentMonth: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function MonthlyComparison({ currentMonth }: MonthlyComparisonProps) {
  const previousMonth = getAdjacentMonth(currentMonth, "prev");

  const { data: current, isLoading: loadingCurrent } = useMonthlyBalance(currentMonth);
  const { data: previous, isLoading: loadingPrevious } = useMonthlyBalance(previousMonth);

  if (loadingCurrent || loadingPrevious) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (!current || !previous) {
    return null;
  }

  const comparisons = [
    {
      label: "Ventas SICAR",
      current: current.sicar.net_sales,
      previous: previous.sicar.net_sales,
    },
    {
      label: "Utilidad SICAR",
      current: current.sicar.gross_profit,
      previous: previous.sicar.gross_profit,
    },
    {
      label: "Consultas",
      current: current.cmv.consultations_income,
      previous: previous.cmv.consultations_income,
      countCurrent: current.cmv.consultations_count,
      countPrevious: previous.cmv.consultations_count,
    },
    {
      label: "Estudios",
      current: current.cmv.studies_income,
      previous: previous.cmv.studies_income,
      countCurrent: current.cmv.studies_count,
      countPrevious: previous.cmv.studies_count,
    },
    {
      label: "Gastos Fijos",
      current: current.expenses.fixed,
      previous: previous.expenses.fixed,
      invertColors: true,
    },
    {
      label: "Gastos Operativos",
      current: current.expenses.operational,
      previous: previous.expenses.operational,
      invertColors: true,
    },
  ];

  const calculateChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const getChangeIcon = (change: number, invertColors: boolean = false) => {
    if (Math.abs(change) < 0.5) {
      return <MinusIcon className="w-4 h-4 text-muted-foreground" />;
    }
    const isPositive = change > 0;
    const isGood = invertColors ? !isPositive : isPositive;
    const colorClass = isGood ? "text-green-600" : "text-red-600";

    return isPositive ? (
      <ArrowUpIcon className={`w-4 h-4 ${colorClass}`} />
    ) : (
      <ArrowDownIcon className={`w-4 h-4 ${colorClass}`} />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Comparativa: {formatMonthDisplay(currentMonth)} vs {formatMonthDisplay(previousMonth)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {comparisons.map((item) => {
            const change = calculateChange(item.current, item.previous);
            return (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  {item.countCurrent !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {item.countCurrent} vs {item.countPrevious} (cantidad)
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.current)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.previous)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 min-w-[60px] justify-end">
                    {getChangeIcon(change, item.invertColors)}
                    <span
                      className={`text-sm ${
                        Math.abs(change) < 0.5
                          ? "text-muted-foreground"
                          : (item.invertColors ? change < 0 : change > 0)
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {Math.abs(change).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
