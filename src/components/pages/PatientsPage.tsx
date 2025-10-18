import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import PatientsTable from "@/components/features/patients/PatientsTable";

export default function PatientsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <PatientsTable />
    </QueryClientProvider>
  );
}
