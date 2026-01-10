import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SicarImport, SicarFileType, SicarImportResponse } from '@/types/balance';
import { toast } from 'sonner';
import { handleError } from '@/lib/errorHandler';

interface SicarImportsParams {
  page?: number;
  page_size?: number;
}

export function useSicarImports(params?: SicarImportsParams) {
  return useQuery({
    queryKey: ['sicar-imports', params],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: {
          imports: SicarImport[];
          total: number;
          page: number;
          page_size: number;
        };
      }>('/sicar/imports', { params });
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useSicarImport(id: string) {
  return useQuery({
    queryKey: ['sicar-imports', id],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: SicarImport }>(`/sicar/imports/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'processing' || data?.status === 'pending') {
        return 3000;
      }
      return false;
    },
  });
}

interface ImportSicarParams {
  file: File;
  file_type: SicarFileType;
}

export function useImportSicar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, file_type }: ImportSicarParams) => {
      const formData = new FormData();
      formData.append('file', file);

      // El backend tiene endpoints separados por tipo de archivo
      const endpoint = file_type === 'utilidad'
        ? '/sicar/import/utilidad'
        : '/sicar/import/movimientos';

      const response = await api.post<{ success: boolean; data: SicarImportResponse }>(
        endpoint,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sicar-imports'] });
      queryClient.invalidateQueries({ queryKey: ['sicar-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Archivo importado exitosamente');
    },
    onError: (error: unknown) => handleError(error, 'Error al importar archivo SICAR'),
  });
}

export function useDeleteSicarImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sicar/imports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sicar-imports'] });
      queryClient.invalidateQueries({ queryKey: ['sicar-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Importación eliminada');
    },
    onError: (error: unknown) => handleError(error, 'Error al eliminar importación'),
  });
}
