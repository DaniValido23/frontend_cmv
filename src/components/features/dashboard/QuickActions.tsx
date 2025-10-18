import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { isDoctor } from "@/lib/auth";
import { UserPlus, FileText, Clock, TrendingUp } from "lucide-react";
import type { LucideProps } from "lucide-react";

interface Action {
  title: string;
  description: string;
  icon: React.ComponentType<LucideProps>;
  href: string;
}

export default function QuickActions() {
  const user = useAuthStore((state) => state.user);
  const isDoctorUser = isDoctor(user);

  const actions: Action[] = [
    {
      title: "Nuevo Paciente",
      description: "Registrar un nuevo paciente en el sistema",
      icon: UserPlus,
      href: "/patients/new",
    },
    {
      title: "Nueva Consulta",
      description: "Iniciar una nueva consulta médica",
      icon: FileText,
      href: "/consultations/new",
    },
    {
      title: "Sala de Espera",
      description: "Ver pacientes en sala de espera",
      icon: Clock,
      href: "/waiting-room",
    },
  ];

  if (isDoctorUser) {
    actions.push({
      title: "Analytics",
      description: "Ver métricas y estadísticas",
      icon: TrendingUp,
      href: "/analytics",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.href}
                href={action.href}
                className="group relative overflow-hidden rounded-lg border bg-background p-5 transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10">
                    <Icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold leading-none tracking-tight">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
