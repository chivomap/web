import React from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { BiPlus, BiMinus, BiFullscreen, BiExitFullscreen, BiCurrentLocation, BiX } from 'react-icons/bi';
import { MdMyLocation, MdNearMe, MdContentCopy, MdDirectionsBus } from 'react-icons/md';
import { usePinStore } from '../../../store/pinStore';
import { useBottomSheet } from '../../../../hooks/useBottomSheet';
import { useMapStore } from '../../../store/mapStore';

export const MapControls: React.FC = () => {
  const { current: map } = useMap();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showLocationMenu, setShowLocationMenu] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
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

  // Obtener ubicación del usuario
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setShowLocationMenu(true);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  };

  // Buscar rutas cercanas directamente
  const handleNearbyRoutes = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Centrar mapa en ubicación con zoom apropiado para 1km
          updateConfig({ 
            ...config, 
            center: { lat: latitude, lng: longitude }, 
            zoom: 14 // Zoom apropiado para ver ~1km de radio
          });
          openNearbyRoutes(latitude, longitude, 0.5);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  };

  // Cerrar menú al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLocationMenu(false);
      }
    };
    
    if (showLocationMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLocationMenu]);

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
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            getUserLocation();
          }}
          className="w-10 h-10 sm:w-10 sm:h-10 bg-primary shadow-lg rounded-lg hover:bg-primary/80 transition-colors touch-manipulation"
          title="Mi ubicación"
        >
          <BiCurrentLocation className="text-secondary text-xl sm:text-xl mx-auto" />
        </button>

        {/* Location Menu */}
        {showLocationMenu && userLocation && (
          <div 
            className="absolute right-full mr-2 top-0 w-56 bg-primary/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-right-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 bg-secondary/20 border-b border-white/10">
              <p className="text-xs text-white/60">Mi ubicación</p>
              <p className="text-xs text-white/80 font-mono">
                {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
              </p>
            </div>
            
            <button
              onClick={() => {
                updateConfig({ ...config, center: userLocation, zoom: 15 });
                setShowLocationMenu(false);
              }}
              className="w-full px-3 py-2.5 text-left hover:bg-white/10 transition-colors text-sm flex items-center gap-3 text-white"
            >
              <MdMyLocation className="text-secondary text-lg" />
              <span>Ir a mi ubicación</span>
            </button>
            
            <button
              onClick={() => {
                openNearbyRoutes(userLocation.lat, userLocation.lng, 0.5);
                setShowLocationMenu(false);
              }}
              className="w-full px-3 py-2.5 text-left hover:bg-white/10 transition-colors text-sm flex items-center gap-3 text-white"
            >
              <MdNearMe className="text-secondary text-lg" />
              <span>Rutas cercanas</span>
            </button>
            
            <button
              onClick={() => {
                const coords = `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`;
                navigator.clipboard.writeText(coords);
                setShowLocationMenu(false);
              }}
              className="w-full px-3 py-2.5 text-left hover:bg-white/10 transition-colors text-sm flex items-center gap-3 text-white"
            >
              <MdContentCopy className="text-secondary text-lg" />
              <span>Copiar coordenadas</span>
            </button>
          </div>
        )}
      </div>

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
