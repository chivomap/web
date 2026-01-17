import React from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { BiPlus, BiMinus, BiFullscreen, BiExitFullscreen } from 'react-icons/bi';

export const MapControls: React.FC = () => {
  const { current: map } = useMap();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

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

  return (
    <div className="absolute top-20 right-[5%] sm:top-4 sm:right-4 z-10 flex flex-col gap-1 sm:gap-2">
      {/* Zoom Controls */}
      <div className="bg-primary shadow-lg rounded-lg overflow-hidden">
        <button
          onClick={zoomIn}
          className="block w-8 h-8 sm:w-10 sm:h-10 bg-primary hover:bg-primary/80 transition-colors border-b border-primary/20 touch-manipulation"
          title="Acercar"
        >
          <BiPlus className="text-secondary text-lg sm:text-xl mx-auto" />
        </button>
        <button
          onClick={zoomOut}
          className="block w-8 h-8 sm:w-10 sm:h-10 bg-primary hover:bg-primary/80 transition-colors touch-manipulation"
          title="Alejar"
        >
          <BiMinus className="text-secondary text-lg sm:text-xl mx-auto" />
        </button>
      </div>

      {/* Fullscreen Control */}
      <button
        onClick={toggleFullscreen}
        className="w-8 h-8 sm:w-10 sm:h-10 bg-primary shadow-lg rounded-lg hover:bg-primary/80 transition-colors touch-manipulation"
        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      >
        {isFullscreen ? (
          <BiExitFullscreen className="text-secondary text-lg sm:text-xl mx-auto" />
        ) : (
          <BiFullscreen className="text-secondary text-lg sm:text-xl mx-auto" />
        )}
      </button>
    </div>
  );
};
