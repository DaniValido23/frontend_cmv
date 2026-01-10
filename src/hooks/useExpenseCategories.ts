import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ExpenseCategory, CreateExpenseCategoryRequest, UpdateExpenseCategoryRequest } from '@/types/balance';
import { toast } from 'sonner';
import { handleError } from '@/lib/errorHandler';

export function useExpenseCategories(type?: 'fixed' | 'operational') {
  return useQuery({
    queryKey: ['expense-categories', type],
    queryFn: async () => {
      const response = await api.get<{ data: { categories: ExpenseCategory[] } }>('/expense-categories', {
        params: type ? { type } : {},
      });
      return response.data.data.categories;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFixedExpenseCategories() {
  return useExpenseCategories('fixed');
}

export function useOperationalExpenseCategories() {
  return useExpenseCategories('operational');
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseCategoryRequest) => {
      const response = await api.post<{ data: ExpenseCategory }>('/expense-categories', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Categoría de gasto creada exitosamente');
    },
    onError: (error: unknown) => handleError(error, 'Error al crear categoría'),
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateExpenseCategoryRequest }) => {
      const response = await api.put<{ data: ExpenseCategory }>(`/expense-categories/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Categoría actualizada');
    },
    onError: (error: unknown) => handleError(error, 'Error al actualizar categoría'),
  });
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/expense-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Categoría eliminada');
    },
    onError: (error: unknown) => handleError(error, 'Error al eliminar categoría'),
  });
}
