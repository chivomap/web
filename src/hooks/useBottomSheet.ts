import { useEffect } from 'react';
import { useBottomSheetStore } from '../shared/store/bottomSheetStore';
import { useRutasStore } from '../shared/store/rutasStore';
import { useMapStore } from '../shared/store/mapStore';
import { useAnnotationStore } from '../shared/store/annotationStore';

type ContentType = 'route' | 'nearbyRoutes' | 'geoInfo' | 'annotations' | 'none';

export const useBottomSheet = () => {
  const { sheetState, setSheetState, setActiveTab } = useBottomSheetStore();
  const { selectedRoute, nearbyRoutes, clearSelectedRoute, clearNearbyRoutes } = useRutasStore();
  const { selectedInfo, setSelectedInfo } = useMapStore();
  const { annotations } = useAnnotationStore();

  // Determinar tipo de contenido actual
  const getContentType = (): ContentType => {
    if (selectedRoute) return 'route';
    if (nearbyRoutes.length > 0) return 'nearbyRoutes';
    if (selectedInfo) return 'geoInfo';
    if (annotations.length > 0) return 'annotations';
    return 'none';
  };

  const contentType = getContentType();
  const isOpen = contentType !== 'none';

  // Estado inicial inteligente según contenido
  const getInitialState = (type: ContentType) => {
    switch (type) {
      case 'route': return 'half';
      case 'nearbyRoutes': return 'half';
      case 'geoInfo': return 'peek';
      case 'annotations': return 'half';
      default: return 'peek';
    }
  };

  // Auto-ajustar estado cuando cambia el contenido
  useEffect(() => {
    if (isOpen) {
      const initialState = getInitialState(contentType);
      setSheetState(initialState);
    }
  }, [contentType, isOpen, setSheetState]);

  // Cerrar completamente (limpia todo)
  const close = () => {
    clearSelectedRoute();
    clearNearbyRoutes();
    setSelectedInfo(null);
    useMapStore.getState().updateGeojson(null);
    useMapStore.getState().setCurrentLevel('departamento');
    useMapStore.getState().setParentInfo(null);
    useMapStore.getState().setDepartamentoGeojson(null);
    
    // Resetear estado del sheet
    setSheetState('peek');
    setActiveTab('info');
  };

  // Cerrar solo el contenido actual (mantiene otros)
  const closeContent = () => {
    switch (contentType) {
      case 'route':
        clearSelectedRoute();
        break;
      case 'nearbyRoutes':
        clearNearbyRoutes();
        break;
      case 'geoInfo':
        setSelectedInfo(null);
        useMapStore.getState().updateGeojson(null);
        break;
    }
    
    // Si no queda nada, resetear estado
    if (getContentType() === 'none') {
      setSheetState('peek');
    }
  };

  // Abrir con contenido específico
  const openRoute = (codigo: string) => {
    useRutasStore.getState().selectRoute(codigo);
    setActiveTab('info');
    setSheetState('half');
  };

  const openNearbyRoutes = (lat: number, lng: number, radius?: number) => {
    useRutasStore.getState().fetchNearbyRoutes(lat, lng, radius);
    setActiveTab('info');
    setSheetState('half');
  };

  const openAnnotations = () => {
    setActiveTab('annotations');
    setSheetState('half');
  };

  return {
    // Estado
    isOpen,
    sheetState,
    contentType,
    
    // Acciones
    close,
    closeContent,
    setSheetState,
    
    // Abrir con contenido
    openRoute,
    openNearbyRoutes,
    openAnnotations,
  };
};
