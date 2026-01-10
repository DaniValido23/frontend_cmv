import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { BarChart3, Database, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

// Hooks
import { useBalanceDashboard } from "@/hooks/useBalance";

// Components
import PeriodSelector, { getCurrentMonthPeriod, type Period } from "../PeriodSelector";
import KPICards from "./KPICards";

// Tab Components
import SicarBiTab from "../tabs/SicarBiTab";
import DataTab from "../tabs/DataTab";
import ConfigTab from "../tabs/ConfigTab";

export default function BalanceDashboard() {
  const [activeTab, setActiveTab] = useState("bi");
  const [period, setPeriod] = useState<Period>(getCurrentMonthPeriod());

  // For now, use the month from period for data fetching
  const monthStr = period.start.slice(0, 7);
  const { data, isLoading, error } = useBalanceDashboard(monthStr);

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Error al cargar el balance. Por favor, intenta de nuevo.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Header with Period Selector */}
      <div className="mb-6">
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[100px] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : data?.kpis ? (
        <div className="mb-6">
          <KPICards kpis={data.kpis} />
        </div>
      ) : null}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="bi" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">BI</span>
          </TabsTrigger>
          <TabsTrigger value="datos" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Datos</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* BI Tab */}
        <TabsContent value="bi">
          <SicarBiTab period={period} />
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="datos">
          <DataTab pendingActions={data?.pending_actions} />
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config">
          <ConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
