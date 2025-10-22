import { useState } from "react";
import { useAllPatients, useDeletePatient } from "@/hooks/usePatients";
import { useNavigate } from "@/hooks/useNavigate";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import {
  User,
  Eye,
  Trash2,
  Phone,
  Mail,
  Search,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Patient } from "@/types/models";

// Función para parsear fechas en formato DD-MM-YYYY del backend
const parseBirthDate = (dateString: string): Date => {
  // El backend puede enviar formato: DD-MM-YYYY
  if (dateString.includes('-') && dateString.split('-')[0].length <= 2) {
    const [day, month, year] = dateString.split('-');
    // Crear fecha en formato ISO: YYYY-MM-DD
    return new Date(`${year}-${month}-${day}`);
  }
  // Si ya está en formato ISO o reconocible
  return new Date(dateString);
};

export default function PatientList() {
  const { data: patients, isLoading } = useAllPatients();
  const deleteMutation = useDeletePatient();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredPatients = patients?.filter(
    (patient) =>
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Gestiona la información de tus pacientes
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre, teléfono o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pacientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resultados
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredPatients?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredPatients && filteredPatients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Fecha de Nacimiento</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead>Tipo de Sangre</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{patient.full_name}</div>
                          {patient.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(parseBirthDate(patient.birth_date), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      {patient.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{patient.phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {patient.gender}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {patient.blood_type ? (
                        <Badge variant="outline" className="font-mono">
                          {patient.blood_type}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (
                              confirm(
                                `¿Estás seguro de eliminar a ${patient.full_name}?`
                              )
                            ) {
                              deleteMutation.mutate(patient.id);
                            }
                          }}
                          isLoading={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                {searchTerm
                  ? "No se encontraron pacientes"
                  : "No hay pacientes registrados"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm
                  ? "Intenta con otro término de búsqueda"
                  : "Comienza agregando tu primer paciente"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
