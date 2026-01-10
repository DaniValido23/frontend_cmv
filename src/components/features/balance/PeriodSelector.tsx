import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type PeriodType = "month" | "year";

export interface Period {
  type: PeriodType;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  label: string;
}

interface PeriodSelectorProps {
  period: Period;
  onChange: (period: Period) => void;
}

const PERIOD_TYPE_LABELS: Record<PeriodType, string> = {
  month: "Mes",
  year: "Ano",
};

// Helper functions
const getMonthStart = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
};

const getMonthEnd = (date: Date): string => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
};

const formatMonthLabel = (dateStr: string): string => {
  const [year, month] = dateStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
};

export function createMonthPeriod(monthStr: string): Period {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return {
    type: "month",
    start: getMonthStart(date),
    end: getMonthEnd(date),
    label: formatMonthLabel(monthStr),
  };
}

export function createYearPeriod(year: number): Period {
  return {
    type: "year",
    start: `${year}-01-01`,
    end: `${year}-12-31`,
    label: `${year}`,
  };
}

export function getCurrentMonthPeriod(): Period {
  const now = new Date();
  return createMonthPeriod(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
}

// Get months between two dates for aggregation
export function getMonthsInPeriod(period: Period): string[] {
  const months: string[] = [];
  const start = new Date(period.start);
  const end = new Date(period.end);

  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    months.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`);
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

export default function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const handlePrevious = () => {
    if (period.type === "month") {
      const [year, month] = period.start.split("-").map(Number);
      const prevDate = new Date(year, month - 2, 1);
      onChange(createMonthPeriod(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`));
    } else {
      // year - parse directly from string to avoid timezone issues
      const year = parseInt(period.start.split("-")[0]);
      onChange(createYearPeriod(year - 1));
    }
  };

  const handleNext = () => {
    const now = new Date();

    if (period.type === "month") {
      const [year, month] = period.start.split("-").map(Number);
      const nextDate = new Date(year, month, 1);
      if (nextDate <= now) {
        onChange(createMonthPeriod(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`));
      }
    } else {
      // year - parse directly from string to avoid timezone issues
      const year = parseInt(period.start.split("-")[0]);
      if (year < now.getFullYear()) {
        onChange(createYearPeriod(year + 1));
      }
    }
  };

  const handleTypeChange = (newType: PeriodType) => {
    const now = new Date();
    if (newType === "month") {
      onChange(getCurrentMonthPeriod());
    } else {
      onChange(createYearPeriod(now.getFullYear()));
    }
    setShowTypeMenu(false);
  };

  const isAtCurrentPeriod = () => {
    const now = new Date();
    if (period.type === "month") {
      return period.start.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    }
    // year - parse directly from string to avoid timezone issues
    const year = parseInt(period.start.split("-")[0]);
    return year === now.getFullYear();
  };

  return (
    <div className="flex items-center gap-1">
      {/* Period Type Selector */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 min-w-[100px]"
          onClick={() => setShowTypeMenu(!showTypeMenu)}
        >
          <Calendar className="h-4 w-4" />
          {PERIOD_TYPE_LABELS[period.type]}
          <ChevronDown className="h-3 w-3" />
        </Button>

        {showTypeMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowTypeMenu(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-popover border rounded-md shadow-lg z-50 min-w-[100px]">
              {(["month", "year"] as PeriodType[]).map((type) => (
                <button
                  key={type}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${
                    period.type === type ? "bg-accent font-medium" : ""
                  }`}
                  onClick={() => handleTypeChange(type)}
                >
                  {PERIOD_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="min-w-[140px] text-center font-medium text-sm capitalize px-2">
          {period.label}
        </span>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={handleNext}
          disabled={isAtCurrentPeriod()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
