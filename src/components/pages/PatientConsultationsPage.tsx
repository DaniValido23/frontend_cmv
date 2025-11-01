import { useState, useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { navigateTo } from "@/hooks/useNavigate";
import { usePatientConsultations } from "@/hooks/useConsultations";
import { usePatient } from "@/hooks/usePatients";
import { isChemist } from "@/lib/auth";
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ConsultationDetailModal from '@/components/features/consultations/ConsultationDetailModal';
import AddPatientModal from '@/components/features/pre-consultation/AddPatientModal';
import type { Consultation } from '@/types/models';
import { User, Calendar, FileText, ChevronLeft, ChevronRight, Phone, Mail, MapPin, AlertCircle, Cake, Briefcase, Church, MapPinned, History, Activity, Edit } from 'lucide-react';

interface PatientConsultationsContentProps {
  patientId: string;
}

function PatientConsultationsContent({ patientId }: PatientConsultationsContentProps) {
  const user = useAuthStore((state) => state.user);
  const isChemistUser = isChemist(user);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading: isLoadingConsultations } = usePatientConsultations(
    patientId,
    currentPage,
    pageSize
  );
  const consultations = data?.consultations || [];
  const meta = data?.meta;

  const { data: patient, isLoading: isLoadingPatient } = usePatient(patientId);

  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleConsultationClick = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowModal(true);
  };

  const handleUpdateClick = () => {
    setIsUpdateModalOpen(true);
  };

  const formatDate = (dateString: string) => {

    if (dateString.includes('-') && dateString.split('-')[0].length <= 2) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      const isoDate = `${year}-${month}-${day}T${timePart || '00:00:00'}`;
      const date = new Date(isoDate);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatBirthDate = (dateString: string) => {

    if (dateString.includes('-') && dateString.split('-')[0].length <= 2) {
      const [day, month, year] = dateString.split('-');
      const isoDate = `${year}-${month}-${day}`;
      const date = new Date(isoDate);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
      <button
        onClick={() => navigateTo('/patients')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a Pacientes
      </button>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {patient?.full_name || 'Paciente'}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Información del Paciente
                </p>
              </div>
            </div>

            {!isChemistUser && (
              <Button
                onClick={handleUpdateClick}
                className="bg-primary/70 hover:bg-primary/80 text-primary-foreground"
              >
                <Edit className="h-5 w-5 mr-2" />
                Actualizar
              </Button>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Cake className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Fecha de Nacimiento</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {patient?.birth_date ? formatBirthDate(patient.birth_date) : 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Edad</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {patient?.age || 'No especificado'} años
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Género</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {patient?.gender || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Teléfono</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {patient?.phone || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Email</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {patient?.email || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Dirección</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {patient?.address || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Ocupación</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {patient?.occupation || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Church className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Religión</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {patient?.religion || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <MapPinned className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Originario de</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {patient?.native_of || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Antecedentes Médicos</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Alergias */}
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-warning/10 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Alergias</p>
                  <p className={`text-sm font-semibold mt-0.5 ${
                    patient?.allergies && patient.allergies !== 'NA' && patient.allergies !== 'Ninguna'
                      ? 'text-warning'
                      : 'text-muted-foreground'
                  }`}>
                    {patient?.allergies && patient.allergies !== 'NA' && patient.allergies !== 'Ninguna'
                      ? patient.allergies
                      : 'Ninguna'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <History className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Antecedentes Personales</p>
                  <p className="text-xs text-foreground mt-0.5 leading-relaxed">
                    {patient?.personal_background || 'No especificado'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Antecedentes Gineco-Obstétricos</p>
                  <p className="text-xs text-foreground mt-0.5 leading-relaxed">
                    {patient?.obstetric_gynecological_background || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Historial de Consultas</h2>
            <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {meta?.total_items || 0}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {consultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                No hay consultas registradas
              </p>
              <p className="text-sm text-muted-foreground">
                {isChemistUser
                  ? "Este paciente aún no tiene consultas en el historial"
                  : "Este paciente aún no tiene consultas tuyas en el historial"
                }
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipo
                  </th>
                  {isChemistUser && (
                    <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Doctor
                    </th>
                  )}
                  <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatDate(consultation.consultation_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-foreground">
                        {consultation.consultation_type === 'study' ? 'Estudio' : 'Consulta'}
                      </span>
                    </td>
                    {isChemistUser && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {consultation.doctor?.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
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

        {meta && meta.total_pages > 1 && (
          <div className="p-6 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Página {meta.page} de {meta.total_pages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!meta.has_previous}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!meta.has_next}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConsultationDetailModal
        open={showModal}
        onOpenChange={setShowModal}
        consultation={selectedConsultation}
      />

      <AddPatientModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onPatientCreated={() => setIsUpdateModalOpen(false)}
        initialPatient={patient}
      />
    </div>
  );
}

interface PatientConsultationsPageProps {
  patientId: string;
}

export default function PatientConsultationsPage({ patientId }: PatientConsultationsPageProps) {
  const { isAuthenticated, user, initAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [initAuth]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigateTo("/login");
      return;
    }

    if (user?.role !== "doctor" && user?.role !== "chemist") {
      navigateTo("/waiting-room");
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || !isAuthenticated || (user?.role !== "doctor" && user?.role !== "chemist")) {
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
