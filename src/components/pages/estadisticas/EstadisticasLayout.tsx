import { Activity, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  activeTab: "clinico" | "financiero";
  children: React.ReactNode;
  // Optional subtabs
  subTabs?: SubTab[];
  activeSubTab?: string;
  onSubTabChange?: (tabId: string) => void;
  // Optional header content (like period selector)
  headerContent?: React.ReactNode;
}

const tabs = [
  {
    id: "clinico",
    label: "Clinico",
    href: "/estadisticas/clinico",
    icon: Activity,
    description: "Analisis de consultas y evolucion de pacientes"
  },
  {
    id: "financiero",
    label: "Financiero",
    href: "/estadisticas/financiero",
    icon: Wallet,
    description: "Resumen financiero consolidado de consultas, estudios y farmacia"
  },
] as const;

export default function EstadisticasLayout({
  activeTab,
  children,
  subTabs,
  activeSubTab,
  onSubTabChange,
  headerContent
}: Props) {
  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Estadisticas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentTab?.description}
        </p>
      </div>

      {/* Main Tabs */}
      <nav className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <a
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </a>
          );
        })}
      </nav>

      {/* SubTabs Bar (if provided) */}
      {subTabs && subTabs.length > 0 && (
        <div className="flex items-center py-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-1">
            {subTabs.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => onSubTabChange?.(subTab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  activeSubTab === subTab.id
                    ? "bg-background text-foreground shadow-sm border"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                {subTab.icon}
                <span className="hidden sm:inline">{subTab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header Content (period selector, etc) */}
      {headerContent && (
        <div className="py-4">
          {headerContent}
        </div>
      )}

      {/* Main Content */}
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}
