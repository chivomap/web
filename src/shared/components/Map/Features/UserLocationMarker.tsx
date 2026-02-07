import React, { useEffect, useState } from 'react';
import { Marker } from 'react-map-gl/maplibre';

export const UserLocationMarker: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    console.log('🌐 App loaded - checking geolocation permissions...');
    // Solo iniciar watch si el usuario ya dio permisos
    if (navigator.geolocation && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log('🔐 Geolocation permission status:', result.state);
        if (result.state === 'granted') {
          console.log('✅ Permission granted - starting location watch...');
          // Ya tiene permisos, iniciar watch
          const id = navigator.geolocation.watchPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              console.log('📍 User location updated:', location);
              setUserLocation(location);
            },
            (error) => {
              console.error('❌ Location watch error:', error);
            },
            {
              enableHighAccuracy: false,
              maximumAge: 30000,
              timeout: 10000
            }
          );
          setWatchId(id);
        } else {
          console.log('⚠️ No geolocation permission - user marker will not show until permission granted');
        }
      });
    } else {
      console.log('❌ Geolocation or Permissions API not supported');
    }

    return () => {
      if (watchId !== null) {
        console.log('🛑 Stopping location watch');
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  if (!userLocation) return null;

  return (
    <Marker
      longitude={userLocation.lng}
      latitude={userLocation.lat}
      anchor="center"
    >
      <div className="relative">
        {/* Pulso exterior */}
        <div className="absolute inset-0 -m-3">
          <div className="w-12 h-12 bg-purple-500/30 rounded-full animate-ping" />
        </div>
        
        {/* Círculo exterior */}
        <div className="relative w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
          {/* Punto central */}
          <div className="w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg" />
        </div>
      </div>
    </Marker>
  );
};
