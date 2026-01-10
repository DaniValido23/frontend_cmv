import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  SicarExpensesResponse,
  ClassifyExpenseRequest,
  BulkClassifyRequest,
  ExcludeExpenseRequest,
  SicarExpense,
} from '@/types/balance';
import { toast } from 'sonner';
import { handleError } from '@/lib/errorHandler';

interface SicarExpensesParams {
  classified?: boolean;
  excluded?: boolean;
  page?: number;
  page_size?: number;
  from?: string;
  to?: string;
}

interface SicarExpensesSummary {
  total_unclassified: number;
  total_excluded: number;
  total_amount_unclassified: number;
}

export function useSicarExpenses(params?: SicarExpensesParams) {
  return useQuery({
    queryKey: ['sicar-expenses', params],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: {
          expenses: SicarExpense[];
          total: number;
          page: number;
          page_size: number;
        };
      }>('/sicar/expenses', { params });
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}

// Hook separado para el resumen de gastos (endpoint separado en el backend)
export function useSicarExpensesSummary() {
  return useQuery({
    queryKey: ['sicar-expenses', 'summary'],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: SicarExpensesSummary;
      }>('/sicar/expenses/summary');
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useUnclassifiedExpenses(page: number = 1) {
  return useSicarExpenses({ classified: false, excluded: false, page });
}

export function useClassifyExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClassifyExpenseRequest }) => {
      const response = await api.patch<{ data: SicarExpense }>(`/sicar/expenses/${id}/classify`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sicar-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Gasto clasificado');
    },
    onError: (error: unknown) => handleError(error, 'Error al clasificar gasto'),
  });
}

export function useBulkClassifyExpenses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkClassifyRequest) => {
      const response = await api.post('/sicar/expenses/bulk-classify', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sicar-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success(`${variables.expense_ids.length} gastos clasificados`);
    },
    onError: (error: unknown) => handleError(error, 'Error al clasificar gastos'),
  });
}

export function useExcludeExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExcludeExpenseRequest }) => {
      const response = await api.patch<{ data: SicarExpense }>(`/sicar/expenses/${id}/exclude`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sicar-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success(variables.data.is_excluded ? 'Gasto excluido del balance' : 'Gasto incluido en el balance');
    },
    onError: (error: unknown) => handleError(error, 'Error al excluir gasto'),
  });
}
