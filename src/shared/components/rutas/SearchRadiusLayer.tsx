import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useRutasStore } from '../../store/rutasStore';

export const SearchRadiusLayer: React.FC = () => {
  const { searchLocation, searchRadius } = useRutasStore();

  if (!searchLocation) return null;

  // Crear círculo usando aproximación de polígono
  const createCircle = (center: { lat: number; lng: number }, radiusKm: number, points = 64) => {
    const coords: [number, number][] = [];
    const radiusDeg = radiusKm / 111.32; // Aproximación: 1 grado ≈ 111.32 km

    for (let i = 0; i <= points; i++) {
      const angle = (i * 360) / points;
      const rad = (angle * Math.PI) / 180;
      const lat = center.lat + radiusDeg * Math.cos(rad);
      const lng = center.lng + (radiusDeg * Math.sin(rad)) / Math.cos((center.lat * Math.PI) / 180);
      coords.push([lng, lat]);
    }

    return coords;
  };

  const circleCoords = createCircle(searchLocation, searchRadius);

  return (
    <>
      {/* Círculo de búsqueda */}
      <Source
        id="search-radius"
        type="geojson"
        data={{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [circleCoords],
          },
        }}
      >
        <Layer
          id="search-radius-fill"
          type="fill"
          paint={{
            'fill-color': '#93c5fd',
            'fill-opacity': 0.1,
          }}
        />
        <Layer
          id="search-radius-outline"
          type="line"
          paint={{
            'line-color': '#93c5fd',
            'line-width': 2,
            'line-dasharray': [2, 2],
          }}
        />
      </Source>

      {/* Marcador del centro */}
      <Source
        id="search-center"
        type="geojson"
        data={{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [searchLocation.lng, searchLocation.lat],
          },
        }}
      >
        <Layer
          id="search-center-circle"
          type="circle"
          paint={{
            'circle-radius': 8,
            'circle-color': '#93c5fd',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          }}
        />
      </Source>
    </>
  );
};
