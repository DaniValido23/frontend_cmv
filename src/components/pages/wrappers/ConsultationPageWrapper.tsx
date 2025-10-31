import LazyComponentLoader from "@/components/common/LazyComponentLoader";
import { ConsultationPageLazy } from "../lazy";

export default function ConsultationPageWrapper() {
  return (
    <LazyComponentLoader>
      <ConsultationPageLazy />
    </LazyComponentLoader>
  );
}
