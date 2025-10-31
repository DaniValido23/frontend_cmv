import LazyComponentLoader from "@/components/common/LazyComponentLoader";
import { AnalyticsPageLazy } from "../lazy";

export default function AnalyticsPageWrapper() {
  return (
    <LazyComponentLoader>
      <AnalyticsPageLazy />
    </LazyComponentLoader>
  );
}
