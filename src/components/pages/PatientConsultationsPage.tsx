import { useState, useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { navigateTo } from "@/hooks/useNavigate";
import { usePatientConsultations } from "@/hooks/useConsultations";
import { usePatient } from "@/hooks/usePatients";
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ConsultationDetailModal from '@/components/features/consultations/ConsultationDetailModal';
import type { Consultation } from '@/types/models';
import { User, Calendar, FileText, ChevronLeft } from 'lucide-react';

interface PatientConsultationsContentProps {
  patientId: string;
}

function PatientConsultationsContent({ patientId }: PatientConsultationsContentProps) {
  const { data: consultations, isLoading: isLoadingConsultations } = usePatientConsultations(patientId);
  const { data: patient, isLoading: isLoadingPatient } = usePatient(patientId);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleConsultationClick = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoadingConsultations || isLoadingPatient) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información del paciente */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigateTo('/patients')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a Pacientes
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {patient?.full_name || 'Paciente'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {patient?.age} años • {patient?.gender || 'No especificado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Consultas */}
      <Card>
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Historial de Consultas</h2>
            <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {consultations?.length || 0}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {!consultations || consultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                No hay consultas registradas
              </p>
              <p className="text-sm text-muted-foreground">
                Este paciente aún no tiene consultas en el historial
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Diagnósticos
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Precio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {consultations.map((consultation) => (
                  <tr
                    key={consultation.id}
                    onClick={() => handleConsultationClick(consultation)}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatDate(consultation.consultation_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {consultation.diagnoses.map((diagnosis, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                          >
                            {diagnosis}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {consultation.doctor?.name || 'No especificado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-green-600">
                        ${consultation.price.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Modal de Detalle */}
      <ConsultationDetailModal
        open={showModal}
        onOpenChange={setShowModal}
        consultation={selectedConsultation}
      />
    </div>
  );
}

interface PatientConsultationsPageProps {
  patientId: string;
}

export default function PatientConsultationsPage({ patientId }: PatientConsultationsPageProps) {
  const { isAuthenticated, initAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigateTo("/login");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PatientConsultationsContent patientId={patientId} />
    </QueryClientProvider>
  );
}
