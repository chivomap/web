import React, { useEffect, useState } from 'react';
import { useMapStore } from '../../shared/store/mapStore';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLng, LatLngBounds } from 'leaflet';
import * as domToImage from 'dom-to-image';
import download from 'downloadjs';
import { useLocation } from 'wouter'; // Usar Wouter en lugar de useRouter

import { LuFileJson2 as JsonIcon, LuImage as ImageIcon } from 'react-icons/lu';
import { ImSpinner2 } from 'react-icons/im';

// Custom hook to fit bounds
const FitBounds: React.FC<{ bounds: LatLngBounds }> = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds);
  }, [map, bounds]);

  return null;
};

export const Export: React.FC = () => {
  const { polygon } = useMapStore();
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [, setLocation] = useLocation(); // Usar Wouter para la redirección

  useEffect(() => {
    if (polygon.length === 0) {
      setLocation('/'); // Redirigir a la página principal si no hay polígono
    }
  }, [polygon, setLocation]);

  useEffect(() => {
    if (polygon.length > 0) {
      const latLngTuples = polygon.map((coord: LatLng) => [coord.lat, coord.lng] as [number, number]);
      const polygonBounds = new LatLngBounds(latLngTuples);
      setBounds(polygonBounds);
    }
  }, [polygon]);

  useEffect(() => {
    setTimeout(() => {
      setMapReady(true);
    }, 1000);
  }, []);

  const downloadJSON = () => {
    const polygonGeoJson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [polygon.map((coord: LatLng) => [coord.lng, coord.lat])]
      },
    };
    const blob = new Blob([JSON.stringify(polygonGeoJson)], { type: 'application/geo+json' });
    download(blob, 'polygon.geojson');
  };

  const downloadImage = () => {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      const scale = 2; // Aumenta la escala para mejorar la calidad
      const options = {
        width: mapElement.clientWidth * scale,
        height: mapElement.clientHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${mapElement.clientWidth}px`,
          height: `${mapElement.clientHeight}px`,
        },
      };
      domToImage.toPng(mapElement, options)
        .then((dataUrl: string) => {
          download(dataUrl, 'map.png');
        })
        .catch((error: Error) => {
          console.error('Error exporting map as image:', error);
        });
    }
  };

  return (
    <div className="pageview">
      <h1 className="text-2xl px-2 pt-2 text-center font-bold mb-4">Exportar Polígono</h1>
      <section className='h-[75%] mb-4 w-full mx-auto'>
        {mapReady && bounds && (
          <MapContainer
            id="map"
            bounds={bounds}
            className="h-full w-full"
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            placeholder={<div className='w-full h-full flex items-center justify-center rounded'>
              <ImSpinner2 className="ml-2 animate-spin"/>
            </div>}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Polygon positions={polygon.map((coord: LatLng) => [coord.lat, coord.lng] as [number, number])} />
            <FitBounds bounds={bounds} />
          </MapContainer>
        )}
      </section>
      <div className="flex justify-center h-[10%] space-x-4">
        <button onClick={downloadJSON} className="bg-secondary flex items-center gap-2 text-primary text-base px-4 py-2 rounded-md hover:bg-secondary/50 transition-colors duration-300 ease-in-out">
          JSON <JsonIcon />
        </button>
        <button onClick={downloadImage} className="bg-secondary flex items-center gap-2 text-primary text-base px-4 py-2 rounded-md hover:bg-secondary/50 transition-colors duration-300 ease-in-out">
          Imagen <ImageIcon />
        </button>
      </div>
    </div>
  );
};

