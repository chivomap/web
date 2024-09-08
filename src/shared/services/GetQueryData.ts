import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

// Actualizamos la función para trabajar con GeoJSON
export const getQueryData = async (query: string, whatIs: string): Promise<FeatureCollection<Geometry, GeoJsonProperties>> => {
    try {
        // Aquí llamamos al backend que devuelve GeoJSON
        const response = await fetch(`https://chivomap-api.up.railway.app/api/geo/filter?query=${query}&whatIs=${whatIs}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.statusText}`);
        }

        // Parseamos el resultado como GeoJSON
        const data: FeatureCollection<Geometry, GeoJsonProperties> = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener los datos geográficos:', error);
        // Retornamos un objeto GeoJSON vacío en caso de error
        return {
            type: 'FeatureCollection',
            features: [],
        };
    }
};
