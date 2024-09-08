import React from 'react';
import { LatLng } from 'leaflet';
import { Polygon, Popup } from 'react-leaflet';
import { IoSave as SaveIcon } from 'react-icons/io5';
import { BiExport as ExportIcon } from 'react-icons/bi';

interface PolygonDisplayProps {
  coordinates: LatLng[];
  onExport: () => void;
}

export const PolygonDisplay: React.FC<PolygonDisplayProps> = ({ coordinates, onExport }) => {
  return (
    <Polygon positions={coordinates}>
      <Popup>
        <p className='font-bold text-lg leading-[0px]'>Polígono de {coordinates.length} puntos.</p>
        <div className='flex items-center justify-around'>
          <button className='bg-primary flex items-center gap-2 text-white text-base px-2 py-1 rounded-md mt-2 hover:bg-primary/50 transition-colors duration-300 ease-in-out'>
            Guardar <SaveIcon />
          </button>
          <button 
            onClick={onExport}
            className='bg-primary flex items-center gap-2 text-white text-base px-2 py-1 rounded-md mt-2 hover:bg-primary/50 transition-colors duration-300 ease-in-out'
          >
            Exportar <ExportIcon />
          </button>
        </div>
      </Popup>
    </Polygon>
  );
};
