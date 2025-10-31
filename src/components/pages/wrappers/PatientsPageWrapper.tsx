import LazyComponentLoader from "@/components/common/LazyComponentLoader";
import { PatientsPageLazy } from "../lazy";

export default function PatientsPageWrapper() {
  return (
    <LazyComponentLoader>
      <PatientsPageLazy />
    </LazyComponentLoader>
  );
}
