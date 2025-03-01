import { FeatureCollection, MultiPolygon } from 'geojson';
import { FeatureProperties } from '../types/feature-propoerties';

interface QueryDataResponse {
  data: FeatureCollection<MultiPolygon, FeatureProperties>;
  timestamp: string;
}

const apiUrl = import.meta.env.VITE_API_URL;

// Actualizamos la función para trabajar con GeoJSON
export const getQueryData = async (query: string, whatIs: string): Promise<FeatureCollection<MultiPolygon, FeatureProperties> | null> => {
  try {
    const response = await fetch(`${apiUrl}/geo/filter?query=${query}&whatIs=${whatIs}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.statusText}`);
    }

    // Parseamos el resultado como GeoJSON FeatureCollection
    const data: QueryDataResponse = await response.json();
    console.log('Datos geográficos obtenidos:', data);
    return data.data;
  } catch (error) {
    console.error('Error al obtener los datos geográficos:', error);
    return null;
  }
};
