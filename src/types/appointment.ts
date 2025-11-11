/**
 * Appointment Types
 * Types for the appointment scheduling system
 */

// Appointment status types
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";

/**
 * Appointment entity
 */
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  consultation_id?: string;
  appointment_date: string; // ISO 8601 datetime
  duration_minutes: number;
  title: string;
  notes?: string;
  status: AppointmentStatus;
  google_event_id?: string;
  synced_at?: string;
  sync_error?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Appointment with patient and doctor details (matches backend AppointmentResponse)
 */
export interface AppointmentWithDetails extends Appointment {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone?: string;
    age?: number;
  };
  doctor: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
  };
  consultation?: {
    id: string;
    consultation_date: string;
  };
}

/**
 * Create appointment request
 */
export interface CreateAppointmentRequest {
  patient_id: string;
  doctor_id: string;
  appointment_date: string; // ISO 8601 datetime
  duration_minutes?: number; // Default: 30
  title: string;
  notes?: string;
  sync_to_google?: boolean; // Whether to sync to Google Calendar
}

/**
 * Update appointment request
 */
export interface UpdateAppointmentRequest {
  appointment_date?: string;
  duration_minutes?: number;
  title?: string;
  notes?: string;
  status?: AppointmentStatus;
}

/**
 * Cancel appointment request
 */
export interface CancelAppointmentRequest {
  reason: string;
}

/**
 * Appointment filter parameters
 */
export interface AppointmentFilterParams {
  patient_id?: string;
  doctor_id?: string;
  from_date?: string; // ISO 8601 date
  to_date?: string;   // ISO 8601 date
  status?: AppointmentStatus;
}

/**
 * Appointment list response with pagination
 */
export interface AppointmentListResponse {
  appointments: AppointmentWithDetails[];
  pagination: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

/**
 * Appointment for react-big-calendar
 * Extends the Event interface required by the calendar library
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: AppointmentWithDetails; // Full appointment data
  allDay?: boolean;
}

/**
 * Helper type for appointment form data
 */
export interface AppointmentFormData {
  patient_id: string;
  doctor_id: string;
  appointment_date: string; // For datetime-local input (YYYY-MM-DDTHH:mm)
  duration_minutes: number;
  title: string;
  notes?: string;
  sync_to_google: boolean;
}
