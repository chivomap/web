import React, { useEffect } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useMapStore } from '../../../store/mapStore';
import { env, isDevelopment } from '../../../config/env';
import type { LayerProps } from 'react-map-gl/maplibre';

export const GeoDistritos: React.FC = () => {
  const { geojson } = useMapStore();

  useEffect(() => {
    if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
      console.log('geojson', geojson);
    }
  }, [geojson]);

  if (!geojson) return null;

  const layerStyle: LayerProps = {
    id: 'distritos-fill',
    type: 'fill',
    paint: {
      'fill-color': '#60a5fa',
      'fill-opacity': 0.6
    }
  };

  const outlineStyle: LayerProps = {
    id: 'distritos-outline',
    type: 'line',
    paint: {
      'line-color': '#1d4ed8',
      'line-width': 2
    }
  };

  return (
    <Source id="distritos-source" type="geojson" data={geojson}>
      <Layer {...layerStyle} />
      <Layer {...outlineStyle} />
    </Source>
  );
};
