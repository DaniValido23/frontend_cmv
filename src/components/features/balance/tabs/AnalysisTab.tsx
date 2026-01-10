import ProfitTrendChart from "../dashboard/ProfitTrendChart";
import MonthlyComparison from "../dashboard/MonthlyComparison";
import type { Period } from "../PeriodSelector";

interface AnalysisTabProps {
  period: Period;
}

export default function AnalysisTab({ period }: AnalysisTabProps) {
  // For monthly period, use the month string for comparison
  const monthStr = period.start.slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Financial Trend - Full width, shows full history with year/month toggle */}
      <ProfitTrendChart />

      {/* Monthly Comparison - current vs previous month */}
      <MonthlyComparison currentMonth={monthStr} />
    </div>
  );
}
