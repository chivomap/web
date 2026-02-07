import React, { useEffect } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useRutasStore } from '../../store/rutasStore';
import { RUTA_COLORS, type SubtipoRuta } from '../../types/rutas';
import { getRoutesBatch } from '../../services/GetRutasData';

export const NearbyRoutesLayer: React.FC = () => {
  const { nearbyRoutes, showNearbyOnMap, selectedRoute, hoveredRoute } = useRutasStore();
  const [loadedRoutes, setLoadedRoutes] = React.useState<Map<string, any>>(new Map());

  // Cargar geometrías de rutas cercanas en lotes
  useEffect(() => {
    if (!showNearbyOnMap || !nearbyRoutes || nearbyRoutes.length === 0) {
      setLoadedRoutes(new Map());
      return;
    }

    let cancelled = false;

    const loadRoutes = async () => {
      const newRoutes = new Map<string, any>();
      const BATCH_SIZE = 50;
      
      for (let i = 0; i < nearbyRoutes.length; i += BATCH_SIZE) {
        if (cancelled) break;
        
        const batch = nearbyRoutes.slice(i, i + BATCH_SIZE);
        const codes = batch.map(r => r.codigo);
        
        const results = await getRoutesBatch(codes);
        
        if (!cancelled) {
          Object.entries(results).forEach(([code, route]) => {
            newRoutes.set(code, route);
          });
          setLoadedRoutes(new Map(newRoutes));
        }
      }
    };

    loadRoutes();

    return () => {
      cancelled = true;
    };
  }, [nearbyRoutes, showNearbyOnMap]);

  // Ocultar rutas cercanas cuando hay una ruta seleccionada
  if (!showNearbyOnMap || !nearbyRoutes || nearbyRoutes.length === 0 || selectedRoute) return null;

  // Ordenar rutas: la que tiene hover al final para que se pinte encima
  const sortedRoutes = [...nearbyRoutes].sort((a, b) => {
    if (a.codigo === hoveredRoute) return 1;
    if (b.codigo === hoveredRoute) return -1;
    return 0;
  });

  return (
    <>
      {sortedRoutes.map((ruta) => {
        const fullRoute = loadedRoutes.get(ruta.codigo);
        if (!fullRoute) return null;

        const subtipo = ruta.subtipo as SubtipoRuta;
        const color = RUTA_COLORS[subtipo] || '#6b7280';
        const isHovered = hoveredRoute === ruta.codigo;
        const isDimmed = hoveredRoute && hoveredRoute !== ruta.codigo;

        return (
          <Source
            key={`nearby-${ruta.codigo}`}
            id={`nearby-route-${ruta.codigo}`}
            type="geojson"
            data={fullRoute}
          >
            {/* Capa invisible más ancha para interacción */}
            <Layer
              id={`nearby-route-hitbox-${ruta.codigo}`}
              type="line"
              paint={{
                'line-color': color,
                'line-width': 12,
                'line-opacity': 0,
              }}
            />
            {/* Capa visual */}
            <Layer
              id={`nearby-route-line-${ruta.codigo}`}
              type="line"
              paint={{
                'line-color': color,
                'line-width': isHovered ? 5 : 3,
                'line-opacity': isDimmed ? 0.15 : (isHovered ? 1 : 0.6),
              }}
            />
          </Source>
        );
      })}
    </>
  );
};
