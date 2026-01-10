import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { SicarImportStatus as StatusType } from "@/types/balance";

interface SicarImportStatusProps {
  status: StatusType;
}

const statusConfig: Record<StatusType, { label: string; icon: typeof Clock; className: string }> = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    className: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  },
  processing: {
    label: "Procesando",
    icon: Loader2,
    className: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  },
  completed: {
    label: "Completado",
    icon: CheckCircle2,
    className: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
  failed: {
    label: "Error",
    icon: XCircle,
    className: "text-red-600 bg-red-100 dark:bg-red-900/30",
  },
};

export default function SicarImportStatus({ status }: SicarImportStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${status === "processing" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  );
}
