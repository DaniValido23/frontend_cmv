import { QueryClient } from "@tanstack/react-query";

// Instancia GLOBAL y SINGLETON de QueryClient
// Esta instancia se comparte entre todas las páginas para mantener el caché consistente
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos - datos considerados frescos durante este tiempo
      refetchOnWindowFocus: false, // No refetch automático al cambiar de ventana
      retry: 1, // Reintentar una vez en caso de error
      gcTime: 1000 * 60 * 10, // 10 minutos - tiempo antes de eliminar datos del caché (antes era cacheTime)
    },
    mutations: {
      retry: 0, // No reintentar mutaciones fallidas automáticamente
    },
  },
});
