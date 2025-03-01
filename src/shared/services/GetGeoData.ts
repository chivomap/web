export interface GeoDataSearch {
  departamentos: string[];
  municipios: string[];
  distritos: string[];
}

export interface GeoDataResponse {
  data: GeoDataSearch;
  timestamp: string;
}
const apiUrl = import.meta.env.VITE_API_URL;

export const getGeoData = async (): Promise<GeoDataResponse> => {
  try {

    if (!apiUrl) {
      throw new Error('La URL del backend no está definida');
    }
    
    console.log("url cargada", apiUrl + '/geo/search-data');

    const response = await fetch(`${apiUrl}/geo/search-data`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.statusText}`);
    }

    const data: GeoDataResponse = await response.json();
    console.log('Datos geográficos obtenidos:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener los datos geográficos:', error);
    return { data: { departamentos: [], municipios: [], distritos: [] }, timestamp: '' };
  }
};
