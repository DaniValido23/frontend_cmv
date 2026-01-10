import { useState } from "react";
import { ChevronDown, Upload, Receipt, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

// SICAR components
import SicarImportFormCompact from "../sicar/SicarImportFormCompact";
import SicarImportList from "../sicar/SicarImportList";
import ExpenseListByCategory from "../sicar/ExpenseListByCategory";

// Expenses components
import FixedExpenseList from "../expenses/FixedExpenseList";

// Classifier components
import ExpenseClassifier from "../sicar/ExpenseClassifier";

// Period selector
import PeriodSelector, {
  type Period,
  getCurrentMonthPeriod,
} from "../PeriodSelector";

interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: number;
}

function AccordionSection({
  title,
  icon,
  defaultOpen = false,
  children,
  badge,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title}
            {badge !== undefined && badge > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {badge}
              </span>
            )}
          </div>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CardTitle>
      </CardHeader>
      {isOpen && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

interface DataTabProps {
  pendingActions?: {
    unclassified_expenses: number;
    unpaid_fixed_expenses: number;
  };
}

export default function DataTab({ pendingActions }: DataTabProps) {
  const unclassified = pendingActions?.unclassified_expenses ?? 0;
  const unpaidFixed = pendingActions?.unpaid_fixed_expenses ?? 0;
  const [expensePeriod, setExpensePeriod] = useState<Period>(getCurrentMonthPeriod());

  return (
    <div className="space-y-4">
      {/* Import SICAR - Form + History side by side, centered */}
      <AccordionSection
        title="Importar SICAR"
        icon={<Upload className="h-5 w-5" />}
        defaultOpen={true}
      >
        <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
          {/* Import Form - compact */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <SicarImportFormCompact />
          </div>
          {/* Import History */}
          <div className="flex-1 max-w-2xl">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">
              Historial de Importaciones
            </h4>
            <SicarImportList />
          </div>
        </div>
      </AccordionSection>

      {/* Expenses List by Category */}
      <ExpenseListByCategory
        from={expensePeriod.start}
        to={expensePeriod.end}
        headerAction={
          <PeriodSelector
            period={expensePeriod}
            onChange={setExpensePeriod}
          />
        }
      />

      {/* Fixed Expenses */}
      <AccordionSection
        title="Gastos Fijos"
        icon={<Receipt className="h-5 w-5" />}
        badge={unpaidFixed}
      >
        <FixedExpenseList />
      </AccordionSection>

      {/* Classify Expenses */}
      <AccordionSection
        title="Clasificar Gastos"
        icon={<Tag className="h-5 w-5" />}
        badge={unclassified}
        defaultOpen={unclassified > 0}
      >
        <ExpenseClassifier />
      </AccordionSection>
    </div>
  );
}
