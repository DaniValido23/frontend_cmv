import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getAdjacentMonth, formatMonthDisplay } from "@/hooks/useBalance";

interface MonthSelectorProps {
  month: string;
  onChange: (month: string) => void;
}

export default function MonthSelector({ month, onChange }: MonthSelectorProps) {
  const handlePrevious = () => {
    onChange(getAdjacentMonth(month, "prev"));
  };

  const handleNext = () => {
    onChange(getAdjacentMonth(month, "next"));
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const isCurrentMonth = month === currentMonth;

  return (
    <div className="flex items-center gap-2">
      <Button size="icon" variant="outline" onClick={handlePrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[160px] text-center font-medium capitalize">
        {formatMonthDisplay(month)}
      </span>
      <Button
        size="icon"
        variant="outline"
        onClick={handleNext}
        disabled={isCurrentMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
