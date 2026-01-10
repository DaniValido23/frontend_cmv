import { useSicarBiDashboard } from "@/hooks/useSicarBi";
import { useBalanceDashboard, useMonthlyBalance } from "@/hooks/useBalance";
import type { Period } from "@/components/features/balance/PeriodSelector";
import SicarTrendsChart from "@/components/features/balance/sicar-bi/SicarTrendsChart";
import CashFlowChart from "@/components/features/balance/sicar-bi/CashFlowChart";
import WeekdayAnalysisChart from "@/components/features/balance/sicar-bi/WeekdayAnalysisChart";
import IncomeTrendsChart from "@/components/features/balance/sicar-bi/IncomeTrendsChart";
import FixedExpensesPieChart from "@/components/features/balance/sicar-bi/FixedExpensesPieChart";
import StudyCategoryPieChart from "@/components/features/balance/sicar-bi/StudyCategoryPieChart";
import CombinedSummaryCards from "@/components/features/balance/sicar-bi/CombinedSummaryCards";
import ExpensesByCategoryChart from "@/components/features/balance/sicar-bi/ExpensesByCategoryChart";
import { Card, CardContent } from "@/components/ui/Card";
import { AlertCircle } from "lucide-react";

interface SicarBiTabProps {
  period: Period;
}

export default function SicarBiTab({ period }: SicarBiTabProps) {
  // Date params for all hooks - using full date range
  const dateParams = {
    from: period.start,
    to: period.end,
  };

  // SICAR BI hooks
  const sicarDashboard = useSicarBiDashboard(dateParams);

  // Financial dashboard hooks - now support date ranges
  const balanceDashboard = useBalanceDashboard(dateParams);
  const monthlyBalance = useMonthlyBalance(dateParams);

  // Combined loading state
  const isLoading = sicarDashboard.isLoading || balanceDashboard.isLoading || monthlyBalance.isLoading;

  // Show error only if ALL requests fail
  const hasError = sicarDashboard.error && balanceDashboard.error;

  if (hasError) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-destructive font-medium">Error al cargar datos de BI</p>
          <p className="text-sm text-muted-foreground mt-2">
            Por favor, verifica que haya datos importados para el periodo seleccionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <CombinedSummaryCards
        dashboard={balanceDashboard.data}
        isLoading={balanceDashboard.isLoading}
      />

      {/* Row 1: Study Categories + Fixed Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StudyCategoryPieChart dateParams={dateParams} />
        <FixedExpensesPieChart dateParams={dateParams} />
      </div>

      {/* Row 2: Expenses by Category + Weekday Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpensesByCategoryChart
          expenses={monthlyBalance.data?.expenses}
          isLoading={monthlyBalance.isLoading}
        />
        <WeekdayAnalysisChart
          data={sicarDashboard.data?.weekday_analysis}
          peakDay={sicarDashboard.data?.top_metrics?.best_day}
          isLoading={sicarDashboard.isLoading}
        />
      </div>

      {/* Row 3: Income Trends (SICAR + Consultas + Estudios) */}
      <IncomeTrendsChart dateParams={dateParams} />

      {/* Row 4: SICAR Trends */}
      <SicarTrendsChart dateParams={dateParams} />

      {/* Row 5: Cash Flow */}
      <CashFlowChart dateParams={dateParams} />
    </div>
  );
}
