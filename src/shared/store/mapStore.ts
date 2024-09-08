'use client';
import { create } from 'zustand';
import * as turf from '@turf/turf';
import { LatLng } from 'leaflet';

interface MapState {
  config: MapConfigOptions;
  updateConfig: (newConfig: MapConfigOptions) => void;
  geojson: GeoJSON.FeatureCollection | null;
  updateGeojson: (newGeojson: GeoJSON.FeatureCollection) => void;
  polygon: LatLng[];
  updatePolygon: (newPolygon: LatLng[]) => void;
}

interface MapConfigOptions {
  center: { lat: number; lng: number };
  zoom: number;
}

export const useMapStore = create<MapState>((set) => ({
  config: {
    center: { lat: 13.758960, lng: -89.653892 },
    zoom: 9,
  },
  updateConfig: (newConfig) => set(() => ({ config: newConfig })),
  geojson: null,
  updateGeojson: (newGeojson) => {
    set(() => ({ geojson: newGeojson }));

    if (newGeojson && newGeojson.features.length > 0) {
      const bbox = turf.bbox(newGeojson);
      const bboxPolygon = turf.bboxPolygon(bbox);
      const center = turf.center(bboxPolygon);
      const centerCoords = center.geometry.coordinates;

      const diagonal = turf.distance(
        turf.point([bbox[0], bbox[1]]),
        turf.point([bbox[2], bbox[3]]),
        { units: 'kilometers' }
      );

      const worldWidthKm = 40075; // Circunferencia aproximada de la tierra en km
      const mapWidthInKmAtZoom0 = worldWidthKm;
      const screenWidth = 1024; // Ajusta esto según el tamaño de la pantalla
      const zoom = Math.log2((mapWidthInKmAtZoom0 / diagonal) * (screenWidth / 300));
      console.log(`Calculated zoom: ${zoom}`);

      set(() => ({
        config: {
          center: { lat: centerCoords[1], lng: centerCoords[0] },
          zoom: zoom,
        },
      }));
    }
  },
  polygon: [],
  updatePolygon: (newPolygon) => set(() => ({ polygon: newPolygon })),
}));
