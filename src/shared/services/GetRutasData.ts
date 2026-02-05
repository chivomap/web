import { env, isDevelopment } from '../config/env';
import { errorHandler } from '../errors/ErrorHandler';
import { createNetworkError } from '../errors/AppError';
import type {
    NearbyResponse,
    SearchResponse,
    RutaFeature,
    RutasMetadataResponse,
    ListResponse
} from '../types/rutas';

const API_BASE = `${env.API_URL}/rutas`;

/**
 * Obtiene rutas cercanas a una ubicación
 */
export const getNearbyRoutes = async (
    lat: number,
    lng: number,
    radius: number = 1
): Promise<NearbyResponse> => {
    try {
        const url = `${API_BASE}/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;

        if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
            console.log('Fetching nearby routes:', url);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), env.API_TIMEOUT);

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'Accept': 'application/json' },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw createNetworkError(
                `HTTP ${response.status}: ${response.statusText}`,
                `HTTP_${response.status}`
            );
        }

        const data: NearbyResponse = await response.json();

        if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
            console.log(`Found ${data.count} nearby routes`);
        }

        return data;
    } catch (error) {
        errorHandler.handle(error);
        return {
            location: { lat, lng },
            radius_km: radius,
            count: 0,
            routes: []
        };
    }
};

/**
 * Busca rutas por nombre o código
 */
export const searchRoutes = async (query: string): Promise<SearchResponse> => {
    try {
        const url = `${API_BASE}/search?q=${encodeURIComponent(query)}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), env.API_TIMEOUT);

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'Accept': 'application/json' },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw createNetworkError(
                `HTTP ${response.status}: ${response.statusText}`,
                `HTTP_${response.status}`
            );
        }

        return await response.json();
    } catch (error) {
        errorHandler.handle(error);
        return { query, count: 0, results: [] };
    }
};

/**
 * Obtiene una ruta específica con geometría completa
 */
export const getRouteByCode = async (codigo: string): Promise<RutaFeature | null> => {
    try {
        const url = `${API_BASE}/${encodeURIComponent(codigo)}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), env.API_TIMEOUT);

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'Accept': 'application/json' },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 404) return null;
            throw createNetworkError(
                `HTTP ${response.status}: ${response.statusText}`,
                `HTTP_${response.status}`
            );
        }

        return await response.json();
    } catch (error) {
        errorHandler.handle(error);
        return null;
    }
};

/**
 * Obtiene metadatos para filtros (departamentos, tipos, subtipos)
 */
export const getRoutesMetadata = async (): Promise<RutasMetadataResponse> => {
    try {
        const url = `${API_BASE}/metadata`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), env.API_TIMEOUT);

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'Accept': 'application/json' },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw createNetworkError(
                `HTTP ${response.status}: ${response.statusText}`,
                `HTTP_${response.status}`
            );
        }

        return await response.json();
    } catch (error) {
        errorHandler.handle(error);
        return { departamentos: [], tipos: [], subtipos: [] };
    }
};

/**
 * Lista rutas con filtros opcionales
 */
export const listRoutes = async (filters?: {
    departamento?: string;
    tipo?: string;
    subtipo?: string;
}): Promise<ListResponse> => {
    try {
        const params = new URLSearchParams();
        if (filters?.departamento) params.append('departamento', filters.departamento);
        if (filters?.tipo) params.append('tipo', filters.tipo);
        if (filters?.subtipo) params.append('subtipo', filters.subtipo);

        const url = `${API_BASE}?${params.toString()}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), env.API_TIMEOUT);

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'Accept': 'application/json' },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw createNetworkError(
                `HTTP ${response.status}: ${response.statusText}`,
                `HTTP_${response.status}`
            );
        }

        return await response.json();
    } catch (error) {
        errorHandler.handle(error);
        return {
            filters: { departamento: '', tipo: '', subtipo: '' },
            count: 0,
            results: []
        };
    }
};
