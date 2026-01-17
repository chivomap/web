import React, { useEffect, useState, useRef } from 'react';
import { useMapStore } from '../../shared/store/mapStore';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LngLat } from 'maplibre-gl';
import * as domToImage from 'dom-to-image';
import download from 'downloadjs';
import { useLocation } from 'wouter';
import type { LayerProps } from 'react-map-gl/maplibre';

import { LuFileJson2 as JsonIcon, LuImage as ImageIcon } from 'react-icons/lu';
import { ImSpinner2 } from 'react-icons/im';

export const Export: React.FC = () => {
  const { polygon } = useMapStore();
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [, setLocation] = useLocation();
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (polygon.length === 0) {
      setLocation('/');
    }
  }, [polygon, setLocation]);

  useEffect(() => {
    if (polygon.length > 0 && mapRef.current) {
      // Calculate bounds from polygon
      const lngs = polygon.map(coord => coord.lng);
      const lats = polygon.map(coord => coord.lat);
      
      const bounds = [
        [Math.min(...lngs), Math.min(...lats)], // Southwest
        [Math.max(...lngs), Math.max(...lats)]  // Northeast
      ] as [[number, number], [number, number]];
      
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [polygon, mapReady]);

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
        coordinates: [polygon.map((coord: LngLat) => [coord.lng, coord.lat])]
      },
    };
    const blob = new Blob([JSON.stringify(polygonGeoJson)], { type: 'application/geo+json' });
    download(blob, 'polygon.geojson');
  };

  const downloadImage = () => {
    const mapElement = document.getElementById('export-map');
    if (mapElement) {
      const scale = 2;
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

  // Create GeoJSON for polygon
  const polygonGeoJSON = polygon.length > 0 ? {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[...polygon.map(coord => [coord.lng, coord.lat]), [polygon[0].lng, polygon[0].lat]]]
        },
        properties: {}
      }
    ]
  } : null;

  const polygonStyle: LayerProps = {
    id: 'polygon-fill',
    type: 'fill',
    paint: {
      'fill-color': '#3b82f6',
      'fill-opacity': 0.3
    }
  };

  const polygonOutline: LayerProps = {
    id: 'polygon-outline',
    type: 'line',
    paint: {
      'line-color': '#1d4ed8',
      'line-width': 3
    }
  };

  return (
    <div className="pageview">
      <h1 className="text-2xl px-2 pt-2 text-center font-bold mb-4">Exportar Polígono</h1>
      <section className='h-[75%] mb-4 w-full mx-auto'>
        {mapReady && polygon.length > 0 && (
          <div id="export-map" className="h-full w-full">
            <Map
              ref={mapRef}
              style={{ width: '100%', height: '100%' }}
              mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
              interactive={false}
            >
              {polygonGeoJSON && (
                <Source id="polygon-source" type="geojson" data={polygonGeoJSON}>
                  <Layer {...polygonStyle} />
                  <Layer {...polygonOutline} />
                </Source>
              )}
            </Map>
          </div>
        )}
        {!mapReady && (
          <div className='w-full h-full flex items-center justify-center rounded'>
            <ImSpinner2 className="ml-2 animate-spin text-2xl"/>
          </div>
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

