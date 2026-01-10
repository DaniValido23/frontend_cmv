import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingUp, Package, DollarSign, Percent, Receipt, Calculator } from "lucide-react";
import type { SicarIncomeDetails } from "@/types/balance";

interface SicarDetailsCardProps {
  data: SicarIncomeDetails;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function SicarDetailsCard({ data }: SicarDetailsCardProps) {
  if (!data) return null;

  const items = [
    {
      label: "Ventas Brutas",
      value: data.gross_sales,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Costo Mercancia",
      value: data.total_cost,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      isNegative: true,
    },
    {
      label: "Utilidad Bruta",
      value: data.gross_profit,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span>Farmacia SICAR</span>
          <span className="ml-auto flex items-center gap-1 text-sm font-normal text-muted-foreground">
            <Percent className="h-3.5 w-3.5" />
            Margen: {data.profit_margin.toFixed(1)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <span className={`font-semibold ${item.isNegative ? "text-orange-600" : ""}`}>
                {item.isNegative ? "-" : ""}
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>

        {/* Ticket metrics */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Receipt className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tickets</p>
                <p className="font-semibold">{data.ticket_count?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                <Calculator className="h-4 w-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Promedio</p>
                <p className="font-semibold">{formatCurrency(data.average_ticket || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual profit bar */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Composicion de Ventas</span>
            <span>{data.profit_margin.toFixed(1)}% utilidad</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden bg-muted flex">
            <div
              className="bg-green-500 h-full transition-all"
              style={{ width: `${data.profit_margin}%` }}
              title={`Utilidad: ${formatCurrency(data.gross_profit)}`}
            />
            <div
              className="bg-orange-500 h-full transition-all"
              style={{ width: `${100 - data.profit_margin}%` }}
              title={`Costo: ${formatCurrency(data.total_cost)}`}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-green-600">Utilidad</span>
            <span className="text-orange-600">Costo</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
