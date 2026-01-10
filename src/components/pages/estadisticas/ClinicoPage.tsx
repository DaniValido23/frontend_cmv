import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { navigateTo } from "@/hooks/useNavigate";
import EstadisticasLayout from "./EstadisticasLayout";
import WeightEvolutionChart from "@/components/features/analytics/WeightEvolutionChart";
import TopPatientsChart from "@/components/features/analytics/TopPatientsChart";
import TopSymptomsChart from "@/components/features/analytics/TopSymptomsChart";
import TopDiagnosesChart from "@/components/features/analytics/TopDiagnosesChart";
import TopMedicationsChart from "@/components/features/analytics/TopMedicationsChart";
import GenderStatsChart from "@/components/features/analytics/GenderStatsChart";
import GlucoseHistoryChart from "@/components/features/analytics/GlucoseHistoryChart";
import BloodPressureHistoryChart from "@/components/features/analytics/BloodPressureHistoryChart";

export default function ClinicoPage() {
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
      <EstadisticasLayout activeTab="clinico">
        <div className="space-y-6">
          {/* Peso y pacientes frecuentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeightEvolutionChart />
            <TopPatientsChart />
          </div>

          {/* Síntomas y diagnósticos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopSymptomsChart />
            <TopDiagnosesChart />
          </div>

          {/* Medicamentos y género */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopMedicationsChart />
            <GenderStatsChart />
          </div>

          {/* Presión arterial y glucosa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BloodPressureHistoryChart />
            <GlucoseHistoryChart />
          </div>
        </div>
      </EstadisticasLayout>
    </QueryClientProvider>
  );
}
