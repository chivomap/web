import React, { useState, useCallback, useEffect, useRef } from 'react';
import Map, { ViewStateChangeEvent, MapRef } from 'react-map-gl/maplibre';
import { LngLat, LngLatBounds } from 'maplibre-gl';
import { useMapStore } from '../../../shared/store/mapStore';
import { useAnnotationStore } from '../../store/annotationStore';
import { useRutasStore } from '../../store/rutasStore';
import { env } from '../../config/env';
import { MapStyle } from '../../data/mapStyles';
import { useThemeStore } from '../../store/themeStore';

import { MapControls, MapMarker, PolygonDisplay, MapStyleSelector, MapScale, GeoLayer, GeoDistritos } from './Features';
import { RouteLayer, SearchRadiusLayer, NearbyRoutesLayer } from '../rutas';
import 'maplibre-gl/dist/maplibre-gl.css';
import './popup-styles.css';

export const MapLibreMap: React.FC = () => {
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [clickPosition, setClickPosition] = useState<LngLat | null>(null);
  const [polygonCoords, setPolygonCoords] = useState<LngLat[]>([]);
  const [hoverInfo, setHoverInfo] = useState<{ name: string; x: number; y: number } | null>(null);
  const [routeHover, setRouteHover] = useState<{ 
    codigo: string; 
    nombre: string; 
    tipo: string;
    subtipo: string;
    sentido: string;
    departamento: string;
    kilometros: number;
    distancia_m: number;
    x: number; 
    y: number;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; lngLat: LngLat } | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [interactiveLayers, setInteractiveLayers] = useState<string[]>(['distritos-fill']);
  const { config, updateConfig } = useMapStore();
  const { addAnnotation, annotations } = useAnnotationStore();
  const { fetchNearbyRoutes, selectedRoute, nearbyRoutes, showNearbyOnMap, selectRoute } = useRutasStore();
  const { currentMapStyle, setMapStyle } = useThemeStore();
  const { center, zoom } = config;

  const mapRef = useRef<MapRef>(null);

  // Initialize map style from store
  const [mapStyle, setMapStyleState] = useState<string>(currentMapStyle.url);

  useEffect(() => {
    setMapStyleState(currentMapStyle.url);
  }, [currentMapStyle]);

  // Zoom to route when selected
  useEffect(() => {
    if (selectedRoute && mapRef.current) {
      try {
        const bounds = new LngLatBounds();
        const coords = selectedRoute.geometry.coordinates;

        if (Array.isArray(coords)) {
          coords.forEach((coord: any) => {
            // coord expected as [lng, lat] or [lng, lat, elev]
            if (Array.isArray(coord) && coord.length >= 2) {
              bounds.extend([coord[0], coord[1]]);
            }
          });

          if (!bounds.isEmpty()) {
            mapRef.current.fitBounds(bounds, {
              padding: 50,
              duration: 1000 // Smooth animation
            });
          }
        }
      } catch (error) {
        console.error("Error fitting bounds to route:", error);
      }
    }
  }, [selectedRoute]);

  const handleMapLoad = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      
      // Crear ícono de flecha SVG
      const arrowSvg = `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2 L12 18 M12 18 L6 12 M12 18 L18 12" 
                stroke="white" 
                stroke-width="3" 
                fill="none" 
                stroke-linecap="round" 
                stroke-linejoin="round"/>
        </svg>
      `;
      
      const img = new Image(24, 24);
      img.onload = () => {
        if (!map.hasImage('arrow')) {
          map.addImage('arrow', img);
        }
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(arrowSvg);
    }
    
    setMapReady(true);
  }, []);

  // Update interactive layers when nearby routes change
  useEffect(() => {
    if (showNearbyOnMap && nearbyRoutes.length > 0) {
      const routeLayers = nearbyRoutes.flatMap(r => [
        `nearby-route-hitbox-${r.codigo}`,
        `nearby-route-line-${r.codigo}`
      ]);
      setInteractiveLayers(['distritos-fill', ...routeLayers]);
    } else {
      setInteractiveLayers(['distritos-fill']);
    }
  }, [showNearbyOnMap, nearbyRoutes]);

  const handleViewStateChange = useCallback((evt: ViewStateChangeEvent) => {
    updateConfig({
      center: { lat: evt.viewState.latitude, lng: evt.viewState.longitude },
      zoom: evt.viewState.zoom
    });
  }, [updateConfig]);

  const handleMapClick = useCallback((event: any) => {
    const { lngLat, features } = event;
    
    // Check if clicked on a nearby route (hitbox or line)
    if (features && features.length > 0) {
      const routeFeature = features.find((f: any) => 
        f.layer?.id?.startsWith('nearby-route-hitbox-') || 
        f.layer?.id?.startsWith('nearby-route-line-')
      );
      if (routeFeature) {
        const codigo = routeFeature.layer.id
          .replace('nearby-route-hitbox-', '')
          .replace('nearby-route-line-', '');
        
        // Seleccionar ruta (en mobile solo actualiza contenido, en desktop abre panel)
        selectRoute(codigo);
        return;
      }
    }
    
    setClickPosition(lngLat);
    // Solo agregar pin, sin abrir modal
  }, [nearbyRoutes, selectRoute]);

  const handleMapRightClick = useCallback((event: any) => {
    event.preventDefault();
    const { lngLat, point } = event;

    if (isDrawingMode) {
      setPolygonCoords((prevCoords) => [...prevCoords, lngLat]);
    } else {
      setContextMenu({ x: point.x, y: point.y, lngLat });
    }
  }, [isDrawingMode]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsDrawingMode(false);
      setPolygonCoords([]);
      setContextMenu(null);
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      setClickPosition(null);
      setPolygonCoords([]);
    } else if (event.ctrlKey && event.key === 'z') {
      setPolygonCoords((prevCoords) => prevCoords.slice(0, -1));
    } else if (event.key === 'Enter' && polygonCoords.length >= 3) {
      addAnnotation({
        type: 'drawn-polygon',
        name: `Polígono ${new Date().toLocaleTimeString('es-SV')}`,
        data: { coordinates: polygonCoords },
      });
      setPolygonCoords([]);
      setIsDrawingMode(false);
    }
  }, [polygonCoords, addAnnotation]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleStyleChange = useCallback((style: MapStyle) => {
    setMapStyleState(style.url);
    setMapStyle(style);
  }, [setMapStyle]);

  return (
    <div className="w-screen h-screen fixed top-0 left-0">
      <Map
        ref={mapRef}
        longitude={center.lng}
        latitude={center.lat}
        zoom={zoom}
        minZoom={env.MAP_MIN_ZOOM}
        maxZoom={18}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        onLoad={handleMapLoad}
        onMove={handleViewStateChange}
        onClick={(event) => {
          // Handle distrito clicks first
          if (event.features && event.features.length > 0) {
            const feature = event.features[0];
            if (feature.source === 'distritos-source') {
              // Delegate to GeoDistritos component
              const geoDistritosEvent = new CustomEvent('distrito-click', {
                detail: { feature, lngLat: event.lngLat }
              });
              window.dispatchEvent(geoDistritosEvent);
              return;
            }
          }
          // Handle regular map clicks
          handleMapClick(event);
        }}
        onMouseMove={(event) => {
          // En mobile, no mostrar tooltips
          const isMobile = window.innerWidth < 768;
          
          if (event.features && event.features.length > 0) {
            const feature = event.features[0];
            
            // Check for nearby route hover (hitbox or line)
            if (feature.layer?.id?.startsWith('nearby-route-hitbox-') || feature.layer?.id?.startsWith('nearby-route-line-')) {
              const codigo = feature.layer.id
                .replace('nearby-route-hitbox-', '')
                .replace('nearby-route-line-', '');
              const ruta = nearbyRoutes.find(r => r.codigo === codigo);
              
              if (ruta) {
                event.target.getCanvas().style.cursor = 'pointer';
                
                // Solo mostrar tooltip en desktop
                if (!isMobile) {
                  setRouteHover({
                    codigo: ruta.codigo,
                    nombre: ruta.nombre,
                    tipo: ruta.tipo,
                    subtipo: ruta.subtipo,
                    sentido: ruta.sentido,
                    departamento: ruta.departamento,
                    kilometros: ruta.kilometros,
                    distancia_m: ruta.distancia_m,
                    x: event.point.x,
                    y: event.point.y
                  });
                }
                return;
              }
            }
            
            if (feature.source === 'distritos-source') {
              event.target.getCanvas().style.cursor = 'pointer';

              // Mostrar tooltip
              const name = feature.properties.NAM || feature.properties.M;
              setHoverInfo({
                name,
                x: event.point.x,
                y: event.point.y
              });

              if (feature.id !== undefined) {
                // Limpiar hover anterior
                event.target.queryRenderedFeatures().forEach((f: any) => {
                  if (f.source === 'distritos-source' && f.id !== feature.id && f.id !== undefined) {
                    event.target.setFeatureState(
                      { source: 'distritos-source', id: f.id },
                      { hover: false }
                    );
                  }
                });
                // Activar hover actual
                event.target.setFeatureState(
                  { source: 'distritos-source', id: feature.id },
                  { hover: true }
                );
              }
            }
          } else {
            event.target.getCanvas().style.cursor = '';
            setHoverInfo(null);
            setRouteHover(null);
            // Limpiar todos los hovers
            try {
              event.target.queryRenderedFeatures().forEach((f: any) => {
                if (f.source === 'distritos-source' && f.id !== undefined) {
                  event.target.setFeatureState(
                    { source: 'distritos-source', id: f.id },
                    { hover: false }
                  );
                }
              });
            } catch {
              // ignore
            }
          }
        }}
        onContextMenu={handleMapRightClick}
        maxBounds={[
          [-91.00994252677712, 11.214449814812207], // Southwest
          [-85.6233130419287, 17.838768214469866]   // Northeast
        ]}
        interactiveLayerIds={interactiveLayers}
        attributionControl={false}
      >
        <MapStyleSelector
          onStyleChange={handleStyleChange}
        />
        <MapControls />
        <MapScale />
        {mapReady && (
          <>
            <GeoLayer />
            <GeoDistritos />
            <SearchRadiusLayer />
            <NearbyRoutesLayer />
            <RouteLayer />
            {clickPosition && <MapMarker position={clickPosition} />}
            {/* Renderizar pins de anotaciones */}
            {annotations.filter(a => a.type === 'pin' && a.data?.coordinates).map(annotation => (
              <MapMarker key={annotation.id} position={annotation.data.coordinates as LngLat} />
            ))}
            {polygonCoords.length > 0 && (
              <PolygonDisplay coordinates={polygonCoords} />
            )}
          </>
        )}
      </Map>

      {/* Menú contextual */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-[70]"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-[71] bg-primary/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 py-2 min-w-[240px] overflow-hidden"
            style={{
              left: contextMenu.x,
              top: contextMenu.y
            }}
          >
            {/* Header con coordenadas */}
            <div className="px-4 py-2 border-b border-white/10">
              <div className="text-xs font-medium text-white/60">Coordenadas</div>
              <div className="text-xs font-mono text-white/80 mt-0.5">
                {contextMenu.lngLat.lat.toFixed(6)}, {contextMenu.lngLat.lng.toFixed(6)}
              </div>
            </div>

            {/* Opciones principales */}
            <div className="py-1">
              <button
                onClick={() => {
                  addAnnotation({
                    type: 'pin',
                    name: `Pin ${new Date().toLocaleTimeString('es-SV')}`,
                    data: { coordinates: contextMenu.lngLat },
                  });
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-3 text-gray-700 dark:text-gray-200"
              >
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div>
                  <div className="font-medium">Agregar marcador</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Guardar esta ubicación</div>
                </div>
              </button>

              <button
                onClick={() => {
                  fetchNearbyRoutes(contextMenu.lngLat.lat, contextMenu.lngLat.lng, 1);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-3 text-gray-700 dark:text-gray-200"
              >
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                </svg>
                <div>
                  <div className="font-medium">Buscar rutas cercanas</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Radio de 1 km</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsDrawingMode(true);
                  setPolygonCoords([contextMenu.lngLat]);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-3 text-gray-700 dark:text-gray-200"
              >
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <div>
                  <div className="font-medium">Dibujar polígono</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Modo dibujo manual</div>
                </div>
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

            {/* Opciones secundarias */}
            <div className="py-1">
              <button
                onClick={() => {
                  updateConfig({ ...config, center: { lng: contextMenu.lngLat.lng, lat: contextMenu.lngLat.lat } });
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-3 text-gray-600 dark:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Centrar mapa aquí</span>
              </button>

              <button
                onClick={async () => {
                  const coords = `${contextMenu.lngLat.lat.toFixed(6)}, ${contextMenu.lngLat.lng.toFixed(6)}`;
                  await navigator.clipboard.writeText(coords);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-3 text-gray-600 dark:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copiar coordenadas</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tooltip discreto */}
      {hoverInfo && (
        <div
          className="fixed pointer-events-none z-50 bg-primary/95 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg shadow-lg border border-white/10"
          style={{
            left: hoverInfo.x + 10,
            top: hoverInfo.y + 10
          }}
        >
          {hoverInfo.name}
        </div>
      )}

      {/* Route hover tooltip */}
      {routeHover && (
        <div
          className="fixed z-50 bg-secondary/95 backdrop-blur-sm text-white px-3 py-2.5 rounded-lg shadow-xl border border-white/20 pointer-events-none min-w-[220px]"
          style={{
            left: routeHover.x + 10,
            top: routeHover.y + 10
          }}
        >
          <div className="font-bold text-base mb-1">{routeHover.codigo}</div>
          <div className="text-xs text-white/90 mb-2">{routeHover.nombre}</div>
          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-white/70">Departamento:</span>
              <span className="font-medium text-right">{routeHover.departamento}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-white/70">Tipo:</span>
              <span className="font-medium text-right">{routeHover.tipo}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-white/70">Subtipo:</span>
              <span className="font-medium text-right">{routeHover.subtipo}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-white/70">Sentido:</span>
              <span className="font-medium text-right">{routeHover.sentido}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-white/70">Longitud ruta:</span>
              <span className="font-medium text-right">{routeHover.kilometros?.toFixed(2) || '0.00'} km</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-white/70">Distancia:</span>
              <span className="font-medium text-right">{routeHover.distancia_m < 1000 ? `${Math.round(routeHover.distancia_m)}m` : `${(routeHover.distancia_m / 1000).toFixed(2)}km`}</span>
            </div>
          </div>
          <div className="text-[10px] text-white/50 mt-2 text-center">Click para ver detalles</div>
        </div>
      )}

      {/* Indicador de modo dibujo */}
      {isDrawingMode && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-purple-600/95 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-xl border border-purple-400/30">
          <div className="text-sm font-medium">✏️ Modo dibujo activo</div>
          <div className="text-xs text-white/80 mt-1">
            Click derecho: agregar punto • Enter: completar • Escape: cancelar
          </div>
        </div>
      )}

      {/* Transport Routes UI - Removed, now integrated in BottomSheet */}
    </div>
  );
};
