import React from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { BiPlus, BiMinus, BiFullscreen, BiExitFullscreen, BiCurrentLocation, BiX } from 'react-icons/bi';
import { MdDirectionsBus } from 'react-icons/md';
import { usePinStore } from '../../../store/pinStore';
import { useBottomSheet } from '../../../../hooks/useBottomSheet';
import { useMapStore } from '../../../store/mapStore';

export const MapControls: React.FC = () => {
  const { current: map } = useMap();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isLocating, setIsLocating] = React.useState(false);
  const { pin, clearPin } = usePinStore();
  const { openNearbyRoutes } = useBottomSheet();
  const { updateConfig, config } = useMapStore();

  const zoomIn = () => {
    if (map) map.zoomIn();
  };

  const zoomOut = () => {
    if (map) map.zoomOut();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Centrar en ubicación del usuario
  const centerOnUserLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      console.log('🎯 Location button clicked - requesting position...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('✅ Location received:', { lat: latitude, lng: longitude });
          updateConfig({ 
            ...config, 
            center: { lat: latitude, lng: longitude }, 
            zoom: 15
          });
          setIsLocating(false);
        },
        (error) => {
          console.error('❌ Location error:', error);
          alert('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
          setIsLocating(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 30000
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  };

  // Buscar rutas cercanas
  const handleNearbyRoutes = () => {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] 🚌 Nearby routes button clicked`);
    
    if (navigator.geolocation) {
      console.log(`[${new Date().toISOString()}] 📡 Requesting geolocation...`);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoTime = Date.now();
          const { latitude, longitude } = position.coords;
          console.log(`[${new Date().toISOString()}] ✅ Location received (took ${geoTime - startTime}ms):`, { lat: latitude, lng: longitude });
          
          console.log(`[${new Date().toISOString()}] 🗺️ Updating map center...`);
          updateConfig({ 
            ...config, 
            center: { lat: latitude, lng: longitude }, 
            zoom: 14
          });
          const mapTime = Date.now();
          console.log(`[${new Date().toISOString()}] ✅ Map updated (took ${mapTime - geoTime}ms)`);
          
          console.log(`[${new Date().toISOString()}] 🔍 Fetching nearby routes (radius: 0.5km)...`);
          openNearbyRoutes(latitude, longitude, 0.5);
          const totalTime = Date.now();
          console.log(`[${new Date().toISOString()}] ⏱️ Total time: ${totalTime - startTime}ms`);
        },
        (error) => {
          console.error(`[${new Date().toISOString()}] ❌ Location error (took ${Date.now() - startTime}ms):`, error);
          alert('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 30000
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  };

  return (
    <div className="absolute top-20 right-[5%] sm:top-4 sm:right-4 z-10 flex flex-col gap-1 sm:gap-2">
      {/* Zoom Controls */}
      <div className="bg-primary shadow-lg rounded-lg overflow-hidden">
        <button
          onClick={zoomIn}
          className="block w-10 h-10 sm:w-10 sm:h-10 bg-primary hover:bg-primary/80 transition-colors border-b border-primary/20 touch-manipulation"
          title="Acercar"
        >
          <BiPlus className="text-secondary text-xl sm:text-xl mx-auto" />
        </button>
        <button
          onClick={zoomOut}
          className="block w-10 h-10 sm:w-10 sm:h-10 bg-primary hover:bg-primary/80 transition-colors touch-manipulation"
          title="Alejar"
        >
          <BiMinus className="text-secondary text-xl sm:text-xl mx-auto" />
        </button>
      </div>

      {/* Fullscreen Control */}
      <button
        onClick={toggleFullscreen}
        className="w-10 h-10 sm:w-10 sm:h-10 bg-primary shadow-lg rounded-lg hover:bg-primary/80 transition-colors touch-manipulation"
        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      >
        {isFullscreen ? (
          <BiExitFullscreen className="text-secondary text-xl sm:text-xl mx-auto" />
        ) : (
          <BiFullscreen className="text-secondary text-xl sm:text-xl mx-auto" />
        )}
      </button>

      {/* Nearby Routes Button */}
      <button
        onClick={handleNearbyRoutes}
        className="w-10 h-10 sm:w-10 sm:h-10 bg-primary shadow-lg rounded-lg hover:bg-primary/80 transition-colors touch-manipulation"
        title="Rutas cercanas"
      >
        <MdDirectionsBus className="text-secondary text-xl sm:text-xl mx-auto" />
      </button>

      {/* My Location Button */}
      <button
        onClick={centerOnUserLocation}
        disabled={isLocating}
        className="w-10 h-10 sm:w-10 sm:h-10 bg-primary shadow-lg rounded-lg hover:bg-primary/80 transition-colors touch-manipulation disabled:opacity-50"
        title="Centrar en mi ubicación"
      >
        <BiCurrentLocation className={`text-secondary text-xl sm:text-xl mx-auto ${isLocating ? 'animate-pulse' : ''}`} />
      </button>

      {/* Clear Pin Button */}
      {pin && (
        <button
          onClick={clearPin}
          className="w-10 h-10 sm:w-10 sm:h-10 bg-primary shadow-lg rounded-lg hover:bg-primary/80 transition-colors touch-manipulation border-2 border-red-500/50"
          title="Quitar pin"
        >
          <BiX className="text-red-500 text-2xl sm:text-2xl mx-auto" />
        </button>
      )}
    </div>
  );
};
