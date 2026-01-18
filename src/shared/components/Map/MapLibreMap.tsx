import React, { useState, useCallback, useEffect } from 'react';
import Map, { ViewStateChangeEvent } from 'react-map-gl/maplibre';
import { LngLat } from 'maplibre-gl';
import { useMapStore } from '../../../shared/store/mapStore';
import { useAnnotationStore } from '../../store/annotationStore';
import { env } from '../../config/env';
import { MapStyle } from '../../data/mapStyles';
import { useThemeStore } from '../../store/themeStore';

import { MapControls, MapMarker, PolygonDisplay, MapStyleSelector, MapScale, BottomSheet, GeoLayer, GeoDistritos } from './Features';
import 'maplibre-gl/dist/maplibre-gl.css';
import './popup-styles.css';

export const MapLibreMap: React.FC = () => {
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [clickPosition, setClickPosition] = useState<LngLat | null>(null);
  const [polygonCoords, setPolygonCoords] = useState<LngLat[]>([]);
  const [hoverInfo, setHoverInfo] = useState<{ name: string; x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; lngLat: LngLat } | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const { config, updateConfig } = useMapStore();
  const { addAnnotation, annotations } = useAnnotationStore();
  const { currentMapStyle, setMapStyle } = useThemeStore();
  const { center, zoom } = config;

  // Initialize map style from store
  const [mapStyle, setMapStyleState] = useState<string>(currentMapStyle.url);

  useEffect(() => {
    setMapStyleState(currentMapStyle.url);
  }, [currentMapStyle]);

  const handleMapLoad = useCallback(() => {
    setMapReady(true);
  }, []);

  const handleViewStateChange = useCallback((evt: ViewStateChangeEvent) => {
    updateConfig({
      center: { lat: evt.viewState.latitude, lng: evt.viewState.longitude },
      zoom: evt.viewState.zoom
    });
  }, [updateConfig]);

  const handleMapClick = useCallback((event: any) => {
    const { lngLat } = event;
    setClickPosition(lngLat);
    // Agregar pin a anotaciones
    addAnnotation({
      type: 'pin',
      name: `Pin ${new Date().toLocaleTimeString('es-SV')}`,
      data: { coordinates: lngLat },
    });
  }, [addAnnotation]);

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
          if (event.features && event.features.length > 0) {
            const feature = event.features[0];
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
            } catch (e) {}
          }
        }}
        onContextMenu={handleMapRightClick}
        maxBounds={[
          [-91.00994252677712, 11.214449814812207], // Southwest
          [-85.6233130419287, 17.838768214469866]   // Northeast
        ]}
        interactiveLayerIds={['distritos-fill']}
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
            <BottomSheet />
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
            className="fixed z-[71] bg-primary/95 backdrop-blur-sm text-white rounded-lg shadow-xl border border-white/20 py-1 min-w-[200px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y
            }}
          >
            <button
              onClick={() => {
                addAnnotation({
                  type: 'pin',
                  name: `Pin ${new Date().toLocaleTimeString('es-SV')}`,
                  data: { coordinates: contextMenu.lngLat },
                });
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
            >
              📍 Agregar pin aquí
            </button>
            <button
              onClick={() => {
                updateConfig({ ...config, center: { lng: contextMenu.lngLat.lng, lat: contextMenu.lngLat.lat } });
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
            >
              🎯 Centrar mapa aquí
            </button>
            <button
              onClick={() => {
                const coords = `${contextMenu.lngLat.lat.toFixed(6)}, ${contextMenu.lngLat.lng.toFixed(6)}`;
                navigator.clipboard.writeText(coords);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
            >
              📋 Copiar coordenadas
            </button>
            <div className="border-t border-white/20 my-1" />
            <button
              onClick={() => {
                setIsDrawingMode(true);
                setPolygonCoords([contextMenu.lngLat]);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
            >
              ✏️ Empezar dibujo manual
            </button>
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

      {/* Indicador de modo dibujo */}
      {isDrawingMode && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-purple-600/95 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-xl border border-purple-400/30">
          <div className="text-sm font-medium">✏️ Modo dibujo activo</div>
          <div className="text-xs text-white/80 mt-1">
            Click derecho: agregar punto • Enter: completar • Escape: cancelar
          </div>
        </div>
      )}
    </div>
  );
};
