import React, { useState, useCallback, useMemo } from 'react';
import { useBottomSheet } from '../../../../hooks/useBottomSheet';
import { useAnnotationStore } from '../../../store/annotationStore';
import { useRutasStore } from '../../../store/rutasStore';
import { useBottomSheetStore } from '../../../store/bottomSheetStore';
import { BiMap, BiBookmark, BiBus } from 'react-icons/bi';
import { Z_INDEX } from '../../../constants/zIndex';
import { RouteInfo } from './BottomSheet/RouteInfo';
import { NearbyRoutesList } from './BottomSheet/NearbyRoutesList';
import { PlaceInfo } from './BottomSheet/PlaceInfo';
import { AnnotationsList } from './BottomSheet/AnnotationsList';

export const BottomSheet: React.FC = () => {
  const { isOpen, sheetState, setSheetState } = useBottomSheet();
  const { activeTab, setActiveTab } = useBottomSheetStore();
  const annotations = useAnnotationStore(state => state.annotations);
  const selectedRoute = useRutasStore(state => state.selectedRoute);
  const nearbyRoutes = useRutasStore(state => state.nearbyRoutes);
  const searchLocation = useRutasStore(state => state.searchLocation);

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);

  const getSheetHeight = useCallback(() => {
    if (window.innerWidth >= 640) return 'auto';
    switch (sheetState) {
      case 'peek': return '140px';
      case 'half': return '50dvh';
      case 'full': return '90dvh';
      default: return '140px';
    }
  }, [sheetState]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragY(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY;
    setDragY(diff);
  }, [isDragging, dragStartY]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    const threshold = 80;

    if (dragY > threshold) {
      if (sheetState === 'full') setSheetState('half');
      else if (sheetState === 'half') setSheetState('peek');
    } else if (dragY < -threshold) {
      if (sheetState === 'peek') setSheetState('half');
      else if (sheetState === 'half') setSheetState('full');
    }

    setDragY(0);
    setDragStartY(0);
  }, [dragY, sheetState, setSheetState]);

  const handleTabClick = useCallback(() => {
    if (sheetState === 'peek') setSheetState('half');
    else if (sheetState === 'half') setSheetState('full');
  }, [sheetState, setSheetState]);

  const tabLabel = useMemo(() => {
    if (selectedRoute) return 'Ruta';
    if (searchLocation || (nearbyRoutes && nearbyRoutes.length > 0)) {
      return `Rutas (${nearbyRoutes?.length || 0})`;
    }
    return 'Información';
  }, [selectedRoute, searchLocation, nearbyRoutes]);

  const tabIcon = useMemo(() => {
    if (selectedRoute || searchLocation || (nearbyRoutes && nearbyRoutes.length > 0)) {
      return <BiBus className="inline mr-2" />;
    }
    return <BiMap className="inline mr-2" />;
  }, [selectedRoute, searchLocation, nearbyRoutes]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 sm:absolute sm:top-20 sm:bottom-auto sm:left-4 w-full sm:w-80 sm:max-h-[calc(100vh-6rem)]"
      style={{
        height: getSheetHeight(),
        zIndex: Z_INDEX.BOTTOM_SHEET,
        transform: `translateY(${Math.max(0, dragY)}px)`,
        transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="bg-primary/95 backdrop-blur-sm text-white rounded-t-2xl sm:rounded-xl shadow-xl border-t sm:border border-white/20 h-full flex flex-col">
        <div
          className="sm:hidden w-full flex justify-center pt-4 pb-4 flex-shrink-0 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleTabClick}
        >
          <div className="w-12 h-1.5 bg-secondary/40 rounded-full" />
        </div>

        <div className="flex border-b border-white/20 flex-shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-white border-b-2 border-secondary'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            {tabIcon}
            {tabLabel}
          </button>
          <button
            onClick={() => setActiveTab('annotations')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'annotations'
                ? 'text-white border-b-2 border-secondary'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <BiBookmark className="inline mr-2" />
            Anotaciones ({annotations.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'info' ? (
            selectedRoute ? (
              <RouteInfo route={selectedRoute} />
            ) : searchLocation || (nearbyRoutes && nearbyRoutes.length > 0) ? (
              <NearbyRoutesList />
            ) : (
              <PlaceInfo />
            )
          ) : (
            <AnnotationsList />
          )}
        </div>
      </div>
    </div>
  );
};
