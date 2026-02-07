// Parada de transporte público
export interface Parada {
  fid: number;
  ruta: string;
  codigo: 'I' | 'R'; // Ida o Regreso
  nombre: string;
  latitud: number;
  longitud: number;
  departamento: string;
}

// Respuesta de paradas cercanas
export interface NearbyParadasResponse {
  location: {
    lat: number;
    lng: number;
  };
  radius_km: number;
  count: number;
  paradas: Parada[];
}

// Respuesta de paradas por ruta
export interface ParadasByRutaResponse {
  ruta: string;
  count: number;
  paradas: Parada[];
}

// Respuesta de búsqueda de paradas
export interface SearchParadasResponse {
  query: string;
  count: number;
  paradas: Parada[];
}
