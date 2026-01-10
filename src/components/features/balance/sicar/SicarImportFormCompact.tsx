import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { useImportSicar } from "@/hooks/useSicarImport";
import type { SicarFileType } from "@/types/balance";

const FILE_TYPES: { value: SicarFileType; label: string }[] = [
  { value: "utilidad", label: "Utilidades" },
  { value: "movimientos", label: "Movimientos" },
];

const VALID_EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const isValidExcelFile = (file: File): boolean => {
  return VALID_EXCEL_TYPES.includes(file.type) || file.name.toLowerCase().endsWith('.xlsx');
};

export default function SicarImportFormCompact() {
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
      { file, file_type: fileType },
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
    <div className="space-y-4">
      {showSuccess && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-800 dark:text-green-200">
            Importado exitosamente
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Type Selection - Compact */}
        <div>
          <Label className="text-xs">Tipo de reporte</Label>
          <div className="flex gap-2 mt-1">
            {FILE_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFileType(type.value)}
                className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                  fileType === type.value
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-input hover:bg-accent/50"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* File Upload - Compact */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            file ? "border-primary bg-primary/5" : "border-input hover:border-primary/50"
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium truncate">{file.name}</span>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={clearFile} className="flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div>
              <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground mb-2">
                Arrastra o selecciona archivo Excel
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-compact"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Seleccionar
              </Button>
            </div>
          )}
        </div>

        {/* Submit - Compact */}
        <Button
          type="submit"
          size="sm"
          className="w-full"
          disabled={!file}
          isLoading={importMutation.isPending}
        >
          <Upload className="h-4 w-4 mr-2" />
          Importar
        </Button>
      </form>
    </div>
  );
}
