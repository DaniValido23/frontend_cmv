import { useCallback } from 'react';

/**
 * Hook para navegación programática con View Transitions de Astro
 *
 * Reemplaza el uso de window.location.href para:
 * - Mantener transiciones suaves entre páginas
 * - Preservar el cache de React Query
 * - Evitar recargas completas del navegador
 *
 * @example
 * const navigate = useNavigate();
 *
 * // Navegación simple
 * navigate('/patients');
 *
 * // Con parámetros de query
 * navigate('/consultations/new?patient_id=123');
 *
 * // Desde un evento
 * <Button onClick={() => navigate('/dashboard')}>Ir al Dashboard</Button>
 */
export function useNavigate() {
  return useCallback((href: string) => {
    // Verificar que estamos en el cliente
    if (typeof window === 'undefined') {
      console.warn('useNavigate: called on server side, skipping navigation');
      return;
    }

    // Usar la API de Astro View Transitions si está disponible
    // @ts-ignore - astro:transitions/client se inyecta en build time
    if (window.astroNavigate) {
      // @ts-ignore
      window.astroNavigate(href);
    } else {
      // Fallback: disparar un click en un link temporal
      // Esto permite que Astro intercepte la navegación
      const link = document.createElement('a');
      link.href = href;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);
}

/**
 * Función standalone para navegación (útil en callbacks, stores, etc.)
 * No requiere estar en un componente React
 *
 * @example
 * // En un store de Zustand
 * logout: async () => {
 *   await api.post('/auth/logout');
 *   navigateTo('/login');
 * }
 */
export function navigateTo(href: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Intentar usar navigate de Astro primero
  // @ts-ignore
  if (window.astroNavigate) {
    // @ts-ignore
    window.astroNavigate(href);
    return;
  }

  // Fallback: crear y hacer click en un link
  const link = document.createElement('a');
  link.href = href;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
