import React, { useState } from 'react';
import { BiBus, BiCurrentLocation } from 'react-icons/bi';
import { useRutasStore } from '../../../store/rutasStore';
import { useMapStore } from '../../../store/mapStore';

export const NearbyRoutesCTA: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { fetchNearbyRoutes, nearbyRoutes, clearSelectedRoute } = useRutasStore();
  const { updateConfig } = useMapStore();

  const handleFindNearby = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      clearSelectedRoute(); // Clear any selected route first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateConfig({ center: { lat: latitude, lng: longitude }, zoom: 14 });
          fetchNearbyRoutes(latitude, longitude, 500).finally(() => setIsLoading(false));
        },
        (error) => {
          console.error('Location error:', error);
          setIsLoading(false);
          alert('No se pudo obtener tu ubicación. Verifica los permisos.');
        }
      );
    }
  };

  // Hide if already showing nearby routes
  if (nearbyRoutes.length > 0) return null;

  return (
    <button
      onClick={handleFindNearby}
      disabled={isLoading}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-secondary/95 hover:bg-secondary backdrop-blur-sm border border-primary/30 text-primary px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ zIndex: 50 }}
    >
      {isLoading ? (
        <>
          <BiCurrentLocation className="text-lg animate-spin" />
          <span className="text-sm font-medium">Buscando...</span>
        </>
      ) : (
        <>
          <BiBus className="text-lg" />
          <span className="text-sm font-medium">Buscar rutas cercanas</span>
        </>
      )}
    </button>
  );
};
