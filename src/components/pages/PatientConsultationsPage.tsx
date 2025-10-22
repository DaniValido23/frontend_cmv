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
import { User, Calendar, FileText, ChevronLeft, Phone, Mail, MapPin, AlertCircle, Cake, Briefcase, Church, MapPinned, History, Activity, Edit } from 'lucide-react';

interface PatientConsultationsContentProps {
  patientId: string;
}

function PatientConsultationsContent({ patientId }: PatientConsultationsContentProps) {
  const user = useAuthStore((state) => state.user);
  const isChemistUser = isChemist(user);
  const { data: consultations, isLoading: isLoadingConsultations } = usePatientConsultations(patientId);
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
    // El backend puede enviar formato: DD-MM-YYYY HH:mm:ss
    // Necesitamos convertir a formato que JavaScript pueda parsear
    if (dateString.includes('-') && dateString.split('-')[0].length <= 2) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      // Crear fecha en formato ISO: YYYY-MM-DDTHH:mm:ss
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

    // Si ya está en formato ISO o reconocible
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
    // El backend puede enviar formato: DD-MM-YYYY
    // Necesitamos convertir a formato que JavaScript pueda parsear
    if (dateString.includes('-') && dateString.split('-')[0].length <= 2) {
      const [day, month, year] = dateString.split('-');
      // Crear fecha en formato ISO: YYYY-MM-DD
      const isoDate = `${year}-${month}-${day}`;
      const date = new Date(isoDate);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    // Si ya está en formato ISO o reconocible
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
      {/* Botón de volver */}
      <button
        onClick={() => navigateTo('/patients')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a Pacientes
      </button>

      {/* Card con información completa del paciente */}
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

            {/* Botón de Actualizar - Solo visible para no químicos */}
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
          {/* Información General */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Fecha de Nacimiento */}
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

              {/* Edad */}
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

              {/* Género */}
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

              {/* Teléfono */}
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

              {/* Email */}
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

              {/* Dirección */}
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

              {/* Ocupación */}
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

              {/* Religión */}
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

              {/* Originario de */}
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

          {/* Antecedentes Médicos */}
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

              {/* Antecedentes Personales */}
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

              {/* Antecedentes Gineco-Obstétricos */}
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

      {/* Modal de Actualización */}
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

    // Solo doctores y químicos pueden ver consultas de pacientes
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
