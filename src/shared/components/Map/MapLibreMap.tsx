import React, { useState, useCallback, useEffect } from 'react';
import Map, { ViewStateChangeEvent } from 'react-map-gl/maplibre';
import { LngLat } from 'maplibre-gl';
import { useMapStore } from '../../../shared/store/mapStore';
import { env } from '../../config/env';
import { MapStyle } from '../../data/mapStyles';
import { useThemeStore } from '../../store/themeStore';

import { MapControls, MapMarker, PolygonDisplay, GeoDistritos, MapStyleSelector, MapScale } from './Features';
import 'maplibre-gl/dist/maplibre-gl.css';
import './popup-styles.css';

import { useLocation } from 'wouter';

export const MapLibreMap: React.FC = () => {
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [clickPosition, setClickPosition] = useState<LngLat | null>(null);
  const [polygonCoords, setPolygonCoords] = useState<LngLat[]>([]);
  const { config, updateConfig, updatePolygon } = useMapStore();
  const { currentMapStyle, setMapStyle } = useThemeStore();
  const { center, zoom } = config;

  const [, navigate] = useLocation();

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
  }, []);

  const handleMapRightClick = useCallback((event: any) => {
    event.preventDefault();
    const { lngLat } = event;
    setPolygonCoords((prevCoords) => [...prevCoords, lngLat]);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      setClickPosition(null);
      setPolygonCoords([]);
    } else if (event.ctrlKey && event.key === 'z') {
      setPolygonCoords((prevCoords) => prevCoords.slice(0, -1));
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleExport = () => {
    updatePolygon(polygonCoords);
    navigate('/export');
  };

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
              if (feature.id !== undefined) {
                // Limpiar hover anterior
                event.target.queryRenderedFeatures().forEach((f: any) => {
                  if (f.source === 'distritos-source' && f.id !== feature.id) {
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
            // Limpiar todos los hovers
            try {
              event.target.queryRenderedFeatures().forEach((f: any) => {
                if (f.source === 'distritos-source') {
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
            <GeoDistritos />
            {clickPosition && <MapMarker position={clickPosition} />}
            {polygonCoords.length > 0 && (
              <PolygonDisplay coordinates={polygonCoords} onExport={handleExport} />
            )}
          </>
        )}
      </Map>
    </div>
  );
};
