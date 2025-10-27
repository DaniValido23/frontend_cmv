import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { navigateTo } from "@/hooks/useNavigate";
import TotalStatsCards from "@/components/features/analytics/TotalStatsCards";
import ConsultationsChart from "@/components/features/analytics/ConsultationsChart";
import RevenueChart from "@/components/features/analytics/RevenueChart";
import WeightEvolutionChart from "@/components/features/analytics/WeightEvolutionChart";
import TopPatientsChart from "@/components/features/analytics/TopPatientsChart";

export default function AnalyticsPage() {
  const { isAuthenticated, user, initAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();

    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigateTo("/login");
      return;
    }

    // Solo los doctores pueden acceder a esta página
    if (user?.role !== "doctor") {
      navigateTo("/waiting-room");
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || !isAuthenticated || user?.role !== "doctor") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        {/* Cards de totales */}
        <TotalStatsCards />

        {/* Primera fila: 2 gráficas lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConsultationsChart />
          <RevenueChart />
        </div>

        {/* Segunda fila: 2 gráficas lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeightEvolutionChart />
          <TopPatientsChart />
        </div>
      </div>
    </QueryClientProvider>
  );
}
