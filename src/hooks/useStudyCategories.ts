import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StudyCategory, CreateStudyCategoryRequest, UpdateStudyCategoryRequest } from '@/types/balance';
import { toast } from 'sonner';
import { handleError } from '@/lib/errorHandler';

export function useStudyCategories() {
  return useQuery({
    queryKey: ['study-categories'],
    queryFn: async () => {
      const response = await api.get<{ data: { categories: StudyCategory[] } }>('/study-categories');
      return response.data.data.categories;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudyCategory(id: string) {
  return useQuery({
    queryKey: ['study-categories', id],
    queryFn: async () => {
      const response = await api.get<{ data: StudyCategory }>(`/study-categories/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateStudyCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStudyCategoryRequest) => {
      const response = await api.post<{ data: StudyCategory }>('/study-categories', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-categories'] });
      toast.success('Categoría creada exitosamente');
    },
    onError: (error: unknown) => handleError(error, 'Error al crear categoría'),
  });
}

export function useUpdateStudyCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStudyCategoryRequest }) => {
      const response = await api.put<{ data: StudyCategory }>(`/study-categories/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-categories'] });
      toast.success('Categoría actualizada');
    },
    onError: (error: unknown) => handleError(error, 'Error al actualizar categoría'),
  });
}

export function useDeleteStudyCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/study-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-categories'] });
      toast.success('Categoría eliminada');
    },
    onError: (error: unknown) => handleError(error, 'Error al eliminar categoría'),
  });
}
