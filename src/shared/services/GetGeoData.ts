export interface Response {
    departamentos: string[];
    municipios: string[];
    distritos: string[];
  }
  
  export const getGeoData = async (): Promise<Response> => {
    try {
      const backendUrl = 'https://chivomap-api.up.railway.app';
      
      if (!backendUrl) {
        throw new Error('La URL del backend no está definida');
      }
  
      const response = await fetch(`${backendUrl}/api/geo/getGeoData`, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.statusText}`);
      }
  
      const data: Response = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener los datos geográficos:', error);
      return { departamentos: [], municipios: [], distritos: [] };
    }
  };
  