export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: APIError;
  metadata?: PaginationMetadata;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: "asc" | "desc";
}

export interface DateRangeParams {
  from?: string;
  to?: string;
}

export interface AnalyticsParams extends DateRangeParams {
  group_by?: "day" | "week" | "month" | "year";
  limit?: number;
}

export interface DashboardStats {
  patients_in_waiting_room: number;
  consultations_today: number;
  revenue_today?: number; // Solo para doctores
}
