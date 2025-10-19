import { useState } from "react";
import { usePatients, useAllPatients } from "@/hooks/usePatients";
import { useAuthStore } from "@/stores/authStore";
import { isDoctor } from "@/lib/auth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import UpdatePatientModal from "./UpdatePatientModal";
import { User, Phone, AlertCircle, Edit, FileText, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import clsx from "clsx";

export default function PatientsTable() {
  const user = useAuthStore((state) => state.user);
  const isDoctorUser = isDoctor(user);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Cargar datos según si hay búsqueda o no
  const { data: paginatedData, isLoading: isLoadingPaginated } = usePatients(currentPage, 10);
  const { data: allPatients, isLoading: isLoadingAll } = useAllPatients();

  const isSearching = searchQuery.trim().length > 0;
  const isLoading = isSearching ? isLoadingAll : isLoadingPaginated;

  const handleUpdateClick = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsUpdateModalOpen(true);
  };

  const handleViewConsultations = (patientId: string) => {
    window.location.href = `/patients/${patientId}/consultations`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Determinar qué pacientes mostrar
  const paginatedPatients = paginatedData?.patients || [];
  const meta = paginatedData?.meta;

  const displayedPatients = isSearching
    ? (allPatients || []).filter(patient =>
        patient.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : paginatedPatients;

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar paciente por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {searchQuery.trim() && (
          <p className="text-sm text-muted-foreground mt-2">
            {displayedPatients.length > 0
              ? `Se encontraron ${displayedPatients.length} resultado${displayedPatients.length > 1 ? 's' : ''}`
              : `No se encontraron resultados`
            }
          </p>
        )}
      </Card>

      {/* Lista de pacientes */}
      <div className="grid gap-4">
        {displayedPatients.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{searchQuery ? "No se encontraron resultados" : "No hay pacientes registrados"}</p>
            </div>
          </Card>
        ) : (
          displayedPatients.map((patient) => (
            <Card key={patient.id} className="p-4 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="bg-primary/10 p-3 rounded-lg shrink-0 self-start sm:self-center">
                  <User className="h-6 w-6 text-primary" />
                </div>

                {/* Información del paciente */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Nombre y Edad */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base text-foreground">
                      {patient.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {patient.age} años • {patient.gender}
                    </p>
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Teléfono</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">
                        {patient.phone || "No especificado"}
                      </span>
                    </div>
                  </div>

                  {/* Alergias */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Alergias</p>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className={clsx(
                        "text-sm font-medium",
                        patient.allergies && patient.allergies !== 'NA' && patient.allergies !== 'Ninguna'
                          ? "text-warning"
                          : "text-muted-foreground"
                      )}>
                        {patient.allergies && patient.allergies !== 'NA' && patient.allergies !== 'Ninguna'
                          ? patient.allergies
                          : "Ninguna"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                  {isDoctorUser && (
                    <Button
                      onClick={() => handleViewConsultations(patient.id)}
                      className="bg-success/70 hover:bg-success/80 text-success-foreground whitespace-nowrap flex-1 sm:flex-none"
                      size="sm"
                    >
                      <FileText className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Ver Consultas</span>
                    </Button>
                  )}

                  <Button
                    onClick={() => handleUpdateClick(patient.id)}
                    className="bg-primary/70 hover:bg-primary/80 text-primary-foreground whitespace-nowrap flex-1 sm:flex-none"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Actualizar</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Paginación - Solo mostrar si NO hay búsqueda activa */}
      {!isSearching && meta && meta.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            Mostrando {displayedPatients.length} de {meta.total_items} pacientes
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!meta.has_previous}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-muted-foreground">
                Página {meta.page} de {meta.total_pages}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!meta.has_next}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal de actualización */}
      {selectedPatientId && (
        <UpdatePatientModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedPatientId(null);
          }}
          patientId={selectedPatientId}
        />
      )}
    </div>
  );
}
