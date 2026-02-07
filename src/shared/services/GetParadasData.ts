import { env } from '../config/env';
import type { NearbyParadasResponse, ParadasByRutaResponse, SearchParadasResponse } from '../types/paradas';

const API_BASE = env.API_URL;

// Obtener paradas cercanas a una ubicación
export const getNearbyParadas = async (
  lat: number,
  lng: number,
  radius: number = 0.5
): Promise<NearbyParadasResponse> => {
  const url = `${API_BASE}/paradas/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Error al obtener paradas cercanas');
  }
  
  return response.json();
};

// Obtener paradas de una ruta específica
export const getParadasByRuta = async (codigoRuta: string): Promise<ParadasByRutaResponse> => {
  const url = `${API_BASE}/rutas/${codigoRuta}/paradas`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Error al obtener paradas de la ruta');
  }
  
  return response.json();
};

// Buscar paradas por nombre
export const searchParadas = async (query: string): Promise<SearchParadasResponse> => {
  const url = `${API_BASE}/paradas/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Error al buscar paradas');
  }
  
  return response.json();
};
