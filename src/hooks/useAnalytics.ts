import { useEffect } from 'react';

export const useAnalytics = () => {
  useEffect(() => {
    const umamiUrl = import.meta.env.VITE_UMAMI_URL;
    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;

    if (!umamiUrl || !websiteId) return;

    const script = document.createElement('script');
    script.defer = true;
    script.src = umamiUrl;
    script.setAttribute('data-website-id', websiteId);
    
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);
};
