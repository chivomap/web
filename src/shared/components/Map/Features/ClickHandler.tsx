import React from 'react';
import { LatLng } from 'leaflet';
import { useMapEvents } from 'react-leaflet';

interface ClickHandlerProps {
  onMapClick: (latlng: LatLng) => void;
  onMapRightClick: (latlng: LatLng) => void;
}

export const ClickHandler: React.FC<ClickHandlerProps> = ({ onMapClick, onMapRightClick }) => {
  useMapEvents({
    click: (event) => {
      const { latlng } = event;
      onMapClick(latlng);
    },
    contextmenu: (event) => {
      const { latlng } = event;
      onMapRightClick(latlng);
    },
  });
  return null;
};
