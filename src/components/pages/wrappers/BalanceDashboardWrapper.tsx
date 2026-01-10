import LazyComponentLoader from "@/components/common/LazyComponentLoader";
import { BalanceDashboardPageLazy } from "../lazy";

export default function BalanceDashboardWrapper() {
  return (
    <LazyComponentLoader>
      <BalanceDashboardPageLazy />
    </LazyComponentLoader>
  );
}
