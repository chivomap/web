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
      <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-full">
        <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    </Marker>
  );
};
