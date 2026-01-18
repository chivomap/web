import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { LngLat } from 'maplibre-gl';
import type { LayerProps } from 'react-map-gl/maplibre';

interface PolygonDisplayProps {
  coordinates: LngLat[];
}

export const PolygonDisplay: React.FC<PolygonDisplayProps> = ({ coordinates }) => {
  if (coordinates.length < 2) return null;

  // Convert coordinates to GeoJSON format
  const geojsonData = {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        geometry: coordinates.length > 2 
          ? {
              type: 'Polygon' as const,
              coordinates: [[...coordinates.map(coord => [coord.lng, coord.lat]), [coordinates[0].lng, coordinates[0].lat]]]
            }
          : {
              type: 'LineString' as const,
              coordinates: coordinates.map(coord => [coord.lng, coord.lat])
            },
        properties: {}
      }
    ]
  };

  const layerStyle: LayerProps = coordinates.length > 2 
    ? {
        id: 'polygon-layer',
        type: 'fill',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.3
        }
      }
    : {
        id: 'polygon-layer',
        type: 'line',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3
        }
      };

  const outlineStyle: LayerProps | null = coordinates.length > 2 ? {
    id: 'polygon-outline',
    type: 'line',
    paint: {
      'line-color': '#1d4ed8',
      'line-width': 2
    }
  } : null;

  return (
    <>
      <Source id="polygon-source" type="geojson" data={geojsonData}>
        <Layer {...layerStyle} />
        {outlineStyle && <Layer {...outlineStyle} />}
      </Source>
    </>
  );
};
