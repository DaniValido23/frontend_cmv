import { useState, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/calendar.css";
import { useAppointmentsByDateRange } from "@/hooks/useAppointments";
import { useAuthStore } from "@/stores/authStore";
import type { CalendarEvent, AppointmentWithDetails } from "@/types/appointment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { parseApiError } from "@/lib/errorHandler";
import { AxiosError } from "axios";

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: es }),
  getDay,
  locales,
});

// Spanish messages for the calendar
const messages = {
  allDay: "Todo el día",
  previous: "Anterior",
  next: "Siguiente",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Cita",
  noEventsInRange: "No hay citas en este rango de fechas",
  showMore: (total: number) => `+ Ver más (${total})`,
};

interface CalendarViewProps {
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

export function CalendarView({ onSelectEvent, onSelectSlot }: CalendarViewProps) {
  const user = useAuthStore((state) => state.user);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("month");

  // Calculate date range based on current view
  const dateRange = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    return {
      from: start.toISOString(), // RFC3339 format with timezone
      to: end.toISOString(),
    };
  }, [currentDate]);

  // Fetch appointments for the current date range
  const { data: appointmentsData, isLoading, error, isError } = useAppointmentsByDateRange(
    dateRange.from,
    dateRange.to,
    user?.role === "doctor" ? user.id : undefined
  );

  // Convert appointments to calendar events
  const events = useMemo((): CalendarEvent[] => {
    if (!appointmentsData?.appointments) {
      return [];
    }

    return appointmentsData.appointments.map((appointment: AppointmentWithDetails) => {
      const start = new Date(appointment.appointment_date);
      const end = new Date(start.getTime() + appointment.duration_minutes * 60000);

      return {
        id: appointment.id,
        title: appointment.title,
        start,
        end,
        resource: appointment,
        allDay: false,
      };
    });
  }, [appointmentsData]);

  // Event style getter - color code by date (past vs future)
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const now = new Date();
    const isPast = event.start < now;

    const backgroundColor = isPast ? "#9ca3af" : "#3b82f6"; // gray for past, blue for future
    const borderColor = isPast ? "#6b7280" : "#2563eb";

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: "2px",
        borderStyle: "solid",
        borderRadius: "4px",
        color: "white",
        fontSize: "0.875rem",
      },
    };
  }, []);

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => addMonths(prev, -1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date }) => {
      const now = new Date();

      // Don't allow selecting past dates
      if (slotInfo.start < now) {
        return;
      }

      // Call the parent's onSelectSlot if provided
      if (onSelectSlot) {
        onSelectSlot(slotInfo);
      }
    },
    [onSelectSlot]
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-4">
          {/* Top bar: Title and Date Navigation */}
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendario de Citas
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoy
              </Button>

              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <span className="ml-4 text-lg font-semibold min-w-[180px] text-center">
                {format(currentDate, "MMMM yyyy", { locale: es })}
              </span>
            </div>
          </div>

          {/* Bottom bar: View selector and Legend */}
          <div className="flex items-center justify-between">
            {/* View Selector */}
            <div className="flex gap-1">
              <Button
                variant={view === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewChange("month")}
              >
                Mes
              </Button>
              <Button
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewChange("week")}
              >
                Semana
              </Button>
              <Button
                variant={view === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewChange("day")}
              >
                Día
              </Button>
              <Button
                variant={view === "agenda" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewChange("agenda")}
              >
                Agenda
              </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-500">Próximas citas</Badge>
              <Badge className="bg-gray-400">Citas pasadas</Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error al cargar las citas</AlertTitle>
            <AlertDescription>
              {(() => {
                const apiError = parseApiError(error);
                return apiError.message || "No se pudieron cargar las citas. Por favor, intenta nuevamente.";
              })()}
            </AlertDescription>
            {error instanceof AxiosError && error.response && (
              <AlertDescription className="mt-2 text-xs opacity-75">
                Código: {error.response.status} |
                Detalles técnicos: {JSON.stringify(error.response.data?.error || error.response.data)}
              </AlertDescription>
            )}
          </Alert>
        ) : (
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              messages={messages}
              culture="es"
              view={view}
              onView={handleViewChange}
              onNavigate={handleNavigate}
              date={currentDate}
              onSelectEvent={onSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              views={["month", "week", "day", "agenda"]}
              step={30}
              showMultiDayTimes
              defaultDate={new Date()}
            />
          </div>
        )}

        {/* Summary */}
        {!isLoading && events.length > 0 && (
          <div className="mt-4 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-semibold">{events.length}</span>{" "}
              {events.length === 1 ? "cita" : "citas"} en{" "}
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
