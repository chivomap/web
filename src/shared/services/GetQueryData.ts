import { FeatureCollection, MultiPolygon } from 'geojson';
import { FeatureProperties } from '../types/feature-propoerties';

// Actualizamos la función para trabajar con GeoJSON
export const getQueryData = async (query: string, whatIs: string): Promise<FeatureCollection<MultiPolygon, FeatureProperties> | null> => {
  try {
    const response = await fetch(`https://chivomap-api.up.railway.app/api/geo/filter?query=${query}&whatIs=${whatIs}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.statusText}`);
    }

    // Parseamos el resultado como GeoJSON FeatureCollection
    const data: FeatureCollection<MultiPolygon, FeatureProperties> = await response.json();
    console.log('Datos geográficos obtenidos:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener los datos geográficos:', error);
    return null;
  }
};
