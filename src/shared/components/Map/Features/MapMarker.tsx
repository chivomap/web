import React from 'react';
import { LatLng, divIcon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import ReactDOMServer from 'react-dom/server';
import { IoLocation as LocationIcon, IoSave as SaveIcon } from 'react-icons/io5';

interface MapMarkerProps {
  position: LatLng;
}

export const MapMarker: React.FC<MapMarkerProps> = ({ position }) => {
  const mapIcon = divIcon({
    html: ReactDOMServer.renderToString(<LocationIcon color='#434' size={24} />),
    className: '',
  });

  return (
    <Marker position={position} icon={mapIcon}>
      <Popup className='text-lg'>
        {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        <br />
        <button className='bg-primary text-lg flex items-center gap-2 text-white px-2 py-1 rounded-md mt-2 hover:bg-primary/50 transition-colors duration-300 ease-in-out'>
          Guardar <SaveIcon />
        </button>
      </Popup>
    </Marker>
  );
};

