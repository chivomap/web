import React from 'react';
import { useMapStore } from '../../../store/mapStore';
import { useAnnotationStore } from '../../../store/annotationStore';
import { useBottomSheetStore } from '../../../store/bottomSheetStore';
import { useRutasStore } from '../../../store/rutasStore';
import { RUTA_COLORS, type SubtipoRuta } from '../../../types/rutas';
import { BiMap, BiBookmark, BiTrash, BiPin, BiShapePolygon, BiDownload, BiBus, BiRuler, BiRightArrowAlt, BiX } from 'react-icons/bi';
import { MdOutlinePolyline } from 'react-icons/md';

export const BottomSheet: React.FC = () => {
  const { selectedInfo, currentLevel, parentInfo, setCurrentLevel, setParentInfo, setDepartamentoGeojson } = useMapStore();
  const { annotations, removeAnnotation } = useAnnotationStore();
  const { activeTab, sheetState, setActiveTab, setSheetState } = useBottomSheetStore();
  const { selectedRoute, clearSelectedRoute } = useRutasStore();

  const [dragY, setDragY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  // Está abierto si hay alguna info o ruta seleccionada
  const isOpen = !!(selectedInfo || annotations.length > 0 || selectedRoute);

  const [dragStartY, setDragStartY] = React.useState(0);

  const getSheetHeight = () => {
    if (window.innerWidth >= 640) return 'auto'; // Desktop: altura automática
    switch (sheetState) {
      case 'peek': return '140px';
      case 'half': return '50dvh';
      case 'full': return '90dvh';
      default: return '140px';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY;
    // Solo permitir drag hacia abajo desde full/half, o hacia arriba desde peek/half
    if ((sheetState === 'full' && diff > 0) ||
      (sheetState === 'half' && diff !== 0) ||
      (sheetState === 'peek' && diff < 0)) {
      setDragY(diff);
    }
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
    setDragStartY(0);
  };

  const handleClose = () => {
    useMapStore.getState().setSelectedInfo(null);
    useMapStore.getState().updateGeojson(null);
    setCurrentLevel('departamento');
    setParentInfo(null);
    setDepartamentoGeojson(null);

    // También limpiar ruta
    clearSelectedRoute();
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
        className="fixed inset-x-0 bottom-0 sm:absolute sm:top-20 sm:bottom-auto sm:left-4 w-full sm:w-80 sm:max-h-[calc(100vh-6rem)] z-[60]"
        style={{
          height: getSheetHeight(),
          transform: `translateY(${Math.max(0, dragY)}px)`,
          transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="bg-primary/95 backdrop-blur-sm text-white rounded-t-2xl sm:rounded-xl shadow-xl border-t sm:border border-white/20 h-full flex flex-col">

          {/* Handle - área arrastrable */}
          <div
            className="sm:hidden w-full flex justify-center pt-4 pb-4 flex-shrink-0 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              if (sheetState === 'peek') setSheetState('half');
              else if (sheetState === 'half') setSheetState('full');
            }}
          >
            <div className="w-12 h-1.5 bg-secondary/40 rounded-full" />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/20 flex-shrink-0">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'info'
                ? 'text-white border-b-2 border-secondary'
                : 'text-white/60 hover:text-white/80'
                }`}
            >
              {selectedRoute ? <BiBus className="inline mr-2" /> : <BiMap className="inline mr-2" />}
              {selectedRoute ? 'Ruta' : 'Información'}
            </button>
            <button
              onClick={() => setActiveTab('annotations')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'annotations'
                ? 'text-white border-b-2 border-secondary'
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
              // Vista de Información (Ruta o Lugar)
              <div className="p-4 space-y-3">

                {/* 1. INFORMACIÓN DE RUTA */}
                {selectedRoute ? (
                  (() => {
                    const props = selectedRoute.properties;
                    const subtipo = props.SUBTIPO as SubtipoRuta;
                    const color = RUTA_COLORS[subtipo] || '#6b7280';

                    return (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Header with color accent */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-lg"
                              style={{ backgroundColor: color }}
                            >
                              {props.Nombre_de_}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg leading-tight text-white truncate">
                                Ruta {props.Nombre_de_}
                              </h3>
                              <p className="text-xs text-white/50">
                                {props.TIPO === 'POR AUTOBUS' ? 'Autobús' : 'Microbús'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={clearSelectedRoute}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                            title="Cerrar Ruta"
                          >
                            <BiX className="text-2xl" />
                          </button>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Subtipo - Full Width */}
                          <div className="col-span-2 flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                            <BiBus className="text-secondary text-lg flex-shrink-0" />
                            <span className="text-white/80 font-medium">{props.SUBTIPO}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                            <BiRuler className="text-secondary text-lg flex-shrink-0" />
                            <span className="text-white/80">
                              {parseFloat(props.Kilómetro).toFixed(1)} km
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                            <BiMap className="text-secondary text-lg flex-shrink-0" />
                            <span className="text-white/80 truncate" title={props.DEPARTAMEN}>{props.DEPARTAMEN}</span>
                          </div>

                          {/* Sentido - Full Width */}
                          <div className="col-span-2 flex items-center gap-2 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                            <BiRightArrowAlt className="text-secondary text-lg flex-shrink-0" />
                            <span className="text-white/80 text-xs break-words leading-tight" title={props.SENTIDO}>
                              {props.SENTIDO}
                            </span>
                          </div>
                        </div>

                        {/* Code */}
                        <div className="mt-3 flex items-center justify-between text-xs text-white/30 px-1">
                          <span>Código: <span className="font-mono">{props.Código_de}</span></span>
                          <span>ID: {props.CANTIDAD_D}</span>
                        </div>
                      </div>
                    );
                  })()
                ) : selectedInfo ? (
                  /* 2. INFORMACIÓN DE LUGAR (Existente) */
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
                        className="flex items-center gap-3 text-sm font-medium text-white bg-secondary/20 hover:bg-secondary/30 px-4 py-3 rounded-lg transition-all w-full"
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
                ) : (
                  <p className="text-white/60 text-center py-8">No hay información seleccionada</p>
                )}
              </div>
            ) : (
              // Vista de Anotaciones (Sin cambios)
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
                            {annotation.type === 'pin' && <BiPin className="text-secondary text-lg" />}
                            {annotation.type === 'drawn-polygon' && <MdOutlinePolyline className="text-secondary text-lg" />}
                            {annotation.type === 'search-result' && <BiShapePolygon className="text-secondary text-lg" />}
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
                        <div className="flex items-center gap-1">
                          {(annotation.type === 'drawn-polygon' || annotation.type === 'search-result') && (
                            <button
                              onClick={() => {
                                let geojson;
                                if (annotation.type === 'drawn-polygon') {
                                  const coords = Array.isArray(annotation.data.coordinates)
                                    ? annotation.data.coordinates
                                    : [annotation.data.coordinates];
                                  geojson = {
                                    type: 'FeatureCollection',
                                    features: [{
                                      type: 'Feature',
                                      properties: { name: annotation.name },
                                      geometry: {
                                        type: 'Polygon',
                                        coordinates: [coords.map((c: any) => [c.lng, c.lat])]
                                      }
                                    }]
                                  };
                                } else {
                                  // search-result ya tiene el geojson completo
                                  geojson = annotation.data.geojson || annotation.data;
                                }
                                const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${annotation.name.replace(/\s+/g, '_')}.geojson`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="p-1.5 hover:bg-white/10 rounded text-secondary"
                              title="Exportar GeoJSON"
                            >
                              <BiDownload />
                            </button>
                          )}
                          <button
                            onClick={() => removeAnnotation(annotation.id)}
                            className="p-1.5 hover:bg-white/10 rounded text-secondary/70 hover:text-secondary"
                            title="Eliminar"
                          >
                            <BiTrash />
                          </button>
                        </div>
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
