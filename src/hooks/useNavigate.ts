import { useCallback } from 'react';

export function useNavigate() {
  return useCallback((href: string) => {
    if (typeof window === 'undefined') {
      if (import.meta.env.DEV) {
        console.warn('useNavigate: called on server side, skipping navigation');
      }
      return;
    }

    // Usar la API de Astro View Transitions si está disponible
    // @ts-ignore - astro:transitions/client se inyecta en build time
    if (window.astroNavigate) {
      // @ts-ignore
      window.astroNavigate(href);
    } else {

      const link = document.createElement('a');
      link.href = href;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);
}

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
