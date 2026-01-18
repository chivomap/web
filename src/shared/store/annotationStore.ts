import { create } from 'zustand';
import { LngLat } from 'maplibre-gl';
import { FeatureCollection, Feature } from 'geojson';

export type AnnotationType = 'pin' | 'drawn-polygon' | 'search-result';

export interface Annotation {
  id: string;
  type: AnnotationType;
  name: string;
  createdAt: Date;
  data: {
    coordinates?: LngLat | LngLat[];
    geojson?: FeatureCollection;
    metadata?: {
      searchType?: 'D' | 'M' | 'distrito';
      searchQuery?: string;
    };
  };
}

interface AnnotationState {
  annotations: Annotation[];
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  removeAnnotation: (id: string) => void;
  clearAnnotations: () => void;
  exportAllAsGeoJSON: () => FeatureCollection;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: [],
  
  addAnnotation: (annotation) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `${annotation.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    
    set((state) => {
      // Si es un pin, remover pins anteriores (solo mantener el último)
      if (annotation.type === 'pin') {
        return {
          annotations: [
            ...state.annotations.filter(a => a.type !== 'pin'),
            newAnnotation
          ]
        };
      }
      // Si es una búsqueda, remover búsquedas anteriores (solo mantener la última)
      if (annotation.type === 'search-result') {
        return {
          annotations: [
            ...state.annotations.filter(a => a.type !== 'search-result'),
            newAnnotation
          ]
        };
      }
      return { annotations: [...state.annotations, newAnnotation] };
    });
  },
  
  removeAnnotation: (id) => {
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== id),
    }));
  },
  
  clearAnnotations: () => set({ annotations: [] }),
  
  exportAllAsGeoJSON: () => {
    const { annotations } = get();
    const features: Feature[] = [];
    
    annotations.forEach((annotation) => {
      if (annotation.type === 'pin' && annotation.data.coordinates) {
        const coord = annotation.data.coordinates as LngLat;
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [coord.lng, coord.lat],
          },
          properties: {
            type: 'pin',
            name: annotation.name,
            createdAt: annotation.createdAt.toISOString(),
          },
        });
      } else if (annotation.type === 'drawn-polygon' && annotation.data.coordinates) {
        const coords = annotation.data.coordinates as LngLat[];
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[...coords.map(c => [c.lng, c.lat]), [coords[0].lng, coords[0].lat]]],
          },
          properties: {
            type: 'drawn-polygon',
            name: annotation.name,
            createdAt: annotation.createdAt.toISOString(),
          },
        });
      } else if (annotation.type === 'search-result' && annotation.data.geojson) {
        annotation.data.geojson.features.forEach((feature) => {
          features.push({
            ...feature,
            properties: {
              ...feature.properties,
              type: 'search-result',
              annotationName: annotation.name,
              searchType: annotation.data.metadata?.searchType,
              searchQuery: annotation.data.metadata?.searchQuery,
              createdAt: annotation.createdAt.toISOString(),
            },
          });
        });
      }
    });
    
    return {
      type: 'FeatureCollection',
      features,
    };
  },
}));
