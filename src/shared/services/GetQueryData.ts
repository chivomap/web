import { FeatureCollection, MultiPolygon } from 'geojson';
import { FeatureProperties } from '../types/feature-propoerties';
import { env, isDevelopment } from '../config/env';

interface QueryDataResponse {
  data: FeatureCollection<MultiPolygon, FeatureProperties>;
  timestamp: string;
}

export const getQueryData = async (query: string, whatIs: string): Promise<FeatureCollection<MultiPolygon, FeatureProperties> | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.API_TIMEOUT);

    const response = await fetch(`${env.API_URL}/geo/filter?query=${encodeURIComponent(query)}&whatIs=${encodeURIComponent(whatIs)}`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.statusText}`);
    }

    const data: QueryDataResponse = await response.json();
    
    if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
      console.log('Datos geográficos obtenidos:', data);
    }
    
    return data.data;
  } catch (error) {
    if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
      console.error('Error al obtener los datos geográficos:', error);
    }
    return null;
  }
};
