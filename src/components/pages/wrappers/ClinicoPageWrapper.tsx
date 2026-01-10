import LazyComponentLoader from "@/components/common/LazyComponentLoader";
import { ClinicoPageLazy } from "../lazy";

export default function ClinicoPageWrapper() {
  return (
    <LazyComponentLoader>
      <ClinicoPageLazy />
    </LazyComponentLoader>
  );
}
