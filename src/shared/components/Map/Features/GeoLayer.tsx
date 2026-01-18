import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useMapStore } from '../../../store/mapStore';
import type { LayerProps } from 'react-map-gl/maplibre';

export const GeoLayer: React.FC = () => {
  const { geojson, currentLevel } = useMapStore();

  if (!geojson || !geojson.features || geojson.features.length === 0) {
    return null;
  }

  // Filter valid features
  const validFeatures = geojson.features.filter((feature: any) => {
    if (feature._vectorTileFeature) {
      return true;
    }
    return (
      feature &&
      feature.geometry &&
      feature.geometry.coordinates &&
      Array.isArray(feature.geometry.coordinates) &&
      feature.geometry.coordinates.length > 0
    );
  });

  if (validFeatures.length === 0) {
    return null;
  }

  // Process GeoJSON based on level
  const processedGeoJSON = {
    type: 'FeatureCollection' as const,
    features: currentLevel === 'departamento' 
      ? groupDistritosByMunicipio(validFeatures)
      : validFeatures.map((feature, index) => ({
          ...feature,
          id: index
        }))
  };

  function groupDistritosByMunicipio(features: any[]) {
    const municipios = new Map();
    
    features.forEach((feature) => {
      const municipio = feature.properties.M;
      if (!municipios.has(municipio)) {
        municipios.set(municipio, {
          type: 'Feature',
          properties: {
            M: municipio,
            D: feature.properties.D,
            NAM: municipio,
            type: 'municipio'
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: []
          }
        });
      }
      
      const municipioFeature = municipios.get(municipio);
      if (feature.geometry.type === 'MultiPolygon') {
        municipioFeature.geometry.coordinates.push(...feature.geometry.coordinates);
      } else if (feature.geometry.type === 'Polygon') {
        municipioFeature.geometry.coordinates.push([feature.geometry.coordinates]);
      }
    });

    return Array.from(municipios.values()).map((feature, index) => ({
      ...feature,
      id: index
    }));
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
    <Source id="distritos-source" type="geojson" data={processedGeoJSON}>
      <Layer {...layerStyle} />
      <Layer {...outlineStyle} />
    </Source>
  );
};
