import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStudyCategoryBreakdown } from "@/hooks/useBalance";
import Spinner from "@/components/ui/Spinner";

interface StudyCategoryTableProps {
  month: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function StudyCategoryTable({ month }: StudyCategoryTableProps) {
  const { data, isLoading, error } = useStudyCategoryBreakdown(month);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Error al cargar datos de estudios
        </CardContent>
      </Card>
    );
  }

  const categories = data?.study_categories || [];

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estudios por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            No hay estudios registrados este mes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Estudios por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                  Categoria
                </th>
                <th className="p-3 text-center text-sm font-medium text-muted-foreground">
                  Cantidad
                </th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">
                  Ingresos
                </th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">
                  Promedio
                </th>
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.category} className="border-b hover:bg-accent/50">
                  <td className="p-3">
                    <span className="font-medium">{cat.category}</span>
                  </td>
                  <td className="p-3 text-center">{cat.count}</td>
                  <td className="p-3 text-right font-medium">
                    {formatCurrency(cat.income)}
                  </td>
                  <td className="p-3 text-right text-muted-foreground">
                    {formatCurrency(cat.average_price)}
                  </td>
                  <td className="p-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
