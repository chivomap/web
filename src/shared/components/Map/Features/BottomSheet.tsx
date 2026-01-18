import React from 'react';
import { useMapStore } from '../../../store/mapStore';
import { useAnnotationStore } from '../../../store/annotationStore';
import { useBottomSheetStore } from '../../../store/bottomSheetStore';
import { BiMap, BiBookmark, BiTrash, BiPin, BiShapePolygon } from 'react-icons/bi';

type Tab = 'info' | 'annotations';
type SheetState = 'peek' | 'half' | 'full';

export const BottomSheet: React.FC = () => {
  const { selectedInfo, currentLevel, parentInfo, setCurrentLevel, setParentInfo, setDepartamentoGeojson } = useMapStore();
  const { annotations, removeAnnotation } = useAnnotationStore();
  const { activeTab, sheetState, setActiveTab, setSheetState } = useBottomSheetStore();
  
  const [dragY, setDragY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const isOpen = !!(selectedInfo || annotations.length > 0);

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
              // Vista de Información
              <div className="p-4 space-y-3">
                {selectedInfo && (
                  <>
                    <div className="mb-3">
                      <h3 className="font-bold text-lg text-white">{selectedInfo.name}</h3>
                      <p className="text-sm text-white/70">{selectedInfo.type}</p>
                    </div>
                    
                    {/* Botones de navegación */}
                    {parentInfo && (
                      <button
                        onClick={async () => {
                          if (selectedInfo?.name) {
                            try {
                              const { getQueryData } = await import('../../../services/GetQueryData');
                              const departamentoData = await getQueryData(selectedInfo.name, 'D');
                              if (departamentoData) {
                                useMapStore.getState().updateGeojson(departamentoData);
                              }
                            } catch (error) {
                              console.error('Error:', error);
                            }
                          }
                          setCurrentLevel('departamento');
                          setParentInfo(null);
                        }}
                        className="flex items-center gap-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg transition-all w-full"
                      >
                        <span>←</span>
                        <span>Volver a {parentInfo.departamento}</span>
                      </button>
                    )}
                    
                    {/* Leyenda de colores */}
                    {currentLevel === 'departamento' && (
                      <div className="border-t border-white/20 pt-3 mt-3">
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
                              <div className="w-3 h-3 rounded border border-white/30" style={{ backgroundColor: color }} />
                              <span className="text-white/90">{region}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {!selectedInfo && <p className="text-white/60 text-center py-8">No hay información seleccionada</p>}
              </div>
            ) : (
              // Vista de Anotaciones
              <div>
                {annotations.length === 0 ? (
                  <div className="p-8 text-center text-white/60 text-sm">
                    No hay anotaciones aún
                  </div>
                ) : (
                  annotations.map((annotation) => (
                    <div key={annotation.id} className="p-3 border-b border-white/10 hover:bg-white/5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <div className="mt-1">
                            {annotation.type === 'pin' && <BiPin className="text-red-500" />}
                            {annotation.type === 'drawn-polygon' && <BiShapePolygon className="text-blue-500" />}
                            {annotation.type === 'search-result' && <BiMap className="text-green-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{annotation.name}</p>
                            <p className="text-white/60 text-xs">
                              {new Date(annotation.createdAt).toLocaleString('es-SV', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeAnnotation(annotation.id)}
                          className="p-1 hover:bg-white/10 rounded text-red-400"
                        >
                          <BiTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
