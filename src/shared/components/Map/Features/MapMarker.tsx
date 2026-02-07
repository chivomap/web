import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { LngLat } from 'maplibre-gl';

interface MapMarkerProps {
  position: LngLat;
}

export const MapMarker: React.FC<MapMarkerProps> = ({ position }) => {
  return (
    <Marker
      longitude={position.lng}
      latitude={position.lat}
      anchor="bottom"
    >
      <img 
        src="/chivomap-pin.svg" 
        alt="Pin" 
        className="w-10 h-10 cursor-pointer drop-shadow-lg"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
      />
    </Marker>
  );
};
