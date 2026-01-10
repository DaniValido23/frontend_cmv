import LazyComponentLoader from "@/components/common/LazyComponentLoader";
import { FinancieroPageLazy } from "../lazy";

export default function FinancieroPageWrapper() {
  return (
    <LazyComponentLoader>
      <FinancieroPageLazy />
    </LazyComponentLoader>
  );
}
