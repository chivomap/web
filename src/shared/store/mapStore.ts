'use client';
import { create } from 'zustand';
import * as turf from '@turf/turf';
import { LngLat } from 'maplibre-gl';
import { FeatureCollection, MultiPolygon } from 'geojson';
import { FeatureProperties } from '../types/feature-propoerties';
import { env, isDevelopment } from '../config/env';

interface MapState {
  config: MapConfigOptions;
  updateConfig: (newConfig: MapConfigOptions) => void;
  geojson: FeatureCollection<MultiPolygon, FeatureProperties> | null;
  updateGeojson: (newGeojson: FeatureCollection<MultiPolygon, FeatureProperties> | null) => void;
  polygon: LngLat[];
  updatePolygon: (newPolygon: LngLat[]) => void;
}

interface MapConfigOptions {
  center: { lat: number; lng: number };
  zoom: number;
}

export const useMapStore = create<MapState>((set) => ({
  config: {
    center: { lat: env.MAP_DEFAULT_LAT, lng: env.MAP_DEFAULT_LNG },
    zoom: env.MAP_DEFAULT_ZOOM,
  },
  updateConfig: (newConfig) => set(() => ({ config: newConfig })),

  geojson: null,
  updateGeojson: (newGeojson) => {
    try {
      if (newGeojson && Array.isArray(newGeojson.features) && newGeojson.features.length > 0) {
        set(() => ({ geojson: newGeojson }));

        const bbox = turf.bbox(newGeojson);
        const bboxPolygon = turf.bboxPolygon(bbox);
        const center = turf.center(bboxPolygon);
        const centerCoords = center.geometry.coordinates as [number, number];
        
        const diagonal = turf.distance(
          turf.point([bbox[0], bbox[1]]),
          turf.point([bbox[2], bbox[3]]),
          { units: 'kilometers' }
        );
        
        const worldWidthKm = 40075;
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
        const mapWidthInKmAtZoom0 = worldWidthKm / Math.pow(2, 0);
        const aspectRatio = screenWidth / screenHeight;
        const zoom = Math.log2((mapWidthInKmAtZoom0 * aspectRatio) / diagonal);
        
        // Validate calculated values
        if (isNaN(centerCoords[0]) || isNaN(centerCoords[1]) || isNaN(zoom)) {
          throw new Error('Invalid coordinates or zoom calculation');
        }
        
        if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
          console.log(`Calculated zoom: ${zoom}`);
        }
        
        set(() => ({
          config: {
            center: { lat: centerCoords[1], lng: centerCoords[0] },
            zoom: Math.max(env.MAP_MIN_ZOOM, Math.min(18, Math.round(zoom))),
          },
        }));
        
      } else {
        if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
          console.warn('GeoJSON inválido o vacío proporcionado');
        }
      }
    } catch (error) {
      if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
        console.error('Error procesando GeoJSON:', error);
      }
      // Reset to default config on error
      set(() => ({
        config: {
          center: { lat: env.MAP_DEFAULT_LAT, lng: env.MAP_DEFAULT_LNG },
          zoom: env.MAP_DEFAULT_ZOOM,
        },
      }));
    }
  },

  polygon: [],
  updatePolygon: (newPolygon) => set(() => ({ polygon: newPolygon })),
}));
