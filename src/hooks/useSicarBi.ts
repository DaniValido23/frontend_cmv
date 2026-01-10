import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  DateRangeParams,
  SicarBiDashboard,
  SicarBiTrends,
  SicarBiTrendGroupBy,
  SicarBiTicketsResponse,
  SicarBiTicketsParams,
  SicarBiHourlyAnalysis,
  SicarBiWeekdayAnalysis,
  SicarBiMovementsResponse,
  SicarBiMovementsParams,
  SicarBiPaymentMethodsResponse,
  SicarCashFlowTrendsResponse,
} from '@/types/sicarBi';

// =============================================
// 1. Dashboard Unificado SICAR BI
// GET /sicar/bi/dashboard
// =============================================

export function useSicarBiDashboard(params?: DateRangeParams) {
  return useQuery({
    queryKey: ['sicar-bi', 'dashboard', params],
    queryFn: async () => {
      const response = await api.get<{ data: SicarBiDashboard }>(
        '/sicar/bi/dashboard',
        { params }
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,  // 2 minutos
    refetchInterval: 5 * 60 * 1000,  // Auto-refresh cada 5 minutos
  });
}

// =============================================
// 2. Tendencias SICAR
// GET /sicar/bi/trends?group_by=day|week|month
// =============================================

export function useSicarBiTrends(
  groupBy: SicarBiTrendGroupBy = 'day',
  params?: DateRangeParams
) {
  return useQuery({
    queryKey: ['sicar-bi', 'trends', groupBy, params],
    queryFn: async () => {
      const response = await api.get<{ data: SicarBiTrends }>(
        '/sicar/bi/trends',
        { params: { group_by: groupBy, ...params } }
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// =============================================
// 3. Lista de Tickets
// GET /sicar/bi/tickets?from=&to=&page=&page_size=
// =============================================

export function useSicarBiTickets(params?: SicarBiTicketsParams) {
  return useQuery({
    queryKey: ['sicar-bi', 'tickets', params],
    queryFn: async () => {
      const response = await api.get<{ data: SicarBiTicketsResponse }>(
        '/sicar/bi/tickets',
        { params }
      );
      return response.data.data;
    },
    staleTime: 60 * 1000,  // 1 minuto (datos más volátiles)
  });
}

// =============================================
// 4. Análisis por Hora
// GET /sicar/bi/analysis/hourly?from=&to=
// =============================================

export function useSicarBiHourlyAnalysis(params?: DateRangeParams) {
  return useQuery({
    queryKey: ['sicar-bi', 'analysis', 'hourly', params],
    queryFn: async () => {
      const response = await api.get<{ data: SicarBiHourlyAnalysis }>(
        '/sicar/bi/analysis/hourly',
        { params }
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,  // 5 minutos (análisis histórico cambia menos)
  });
}

// =============================================
// 5. Análisis por Día de Semana
// GET /sicar/bi/analysis/weekday?from=&to=
// =============================================

export function useSicarBiWeekdayAnalysis(params?: DateRangeParams) {
  return useQuery({
    queryKey: ['sicar-bi', 'analysis', 'weekday', params],
    queryFn: async () => {
      const response = await api.get<{ data: SicarBiWeekdayAnalysis }>(
        '/sicar/bi/analysis/weekday',
        { params }
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================
// 6. Movimientos de Caja
// GET /sicar/bi/movements?from=&to=&type=E|S&classified=
// =============================================

export function useSicarBiMovements(params?: SicarBiMovementsParams) {
  return useQuery({
    queryKey: ['sicar-bi', 'movements', params],
    queryFn: async () => {
      const response = await api.get<{ data: SicarBiMovementsResponse }>(
        '/sicar/bi/movements',
        { params }
      );
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}

// =============================================
// 7. Desglose por Método de Pago
// GET /sicar/bi/movements/by-payment-method?from=&to=
// =============================================

export function useSicarBiPaymentMethods(params?: DateRangeParams) {
  return useQuery({
    queryKey: ['sicar-bi', 'payment-methods', params],
    queryFn: async () => {
      const response = await api.get<{ data: SicarBiPaymentMethodsResponse }>(
        '/sicar/bi/movements/by-payment-method',
        { params }
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// =============================================
// 8. Tendencias de Flujo de Caja
// GET /sicar/bi/cash-flow?from=&to=&group_by=
// =============================================

export function useSicarBiCashFlow(
  groupBy: SicarBiTrendGroupBy = 'day',
  params?: DateRangeParams
) {
  return useQuery({
    queryKey: ['sicar-bi', 'cash-flow', groupBy, params],
    queryFn: async () => {
      const response = await api.get<{ data: SicarCashFlowTrendsResponse }>(
        '/sicar/bi/cash-flow',
        { params: { group_by: groupBy, ...params } }
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Obtiene los datos de flujo de caja según el group_by seleccionado
 */
export function getCashFlowData(trends: SicarCashFlowTrendsResponse | undefined) {
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
 * Formatea la etiqueta del período de flujo de caja según el group_by
 */
export function getCashFlowLabel(
  point: { date?: string; week_start?: string; month_label?: string },
  groupBy: SicarBiTrendGroupBy
): string {
  switch (groupBy) {
    case 'day':
      if (!point.date) return '';
      const date = new Date(point.date);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    case 'week':
      if (!point.week_start) return '';
      const weekDate = new Date(point.week_start);
      if (isNaN(weekDate.getTime())) return '';
      return `Sem ${weekDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;
    case 'month':
      return point.month_label || '';
    default:
      return '';
  }
}

// =============================================
// Utilidades
// =============================================

/**
 * Obtiene los datos de tendencia según el group_by seleccionado
 */
export function getTrendData(trends: SicarBiTrends | undefined) {
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
 * Formatea la etiqueta del período según el group_by
 */
export function getTrendLabel(
  point: { date?: string; week_start?: string; month_label?: string },
  groupBy: SicarBiTrendGroupBy
): string {
  switch (groupBy) {
    case 'day':
      if (!point.date) return '';
      // Handle ISO 8601 dates from backend (e.g., "2025-01-07T00:00:00Z")
      const date = new Date(point.date);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    case 'week':
      if (!point.week_start) return '';
      const weekDate = new Date(point.week_start);
      if (isNaN(weekDate.getTime())) return '';
      return `Sem ${weekDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;
    case 'month':
      return point.month_label || '';
    default:
      return '';
  }
}
