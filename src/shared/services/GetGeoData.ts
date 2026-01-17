import { env, isDevelopment } from '../config/env';
import { errorHandler } from '../errors/ErrorHandler';
import { createNetworkError, createValidationError } from '../errors/AppError';

export interface GeoDataSearch {
  departamentos: string[];
  municipios: string[];
  distritos: string[];
}

export interface GeoDataResponse {
  data: GeoDataSearch;
  timestamp: string;
}

const validateGeoDataResponse = (data: unknown): GeoDataResponse => {
  if (!data || typeof data !== 'object') {
    throw createValidationError('Invalid response format');
  }

  const response = data as any;
  
  if (!response.data || typeof response.data !== 'object') {
    throw createValidationError('Missing or invalid data field');
  }

  const { departamentos, municipios, distritos } = response.data;
  
  if (!Array.isArray(departamentos) || !Array.isArray(municipios) || !Array.isArray(distritos)) {
    throw createValidationError('Invalid data arrays in response');
  }

  return response as GeoDataResponse;
};

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
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw createNetworkError(
        `HTTP ${response.status}: ${response.statusText}`,
        `HTTP_${response.status}`
      );
    }

    const data = await response.json();
    const validatedData = validateGeoDataResponse(data);
    
    if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
      console.log('Datos geográficos obtenidos:', validatedData);
    }
    
    return validatedData;
  } catch (error) {
    const handledError = errorHandler.handle(error);
    
    if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
      console.error('Error al obtener los datos geográficos:', handledError);
    }
    
    // Return safe fallback
    return { 
      data: { departamentos: [], municipios: [], distritos: [] }, 
      timestamp: new Date().toISOString() 
    };
  }
};
