import IncomeBreakdownChart from "../dashboard/IncomeBreakdownChart";
import ExpenseBreakdownChart from "../dashboard/ExpenseBreakdownChart";
import SicarDetailsCard from "../dashboard/SicarDetailsCard";
import CashFlowChart from "../dashboard/CashFlowChart";
import StudyCategoryTable from "../dashboard/StudyCategoryTable";
import type { Period } from "../PeriodSelector";
import type { BalanceDashboard } from "@/types/balance";

interface BreakdownTabProps {
  period: Period;
  data?: BalanceDashboard;
}

export default function BreakdownTab({ period, data }: BreakdownTabProps) {
  const monthStr = period.start.slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Income vs Expense Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data?.income_breakdown && (
          <IncomeBreakdownChart data={data.income_breakdown} />
        )}
        {data?.expense_breakdown && (
          <ExpenseBreakdownChart data={data.expense_breakdown} />
        )}
      </div>

      {/* SICAR Details + Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data?.sicar_details && <SicarDetailsCard data={data.sicar_details} />}
        {data?.cash_flow && <CashFlowChart data={data.cash_flow} />}
      </div>

      {/* Study Categories */}
      <StudyCategoryTable month={monthStr} />
    </div>
  );
}
