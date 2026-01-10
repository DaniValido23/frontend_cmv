import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { FileText, Trash2, RefreshCw } from "lucide-react";
import { useSicarImports, useDeleteSicarImport } from "@/hooks/useSicarImport";
import type { SicarImport, SicarFileType } from "@/types/balance";
import SicarImportStatus from "./SicarImportStatus";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Modal";

const FILE_TYPE_LABELS: Record<SicarFileType, string> = {
  utilidad: "Reporte de Utilidades",
  movimientos: "Movimientos de Caja",
};

export default function SicarImportList() {
  const { data, isLoading, error, refetch } = useSicarImports();
  const imports = data?.imports;
  const deleteMutation = useDeleteSicarImport();

  const [deleteImport, setDeleteImport] = useState<SicarImport | null>(null);

  const handleDelete = () => {
    if (!deleteImport) return;
    deleteMutation.mutate(deleteImport.id, {
      onSuccess: () => setDeleteImport(null),
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">Error al cargar importaciones</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!imports || imports.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No hay importaciones registradas. Sube un archivo Excel de SICAR para comenzar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {imports.map((importItem) => (
              <div
                key={importItem.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground mt-1" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{importItem.file_name}</p>
                      <SicarImportStatus status={importItem.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {FILE_TYPE_LABELS[importItem.file_type]} &bull;{" "}
                      {formatDate(importItem.period_start)} - {formatDate(importItem.period_end)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Importado: {formatDateTime(importItem.imported_at)}
                      {importItem.total_records > 0 && (
                        <> &bull; {importItem.total_records} registros</>
                      )}
                    </p>
                    {importItem.error_message && (
                      <p className="text-xs text-destructive mt-1">
                        {importItem.error_message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteImport(importItem)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!deleteImport} onOpenChange={(open) => !open && setDeleteImport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar importacion</DialogTitle>
            <DialogDescription>
              ¿Estas seguro de eliminar esta importacion? Se eliminaran todos los datos
              asociados (ventas y gastos importados). Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteImport(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
