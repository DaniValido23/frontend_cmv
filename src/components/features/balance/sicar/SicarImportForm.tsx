import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Upload, FileText, X, CheckCircle2, Info } from "lucide-react";
import { useImportSicar } from "@/hooks/useSicarImport";
import type { SicarFileType } from "@/types/balance";

const FILE_TYPES: { value: SicarFileType; label: string; description: string }[] = [
  {
    value: "utilidad",
    label: "Reporte de Utilidades",
    description: "Excel (RepUtilidadVen.xlsx) con ventas, costos y utilidad",
  },
  {
    value: "movimientos",
    label: "Movimientos de Caja",
    description: "Excel (RepMovimientos.xlsx) con gastos operacionales",
  },
];

const VALID_EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const isValidExcelFile = (file: File): boolean => {
  return VALID_EXCEL_TYPES.includes(file.type) || file.name.toLowerCase().endsWith('.xlsx');
};

export default function SicarImportForm() {
  const importMutation = useImportSicar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<SicarFileType>("utilidad");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidExcelFile(selectedFile)) {
      setFile(selectedFile);
      setShowSuccess(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidExcelFile(droppedFile)) {
      setFile(droppedFile);
      setShowSuccess(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    importMutation.mutate(
      {
        file,
        file_type: fileType,
      },
      {
        onSuccess: () => {
          resetForm();
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        },
      }
    );
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar archivo Excel de SICAR</CardTitle>
      </CardHeader>
      <CardContent>
        {showSuccess && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-900 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-green-800 dark:text-green-200">
              Archivo importado exitosamente. Procesando datos...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Type Selection */}
          <div>
            <Label>Tipo de reporte</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {FILE_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    fileType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-accent/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="fileType"
                    value={type.value}
                    checked={fileType === type.value}
                    onChange={(e) => setFileType(e.target.value as SicarFileType)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">{type.label}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Info about automatic date extraction */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted border">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">
              Exporta los reportes de SICAR como Excel (.xlsx). El periodo se extrae automaticamente del archivo.
            </p>
          </div>

          {/* File Upload */}
          <div>
            <Label>Archivo Excel</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file
                  ? "border-primary bg-primary/5"
                  : "border-input hover:border-primary/50"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">
                    Arrastra un archivo Excel (.xlsx) o haz clic para seleccionar
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Seleccionar archivo
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!file}
              isLoading={importMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar archivo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
