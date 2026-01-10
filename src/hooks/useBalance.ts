import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  BalanceDashboard,
  MonthlyBalance,
  MonthlyComparison,
  StudyCategoryBreakdown,
  ComparisonParams,
  IncomeTrendsResponse,
  IncomeTrendPoint,
  IncomeTrendGroupBy,
  FixedExpensesByCategory,
} from '@/types/balance';
import { toast } from 'sonner';
import { handleError } from '@/lib/errorHandler';

// Type for date range parameters
export interface DateRangeParams {
  from?: string;  // YYYY-MM-DD format
  to?: string;    // YYYY-MM-DD format
}

/**
 * Hook for balance dashboard data
 * Supports both single month and date range queries
 * @param params - Either a month string (YYYY-MM) or { from, to } date range
 */
export function useBalanceDashboard(params?: string | DateRangeParams) {
  // Determine if we're using month or date range
  const isDateRange = params && typeof params === 'object' && 'from' in params;
  const queryParams = isDateRange
    ? { from: params.from, to: params.to }
    : params ? { month: params } : {};

  return useQuery({
    queryKey: ['balance', 'dashboard', queryParams],
    queryFn: async () => {
      const response = await api.get<{ data: BalanceDashboard }>('/financial/dashboard', {
        params: queryParams,
      });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

/**
 * Hook for monthly balance data
 * Supports both single month and date range queries
 * @param params - Either a month string (YYYY-MM) or { from, to } date range
 */
export function useMonthlyBalance(params: string | DateRangeParams) {
  // Determine if we're using month or date range
  const isDateRange = params && typeof params === 'object' && 'from' in params;
  const queryParams = isDateRange
    ? { from: params.from, to: params.to }
    : { month: params };

  const isEnabled = isDateRange
    ? !!(params.from && params.to)
    : !!params;

  return useQuery({
    queryKey: ['balance', 'monthly', queryParams],
    queryFn: async () => {
      const response = await api.get<{ data: MonthlyBalance }>('/financial/monthly', {
        params: queryParams,
      });
      return response.data.data;
    },
    enabled: isEnabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for fetching balance comparison data
 * @param params - Optional parameters for date range and grouping
 *   - from: Start date in YYYY-MM format (omit for full history)
 *   - to: End date in YYYY-MM format (defaults to current month)
 *   - group_by: 'month' or 'year' (auto-selects based on range if omitted)
 *
 * If no params provided, returns full history grouped by year (default)
 */
export function useBalanceComparison(params?: ComparisonParams) {
  return useQuery({
    queryKey: ['balance', 'comparison', params],
    queryFn: async () => {
      const response = await api.get<{ data: MonthlyComparison }>('/financial/comparison', {
        params: params || {},  // Empty params = full history
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Legacy hook for backwards compatibility
 * @deprecated Use useBalanceComparison(params) instead
 */
export function useBalanceComparisonLegacy(months: number = 6) {
  return useQuery({
    queryKey: ['balance', 'comparison-legacy', months],
    queryFn: async () => {
      const response = await api.get<{ data: MonthlyComparison }>('/financial/comparison', {
        params: { months },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudyCategoryBreakdown(month: string) {
  return useQuery({
    queryKey: ['balance', 'by-category', month],
    queryFn: async () => {
      const response = await api.get<{ data: StudyCategoryBreakdown }>('/financial/by-category', {
        params: { month },
      });
      return response.data.data;
    },
    enabled: !!month,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecalculateBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/financial/recalculate');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Balance recalculado exitosamente');
    },
    onError: (error: unknown) => handleError(error, 'Error al recalcular balance'),
  });
}

// Utility hook to get the current month in YYYY-MM format
export function useCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

// Utility function to navigate months
export function getAdjacentMonth(month: string, direction: 'prev' | 'next'): string {
  const [year, monthNum] = month.split('-').map(Number);
  const date = new Date(year, monthNum - 1 + (direction === 'next' ? 1 : -1), 1);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

// Format month for display
export function formatMonthDisplay(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const date = new Date(year, monthNum - 1, 1);
  return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}

// =============================================
// INCOME TRENDS
// =============================================

/**
 * Hook for combined income trends (SICAR + Consultations + Studies)
 * @param groupBy - Grouping: day, week, or month
 * @param params - Date range parameters { from, to } in YYYY-MM-DD format
 */
export function useIncomeTrends(
  groupBy: IncomeTrendGroupBy = 'day',
  params?: DateRangeParams
) {
  return useQuery({
    queryKey: ['balance', 'income-trends', groupBy, params],
    queryFn: async () => {
      const response = await api.get<{ data: IncomeTrendsResponse }>(
        '/financial/income-trends',
        { params: { group_by: groupBy, ...params } }
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Helper to get the trend data array based on groupBy
 */
export function getIncomeTrendData(trends: IncomeTrendsResponse | undefined): IncomeTrendPoint[] {
  if (!trends) return [];
  switch (trends.group_by) {
    case 'day':
      return trends.daily || [];
    case 'week':
      return trends.weekly || [];
    case 'month':
      return trends.monthly || [];
    default:
      return [];
  }
}

/**
 * Helper to format trend point label based on groupBy
 */
export function getIncomeTrendLabel(
  point: IncomeTrendPoint,
  groupBy: IncomeTrendGroupBy
): string {
  switch (groupBy) {
    case 'day':
      if (!point.date) return '';
      const date = new Date(point.date);
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    case 'week':
      if (!point.week_start) return '';
      const weekDate = new Date(point.week_start);
      return `Sem ${weekDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;
    case 'month':
      return point.month_label || '';
    default:
      return '';
  }
}

// =============================================
// FIXED EXPENSES BY CATEGORY
// =============================================

/**
 * Hook for fixed expenses grouped by category
 * @param month - Month in YYYY-MM format
 */
export function useFixedExpensesByCategory(month: string) {
  return useQuery({
    queryKey: ['fixed-expenses', 'by-category', month],
    queryFn: async () => {
      const response = await api.get<{ data: FixedExpensesByCategory }>(
        '/fixed-expenses/by-category',
        { params: { month } }
      );
      return response.data.data;
    },
    enabled: !!month,
    staleTime: 2 * 60 * 1000,
  });
}
