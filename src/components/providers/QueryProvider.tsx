import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * QueryProvider - Envuelve la aplicación con el QueryClientProvider
 * Usa la instancia global y singleton de queryClient para mantener
 * el caché consistente en toda la aplicación
 */
export default function QueryProvider({ children }: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
