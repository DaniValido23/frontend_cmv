import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import BalanceDashboard from "@/components/features/balance/dashboard/BalanceDashboard";

export default function BalanceDashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BalanceDashboard />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
