import { env, isDevelopment } from '../config/env';

export interface GeoDataSearch {
  departamentos: string[];
  municipios: string[];
  distritos: string[];
}

export interface GeoDataResponse {
  data: GeoDataSearch;
  timestamp: string;
}

export const getGeoData = async (): Promise<GeoDataResponse> => {
  try {
    if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
      console.log("API URL:", env.API_URL + '/geo/search-data');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.API_TIMEOUT);

    const response = await fetch(`${env.API_URL}/geo/search-data`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.statusText}`);
    }

    const data: GeoDataResponse = await response.json();
    
    if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
      console.log('Datos geográficos obtenidos:', data);
    }
    
    return data;
  } catch (error) {
    if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
      console.error('Error al obtener los datos geográficos:', error);
    }
    return { data: { departamentos: [], municipios: [], distritos: [] }, timestamp: '' };
  }
};
