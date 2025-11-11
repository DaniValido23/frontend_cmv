import * as React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/datepicker.css";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

// Registrar el locale español
registerLocale("es", es);

export interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  showTimeSelect?: boolean;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  dateFormat?: string;
  timeIntervals?: number;
}

const DateTimePicker = React.forwardRef<DatePicker, DateTimePickerProps>(
  (
    {
      value,
      onChange,
      label,
      error,
      placeholder = "Selecciona fecha y hora",
      showTimeSelect = true,
      minDate,
      maxDate,
      required = false,
      disabled = false,
      className,
      dateFormat = "dd/MM/yyyy HH:mm",
      timeIntervals = 15,
    },
    ref
  ) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <DatePicker
            ref={ref}
            selected={value}
            onChange={onChange}
            showTimeSelect={showTimeSelect}
            timeFormat="HH:mm"
            timeIntervals={timeIntervals}
            dateFormat={dateFormat}
            placeholderText={placeholder}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            required={required}
            timeCaption="Hora"
            locale="es"
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            calendarClassName="shadow-lg border border-border rounded-md"
            wrapperClassName="w-full"
            popperClassName="z-50"
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [0, 8],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker };
export default DateTimePicker;
