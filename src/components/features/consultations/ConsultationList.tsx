import { useState } from "react";
import { useConsultations, useDeleteConsultation } from "@/hooks/useConsultations";
import { usePatients } from "@/hooks/usePatients";
import { useNavigate } from "@/hooks/useNavigate";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Label from "@/components/ui/Label";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Eye,
  Trash2,
  Calendar,
  User,
  FileText,
  DollarSign,
  Filter,
} from "lucide-react";
import type { Consultation } from "@/types/models";

export default function ConsultationList() {
  const { data: consultations, isLoading } = useConsultations();
  const { data: patients } = usePatients();
  const deleteMutation = useDeleteConsultation();
  const navigator = useNavigate();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getPatientName = (patientId?: string) => {
    if (!patientId) return "Desconocido";
    const patient = patients?.find((p) => p.id === patientId);
    return patient?.full_name || "Desconocido";
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">Sin estado</Badge>;

    const statusMap = {
      pending: { variant: "warning" as const, label: "Pendiente" },
      in_progress: { variant: "default" as const, label: "En Progreso" },
      completed: { variant: "success" as const, label: "Completada" },
      cancelled: { variant: "destructive" as const, label: "Cancelada" },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      variant: "secondary" as const,
      label: status,
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const handleDelete = () => {
    if (deleteModal.id) {
      deleteMutation.mutate(deleteModal.id, {
        onSuccess: () => {
          setDeleteModal({ isOpen: false, id: null });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const filteredConsultations = consultations?.filter((consultation) => {
    if (statusFilter === "all") return true;
    return consultation.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-4 p-6">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <div className="flex items-center gap-3 flex-1">
            <Label htmlFor="status-filter" className="text-sm font-medium whitespace-nowrap">
              Filtrar por estado:
            </Label>
            <Select
              id="status-filter"
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </Select>
          </div>
        </div>
      </Card>

      {!filteredConsultations || filteredConsultations.length === 0 ? (
        <Card>
          <div className="text-center py-12 px-6">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay consultas registradas</p>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Paciente
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Motivo
                  </div>
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Costo
                  </div>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultations.map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell className="font-medium">
                    {format(new Date(consultation.consultation_date), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>{getPatientName(consultation.patient_id)}</TableCell>
                  <TableCell className="max-w-xs truncate">{consultation.reason ?? "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(consultation.status)}</TableCell>
                  <TableCell>
                    {consultation.cost ? `$${consultation.cost.toFixed(2)}` : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          navigator.navigate(`/consultations/${consultation.id}`)
                        }
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      {consultation.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteModal({ isOpen: true, id: consultation.id })}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Modal
        open={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Eliminar Consulta"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            ¿Estás seguro de que deseas eliminar esta consulta? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, id: null })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} isLoading={deleteMutation.isPending}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
