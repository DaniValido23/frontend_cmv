// =============================================
// SICAR BI - Tipos para endpoints /sicar/bi/*
// =============================================

// =============================================
// Parámetros comunes
// =============================================

export interface DateRangeParams {
  from?: string;  // YYYY-MM-DD
  to?: string;    // YYYY-MM-DD
}

export type SicarBiTrendGroupBy = 'day' | 'week' | 'month';

// =============================================
// Dashboard Unificado - GET /sicar/bi/dashboard
// =============================================

export interface SicarBiTicketsSummary {
  total_tickets: number;
  total_ventas: number;
  total_costo: number;
  total_utilidad: number;
  ticket_promedio: number;
}

export interface SicarBiMovementsSummary {
  total_entradas: number;
  total_salidas: number;
  diferencia: number;
  count_unclassified: number;
}

export interface SicarBiPaymentMethod {
  payment_method: string;
  total_amount: number;
  count: number;
}

export interface SicarBiHourlyData {
  hour_of_day: number;
  ticket_count: number;
  total_sales: number;
  avg_ticket: number;
  total_profit: number;
}

export interface SicarBiWeekdayData {
  day_of_week: number;
  day_name: string;
  ticket_count: number;
  total_sales: number;
  avg_ticket: number;
  total_profit: number;
}

export interface SicarBiPendingActions {
  unclassified_expenses: number;
  unpaid_fixed_expenses: number;
}

export interface SicarBiTopMetrics {
  best_hour: number;
  best_day: string;
  avg_daily_sales: number;
  avg_daily_tickets: number;
}

export interface SicarBiDashboard {
  period: {
    from: string;
    to: string;
    days_count: number;
  };
  tickets: SicarBiTicketsSummary;
  movements: SicarBiMovementsSummary;
  payment_methods: SicarBiPaymentMethod[];
  hourly_analysis: SicarBiHourlyData[];
  weekday_analysis: SicarBiWeekdayData[];
  pending_actions: SicarBiPendingActions;
  top_metrics: SicarBiTopMetrics;
}

// =============================================
// Tendencias - GET /sicar/bi/trends
// =============================================

export interface SicarBiTrendPoint {
  // Campos que varían según group_by
  date?: string;          // Para group_by=day
  week_start?: string;    // Para group_by=week
  month_label?: string;   // Para group_by=month (ej: "Enero 2025")
  month?: string;         // Para group_by=month (ej: "2025-01")
  // Campos siempre presentes
  ticket_count: number;
  total_ventas: number;
  total_costo: number;
  total_utilidad: number;
  ticket_promedio: number;
}

export interface SicarBiTrendsSummary {
  total_ventas: number;
  total_tickets: number;
  total_utilidad: number;
  avg_ticket: number;
}

export interface SicarBiTrends {
  group_by: SicarBiTrendGroupBy;
  from: string;
  to: string;
  summary: SicarBiTrendsSummary;
  daily?: SicarBiTrendPoint[];
  weekly?: SicarBiTrendPoint[];
  monthly?: SicarBiTrendPoint[];
}

// =============================================
// Lista de Tickets - GET /sicar/bi/tickets
// =============================================

export interface SicarBiTicket {
  ticket_datetime: string;
  folio: string;
  cliente: string;
  caja: string;
  usuario: string;
  total_venta: number;
  total_costo: number;
  utilidad: number;
}

export interface SicarBiTicketsMeta {
  total: number;
  page: number;
  page_size: number;
  has_next?: boolean;
}

export interface SicarBiTicketsResponse {
  tickets: SicarBiTicket[];
  meta: SicarBiTicketsMeta;
}

export interface SicarBiTicketsParams extends DateRangeParams {
  page?: number;
  page_size?: number;
}

// =============================================
// Análisis por Hora - GET /sicar/bi/analysis/hourly
// =============================================

export interface SicarBiHourlyAnalysis {
  period?: {
    from: string;
    to: string;
  };
  hourly: SicarBiHourlyData[];
  peak_hour?: number;
  total_analyzed?: number;
}

// =============================================
// Análisis por Día - GET /sicar/bi/analysis/weekday
// =============================================

export interface SicarBiWeekdayAnalysis {
  period?: {
    from: string;
    to: string;
  };
  weekday: SicarBiWeekdayData[];
  peak_day?: string;
  total_analyzed?: number;
}

// =============================================
// Movimientos de Caja - GET /sicar/bi/movements
// =============================================

export type SicarBiMovementType = 'E' | 'S';  // Entrada / Salida

export interface SicarBiMovement {
  id?: string;
  movement_date?: string;
  movement_datetime?: string;
  movement_type: SicarBiMovementType;
  comment: string;
  payment_method: string;
  amount: number;
  is_classified: boolean;
  is_excluded?: boolean;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface SicarBiMovementsResponse {
  movements: SicarBiMovement[];
  total?: number;
  page?: number;
  page_size?: number;
  summary?: {
    total_entradas: number;
    total_salidas: number;
  };
}

export interface SicarBiMovementsParams extends DateRangeParams {
  type?: SicarBiMovementType;
  classified?: boolean;
  excluded?: boolean;
  page?: number;
  page_size?: number;
}

// =============================================
// Por Método de Pago - GET /sicar/bi/movements/by-payment-method
// =============================================

export interface SicarBiPaymentMethodDetail {
  payment_method: string;
  movement_type: SicarBiMovementType;
  count: number;
  total_amount: number;
}

export interface SicarBiPaymentMethodsResponse {
  period?: {
    from: string;
    to: string;
  };
  payment_methods: SicarBiPaymentMethodDetail[];
  totals?: {
    total_entradas: number;
    total_salidas: number;
    net: number;
  };
}

// =============================================
// Cash Flow Trends - GET /sicar/bi/cash-flow
// =============================================

export interface SicarCashFlowTrend {
  // Campos que varían según group_by
  date?: string;         // Para day
  week_start?: string;   // Para week
  month_label?: string;  // Para month (ej: "Enero 2025")
  month?: string;        // Para month (ej: "2025-01")
  // Campos siempre presentes
  total_entradas: number;
  total_salidas: number;
  count_entradas: number;
  count_salidas: number;
  diferencia: number;
}

export type SicarCashFlowGroupBy = 'day' | 'week' | 'month';

export interface SicarCashFlowTrendsResponse {
  group_by: SicarCashFlowGroupBy;
  from: string;
  to: string;
  daily?: SicarCashFlowTrend[];
  weekly?: SicarCashFlowTrend[];
  monthly?: SicarCashFlowTrend[];
  summary: SicarBiMovementsSummary;
}

// =============================================
// Combined Summary - GET /sicar/bi/combined-summary
// Resumen financiero combinado (SICAR + CMV)
// =============================================

export interface CombinedSummaryIncomeSicar {
  sales: number;
  profit: number;
  ticket_count: number;
}

export interface CombinedSummaryIncomeCmv {
  consultations: number;
  studies: number;
  consultation_count: number;
  study_count: number;
}

export interface CombinedSummaryIncome {
  sicar: CombinedSummaryIncomeSicar;
  cmv: CombinedSummaryIncomeCmv;
  total: number;
}

export interface CombinedSummaryExpenses {
  fixed: number;
  variable: number;
  total: number;
}

export interface CombinedSummaryProfit {
  gross: number;
  net: number;
  margin_percentage: number;
}

export interface CombinedSummary {
  period: {
    from: string;
    to: string;
  };
  income: CombinedSummaryIncome;
  expenses: CombinedSummaryExpenses;
  profit: CombinedSummaryProfit;
}

// =============================================
// Income Comparison - GET /sicar/bi/income-comparison
// Comparación de fuentes de ingreso
// =============================================

export interface IncomeSource {
  source: 'sicar' | 'consultations' | 'studies';
  label: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface IncomeComparison {
  period: {
    from: string;
    to: string;
  };
  sources: IncomeSource[];
  total: number;
}

// =============================================
// Monthly Expenses - GET /sicar/bi/monthly-expenses
// Gastos mensuales agrupados por categoría
// =============================================

export interface ExpenseCategory {
  category_id: string;
  category_name: string;
  color: string;
  total: number;
  percentage: number;
  count: number;
}

export interface MonthlyExpenses {
  period: {
    from: string;
    to: string;
  };
  categories: ExpenseCategory[];
  unclassified: {
    total: number;
    count: number;
  };
  total: number;
}

// =============================================
// Profit Analysis - GET /sicar/bi/profit-analysis
// Análisis de ganancias vs gastos
// =============================================

export interface ProfitBySource {
  source: 'sicar' | 'consultations' | 'studies';
  label: string;
  income: number;
  cost: number;
  profit: number;
  margin: number;
}

export interface ProfitAnalysisSummary {
  total_income: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
}

export interface ProfitAnalysis {
  period: {
    from: string;
    to: string;
  };
  summary: ProfitAnalysisSummary;
  by_source: ProfitBySource[];
  expenses_breakdown: {
    fixed: number;
    variable: number;
  };
}
