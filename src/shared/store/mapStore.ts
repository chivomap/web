'use client';
import { create } from 'zustand';
import * as turf from '@turf/turf';
import { LatLng } from 'leaflet';
import { FeatureCollection, MultiPolygon } from 'geojson';  // Importamos MultiPolygon de geojson
import { FeatureProperties } from '../types/feature-propoerties';  // Usamos tus tipos personalizados

interface MapState {
  config: MapConfigOptions;
  updateConfig: (newConfig: MapConfigOptions) => void;
  geojson: FeatureCollection<MultiPolygon, FeatureProperties> | null;  // Corregimos el tipo de geojson
  updateGeojson: (newGeojson: FeatureCollection<MultiPolygon, FeatureProperties> | null) => void;
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
    if (newGeojson && Array.isArray(newGeojson.features) && newGeojson.features.length > 0) {
      set(() => ({ geojson: newGeojson }));

      const bbox = turf.bbox(newGeojson); // Calcula el bounding box del GeoJSON
      const bboxPolygon = turf.bboxPolygon(bbox); // Genera el polígono basado en el bounding box
      const center = turf.center(bboxPolygon); // Calcula el centro del polígono
      const centerCoords = center.geometry.coordinates as [number, number]; // Aseguramos que las coordenadas son [number, number]
      
      // Calcular la diagonal en kilómetros entre las esquinas del bbox
      const diagonal = turf.distance(
        turf.point([bbox[0], bbox[1]]),
        turf.point([bbox[2], bbox[3]]),
        { units: 'kilometers' }
      );
      
      // Circunferencia aproximada de la tierra en km
      const worldWidthKm = 40075; 
      
      // Tamaño de la pantalla dinámica (considerando si está disponible `window`)
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
      
      // Calcula el ancho visible del mapa a zoom 0
      const mapWidthInKmAtZoom0 = worldWidthKm / Math.pow(2, 0);
      
      // Factor de ajuste basado en la pantalla (relación ancho/alto)
      const aspectRatio = screenWidth / screenHeight;
      
      // Ajusta el zoom calculando el nivel en función de la diagonal del bbox
      const zoom = Math.log2((mapWidthInKmAtZoom0 * aspectRatio) / diagonal);
      console.log(`Calculated zoom: ${zoom}`);
      
      // Setear la nueva configuración del mapa con el centro y el zoom calculados
      set(() => ({
        config: {
          center: { lat: centerCoords[1], lng: centerCoords[0] },
          zoom: Math.round(zoom), // Ajustar al valor de zoom más cercano
        },
      }));
      
    } else {
      console.error('El objeto GeoJSON no es válido o no tiene características.');
    }
  },

  polygon: [],
  updatePolygon: (newPolygon) => set(() => ({ polygon: newPolygon })),
}));
