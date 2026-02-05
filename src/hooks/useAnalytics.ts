import { useEffect } from 'react';

export const useAnalytics = () => {
  useEffect(() => {
    const umamiUrl = import.meta.env.VITE_UMAMI_URL;
    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;

    console.log('Analytics config:', { umamiUrl, websiteId });

    if (!umamiUrl || !websiteId) {
      console.log('Analytics not configured');
      return;
    }

    // Verificar si ya existe el script
    const existingScript = document.querySelector(`script[data-website-id="${websiteId}"]`);
    if (existingScript) {
      console.log('Analytics script already loaded');
      return;
    }

    const script = document.createElement('script');
    script.defer = true;
    script.src = umamiUrl;
    script.setAttribute('data-website-id', websiteId);
    
    script.onload = () => console.log('Analytics script loaded successfully');
    script.onerror = () => console.error('Failed to load analytics script');
    
    document.head.appendChild(script);
    console.log('Analytics script added to head');

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
};
