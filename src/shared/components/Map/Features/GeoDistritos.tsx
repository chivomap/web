import React, { useState, useEffect } from 'react';
import { Source, Layer, Popup, useMap } from 'react-map-gl/maplibre';
import { useMapStore } from '../../../store/mapStore';
import { useThemeStore } from '../../../store/themeStore';
import { env, isDevelopment } from '../../../config/env';
import type { LayerProps } from 'react-map-gl/maplibre';
import { MapLegend } from './MapLegend';

export const GeoDistritos: React.FC = () => {
  const { geojson, selectedInfo, currentLevel, parentInfo, setCurrentLevel, setParentInfo, previousGeojson, setPreviousGeojson, departamentoGeojson, setDepartamentoGeojson } = useMapStore();
  const { currentMapStyle } = useThemeStore();
  const [clickInfo, setClickInfo] = useState<any>(null);

  const isDark = currentMapStyle.name === 'Oscuro';

  // Guardar GeoJSON del departamento cuando se carga por primera vez
  useEffect(() => {
    if (geojson && currentLevel === 'departamento' && !departamentoGeojson) {
      setDepartamentoGeojson(geojson);
    }
  }, [geojson, currentLevel, departamentoGeojson]);

  // Listen for distrito clicks
  useEffect(() => {
    const handleDistritoClick = (event: any) => {
      const { feature, lngLat } = event.detail;
      
      if (currentLevel === 'departamento') {
        const municipio = feature.properties.M || feature.properties.NAM;
        const departamento = feature.properties.D;
        
        if (feature.properties.type === 'municipio') {
          setParentInfo({ departamento, municipio });
          setCurrentLevel('distrito');
          setClickInfo(null); // Limpiar clickInfo al navegar a municipio
          loadDistritosByMunicipio(municipio);
        }
      } else {
        // Solo enfocar si NO estamos ya en un distrito individual
        if (!clickInfo) {
          // Guardar el GeoJSON ORIGINAL antes de procesarlo
          setPreviousGeojson(geojson);
          
          // Limpiar el feature para que sea serializable
          const cleanFeature = {
            type: 'Feature',
            properties: { ...feature.properties },
            geometry: feature.geometry || feature._vectorTileFeature?.geometry,
            id: feature.id
          };
          
          const singleDistrictGeoJSON = {
            type: 'FeatureCollection' as const,
            features: [cleanFeature]
          };
          useMapStore.getState().updateGeojson(singleDistrictGeoJSON);
          setClickInfo({
            feature: cleanFeature,
            longitude: lngLat.lng,
            latitude: lngLat.lat
          });
        }
      }
    };

    window.addEventListener('distrito-click', handleDistritoClick);
    return () => window.removeEventListener('distrito-click', handleDistritoClick);
  }, [currentLevel, geojson, clickInfo]);

  // Función para cargar distritos de un municipio
  const loadDistritosByMunicipio = async (municipio: string) => {
    try {
      const { getQueryData } = await import('../../../services/GetQueryData');
      const distritosData = await getQueryData(municipio, 'M');
      if (distritosData) {
        useMapStore.getState().updateGeojson(distritosData);
      }
    } catch (error) {
      console.error('Error cargando distritos:', error);
    }
  };

  // Validate GeoJSON before rendering
  if (!geojson || !geojson.features || geojson.features.length === 0) {
    return null;
  }

  // Filter valid features
  const validFeatures = geojson.features.filter((feature: any) => {
    // Aceptar tanto features normales como _vectorTileFeature
    if (feature._vectorTileFeature) {
      return true; // Vector tile features son válidos
    }
    return (
      feature &&
      feature.geometry &&
      feature.geometry.coordinates &&
      Array.isArray(feature.geometry.coordinates) &&
      feature.geometry.coordinates.length > 0
    );
  });

  if (validFeatures.length === 0) {
    if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
      console.warn('No valid features found');
      console.log('Sample feature:', geojson.features[0]);
    }
    return null;
  }

  // Use the GeoJSON directly - it's already in the correct format
  const cleanGeoJSON = {
    type: 'FeatureCollection' as const,
    features: currentLevel === 'departamento' 
      ? groupDistritosByMunicipio(validFeatures)
      : validFeatures.map((feature, index) => ({
          ...feature,
          id: index // Add ID for feature state
        }))
  };

  // Función para agrupar distritos por municipio
  function groupDistritosByMunicipio(features: any[]) {
    const municipios = new Map();
    
    features.forEach((feature) => {
      const municipio = feature.properties.M;
      if (!municipios.has(municipio)) {
        municipios.set(municipio, {
          type: 'Feature',
          properties: {
            M: municipio,
            D: feature.properties.D,
            NAM: municipio, // Usar nombre del municipio
            type: 'municipio'
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: []
          }
        });
      }
      
      // Agregar coordenadas del distrito al municipio
      const municipioFeature = municipios.get(municipio);
      if (feature.geometry.type === 'MultiPolygon') {
        municipioFeature.geometry.coordinates.push(...feature.geometry.coordinates);
      } else if (feature.geometry.type === 'Polygon') {
        municipioFeature.geometry.coordinates.push([feature.geometry.coordinates]);
      }
    });

    return Array.from(municipios.values()).map((feature, index) => ({
      ...feature,
      id: index
    }));
  }

  const layerStyle: LayerProps = {
    id: 'distritos-fill',
    type: 'fill',
    paint: {
      'fill-color': currentLevel === 'departamento' ? [
        // Colores por región cuando mostramos municipios
        'case',
        ['in', 'Centro', ['get', 'M']], '#06b6d4',
        ['in', 'Norte', ['get', 'M']], '#22c55e',
        ['in', 'Sur', ['get', 'M']], '#f97316',
        ['in', 'Este', ['get', 'M']], '#e11d48',
        ['in', 'Oeste', ['get', 'M']], '#a855f7',
        '#64748b'
      ] : [
        // Mantener colores por región también en distritos
        'case',
        ['in', 'Centro', ['get', 'M']], '#06b6d4',
        ['in', 'Norte', ['get', 'M']], '#22c55e',
        ['in', 'Sur', ['get', 'M']], '#f97316',
        ['in', 'Este', ['get', 'M']], '#e11d48',
        ['in', 'Oeste', ['get', 'M']], '#a855f7',
        '#3b82f6' // Azul por defecto solo si no coincide
      ],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.8, // Más opaco en hover
        currentLevel === 'departamento' ? 0.7 : 0.5
      ]
    }
  };

  const outlineStyle: LayerProps = {
    id: 'distritos-outline',
    type: 'line',
    paint: {
      'line-color': currentLevel === 'departamento' ? [
        'case',
        ['in', 'Centro', ['get', 'M']], '#0891b2',
        ['in', 'Norte', ['get', 'M']], '#16a34a',
        ['in', 'Sur', ['get', 'M']], '#ea580c',
        ['in', 'Este', ['get', 'M']], '#be123c',
        ['in', 'Oeste', ['get', 'M']], '#9333ea',
        '#475569'
      ] : '#1d4ed8', // Azul oscuro uniforme para distritos
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        3, // Más grueso en hover
        currentLevel === 'departamento' ? 2 : 1
      ]
    }
  };

  return (
    <>
      <Source id="distritos-source" type="geojson" data={cleanGeoJSON}>
        <Layer {...layerStyle} />
        <Layer {...outlineStyle} />
      </Source>

      {/* Info Panel with Legend */}
      {(selectedInfo || clickInfo) && (
        <div className="absolute top-20 left-4 w-80 sm:top-24 sm:left-4 z-20 
                        animate-in slide-in-from-left-4 duration-300">
          <div className="bg-primary/95 backdrop-blur-sm text-white rounded-xl shadow-xl 
                          border border-white/20 overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-white/20">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {clickInfo 
                      ? (clickInfo.feature.properties.NAM || clickInfo.feature.properties.M || clickInfo.feature.properties.D)
                      : selectedInfo?.name
                    }
                  </h3>
                  {parentInfo && (
                    <div className="text-sm text-white/80 mt-1">
                      {parentInfo.departamento} {parentInfo.municipio && `› ${parentInfo.municipio}`}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setClickInfo(null);
                    useMapStore.getState().setSelectedInfo(null);
                    useMapStore.getState().updateGeojson(null);
                    setCurrentLevel('departamento');
                    setParentInfo(null);
                    setPreviousGeojson(null);
                    setDepartamentoGeojson(null);
                  }}
                  className="p-2.5 hover:bg-white/20 rounded-lg transition-all hover:scale-110 text-white/80 hover:text-white text-xl"
                  title="Cerrar"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Back button from municipio to departamento */}
              {parentInfo && !clickInfo && (
                <button
                  onClick={async () => {
                    // Recargar departamento completo desde la API
                    if (selectedInfo?.name) {
                      try {
                        const { getQueryData } = await import('../../../services/GetQueryData');
                        const departamentoData = await getQueryData(selectedInfo.name, 'D');
                        if (departamentoData) {
                          useMapStore.getState().updateGeojson(departamentoData);
                        }
                      } catch (error) {
                        console.error('Error recargando departamento:', error);
                      }
                    }
                    setCurrentLevel('departamento');
                    setParentInfo(null);
                    setClickInfo(null);
                  }}
                  className="flex items-center gap-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg transition-all hover:scale-[1.02] w-full shadow-lg"
                >
                  <span className="text-lg">←</span>
                  <span>Volver a {parentInfo.departamento}</span>
                </button>
              )}

              {/* Back from district detail */}
              {clickInfo && previousGeojson && !parentInfo && (
                <button
                  onClick={async () => {
                    // Recargar departamento completo desde la API
                    if (selectedInfo?.name) {
                      try {
                        const { getQueryData } = await import('../../../services/GetQueryData');
                        const departamentoData = await getQueryData(selectedInfo.name, 'D');
                        if (departamentoData) {
                          useMapStore.getState().updateGeojson(departamentoData);
                        }
                      } catch (error) {
                        console.error('Error recargando departamento:', error);
                      }
                    }
                    setPreviousGeojson(null);
                    setClickInfo(null);
                    setCurrentLevel('departamento');
                  }}
                  className="flex items-center gap-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg transition-all hover:scale-[1.02] w-full shadow-lg"
                >
                  <span className="text-lg">←</span>
                  <span>Volver al departamento</span>
                </button>
              )}

              {/* Back from district detail when we have parentInfo */}
              {clickInfo && previousGeojson && parentInfo && (
                <button
                  onClick={() => {
                    // Restaurar vista de municipio
                    useMapStore.getState().updateGeojson(previousGeojson);
                    setPreviousGeojson(null);
                    setClickInfo(null); // IMPORTANTE: Limpiar clickInfo
                    // Mantener currentLevel='distrito' y parentInfo
                  }}
                  className="flex items-center gap-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg transition-all hover:scale-[1.02] w-full shadow-lg"
                >
                  <span className="text-lg">←</span>
                  <span>Volver a {parentInfo.municipio}</span>
                </button>
              )}

              {/* District info */}
              {clickInfo && (
                <div className="bg-white/10 rounded-lg p-3 space-y-2">
                  {clickInfo.feature.properties.D && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Departamento:</span>
                      <span className="font-medium">{clickInfo.feature.properties.D}</span>
                    </div>
                  )}
                  {clickInfo.feature.properties.M && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Municipio:</span>
                      <span className="font-medium">{clickInfo.feature.properties.M}</span>
                    </div>
                  )}
                  {clickInfo.feature.properties.NAM && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Distrito:</span>
                      <span className="font-medium">{clickInfo.feature.properties.NAM}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Search info */}
              {selectedInfo && !clickInfo && (
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-sm mb-2">
                    <span className="text-white/80">Mostrando:</span> {selectedInfo.type}
                  </div>
                  <div className="text-xs text-white/70">
                    {currentLevel === 'departamento' 
                      ? 'Los polígonos muestran municipios agrupados'
                      : 'Los polígonos muestran distritos individuales'
                    }
                  </div>
                </div>
              )}

              {/* Legend - solo para departamentos */}
              {currentLevel === 'departamento' && (
                <div className="border-t border-white/20 pt-3">
                  <h4 className="text-sm font-medium text-white mb-2">Colores por región</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { region: 'Centro', color: '#06b6d4' },
                      { region: 'Norte', color: '#22c55e' },
                      { region: 'Sur', color: '#f97316' },
                      { region: 'Este', color: '#e11d48' },
                      { region: 'Oeste', color: '#a855f7' }
                    ].map(({ region, color }) => (
                      <div key={region} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                        <div 
                          className="w-3 h-3 rounded border border-white/30"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-white/90">{region}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
