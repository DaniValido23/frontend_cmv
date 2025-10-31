import { memo } from "react";
import { Upload, FileIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AttachmentsSectionProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

function AttachmentsSection({ files, onFilesChange }: AttachmentsSectionProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      const maxSize = 20 * 1024 * 1024; // 20MB en bytes

      // Validar tamaño de cada archivo
      const validFiles = newFiles.filter(file => {
        if (file.size > maxSize) {
          toast.error(`El archivo "${file.name}" excede el tamaño máximo de 20MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            Archivos Adjuntos
          </div>
          <span className="text-xs text-muted-foreground font-normal">
            PDF, JPG, JPEG, PNG, DOC, DOCX (máx. 20MB)
          </span>
        </div>
      </label>
      <div className="flex items-center gap-2">
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        <label
          htmlFor="file-upload"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-input rounded-md hover:border-primary cursor-pointer transition-colors"
        >
          <Upload className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Seleccionar archivos
          </span>
        </label>
      </div>

      {/* Lista de archivos adjuntos */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Archivos seleccionados:</p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-3 p-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded transition-colors"
                title="Eliminar archivo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Memoize component to prevent re-renders when props don't change
export default memo(AttachmentsSection);
