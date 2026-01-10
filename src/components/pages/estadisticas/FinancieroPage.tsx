import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { navigateTo } from "@/hooks/useNavigate";
import { BarChart3, Database, Settings } from "lucide-react";
import EstadisticasLayout from "./EstadisticasLayout";

// Components
import PeriodSelector, { getCurrentMonthPeriod, type Period } from "@/components/features/balance/PeriodSelector";

// Tab Components
import SicarBiTab from "@/components/features/balance/tabs/SicarBiTab";
import DataTab from "@/components/features/balance/tabs/DataTab";
import ConfigTab from "@/components/features/balance/tabs/ConfigTab";

const SUB_TABS = [
  { id: "bi", label: "BI", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "datos", label: "Datos", icon: <Database className="h-4 w-4" /> },
  { id: "config", label: "Config", icon: <Settings className="h-4 w-4" /> },
];

// Inner component that uses React Query hooks (must be inside QueryClientProvider)
function FinancieroDashboard() {
  const [activeSubTab, setActiveSubTab] = useState("bi");
  const [period, setPeriod] = useState<Period>(getCurrentMonthPeriod());

  // Header content with period selector
  const headerContent = (
    <PeriodSelector period={period} onChange={setPeriod} />
  );

  return (
    <EstadisticasLayout
      activeTab="financiero"
      subTabs={SUB_TABS}
      activeSubTab={activeSubTab}
      onSubTabChange={setActiveSubTab}
      headerContent={headerContent}
    >
        {/* Tab Content */}
        {activeSubTab === "bi" && (
          <SicarBiTab period={period} />
        )}

        {activeSubTab === "datos" && (
          <DataTab />
        )}

        {activeSubTab === "config" && (
          <ConfigTab />
        )}
    </EstadisticasLayout>
  );
}

// Main component - handles auth and provides QueryClient
export default function FinancieroPage() {
  const { isAuthenticated, user, initAuth } = useAuthStore();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    initAuth();
    setTimeout(() => {
      setIsAuthLoading(false);
    }, 100);
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      navigateTo("/login");
      return;
    }

    if (user?.role !== "doctor") {
      navigateTo("/waiting-room");
    }
  }, [isAuthLoading, isAuthenticated, user]);

  if (isAuthLoading || !isAuthenticated || user?.role !== "doctor") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <FinancieroDashboard />
    </QueryClientProvider>
  );
}
