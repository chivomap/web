import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useMapStore } from '../../../store/mapStore';
import type { LayerProps } from 'react-map-gl/maplibre';

export const GeoLayer: React.FC = () => {
  const { geojson, currentLevel } = useMapStore();

  if (!geojson || !geojson.features || geojson.features.length === 0) {
    return null;
  }

  const layerStyle: LayerProps = {
    id: 'distritos-fill',
    type: 'fill',
    paint: {
      'fill-color': currentLevel === 'departamento' ? [
        'case',
        ['in', 'Centro', ['get', 'M']], '#06b6d4',
        ['in', 'Norte', ['get', 'M']], '#22c55e',
        ['in', 'Sur', ['get', 'M']], '#f97316',
        ['in', 'Este', ['get', 'M']], '#e11d48',
        ['in', 'Oeste', ['get', 'M']], '#a855f7',
        '#3b82f6'
      ] : '#3b82f6',
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.8,
        currentLevel === 'departamento' ? 0.7 : 0.5
      ]
    }
  };

  const outlineStyle: LayerProps = {
    id: 'distritos-outline',
    type: 'line',
    paint: {
      'line-color': currentLevel === 'departamento' ? [
        'case',
        ['in', 'Centro', ['get', 'M']], '#0891b2',
        ['in', 'Norte', ['get', 'M']], '#16a34a',
        ['in', 'Sur', ['get', 'M']], '#ea580c',
        ['in', 'Este', ['get', 'M']], '#be123c',
        ['in', 'Oeste', ['get', 'M']], '#9333ea',
        '#475569'
      ] : '#1d4ed8',
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        3,
        currentLevel === 'departamento' ? 2 : 1
      ]
    }
  };

  return (
    <Source id="distritos-source" type="geojson" data={geojson}>
      <Layer {...layerStyle} />
      <Layer {...outlineStyle} />
    </Source>
  );
};
