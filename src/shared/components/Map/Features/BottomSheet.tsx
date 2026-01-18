import React, { useState } from 'react';
import { useMapStore } from '../../../store/mapStore';
import { useAnnotationStore } from '../../../store/annotationStore';
import { BiMap, BiBookmark, BiTrash, BiCopy, BiDownload, BiDotsVerticalRounded, BiImage, BiPin, BiShapePolygon } from 'react-icons/bi';

type Tab = 'info' | 'annotations';
type SheetState = 'peek' | 'half' | 'full';

export const BottomSheet: React.FC = () => {
  const { selectedInfo, clickInfo, currentLevel, parentInfo, setCurrentLevel, setParentInfo, previousGeojson, setPreviousGeojson, setDepartamentoGeojson } = useMapStore();
  const { annotations, removeAnnotation, clearAnnotations, exportAllAsGeoJSON } = useAnnotationStore();
  
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [sheetState, setSheetState] = useState<SheetState>('peek');
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeItemMenu, setActiveItemMenu] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const isOpen = !!(selectedInfo || clickInfo || annotations.length > 0);

  const getSheetHeight = () => {
    switch (sheetState) {
      case 'peek': return '140px';
      case 'half': return '50dvh';
      case 'full': return '90dvh';
      default: return '140px';
    }
  };

  const handleTouchStart = () => {
    setIsDragging(true);
    setDragY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const diff = e.touches[0].clientY - touch.clientY;
    setDragY(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (dragY > 100) {
      if (sheetState === 'full') setSheetState('half');
      else if (sheetState === 'half') setSheetState('peek');
      else handleClose();
    } else if (dragY < -100) {
      if (sheetState === 'peek') setSheetState('half');
      else if (sheetState === 'half') setSheetState('full');
    }
    
    setDragY(0);
  };

  const handleClose = () => {
    useMapStore.getState().setSelectedInfo(null);
    useMapStore.getState().updateGeojson(null);
    setCurrentLevel('departamento');
    setParentInfo(null);
    setPreviousGeojson(null);
    setDepartamentoGeojson(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      {sheetState !== 'peek' && (
        <div 
          className="sm:hidden fixed inset-0 bg-black/40 z-[59]"
          onClick={() => setSheetState('peek')}
        />
      )}
      
      {/* Sheet */}
      <div 
        className="fixed inset-x-0 bottom-0 sm:absolute sm:top-20 sm:bottom-auto sm:left-4 w-full sm:w-80 z-[60]"
        style={{
          height: getSheetHeight(),
          transform: `translateY(${Math.max(0, dragY)}px)`,
          transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-primary/95 backdrop-blur-sm text-white rounded-t-2xl sm:rounded-xl shadow-xl border-t sm:border border-white/20 h-full flex flex-col">
          
          {/* Handle */}
          <div 
            className="sm:hidden w-10 h-1 bg-white/40 rounded-full mx-auto mt-3 mb-2 flex-shrink-0"
            onClick={() => {
              if (sheetState === 'peek') setSheetState('half');
              else if (sheetState === 'half') setSheetState('full');
            }}
          />
          
          {/* Tabs */}
          <div className="flex border-b border-white/20 flex-shrink-0">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'info' 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <BiMap className="inline mr-2" />
              Información
            </button>
            <button
              onClick={() => setActiveTab('annotations')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'annotations' 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <BiBookmark className="inline mr-2" />
              Anotaciones ({annotations.length})
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'info' ? (
              <div className="p-4">
                <p className="text-white">Vista de información - TODO: Migrar contenido de GeoDistritos</p>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-white">Vista de anotaciones - TODO: Migrar contenido de AnnotationsPanel</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
