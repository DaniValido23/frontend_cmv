// =============================================
// CATEGORÍAS
// =============================================

export interface StudyCategory {
  id: string;
  doctor_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStudyCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateStudyCategoryRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ExpenseCategory {
  id: string;
  doctor_id: string;
  name: string;
  type: 'fixed' | 'operational';
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateExpenseCategoryRequest {
  name: string;
  type: 'fixed' | 'operational';
  description?: string;
}

export interface UpdateExpenseCategoryRequest {
  name?: string;
  type?: 'fixed' | 'operational';
  description?: string;
  is_active?: boolean;
}

// =============================================
// SICAR IMPORTS
// =============================================

// Solo 2 tipos soportados por el backend
export type SicarFileType = 'utilidad' | 'movimientos';
export type SicarImportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SicarImport {
  id: string;
  file_name: string;
  file_type: SicarFileType;
  period_start: string;
  period_end: string;
  status: SicarImportStatus;
  total_records: number;
  error_message?: string;
  imported_at: string;
}

// Respuesta de importación de utilidades
export interface SicarImportUtilityResponse {
  import: SicarImport;
  period_start: string;
  period_end: string;
  total_ventas: number;
  total_compra: number;
  total_utilidad: number;
  ticket_count: number;
  daily_sales_created: number;
}

// Respuesta de importación de movimientos
export interface SicarImportMovimientosResponse {
  import: SicarImport;
  expense_count: number;
}

// Tipo unión para ambas respuestas
export type SicarImportResponse = SicarImportUtilityResponse | SicarImportMovimientosResponse;

// =============================================
// SICAR EXPENSES (Movimientos de caja)
// =============================================

export interface SicarExpense {
  id: string;
  expense_date: string;
  expense_time?: string;
  description: string;
  amount: number;
  payment_method: string;
  is_classified: boolean;
  is_excluded: boolean;
  category?: ExpenseCategory;
  original_comment?: string;
}

// Nota: El summary viene de GET /sicar/expenses/summary (endpoint separado)
export interface SicarExpensesResponse {
  expenses: SicarExpense[];
  total: number;
  page: number;
  page_size: number;
}

export interface ClassifyExpenseRequest {
  category_id: string;
}

export interface BulkClassifyRequest {
  expense_ids: string[];
  category_id: string;
}

export interface ExcludeExpenseRequest {
  is_excluded: boolean;
}

// =============================================
// FIXED EXPENSES
// =============================================

export interface FixedExpense {
  id: string;
  category: ExpenseCategory;
  month: string;
  amount: number;
  notes?: string;
  paid_at?: string;
  is_paid: boolean;
  created_at: string;
}

export interface CreateFixedExpenseRequest {
  category_id: string;
  month: string;
  amount: number;
  notes?: string;
}

export interface UpdateFixedExpenseRequest {
  category_id?: string;
  amount?: number;
  notes?: string;
}

export interface MarkPaidRequest {
  is_paid: boolean;
  paid_at?: string;
}

export interface FixedExpensesResponse {
  expenses: FixedExpense[];
  summary: {
    total_amount: number;
    total_paid: number;
    total_pending: number;
  };
}

// =============================================
// BALANCE
// =============================================

// Cash flow breakdown by payment method (includes income and expenses)
export interface CashFlowBreakdown {
  efectivo: number;
  tarjeta: number;
  total: number;
  efectivo_ingresos: number;
  efectivo_gastos: number;
  tarjeta_ingresos: number;
  tarjeta_gastos: number;
}

// Detailed SICAR income info
export interface SicarIncomeDetails {
  gross_sales: number;
  total_cost: number;
  gross_profit: number;
  profit_margin: number;
  ticket_count: number;
  average_ticket: number;
}

export interface BalanceDashboard {
  current_month: string;
  kpis: {
    total_income: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
    vs_previous_month?: {
      income_change: number;
      expenses_change: number;
      profit_change: number;
    };
  };
  income_breakdown: {
    sicar: {
      amount: number;
      count?: number;
      percentage: number;
    };
    consultations: {
      amount: number;
      count: number;
      percentage: number;
    };
    studies: {
      amount: number;
      count: number;
      percentage: number;
    };
  };
  expense_breakdown: {
    fixed: {
      amount: number;
      percentage: number;
    };
    operational: {
      amount: number;
      percentage: number;
    };
  };
  cash_flow: CashFlowBreakdown;
  sicar_details: SicarIncomeDetails;
  pending_actions: {
    unclassified_expenses: number;
    unpaid_fixed_expenses: number;
  };
}

export interface MonthlyBalance {
  month: string;
  sicar: {
    gross_sales: number;
    net_sales: number;
    cost: number;
    gross_profit: number;
  };
  cmv: {
    consultations_income: number;
    consultations_count: number;
    studies_income: number;
    studies_count: number;
  };
  expenses: {
    fixed: number;
    operational: number;
    total: number;
    by_category: Array<{
      category: string;
      amount: number;
    }>;
  };
  totals: {
    total_income: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
  };
}

export interface MonthlyComparisonData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface YearlyComparisonData {
  year: number;
  income: number;
  expenses: number;
  profit: number;
}

export interface MonthlyComparison {
  group_by: 'month' | 'year';
  from: string;
  to: string;
  months?: MonthlyComparisonData[];
  years?: YearlyComparisonData[];
}

// Parameters for comparison endpoint
export interface ComparisonParams {
  from?: string;  // YYYY-MM format
  to?: string;    // YYYY-MM format
  group_by?: 'month' | 'year';
}

export interface StudyCategoryBreakdown {
  month: string;
  study_categories: Array<{
    category: string;
    count: number;
    income: number;
    percentage: number;
    average_price: number;
  }>;
}

// =============================================
// INCOME TRENDS
// =============================================

export interface IncomeTrendPoint {
  date?: string;
  week_start?: string;
  month_label?: string;
  sicar_sales: number;
  consultations: number;
  studies: number;
  total: number;
}

export interface IncomeTrendsSummary {
  total_sicar: number;
  total_consultations: number;
  total_studies: number;
  grand_total: number;
}

export type IncomeTrendGroupBy = 'day' | 'week' | 'month';

export interface IncomeTrendsResponse {
  group_by: IncomeTrendGroupBy;
  from: string;
  to: string;
  summary: IncomeTrendsSummary;
  daily?: IncomeTrendPoint[];
  weekly?: IncomeTrendPoint[];
  monthly?: IncomeTrendPoint[];
}

// =============================================
// FIXED EXPENSES BY CATEGORY
// =============================================

export interface FixedExpenseCategoryTotal {
  category_id: string;
  category_name: string;
  amount: number;
  is_paid: boolean;
  count: number;
}

export interface FixedExpensesByCategory {
  month: string;
  categories: FixedExpenseCategoryTotal[];
  summary: {
    total: number;
    paid: number;
    pending: number;
  };
}

// =============================================
// COMMON
// =============================================

export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}
