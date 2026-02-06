import React, { useState } from 'react';
import { BiBus, BiCurrentLocation } from 'react-icons/bi';
import { useRutasStore } from '../../../store/rutasStore';
import { useMapStore } from '../../../store/mapStore';

export const NearbyRoutesCTA: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { fetchNearbyRoutes, nearbyRoutes } = useRutasStore();
  const { updateConfig } = useMapStore();

  const handleFindNearby = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
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
      className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ zIndex: 50 }}
    >
      {isLoading ? (
        <>
          <BiCurrentLocation className="text-xl animate-spin" />
          <span className="font-medium">Buscando...</span>
        </>
      ) : (
        <>
          <BiBus className="text-xl" />
          <span className="font-medium">Rutas cercanas</span>
        </>
      )}
    </button>
  );
};
