import { useEffect, useState } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { navigateTo } from "@/hooks/useNavigate";
import { CalendarView } from "@/components/features/calendar/CalendarView";
import { GoogleCalendarSettings } from "@/components/features/calendar/GoogleCalendarSettings";
import { AppointmentModal } from "@/components/features/calendar/AppointmentModal";
import type { CalendarEvent } from "@/types/appointment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Calendar, Settings } from "lucide-react";

export default function CalendarPage() {
  const { isAuthenticated, initAuth, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | undefined>();

  useEffect(() => {
    initAuth();

    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigateTo("/login");
    }
  }, [isLoading, isAuthenticated]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsAppointmentModalOpen(true);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // Only allow doctors to create appointments by clicking on calendar
    if (user?.role === "doctor") {
      setInitialDate(slotInfo.start);
      setSelectedEvent(null);
      setIsAppointmentModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedEvent(null);
    setInitialDate(undefined);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Only doctors can access the calendar page
  if (user?.role !== "doctor") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Acceso Denegado</h1>
          <p className="text-muted-foreground">
            Solo los doctores pueden acceder al calendario de citas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-6 space-y-6">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4 mt-6">
            <CalendarView
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="max-w-2xl">
              <GoogleCalendarSettings />
            </div>
          </TabsContent>
        </Tabs>

        {/* Appointment Modal */}
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={handleCloseModal}
          initialDate={initialDate}
          appointment={selectedEvent?.resource}
        />
      </div>
    </QueryClientProvider>
  );
}
