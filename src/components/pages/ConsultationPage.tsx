import { useEffect, useState } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { navigateTo } from "@/hooks/useNavigate";
import { useInProgressConsultations } from "@/hooks/useWaitingRoom";
import { ActiveConsultationsList } from '@/components/features/consultation/ActiveConsultationsList';
import ConsultationForm from '@/components/features/consultation/ConsultationForm';
import { AlertCircle } from "lucide-react";

function ConsultationPageContent() {
  const { data: inProgressConsultations, isLoading: isLoadingConsultations } = useInProgressConsultations();
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

  // Auto-seleccionar la primera consulta cuando carguen los datos
  useEffect(() => {
    if (inProgressConsultations && inProgressConsultations.length > 0 && !selectedConsultationId) {
      setSelectedConsultationId(inProgressConsultations[0].id);
    }
  }, [inProgressConsultations, selectedConsultationId]);

  if (isLoadingConsultations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Si no hay consultas activas, mostrar mensaje
  if (!inProgressConsultations || inProgressConsultations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No hay consultas activas</h2>
          <p className="text-muted-foreground mb-6">
            Actualmente no tienes pacientes en consulta. Ve a la sala de espera para atender un nuevo paciente.
          </p>
          <button
            onClick={() => navigateTo("/waiting-room")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Ir a Sala de Espera
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Panel lateral izquierdo: Lista de consultas activas */}
      <div className="w-80 border-r bg-card shadow-sm flex-shrink-0 overflow-hidden">
        <ActiveConsultationsList
          consultations={inProgressConsultations}
          selectedConsultationId={selectedConsultationId}
          onSelectConsultation={setSelectedConsultationId}
        />
      </div>

      {/* Área principal: Formulario de consulta */}
      <div className="flex-1 overflow-y-auto">
        {selectedConsultationId ? (
          <ConsultationForm key={selectedConsultationId} selectedConsultationId={selectedConsultationId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Selecciona una consulta para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConsultationPage() {
  const { isAuthenticated, user, initAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();

    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigateTo("/login");
      return;
    }

    if (user?.role !== "doctor") {
      navigateTo("/waiting-room");
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || !isAuthenticated || user?.role !== "doctor") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ConsultationPageContent />
    </QueryClientProvider>
  );
}
