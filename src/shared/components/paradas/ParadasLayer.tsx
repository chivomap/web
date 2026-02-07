import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { useParadasStore } from '../../store/paradasStore';

export const ParadasLayer: React.FC = () => {
  const { nearbyParadas, showParadasOnMap, setSelectedParada } = useParadasStore();

  if (!showParadasOnMap || nearbyParadas.length === 0) return null;

  return (
    <>
      {nearbyParadas.map((parada) => (
        <Marker
          key={parada.fid}
          longitude={parada.longitud}
          latitude={parada.latitud}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelectedParada(parada);
          }}
        >
          <div className="relative group cursor-pointer">
            {/* Parada marker */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-lg transition-transform group-hover:scale-110"
            >
              {/* Circle background */}
              <circle cx="12" cy="12" r="10" fill="#3b82f6" opacity="0.9" />
              <circle cx="12" cy="12" r="8" fill="white" />
              
              {/* Bus stop icon */}
              <rect x="8" y="7" width="8" height="10" rx="1" fill="#3b82f6" />
              <rect x="9" y="9" width="2" height="2" fill="white" />
              <rect x="13" y="9" width="2" height="2" fill="white" />
              <rect x="9" y="13" width="6" height="2" fill="white" />
            </svg>
            
            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-blue-600 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Parada
            </div>
          </div>
        </Marker>
      ))}
    </>
  );
};
