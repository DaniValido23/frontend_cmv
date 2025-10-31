import { useState, useMemo } from "react";
import { usePatients, useAllPatients } from "@/hooks/usePatients";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "@/hooks/useNavigate";
import { useDebounce } from "@/hooks/useDebounce";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { User, Info, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

export default function PatientsTable() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search query to reduce re-renders and API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Cargar datos según si hay búsqueda o no
  const { data: paginatedData, isLoading: isLoadingPaginated } = usePatients(currentPage, 10);
  const { data: allPatients, isLoading: isLoadingAll } = useAllPatients();

  const isSearching = debouncedSearchQuery.trim().length > 0;
  const isLoading = isSearching ? isLoadingAll : isLoadingPaginated;

  const handleViewInfo = (patientId: string) => {
    navigate(`/patients/${patientId}/consultations`);
  };

  // Determinar qué pacientes mostrar
  const paginatedPatients = paginatedData?.patients || [];
  const meta = paginatedData?.meta;

  // Memoize filtered patients to avoid re-filtering on every render
  // IMPORTANT: This must be called before any conditional returns to follow Rules of Hooks
  const displayedPatients = useMemo(() => {
    if (!isSearching) return paginatedPatients;

    const query = debouncedSearchQuery.toLowerCase();
    return (allPatients || []).filter(patient =>
      patient.full_name?.toLowerCase().includes(query) ||
      patient.first_name?.toLowerCase().includes(query) ||
      patient.last_name?.toLowerCase().includes(query)
    );
  }, [isSearching, debouncedSearchQuery, allPatients, paginatedPatients]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
            <Card key={patient.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                {/* Avatar y Nombre */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {patient.full_name}
                  </h3>
                </div>

                {/* Botón de acción */}
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={() => handleViewInfo(patient.id)}
                    className="bg-primary/70 hover:bg-primary/80 text-primary-foreground"
                    size="sm"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Ver Información
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

    </div>
  );
}
