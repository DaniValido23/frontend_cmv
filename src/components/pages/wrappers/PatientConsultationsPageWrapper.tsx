import LazyComponentLoader from "@/components/common/LazyComponentLoader";
import { PatientConsultationsPageLazy } from "../lazy";

interface PatientConsultationsPageWrapperProps {
  patientId: string;
}

export default function PatientConsultationsPageWrapper({
  patientId
}: PatientConsultationsPageWrapperProps) {
  return (
    <LazyComponentLoader>
      <PatientConsultationsPageLazy patientId={patientId} />
    </LazyComponentLoader>
  );
}
