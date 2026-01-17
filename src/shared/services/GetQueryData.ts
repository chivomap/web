import { FeatureCollection, MultiPolygon } from 'geojson';
import { FeatureProperties } from '../types/feature-propoerties';
import { env, isDevelopment } from '../config/env';
import { errorHandler } from '../errors/ErrorHandler';
import { createNetworkError, createValidationError, createGeoJsonError } from '../errors/AppError';

const validateGeoJsonResponse = (data: unknown): FeatureCollection<MultiPolygon, FeatureProperties> => {
  if (!data || typeof data !== 'object') {
    throw createValidationError('Invalid response format');
  }

  const response = data as any;
  
  if (!response.data) {
    throw createValidationError('Missing data field in response');
  }

  const geoJson = response.data;
  
  if (!geoJson.type || geoJson.type !== 'FeatureCollection') {
    throw createGeoJsonError('Invalid GeoJSON: missing or incorrect type');
  }

  if (!Array.isArray(geoJson.features)) {
    throw createGeoJsonError('Invalid GeoJSON: features must be an array');
  }

  return geoJson as FeatureCollection<MultiPolygon, FeatureProperties>;
};

export const getQueryData = async (
  query: string, 
  whatIs: string
): Promise<FeatureCollection<MultiPolygon, FeatureProperties> | null> => {
  try {
    if (!query.trim() || !whatIs.trim()) {
      throw createValidationError('Query and whatIs parameters are required');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.API_TIMEOUT);

    const url = `${env.API_URL}/geo/filter?query=${encodeURIComponent(query)}&whatIs=${encodeURIComponent(whatIs)}`;
    
    const response = await fetch(url, {
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
    const validatedGeoJson = validateGeoJsonResponse(data);
    
    if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
      console.log('Datos geográficos obtenidos:', { 
        query, 
        whatIs, 
        featuresCount: validatedGeoJson.features.length 
      });
    }
    
    return validatedGeoJson;
  } catch (error) {
    const handledError = errorHandler.handle(error);
    
    if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
      console.error('Error al obtener los datos geográficos:', handledError);
    }
    
    return null;
  }
};
