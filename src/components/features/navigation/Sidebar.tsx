import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { isDoctor, isChemist, isAssistant } from "@/lib/auth";
import { APP_CONFIG } from "@/config/app";
import clsx from "clsx";
import {
  Home,
  Users,
  Clock,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Moon,
  Sun,
  Stethoscope,
  UserCog,
  FlaskConical,
  BarChart3,
  Calendar,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: ('doctor' | 'assistant' | 'chemist')[]; // Roles permitidos para acceder
}

const navItems: NavItem[] = [
  { name: "Sala de Espera", href: "/waiting-room", icon: Clock, roles: ['doctor', 'assistant'] },
  { name: "Pre-Consulta", href: "/pre-consultation", icon: ClipboardList, roles: ['doctor', 'assistant'] },
  { name: "Consulta", href: "/consultation", icon: FileText, roles: ['doctor'] },
  { name: "Calendario", href: "/calendar", icon: Calendar, roles: ['doctor'] },
  { name: "Pacientes", href: "/patients", icon: Users, roles: ['doctor', 'chemist', 'assistant'] },
  { name: "Estadísticas", href: "/analytics", icon: BarChart3, roles: ['doctor'] },
  { name: "Usuarios", href: "/users", icon: User, roles: ['doctor'] },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // Start closed on mobile to avoid hydration issues
  const [currentPath, setCurrentPath] = useState('');
  const [isClient, setIsClient] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Initialize client-side state after hydration
  useEffect(() => {
    setIsClient(true);
    setCurrentPath(window.location.pathname);
    // On desktop, open sidebar by default
    if (window.innerWidth >= 1024) {
      setIsOpen(true);
    }
  }, []);

  // Actualizar el path cuando hay una transición de página
  useEffect(() => {
    if (!isClient) return;

    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };

    // Escuchar eventos de navegación de Astro
    document.addEventListener('astro:page-load', updatePath);

    return () => {
      document.removeEventListener('astro:page-load', updatePath);
    };
  }, [isClient]);

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true; // Si no tiene restricciones de rol, mostrar
    if (!user) return false;
    return item.roles.includes(user.role); // Mostrar solo si el rol del usuario está en la lista
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-30",
          "w-64 bg-background border-r border-border",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h2 className="text-base font-semibold text-foreground tracking-tight text-center mb-4">
              {APP_CONFIG.name}
            </h2>
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  {user.role === 'doctor' ? (
                    <Stethoscope className="h-5 w-5 text-primary" />
                  ) : user.role === 'chemist' ? (
                    <FlaskConical className="h-5 w-5 text-primary" />
                  ) : (
                    <UserCog className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.first_name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {filteredItems.map((item) => {
              const isActive = currentPath === item.href;

              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors relative",
                    "text-sm font-medium",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                  )}
                  <Icon className={clsx("h-4 w-4", isActive && "text-primary")} />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>

          {/* Theme Toggle & Logout */}
          <div className="p-3 border-t border-border space-y-1">
            <button
              id="theme-toggle"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
              aria-label="Cambiar tema"
            >
              <Moon className="h-4 w-4" data-icon="moon" />
              <Sun className="h-4 w-4 hidden" data-icon="sun" />
              <span data-text="dark">Modo Oscuro</span>
              <span className="hidden" data-text="light">Modo Claro</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 lg:hidden z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </>
  );
}
