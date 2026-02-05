import { useEffect } from 'react';
import { isDevelopment } from '../shared/config/env';

export const useAnalytics = () => {
  useEffect(() => {
    const umamiUrl = import.meta.env.VITE_UMAMI_URL;
    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;

    if (!umamiUrl || !websiteId) {
      return;
    }

    // Verificar si ya existe el script
    const existingScript = document.querySelector(`script[data-website-id="${websiteId}"]`);
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.async = true; // Cambiar a async para no bloquear
    script.src = umamiUrl;
    script.setAttribute('data-website-id', websiteId);
    
    // Silenciar errores en producción
    script.onerror = () => {
      if (isDevelopment) {
        console.warn('Analytics script failed to load - this is normal in development');
      }
    };
    
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
};
