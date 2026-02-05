import { create } from 'zustand';
import type {
    RutaNearby,
    RutaFeature,
    RutasMetadataResponse,
    RutaMetadata
} from '../types/rutas';
import {
    getNearbyRoutes,
    getRouteByCode,
    getRoutesMetadata,
    listRoutes
} from '../services/GetRutasData';

interface RutasState {
    // Data
    allRoutes: RutaMetadata[];
    nearbyRoutes: RutaNearby[];
    selectedRoute: RutaFeature | null;
    metadata: RutasMetadataResponse | null;

    // Location
    searchLocation: { lat: number; lng: number } | null;
    searchRadius: number;

    // UI State
    isLoading: boolean;
    isPanelOpen: boolean;
    error: string | null;

    // Actions
    fetchAllRoutes: () => Promise<void>;
    fetchNearbyRoutes: (lat: number, lng: number, radius?: number) => Promise<void>;
    selectRoute: (codigo: string) => Promise<void>;
    clearSelectedRoute: () => void;
    clearNearbyRoutes: () => void;
    fetchMetadata: () => Promise<void>;
    setRadius: (radius: number) => void;
    togglePanel: () => void;
    setError: (error: string | null) => void;
}

export const useRutasStore = create<RutasState>((set, get) => ({
    // Initial state
    allRoutes: [],
    nearbyRoutes: [],
    selectedRoute: null,
    metadata: null,
    searchLocation: null,
    searchRadius: 1,
    isLoading: false,
    isPanelOpen: false,
    error: null,

    fetchAllRoutes: async () => {
        // Evitar recargar si ya hay datos
        if (get().allRoutes.length > 0) return;

        set({ isLoading: true });
        try {
            // Llamar sin filtros para traer todo
            const response = await listRoutes();
            set({ allRoutes: response.results, isLoading: false });
        } catch {
            console.error('Error fetching all routes for cache');
            set({ isLoading: false });
            // No seteamos error global para no interrumpir otras interacciones
        }
    },

    fetchNearbyRoutes: async (lat: number, lng: number, radius?: number) => {
        const r = radius ?? get().searchRadius;
        set({ isLoading: true, error: null, searchLocation: { lat, lng } });

        try {
            const response = await getNearbyRoutes(lat, lng, r);
            set({
                nearbyRoutes: response.routes,
                searchRadius: response.radius_km,
                isPanelOpen: response.routes.length > 0,
                isLoading: false
            });
        } catch {
            set({
                error: 'Error al buscar rutas cercanas',
                isLoading: false
            });
        }
    },

    selectRoute: async (codigo: string) => {
        set({ isLoading: true, error: null });

        try {
            const route = await getRouteByCode(codigo);
            if (route) {
                set({ selectedRoute: route, isLoading: false });
            } else {
                set({ error: 'Ruta no encontrada', isLoading: false });
            }
        } catch {
            set({ error: 'Error al cargar la ruta', isLoading: false });
        }
    },

    clearSelectedRoute: () => {
        set({ selectedRoute: null });
    },

    clearNearbyRoutes: () => {
        set({
            nearbyRoutes: [],
            searchLocation: null,
            isPanelOpen: false
        });
    },

    fetchMetadata: async () => {
        const metadata = await getRoutesMetadata();
        set({ metadata });
    },

    setRadius: (radius: number) => {
        set({ searchRadius: Math.min(Math.max(radius, 0.5), 10) });
    },

    togglePanel: () => {
        set(state => ({ isPanelOpen: !state.isPanelOpen }));
    },

    setError: (error: string | null) => {
        set({ error });
    },
}));
