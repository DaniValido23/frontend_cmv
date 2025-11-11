/**
 * Google Calendar Integration Types
 * Types for Google Calendar OAuth and synchronization
 */

/**
 * Google Calendar integration status
 */
export interface GoogleCalendarStatus {
  connected: boolean;
  enabled?: boolean;
  calendar_id?: string;
  last_sync_at?: string;
  last_sync_error?: string;
  doctor_id: string;
}

/**
 * Google Calendar connect response
 */
export interface GoogleCalendarConnectResponse {
  authorization_url: string;
  state: string;
}

/**
 * Google Calendar disconnect request
 */
export interface GoogleCalendarDisconnectRequest {
  revoke_access?: boolean; // If true, revoke Google tokens; if false, just disable
}

/**
 * Google Calendar event data for creating/updating events
 */
export interface GoogleCalendarEventData {
  summary: string;
  description?: string;
  start_time: string; // ISO 8601 datetime
  end_time: string;   // ISO 8601 datetime
  location?: string;
}

/**
 * Calendar settings form data
 */
export interface CalendarSettingsFormData {
  enabled: boolean;
  auto_sync: boolean;
}
