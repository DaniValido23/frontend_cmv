import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  FixedExpense,
  FixedExpensesResponse,
  CreateFixedExpenseRequest,
  UpdateFixedExpenseRequest,
  MarkPaidRequest,
} from '@/types/balance';
import { toast } from 'sonner';
import { handleError } from '@/lib/errorHandler';

export function useFixedExpenses(month?: string) {
  return useQuery({
    queryKey: ['fixed-expenses', month],
    queryFn: async () => {
      const response = await api.get<{ data: FixedExpensesResponse }>('/fixed-expenses', {
        params: month ? { month } : {},
      });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useFixedExpense(id: string) {
  return useQuery({
    queryKey: ['fixed-expenses', 'detail', id],
    queryFn: async () => {
      const response = await api.get<{ data: FixedExpense }>(`/fixed-expenses/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateFixedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFixedExpenseRequest) => {
      const response = await api.post<{ data: FixedExpense }>('/fixed-expenses', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Gasto fijo registrado exitosamente');
    },
    onError: (error: unknown) => handleError(error, 'Error al registrar gasto fijo'),
  });
}

export function useUpdateFixedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFixedExpenseRequest }) => {
      const response = await api.put<{ data: FixedExpense }>(`/fixed-expenses/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Gasto fijo actualizado');
    },
    onError: (error: unknown) => handleError(error, 'Error al actualizar gasto fijo'),
  });
}

export function useDeleteFixedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/fixed-expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Gasto fijo eliminado');
    },
    onError: (error: unknown) => handleError(error, 'Error al eliminar gasto fijo'),
  });
}

export function useMarkFixedExpensePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MarkPaidRequest }) => {
      const response = await api.patch<{ data: FixedExpense }>(`/fixed-expenses/${id}/paid`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success(variables.data.is_paid ? 'Gasto marcado como pagado' : 'Gasto marcado como pendiente');
    },
    onError: (error: unknown) => handleError(error, 'Error al actualizar estado de pago'),
  });
}
