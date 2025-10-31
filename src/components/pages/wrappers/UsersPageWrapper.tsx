import LazyComponentLoader from "@/components/common/LazyComponentLoader";
import { UsersPageLazy } from "../lazy";

export default function UsersPageWrapper() {
  return (
    <LazyComponentLoader>
      <UsersPageLazy />
    </LazyComponentLoader>
  );
}
