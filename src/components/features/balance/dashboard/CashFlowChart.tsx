import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import type { CashFlowBreakdown } from "@/types/balance";

interface CashFlowChartProps {
  data: CashFlowBreakdown;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function CashFlowChart({ data }: CashFlowChartProps) {
  if (!data) return null;

  // Calculate net amounts
  const efectivoNeto = (data.efectivo_ingresos || 0) - (data.efectivo_gastos || 0);
  const tarjetaNeto = (data.tarjeta_ingresos || 0) - (data.tarjeta_gastos || 0);

  const paymentMethods = [
    {
      name: "Efectivo",
      ingresos: data.efectivo_ingresos || 0,
      gastos: data.efectivo_gastos || 0,
      neto: efectivoNeto,
      color: "green",
      icon: Wallet,
    },
    {
      name: "Tarjeta",
      ingresos: data.tarjeta_ingresos || 0,
      gastos: data.tarjeta_gastos || 0,
      neto: tarjetaNeto,
      color: "blue",
      icon: Wallet,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Flujo de Caja por Metodo de Pago</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{method.name}</span>
              <span className={`font-semibold ${method.neto >= 0 ? "text-green-600" : "text-red-600"}`}>
                {method.neto >= 0 ? "+" : ""}{formatCurrency(method.neto)}
              </span>
            </div>

            {/* Income/Expense breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-900/20">
                <ArrowDownCircle className="h-3.5 w-3.5 text-green-600" />
                <div>
                  <span className="text-muted-foreground">Entradas</span>
                  <p className="font-medium text-green-700 dark:text-green-400">
                    {formatCurrency(method.ingresos)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-red-50 dark:bg-red-900/20">
                <ArrowUpCircle className="h-3.5 w-3.5 text-red-600" />
                <div>
                  <span className="text-muted-foreground">Salidas</span>
                  <p className="font-medium text-red-700 dark:text-red-400">
                    {formatCurrency(method.gastos)}
                  </p>
                </div>
              </div>
            </div>

            {/* Visual bar */}
            {method.ingresos > 0 && (
              <div className="h-2 rounded-full overflow-hidden bg-muted flex">
                <div
                  className="bg-green-500 h-full"
                  style={{
                    width: `${(method.ingresos / (method.ingresos + method.gastos)) * 100}%`
                  }}
                />
                <div
                  className="bg-red-400 h-full"
                  style={{
                    width: `${(method.gastos / (method.ingresos + method.gastos)) * 100}%`
                  }}
                />
              </div>
            )}
          </div>
        ))}

        {/* Total summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Neto en Caja</span>
            <span className={`font-bold text-lg ${(efectivoNeto + tarjetaNeto) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(efectivoNeto + tarjetaNeto)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
