import React, { useState, useEffect } from 'react';
import { useMapStore } from '../../../store/mapStore';
import { env, isDevelopment } from '../../../config/env';

export const GeoDistritos: React.FC = () => {
  const { geojson, currentLevel, setCurrentLevel, setParentInfo, setPreviousGeojson, departamentoGeojson, setDepartamentoGeojson } = useMapStore();
  const [clickInfo, setClickInfo] = useState<any>(null);

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
          
          const singleDistrictGeoJSON: any = {
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

  // UI manejada por BottomSheet
  return null;
};
